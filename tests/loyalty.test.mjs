// Tests der Stempelkarte ohne Server: QR-Inhalt und Decoder, Apple-Wallet-Datei, Google-Wallet-JWT.
// Ausführen: npm test   (Node 22.18+ liest die TypeScript-Dateien direkt)
import { execFileSync } from "node:child_process";
import { createHash, createVerify, generateKeyPairSync } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import forge from "node-forge";
import QRCode from "qrcode";
import { cardQrPayload, parseCardPayload } from "../lib/loyalty-qr.ts";
import { decodeQrImage } from "../lib/loyalty-qr-decode.ts";
import { ordinal, freeNth } from "../lib/loyalty-text.ts";
import { buildManifest, buildPkpass, crc32, zipStore } from "../lib/wallet/pkpass.ts";
import { classId, objectId, saveJwtPayload, saveUrl, signJwt } from "../lib/wallet/google.ts";

/** QR-Code als RGBA-Bild rendern, wie es die Kamera liefern würde */
function qrImage(text, scale = 6, quiet = 4) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const size = (n + quiet * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      if (!qr.modules.get(y, x)) continue;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const i = (((y + quiet) * scale + dy) * size + (x + quiet) * scale + dx) * 4;
          data[i] = data[i + 1] = data[i + 2] = 20;
        }
    }
  return { data, width: size, height: size };
}

test("QR-Inhalt: Präfix, Token lesen, Unsinn ablehnen", () => {
  const token = "AbCdEfGhIjKlMnOpQrStUv";
  assert.equal(cardQrPayload(token), `GYAN:${token}`);
  assert.equal(parseCardPayload(`GYAN:${token}`), token);
  assert.equal(parseCardPayload(`gyan:${token}`), token);
  assert.equal(parseCardPayload(`  ${token}  `), token);
  assert.equal(parseCardPayload("https://example.com"), null);
  assert.equal(parseCardPayload("kurz"), null);
  assert.equal(parseCardPayload("GYAN:<script>alert(1)</script>"), null);
});

test("Decoder liest einen erzeugten QR-Code der Karte", () => {
  const token = "Zx9_-Qw3Er5Ty7Ui9Op1As";
  const img = qrImage(cardQrPayload(token));
  const text = decodeQrImage(img.data, img.width, img.height);
  assert.equal(text, `GYAN:${token}`);
  assert.equal(parseCardPayload(text), token);
});

test("Decoder gibt null ohne QR-Code", () => {
  const data = new Uint8ClampedArray(200 * 200 * 4).fill(255);
  assert.equal(decodeQrImage(data, 200, 200), null);
});

test("Ordnungszahlen: jeder 12. Haarschnitt", () => {
  assert.equal(freeNth(11, "de"), "12.");
  assert.equal(freeNth(11, "fr"), "12e");
  assert.equal(freeNth(11, "en"), "12th");
  assert.equal(ordinal(21, "en"), "21st");
  assert.equal(ordinal(22, "en"), "22nd");
  assert.equal(ordinal(13, "en"), "13th");
  assert.equal(ordinal(1, "fr"), "1er");
});

/** Selbst signiertes Test-Zertifikat (ersetzt das echte Pass-Type-ID-Zertifikat von Apple) */
function testCert(cn) {
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date(Date.now() - 86400000);
  cert.validity.notAfter = new Date(Date.now() + 86400000 * 365);
  const attrs = [{ name: "commonName", value: cn }];
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  return { keys, cert };
}

test("Manifest: SHA-1 jeder Datei", () => {
  const files = { "pass.json": Buffer.from('{"a":1}'), "icon.png": Buffer.from([1, 2, 3]) };
  const manifest = JSON.parse(buildManifest(files).toString());
  assert.equal(manifest["pass.json"], createHash("sha1").update('{"a":1}').digest("hex"));
  assert.equal(manifest["icon.png"], createHash("sha1").update(Buffer.from([1, 2, 3])).digest("hex"));
});

test("CRC32 wie zlib", () => {
  assert.equal(crc32(Buffer.from("123456789")), 0xcbf43926);
});

