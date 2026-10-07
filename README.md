# GYAN Hair Salon · Webseite mit Buchungssystem

Next.js (App Router) · Neon Postgres · Resend · Vercel

**Ausführliche Schritt-für-Schritt-Anleitung mit Kopier-Knöpfen:** https://claude.ai/artifact/Dggv5DNqyHygkoan9ekc3R

- **Dreisprachig** (Deutsch, Französisch, Englisch): Webseite, Buchung, Kunden-E-Mails und Admin-Panel. Jede Sprache hat eigene Adressen (z. B. `/de/leistungen`, `/fr/prestations`, `/en/services`), sauber verknüpft für Google (hreflang, Sitemap, schema.org).
- **Startseite**: helles Design in Weiss und Beige. Vollbild-Intro (Logo, Faden, Schere schneidet). Hero mit wechselndem Wort, Live-Anzeige «Jetzt offen bis …» und «Nächster freier Termin bei Zana» (direkt aus Öffnungszeiten und Buchungen), Bildkomposition mit drehendem Siegel und Laufband mit allen Leistungen. Zanas echte Unterschrift wird wie mit einem Kugelschreiber gezogen. Leistungen als Bildkacheln, Filmstreifen mit Arbeiten. Mobile first.
- **Unterseiten**: Zana, Leistungen (jede mit eigener Seite und Text), Salon, Journal (Blog), FAQ, Kontakt, Impressum, Datenschutz.
- **Lokale SEO**: 5 Themenseiten (Coiffeur, Barbier, Herrencoiffeur, Fade, Bart in Biel) und 19 Ortsseiten (Nidau, Brügg, Port, Ipsach, Leubringen, Orpund, Lyss, Pieterlen, Studen, Lengnau, Grenchen, Magglingen, Twann/Tüscherz, Sutz-Lattrigen, Täuffelen, Aegerten, Safnern, Busswil, Orvin/Frinvillier), alle im Footer verlinkt und untereinander vernetzt.
- **Online-Buchung** nur bei Zana. Ist der Termin frei, ist er **sofort bestätigt**. Doppelbuchungen sind in der Datenbank ausgeschlossen (inkl. Puffer).
- **E-Mails**: Bestätigung (mit Kalendereintrag), Erinnerung vor dem Termin, Feedback nach dem Termin (Google-Bewertung, Instagram), Stornierung, Absage durch den Salon, Info an den Salon. Alles in der Sprache des Kunden.
- **Admin-Panel** unter `/admin` (DE/FR/EN): Termine, Leistungen (Texte in 3 Sprachen), Zeiten & Sperren, **Buchungsregeln** (Zeitraster, Mindestvorlauf, wie weit im Voraus, Puffer, Storno-Frist, Erinnerung, Feedback), **E-Mails** (an/aus, Texte pro Sprache, Vorschau, Test senden). Am Handy wie eine App: Leiste unten, grosse Tasten, Leistungen einklappbar, kein Zoomen beim Tippen.

Alle Befehle unten sind für **PowerShell** unter Windows.

---

## 1. Lokal starten (ohne Konto, in 2 Minuten)

Voraussetzung: Node.js 22 LTS und Git.

```powershell
winget install OpenJS.NodeJS.LTS
winget install Git.Git
```

Danach **PowerShell schliessen und neu öffnen**, dann einmalig Skripte erlauben (sonst blockiert Windows `npm`):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Projekt entpacken und starten (Zip liegt in Downloads):

```powershell
Expand-Archive "$HOME\Downloads\gyan-hair-salon.zip" -DestinationPath C:\Projekte -Force
cd C:\Projekte\gyan-hair-salon
npm install
Copy-Item .env.example .env.local
notepad .env.local   # ADMIN_PASSWORD=... setzen, Rest vorerst leer lassen
npm run dev
```

Dann <http://localhost:3000> öffnen, Admin unter <http://localhost:3000/admin>.
Ohne `DATABASE_URL` läuft lokal automatisch eine eingebaute Test-Datenbank (Ordner `.pglite`). E-Mails werden dann nur im Terminal angezeigt.

## 2. Auf GitHub hochladen

Leeres privates Repository auf github.com anlegen (z. B. `gyan-hair-salon`, ohne README), dann:

```powershell
git init
git add .
git commit -m "GYAN Webseite"
git branch -M main
git remote add origin https://github.com/orderheld/gyan-hair-salon.git
git push -u origin main
```

## 3. Datenbank (Neon)

