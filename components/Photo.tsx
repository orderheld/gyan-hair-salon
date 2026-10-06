import Image from "next/image";

type Props = { src: string | null; alt: string; label?: string; mono?: boolean; className?: string; priority?: boolean };

/** Zeigt ein Foto oder, solange keins hinterlegt ist, einen ruhigen Platzhalter. */
export function Photo({ src, alt, label, mono, className, priority }: Props) {
  return (
    <div className={`photo ${className ?? ""}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 760px) 100vw, 60vw" style={{ objectFit: "cover" }} priority={priority} />
      ) : (
        <>
          {mono && <div className="photo-mono" aria-hidden>GYAN</div>}
          {label && <span className="photo-label">{label}</span>}
        </>
      )}
    </div>
  );
}