test(".pkpass: gültiges ZIP, Manifest stimmt, PKCS#7-Signatur prüfbar", () => {
  const signer = testCert("Pass Type ID: pass.ch.test");
  const wwdr = testCert("Test WWDR");
  const p12 = forge.pkcs12.toPkcs12Asn1(signer.keys.privateKey, [signer.cert], "geheim", { algorithm: "3des" });
  const p12Base64 = forge.util.encode64(forge.asn1.toDer(p12).getBytes());
  const wwdrBase64 = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(wwdr.cert)).getBytes(), "binary").toString("base64");
  const pass = { formatVersion: 1, passTypeIdentifier: "pass.ch.test", teamIdentifier: "TEAM123", serialNumber: "1", organizationName: "GYAN Hair Salon", description: "Stempelkarte", storeCard: { primaryFields: [{ key: "stamps", label: "Stempel", value: "3 / 11" }] }, barcodes: [{ format: "PKBarcodeFormatQR", message: "GYAN:AbCdEfGhIjKlMnOpQrStUv", messageEncoding: "iso-8859-1" }] };
  const buf = buildPkpass({ pass, images: { "icon.png": Buffer.from("png") }, p12Base64, p12Password: "geheim", wwdrBase64 });

  const dir = mkdtempSync(join(tmpdir(), "pkpass-"));
  writeFileSync(join(dir, "card.pkpass"), buf);
  execFileSync("python3", ["-I", "-c", "import sys,zipfile; z=zipfile.ZipFile(sys.argv[1]); assert z.testzip() is None; z.extractall(sys.argv[2])", join(dir, "card.pkpass"), join(dir, "x")]);
  const manifest = JSON.parse(readFileSync(join(dir, "x", "manifest.json"), "utf8"));
  for (const name of ["pass.json", "icon.png"]) assert.equal(manifest[name], createHash("sha1").update(readFileSync(join(dir, "x", name))).digest("hex"));
  assert.equal(JSON.parse(readFileSync(join(dir, "x", "pass.json"), "utf8")).storeCard.primaryFields[0].value, "3 / 11");
  // Signatur über manifest.json mit OpenSSL prüfen (Kette ist hier selbst signiert, daher -noverify)
  const out = execFileSync("openssl", ["smime", "-verify", "-binary", "-inform", "DER", "-in", join(dir, "x", "signature"), "-content", join(dir, "x", "manifest.json"), "-noverify", "-out", "/dev/null"], { stdio: ["ignore", "pipe", "pipe"] });
  assert.ok(out !== undefined);
  // Beide Zertifikate sind in der Signatur enthalten
  const certs = execFileSync("openssl", ["pkcs7", "-inform", "DER", "-in", join(dir, "x", "signature"), "-print_certs", "-noout"]).toString();
  assert.match(certs, /Pass Type ID: pass\.ch\.test/);
  assert.match(certs, /Test WWDR/);
});

test("ZIP mit mehreren Dateien", () => {
  const zip = zipStore({ a: Buffer.from("x"), b: Buffer.from("yy") });
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.equal(zip.readUInt16LE(zip.length - 22 + 10), 2);
});

test("Google Wallet: JWT-Inhalt und Signatur", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const account = { client_email: "wallet@test.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString() };
  const data = { issuerId: "3388000000012345678", cardId: "gyan_7_ABC2345", name: "Luca Meier", stampsLabel: "Stempel", stampsValue: "3 / 11", rewardLabel: "Prämie", rewardValue: "Noch 8 Stempel", qrValue: "GYAN:AbCdEfGhIjKlMnOpQrStUv", programName: "Stempelkarte", issuerName: "GYAN Hair Salon", logoUrl: "https://www.gyanhairsalon.ch/icons/app-512.png", siteUrl: "https://www.gyanhairsalon.ch" };
  const payload = saveJwtPayload(data, account, 1_700_000_000);
  assert.equal(payload.aud, "google");
  assert.equal(payload.typ, "savetowallet");
  assert.equal(payload.iss, account.client_email);
  assert.deepEqual(payload.origins, ["https://www.gyanhairsalon.ch"]);
  const [cls] = payload.payload.loyaltyClasses;
  const [obj] = payload.payload.loyaltyObjects;
  assert.equal(cls.id, "3388000000012345678.gyan_stempelkarte");
  assert.equal(cls.id, classId(data.issuerId));
  assert.equal(obj.classId, cls.id);
  assert.equal(obj.id, objectId(data.issuerId, data.cardId));
  assert.equal(obj.barcode.type, "QR_CODE");
  assert.equal(obj.barcode.value, data.qrValue);
  assert.equal(obj.loyaltyPoints.balance.string, "3 / 11");

  const url = saveUrl(data, account);
  assert.ok(url.startsWith("https://pay.google.com/gp/v/save/"));
  const jwt = url.slice("https://pay.google.com/gp/v/save/".length);
  const [h, b, s] = jwt.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(h, "base64url").toString()), { alg: "RS256", typ: "JWT" });
  assert.equal(JSON.parse(Buffer.from(b, "base64url").toString()).payload.loyaltyObjects[0].id, obj.id);
  assert.ok(createVerify("RSA-SHA256").update(`${h}.${b}`).verify(publicKey, Buffer.from(s, "base64url")));
  assert.equal(signJwt({ a: 1 }, account.private_key).split(".").length, 3);
});