1. Auf <https://console.neon.tech> ein Projekt anlegen, Region **AWS Europe Central 1 (Frankfurt)**.
2. **Connect** → Connection string kopieren (endet auf `?sslmode=require`).
3. In `.env.local` eintragen: `DATABASE_URL=postgresql://...`
4. Tabellen und Startdaten anlegen:

```powershell
npm run db:setup
```

Alternative: In Vercel unter **Storage → Neon** verbinden, dann setzt Vercel `DATABASE_URL` automatisch. `npm run db:setup` danach lokal mit derselben URL ausführen.

## 4. E-Mails (Resend)

1. Auf <https://resend.com> anmelden → **Domains → Add Domain** → deine Domain, Region **Ireland (eu-west-1)**.
2. Resend zeigt 3–4 DNS-Einträge (TXT/MX für `send` und `resend._domainkey`). Diese bei cyon eintragen (siehe Schritt 6). Nach ein paar Minuten auf **Verify** klicken.
3. **API Keys → Create** (Sending access) und in `.env.local` als `RESEND_API_KEY` eintragen.
4. `EMAIL_FROM` auf eine Adresse dieser Domain setzen, z. B. `GYAN Hair Salon <termin@gyanhairsalon.ch>`.
5. `SALON_NOTIFY_EMAIL` = Zanas E-Mail. Dorthin geht jede neue Buchung und Stornierung.

## 5. Veröffentlichen (Vercel)

**Im Browser:** <https://vercel.com/new> → GitHub-Repository importieren → unter **Environment Variables** alle Werte aus `.env.local` eintragen, dazu `COMING_SOON` = `1` (siehe Schritt 8) → **Deploy**.

**Oder per PowerShell:**

```powershell
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add RESEND_API_KEY production
vercel env add EMAIL_FROM production
vercel env add SALON_NOTIFY_EMAIL production
vercel env add ADMIN_PASSWORD production
vercel env add ADMIN_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add CRON_SECRET production
vercel env add COMING_SOON production
vercel --prod
```

Zufälligen Wert für `ADMIN_SECRET` erzeugen:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Jeder `git push` auf `main` veröffentlicht danach automatisch neu.

## 6. Domain von cyon auf Vercel zeigen

1. Vercel → Projekt → **Settings → Domains** → `gyanhairsalon.ch` und `www.gyanhairsalon.ch` hinzufügen. Vercel zeigt die nötigen DNS-Werte an.
2. Bei cyon: <https://my.cyon.ch> → **Domains & SSL → DNS-Zone** der Domain bearbeiten:

| Typ   | Name  | Wert                                   |
|-------|-------|----------------------------------------|
| A     | @     | `76.76.21.21` (oder der Wert, den Vercel anzeigt) |
| CNAME | www   | `cname.vercel-dns.com` (oder der Wert, den Vercel anzeigt) |

3. Bestehende **A/AAAA-Einträge für @ und www**, die auf cyon zeigen, löschen. **MX-Einträge nicht anfassen**, falls ihr E-Mail bei cyon habt.
4. Die Resend-Einträge aus Schritt 4 ebenfalls hier eintragen.
5. Nach 5–60 Minuten zeigt Vercel «Valid Configuration» und stellt das SSL-Zertifikat automatisch aus.
6. `NEXT_PUBLIC_SITE_URL` in Vercel auf `https://www.gyanhairsalon.ch` setzen und neu deployen (wird für Links in E-Mails gebraucht).

## 7. Erinnerungs- und Feedback-E-Mails (cron-job.org)

Vercel Hobby führt Cronjobs nur einmal pro Tag aus. Darum ruft der kostenlose Dienst cron-job.org die Seite alle 10 Minuten auf:

1. In Vercel `CRON_SECRET` auf einen langen Zufallswert setzen (siehe Befehl oben) und neu deployen.
2. Auf <https://cron-job.org> anmelden → **Create cronjob**.
3. URL: `https://www.gyanhairsalon.ch/api/cron?key=DEIN_CRON_SECRET`, Ausführung **alle 10 Minuten**, speichern.
4. Testen: Die Adresse im Browser öffnen, es erscheint `{"ok":true,...}`.

Zusätzlich prüft die Webseite bei Besuchen selbst, ob Mails fällig sind. Der Cronjob sorgt dafür, dass es auch nachts pünktlich klappt.

## 8. Coming soon und Livegang

Solange `COMING_SOON=1` in Vercel gesetzt ist, sehen Besucher auf jeder Adresse nur die Seite «Bald online» (mit Telefon, Route, Öffnungszeiten, DE/FR/EN). Google wird gebeten, nichts zu indexieren, und Online-Buchungen sind für Besucher gesperrt.

