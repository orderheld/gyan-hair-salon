// Nur für die Startadresse "/": leitet sofort auf die passende Sprache weiter
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
