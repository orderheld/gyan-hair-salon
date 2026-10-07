// Apple Wallet: .pkpass-Datei bauen (ZIP mit pass.json, Bildern, manifest.json und signature).
// Ohne Server-Abhängigkeiten, damit die Tests es direkt mit Node prüfen können.
import { createHash } from "node:crypto";
import forge from "node-forge";

export type PassFiles = Record<string, Buffer>;

/** manifest.json: SHA-1 jeder Datei, wie Apple es verlangt */
export function buildManifest(files: PassFiles): Buffer {
  const manifest: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) manifest[name] = createHash("sha1").update(content).digest("hex");
  return Buffer.from(JSON.stringify(manifest));
}

/** Base64 eines Zertifikats als DER oder PEM einlesen */
function readCertificate(base64: string): forge.pki.Certificate {
  const raw = Buffer.from(base64.trim(), "base64");
  const text = raw.toString("latin1");
  if (text.includes("-----BEGIN CERTIFICATE-----")) return forge.pki.certificateFromPem(text);
  return forge.pki.certificateFromAsn1(forge.asn1.fromDer(forge.util.createBuffer(text)));
}

/** Zertifikat und privater Schlüssel aus dem .p12 (Pass Type ID Certificate) */
export function readP12(p12Base64: string, password: string) {
  const der = forge.util.decode64(p12Base64.trim().replace(/\s+/g, ""));
  const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(der), password);
  const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]?.[0];
  const keyBag =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0] ??
    p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];
  if (!certBag?.cert || !keyBag?.key) throw new Error("Zertifikat oder Schlüssel fehlt im .p12");
  return { certificate: certBag.cert, key: keyBag.key as forge.pki.rsa.PrivateKey };
}

/** PKCS#7-Signatur (detached, DER) über manifest.json, mit Apple-WWDR-Zwischenzertifikat */
export function signManifest(manifest: Buffer, signer: { certificate: forge.pki.Certificate; key: forge.pki.rsa.PrivateKey }, wwdrBase64: string, now = new Date()): Buffer {
  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifest.toString("binary"));
  p7.addCertificate(signer.certificate);
  p7.addCertificate(readCertificate(wwdrBase64));
  p7.addSigner({
    key: signer.key,
    certificate: signer.certificate,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      // node-forge erwartet hier ein Date, die Typen sagen string
      { type: forge.pki.oids.signingTime, value: now as unknown as string },
    ],
  });
  p7.sign({ detached: true });
  return Buffer.from(forge.asn1.toDer(p7.toAsn1()).getBytes(), "binary");
}

/* ---------- ZIP (ohne Kompression, reicht für die paar kleinen Dateien) ---------- */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function zipStore(files: PassFiles): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, data] of Object.entries(files)) {
    const nameBuf = Buffer.from(name, "utf8");
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // Version
    local.writeUInt16LE(0x0800, 6); // UTF-8-Namen
    local.writeUInt16LE(0, 8); // ohne Kompression
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12); // 1.1.1980
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, nameBuf, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(0x21, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, nameBuf);
    offset += 30 + nameBuf.length + data.length;
  }
  const centralSize = centrals.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(Object.keys(files).length, 8);
  end.writeUInt16LE(Object.keys(files).length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, ...centrals, end]);
}

/** Fertige .pkpass-Datei: pass.json + Bilder, dazu manifest.json und signature */
export function buildPkpass(opts: { pass: object; images: PassFiles; p12Base64: string; p12Password: string; wwdrBase64: string }): Buffer {
  const files: PassFiles = { "pass.json": Buffer.from(JSON.stringify(opts.pass)), ...opts.images };
  const manifest = buildManifest(files);
  const signature = signManifest(manifest, readP12(opts.p12Base64, opts.p12Password), opts.wwdrBase64);
  return zipStore({ ...files, "manifest.json": manifest, signature });
}