**Du und Zana sehen die echte Seite:** unten rechts auf «Login» tippen, Admin-Passwort eingeben. Danach ist die ganze Webseite offen (30 Tage, pro Gerät). Ihr könnt so auch echte Testbuchungen machen und die E-Mails prüfen.

**Livegang:** Vercel → Projekt → **Settings → Environment Variables** → `COMING_SOON` auf `0` setzen (oder löschen) → **Deployments → … → Redeploy**. Danach in der Google Search Console die Sitemap `https://www.gyanhairsalon.ch/sitemap.xml` einreichen.

---

## 9. Als App auf dem Home-Bildschirm

**Webseite (für Kunden):** Auf dem iPhone in Safari «Teilen» → «Zum Home-Bildschirm». Auf Android in Chrome «⋮» → «App installieren». GYAN startet dann ohne Browserleiste, mit eigenem Icon (beiges GA-Monogramm), unterer Tab-Leiste (Start, Leistungen, Buchen, Zana, Kontakt) und Zurück-Pfeil auf Unterseiten. Ohne Internet erscheint eine kleine Offline-Seite mit der Telefonnummer.

**Admin (für dich):** `/admin` im Browser öffnen, einloggen und genauso «Zum Home-Bildschirm». Das Admin hat ein eigenes dunkelbraunes Icon mit «ADMIN» und startet direkt bei den Terminen. Die Anmeldung bleibt 30 Tage gültig.

Icons liegen in `public/icons/`, die App-Daten in `app/site.webmanifest/route.ts` und `app/admin/app.webmanifest/route.ts`.

## 10. Kunden, E-Mail-Code und Stornos

- **E-Mail-Code:** Vor dem Buchen bekommt der Kunde einen 6-stelligen Code per E-Mail (10 Minuten gültig). Danach merkt sich sein Browser die Adresse 6 Monate, beim nächsten Mal geht es ohne Code. Ohne `RESEND_API_KEY` steht der Code lokal im Terminal.
- **Einwilligung:** Kunden bestätigen mit einem Haken, dass GYAN ihre Angaben auch für eigene Werbung nutzen darf. Admin → Kunden → «Werbe-Liste als CSV» lädt alle Adressen mit Einwilligung herunter (ohne Abgemeldete und Gesperrte).
- **Späte Stornierung:** Bis 12 Stunden vorher (Buchungsregeln) ist Stornieren gratis. Danach geht es trotzdem, der Kunde sieht aber den Hinweis, dass die Kosten beim nächsten Besuch verrechnet werden. Dasselbe gilt für «Nicht gekommen». Beides steht im Admin unter «Offene Kosten», bis du «Verrechnet» antippst.
- **Hinweise:** Bucht so ein Kunde wieder, erscheint der Termin oben unter «Hinweise zu kommenden Terminen», und die Admin-E-Mail enthält eine Zeile «Achtung». Der Kunde selbst sieht davon nichts.
- **Datenbank:** Neue Spalten und Tabellen legt die Webseite beim Start selbst an. `npm run db:setup` ist nach diesem Update nicht nötig.

## 11. Preisliste mit und ohne Termin

Die Leistungen entsprechen der Preisliste vom Oktober 2026 (Haarschnitt, Bart, Face, Pakete). Beim ersten Start nach dem Update ersetzt die Seite die alten Beispiel-Leistungen automatisch durch diese Liste, einmalig. Danach änderst du alles wie gewohnt unter **Admin → Preise**:

- **Preis** = mit Termin, **Ohne Termin** = Walk-in-Preis (leer lassen, wenn es die Leistung ohne Termin nicht extra gibt)
- **Weitere Einstellungen**: Gruppe (Haarschnitt, Bart, Face, Pakete) und «Beliebt»-Hinweis
- Dauer: Haarschnitt 20, Signature Cut 25, Bart Trim 15, Rasur 20, Face 20, Classic 30, Premium 40, Full Service 50 Minuten (beim Update automatisch gesetzt)

## Inhalte anpassen

| Was | Wo |
|-----|----|
| Leistungen, Preise, Dauer, Texte in 3 Sprachen | Admin → Leistungen |
| Öffnungszeiten, Ferien, gesperrte Zeiten | Admin → Zeiten & Sperren |
| Zeitraster, Vorlauf, Puffer, Storno-Frist, Erinnerung, Feedback | Admin → Buchungsregeln |
| E-Mail-Texte, welche E-Mails rausgehen | Admin → E-Mails |
| Google-Bewertungslink, Instagram, Benachrichtigungs-E-Mail | Admin → Buchungsregeln |
| Telefon, Adresse, E-Mail, Bilder | `content/site.ts` |
| Alle Seitentexte (DE/FR/EN) | `lib/i18n/dict/de.ts`, `fr.ts`, `en.ts` |
| Fotos | Datei nach `public/images/` legen, Pfad in `content/site.ts` |
| SEO-Seiten (Themen und Orte) | `content/seo/topics.ts`, `content/seo/places.ts` |

## Neuen Blogartikel hinzufügen

1. Eine bestehende Datei in `content/blog/` kopieren, z. B. `wie-oft-zum-coiffeur.ts` → `mein-neuer-artikel.ts`.
2. `key`, `slug` (pro Sprache), `date`, `image`, `title`, `description` und `body` anpassen. Im Text funktionieren `## Zwischentitel`, `- Listen`, `**fett**` und interne Links wie `[Termin buchen](page:booking)`, `[Haarschnitt](service:haarschnitt-biel)`, `[Coiffeur Nidau](seo:nidau)`.
3. In `content/blog/index.ts` importieren und **zuoberst** in die Liste setzen.
4. `git add . ; git commit -m "Neuer Artikel" ; git push` → Vercel veröffentlicht automatisch, Sitemap und Footer sind sofort aktuell.

Oder einfach Claude das Thema geben, dann kommt der fertige Artikel in drei Sprachen.

## Aufbau

```
app/[lang]/            Öffentliche Seiten pro Sprache (Ordnernamen intern deutsch)
app/[lang]/[...slug]   SEO-Seiten (Themen und Orte)
app/admin/             Admin-Panel und Server-Aktionen
app/api/               Freie Zeiten, Buchung, Cron für Erinnerungen
proxy.ts               Sprache erkennen, übersetzte Adressen (z. B. /fr/prestations)
components/            Header, Footer, Animationen (Intro, Filmstreifen), Buchung
content/               Blog, SEO-Seiten, Kontaktangaben
lib/i18n/              Alle Texte DE/FR/EN (Webseite, E-Mails, Admin)
db/                    Datenbankschema und Startdaten (Leistungen in 3 Sprachen)
lib/email.ts           Alle E-Mails (festes Design, Texte aus dem Admin)
lib/jobs.ts            Erinnerungen und Feedback-E-Mails
```

## Update von Version 1

Falls du Version 1 lokal laufen hattest: den Ordner `.pglite` löschen (`Remove-Item -Recurse -Force .pglite`), die Datenbank hat neue Felder. Falls Neon schon mit Version 1 eingerichtet war: dort am einfachsten ein neues Projekt anlegen und `npm run db:setup` ausführen.

## 12. Tempo und Zwischenspeicher

Die öffentlichen Seiten werden fertig gerechnet zwischengespeichert und kommen dadurch sofort. Änderungen im Admin (Preise, Zeiten, Texte) erscheinen gleich nach dem Speichern auf der Website. Spätestens alle 10 Minuten wird zusätzlich automatisch aufgefrischt.

Die Live-Angaben auf der Startseite (offen/geschlossen, nächster freier Termin) werden bei jedem Besuch frisch über `/api/live` geladen. Buchung, Bestätigung und Stornierung sind nie zwischengespeichert.

## 13. Wenn E-Mails nicht ankommen

- Im Admin unter **Termine** erscheint oben eine Warnung mit der genauen Meldung von Resend, wenn eine E-Mail nicht rausging.
- Häufigste Ursache: Die Absender-Domain ist in Resend nicht verifiziert. Ohne verifizierte Domain schickt Resend nur an die eigene Konto-Adresse, Kunden bekommen nichts (auch keinen Buchungscode). Lösung: Schritt 4 und 6 (DNS-Einträge bei cyon, **Verify** in Resend, `EMAIL_FROM` auf diese Domain, Redeploy).
- Kommt der Buchungscode nicht an, sieht der Kunde jetzt direkt eine Meldung mit der Bitte anzurufen.
- Unter **E-Mails** zeigt die Test-E-Mail bei einem Fehler die Meldung von Resend an.
- Vercel → **Logs**, Suche nach `E-Mail-Fehler`, zeigt jeden Fehler mit Empfänger.

## 14. Admin: Kalender, Termine und Kunden

- **Kalender** (Menü «Kalender»): Tag, Woche oder Monat. Auf einen Termin tippen öffnet ihn, auf eine freie Stelle tippen trägt einen neuen Termin zu dieser Zeit ein. Sperrzeiten und Pausen sind schraffiert, am Handy wischt man durch die Woche.
- **Termin öffnen:** Leistung, Datum, Uhrzeit, Preis, Name, Telefon, E-Mail, Sprache und Notizen ändern. Beim Verschieben bekommt der Kunde auf Wunsch eine neue Bestätigung mit Kalendereintrag. Überschneidungen und Sperrzeiten werden geprüft. Dazu: Anrufen, WhatsApp, E-Mail, Bestätigung nochmals senden, Nicht gekommen, Stornieren und **Endgültig löschen**.
- **Kundenkarte** (Kunden → Kundenkarte öffnen): alle Termine, Besuche, Umsatz, Kontaktdaten ändern (gilt für alle Termine), Notiz, Werbe-Abmeldung, Sperren, neuen Termin für den Kunden und **Kunde endgültig löschen** (mit allen Terminen, z. B. auf Wunsch nach Datenschutzgesetz).

## 15. Push-Benachrichtigungen

**Einmal einrichten (2 Minuten):**

1. In PowerShell im Projektordner: `npx web-push generate-vapid-keys`
2. Die zwei Schlüssel in Vercel → **Settings → Environment Variables** eintragen: `VAPID_PUBLIC_KEY` (Public Key) und `VAPID_PRIVATE_KEY` (Private Key). Danach **Redeploy**.
3. Admin auf dem Handy öffnen und oben auf **Aktivieren** tippen. Am iPhone das Admin vorher über «Teilen → Zum Home-Bildschirm» als App ablegen und von dort öffnen (Apple erlaubt Push nur so).
4. Unter **E-Mails → Push-Benachrichtigungen** eine Testnachricht senden.

**Was kommt wann:**

- Admin: sofort bei jeder neuen Online-Buchung und bei jeder Stornierung durch den Kunden. Antippen öffnet den Termin.
- Kunde: Beim Buchen fragt der Browser direkt nach der Erlaubnis. Danach: «Termin bestätigt», Erinnerung vor dem Termin (gleiche Zeit wie die Erinnerungs-Mail), Dankeschön nach dem Termin mit Knöpfen für Google-Bewertung und Instagram (gleiche Zeit wie die Feedback-Mail), plus Hinweis bei Verschiebung oder Absage durch den Salon.
- Push und E-Mail laufen immer zusammen und folgen denselben Schaltern unter **E-Mails**. Wer keine Push-Erlaubnis gibt, bekommt einfach nur die E-Mails.
- Ein Browser darf Benachrichtigungen nie ohne Zustimmung erlauben. Die Abfrage kommt deshalb genau beim Klick auf «Buchen» bzw. «Aktivieren», wo die meisten zustimmen.

### Absender-Zeile («von gyanhairsalon.ch»)

Diese Zeile setzt der Browser, nicht die Webseite. Sie verschwindet, wenn die Seite als App installiert ist:
- **Admin:** Admin im Browser öffnen, «Zum Startbildschirm hinzufügen» bzw. «App installieren», danach in der App einmal «Aktivieren». Die Meldungen kommen dann von «GYAN Admin».
- **Kunden:** Wer die Seite als App installiert hat, bekommt die Meldungen von «GYAN». Im normalen Browser zeigen Android und Computer immer den Browser und die Adresse an.
- Am iPhone gibt es Push nur in der installierten App, dort steht immer der App-Name.

## 16. Meine Termine (Kunden-Bereich)

Kunden finden oben rechts das Personen-Symbol (im Handy-Menü «Meine Termine»). Pfade: `/de/meine-termine`, `/fr/mes-rendez-vous`, `/en/my-bookings`.

- **Kein Passwort:** E-Mail eingeben, 6-stelligen Code aus der Mail eintippen, fertig. Wer schon gebucht hat, ist auf diesem Gerät automatisch angemeldet (180 Tage).
- **Buchen bleibt ohne Konto möglich.** Angemeldete Kunden finden Name, E-Mail und Telefon im Formular schon ausgefüllt.
- Kunden sehen kommende Termine (mit Route und «Stornieren»), frühere Termine mit «Nochmals buchen» und offene Kosten aus kurzfristigen Stornierungen.
- Verschieben geht über Stornieren und neu buchen, oder per Telefon. Im Admin verschiebst du wie bisher.
- «Abmelden» löscht die Anmeldung auf diesem Gerät. Die Seite erscheint nicht bei Google.
