import type { SeoPlace } from "../types";

export const places: SeoPlace[] = [
  // ───────────────────────────── NIDAU ─────────────────────────────
  {
    key: "nidau",
    name: { de: "Nidau", fr: "Nidau", en: "Nidau" },
    slug: { de: "coiffeur-nidau", fr: "coiffeur-nidau", en: "barber-nidau" },
    km: 2,
    title: {
      de: "Coiffeur für Nidau – Herrenschnitt in Biel | GYAN",
      fr: "Coiffeur près de Nidau – barbier à Bienne | GYAN",
      en: "Barber near Nidau – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Nidau: GYAN in Biel, nur 2 km entfernt. Haarschnitt in rund 20 Minuten, passt in die Mittagspause. Jetzt online Termin buchen.",
      fr: "Coiffeur homme près de Nidau : GYAN à Bienne, à 2 km. Une coupe en 20 minutes environ, idéale à midi. Réserve ton rendez-vous en ligne.",
      en: "Barber near Nidau: GYAN in Biel is just 2 km away. A men's haircut takes about 20 minutes, ideal at lunchtime. Book your slot online now.",
    },
    h1: {
      de: "Herrencoiffeur für Nidau",
      fr: "Coiffeur homme près de Nidau",
      en: "Barber near Nidau",
    },
    intro: {
      de: "Von Nidau bis zu GYAN an der Zentralstrasse 22 sind es nur rund zwei Kilometer, zu Fuss, mit dem Velo oder mit der BTI-Bahn schnell gemacht.",
      fr: "De Nidau à GYAN, à la Zentralstrasse 22, il n'y a qu'environ deux kilomètres : à pied, à vélo ou en train BTI, c'est vite fait.",
      en: "From Nidau to GYAN on Zentralstrasse 22 it's only about two kilometres, a quick trip on foot, by bike or on the BTI line.",
    },
    body: {
      de: `## Nidau und Biel: eine Grenze, die man kaum sieht

Nidau ist ein kleines historisches Städtchen mit Schloss, gelegen dort, wo der Bielersee in den Nidau-Büren-Kanal abfliesst. Gegen Norden geht Nidau nahtlos in Biel über, und wer zwischen den beiden Orten unterwegs ist, merkt oft gar nicht, wann er die Gemeindegrenze überquert. Für viele, die in Nidau wohnen, ist Biel deshalb nicht einfach die Stadt nebenan, sondern Teil des Alltags: Arbeit, Bahnhof, Einkauf, alles liegt nur wenige Minuten entfernt.

## Von Nidau an die Zentralstrasse

Rund zwei Kilometer trennen Nidau von unserem Salon an der Zentralstrasse 22. Das ist eine Strecke, die du gut zu Fuss oder mit dem Velo schaffst, flach und ohne Steigung. Wer lieber den öffentlichen Verkehr nimmt, steigt in die BTI-Bahn Biel-Täuffelen-Ins, die durch Nidau fährt und am Bahnhof Biel endet; auch Busse verbinden Nidau mit dem Bahnhof. Von dort sind es nur ein paar Minuten zu Fuss bis zu uns. Mit dem Auto rechnest du mit rund zehn Minuten bis ins Bieler Zentrum, wo es öffentliche Parkplätze gibt.

## Ein Schnitt, der in die Mittagspause passt

Weil der Weg so kurz ist, lässt sich der Coiffeur einfach in den Tag einbauen. Ein [Herren Haarschnitt](service:haarschnitt-biel) dauert bei uns rund 20 Minuten, ein Bart Trim rund 15 Minuten. Mit Hin- und Rückweg passt das gut in eine längere Mittagspause. Wer beides auf einmal erledigen will, nimmt das [GYAN Classic Paket](service:haarschnitt-und-bart) mit Haarschnitt und Bart, das rund 30 Minuten dauert.

Du kannst deinen Termin [online buchen](page:booking) und bekommst sofort eine Bestätigung. Spontan vorbeikommen geht ebenfalls, denn während der Öffnungszeiten sind Walk-ins willkommen. Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, am Donnerstag und Freitag bis 20 Uhr und am Samstag von 8.30 bis 18 Uhr. Sonntags bleibt der Salon geschlossen.

## Was dich bei GYAN erwartet

Im Salon sitzt du auf braunen Lederstühlen, an der Wand hängt ein roter Perserteppich. Bevor Schere und Maschine zum Einsatz kommen, schauen wir uns an, wie dein Haar wächst, wo die Wirbel sitzen und wie viel Zeit du morgens investieren willst. Ob kurzer Fade oder klassischer Seitenscheitel: Das Ziel ist ein Schnitt, der auch nach ein paar Wochen noch Form hat. Bezahlen kannst du bar, mit Karte oder mit TWINT.

Nach dem Termin bist du in wenigen Minuten wieder in Nidau, vielleicht für einen Spaziergang am Seeufer oder entlang dem Kanal. Wohnst du weiter südlich am See, findest du auch eine eigene Seite für [Ipsach](seo:ipsach).`,
      fr: `## Nidau et Bienne : une frontière qu'on ne voit presque pas

Nidau est une petite ville historique avec son château, située là où le lac de Bienne s'écoule dans le canal Nidau-Büren. Au nord, Nidau se fond dans Bienne sans transition, et en passant de l'une à l'autre, on ne remarque souvent même pas la limite communale. Pour beaucoup d'habitants de Nidau, Bienne n'est donc pas simplement la ville d'à côté, mais une partie du quotidien : le travail, la gare, les courses, tout est à quelques minutes.

## De Nidau à la Zentralstrasse

Environ deux kilomètres séparent Nidau de notre salon à la Zentralstrasse 22. Une distance qui se fait très bien à pied ou à vélo, sur un terrain plat. Si tu préfères les transports publics, prends le train BTI Bienne-Täuffelen-Anet, qui traverse Nidau et arrive à la gare de Bienne ; des bus relient aussi Nidau à la gare. De là, il ne reste que quelques minutes à pied jusqu'au salon. En voiture, compte une dizaine de minutes jusqu'au centre de Bienne, où tu trouves des places de parc publiques.

## Une coupe qui tient dans la pause de midi

Comme le trajet est court, passer chez le coiffeur s'intègre facilement dans ta journée. Une [coupe homme](service:haarschnitt-biel) dure chez nous environ 20 minutes, une taille de barbe environ 15 minutes. Aller et retour compris, ça rentre bien dans une pause de midi un peu longue. Si tu veux faire les deux d'un coup, choisis la [formule GYAN Classic](service:haarschnitt-und-bart) avec coupe et barbe, en une trentaine de minutes.

Tu peux [réserver en ligne](page:booking) et recevoir ta confirmation immédiatement. Tu peux aussi passer spontanément : pendant les heures d'ouverture, les clients sans rendez-vous sont les bienvenus. Du lundi au mercredi, on est là de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, et le samedi de 8 h 30 à 18 h. Le dimanche, le salon est fermé.

## Ce qui t'attend chez GYAN

Au salon, tu t'installes dans un fauteuil en cuir brun, avec un tapis persan rouge accroché au mur. Avant de sortir ciseaux et tondeuse, on regarde comment tes cheveux poussent, où se trouvent les épis et combien de temps tu veux y consacrer le matin. Dégradé court ou raie sur le côté classique : l'objectif est une coupe qui garde sa forme plusieurs semaines. Tu paies en espèces, par carte ou avec TWINT.

Après ton rendez-vous, tu es de retour à Nidau en quelques minutes, peut-être pour une balade au bord du lac ou le long du canal. Tu habites plus au sud, le long du lac ? Il existe aussi une page pour [Ipsach](seo:ipsach).`,
      en: `## Nidau and Biel: a border you barely notice

Nidau is a small historic town with a castle, sitting where Lake Biel drains into the Nidau-Büren canal. To the north it runs straight into Biel, and moving between the two you often won't notice where one municipality ends and the other begins. So if you live in Nidau, Biel isn't really the town next door, it's part of your daily routine: work, the station, shopping, all just minutes away.

## From Nidau to Zentralstrasse

Around two kilometres separate Nidau from our salon at Zentralstrasse 22. That's an easy distance on foot or by bike, flat the whole way. If you'd rather take public transport, hop on the BTI line Biel-Täuffelen-Ins, which runs through Nidau and ends at Biel station; buses also link Nidau with the station. From there it's just a few minutes' walk to us. By car, allow about ten minutes into central Biel, where you'll find public parking.

## A cut that fits into your lunch break

Because the trip is so short, a haircut slots easily into your day. A [men's haircut](service:haarschnitt-biel) takes about 20 minutes with us, a beard trim about 15. Including the trip there and back, that fits into a longer lunch break. Want both at once? Go for the [GYAN Classic package](service:haarschnitt-und-bart), haircut and beard in about 30 minutes.

You can [book online](page:booking) and get your confirmation right away. Dropping in works too, since walk-ins are welcome during opening hours. Monday to Wednesday we're open 9am to 7pm, Thursday and Friday until 8pm, and Saturday from 8:30am to 6pm. On Sundays the salon is closed.

## What to expect at GYAN

In the salon you sit in a brown leather chair, with a red Persian carpet hanging on the wall. Before the scissors and clippers come out, we look at how your hair grows, where the crowns sit and how much time you want to spend on it in the morning. Short fade or classic side part, the goal is a cut that still holds its shape a few weeks later. You can pay in cash, by card or with TWINT.

After your appointment you're back in Nidau within minutes, maybe for a walk along the lakeshore or the canal. Living further south along the lake? There's also a page for [Ipsach](seo:ipsach).`,
    },
    neighbors: ["ipsach", "port", "bruegg", "sutz-lattrigen"],
    carMin: 10,
    transit: {
      de: "Mit der BTI-Bahn Biel-Täuffelen-Ins oder dem Bus von Nidau zum Bahnhof Biel, dann wenige Minuten zu Fuss.",
      fr: "Avec le train BTI Bienne-Täuffelen-Anet ou le bus de Nidau jusqu'à la gare de Bienne, puis quelques minutes à pied.",
      en: "Take the BTI line Biel-Täuffelen-Ins or the bus from Nidau to Biel station, then walk a few minutes.",
    },
    services: ["haarschnitt-biel", "bart-trimmen-biel", "haarschnitt-und-bart"],
    faq: {
      de: [
        { q: "Kann ich von Nidau aus zu Fuss oder mit dem Velo zu GYAN kommen?", a: "Ja. Von Nidau bis zur Zentralstrasse 22 in Biel sind es nur rund zwei Kilometer auf flachem Weg, das geht gut zu Fuss oder mit dem Velo." },
        { q: "Passt ein Coiffeurtermin von Nidau aus in die Mittagspause?", a: "Meistens schon. Ein Herren Haarschnitt dauert rund 20 Minuten, ein Bart Trim rund 15 Minuten, und der Weg von Nidau ist kurz." },
        { q: "Muss ich als Kunde aus Nidau vorher einen Termin buchen?", a: "Nein, während der Öffnungszeiten sind Walk-ins willkommen. Wenn du eine feste Zeit willst, buchst du online und bekommst sofort eine Bestätigung." },
      ],
      fr: [
        { q: "Puis-je venir de Nidau chez GYAN à pied ou à vélo ?", a: "Oui. De Nidau à la Zentralstrasse 22 à Bienne, il n'y a qu'environ deux kilomètres sur un trajet plat, facile à pied ou à vélo." },
        { q: "Un rendez-vous depuis Nidau tient-il dans la pause de midi ?", a: "En général, oui. Une coupe homme dure environ 20 minutes, une taille de barbe environ 15 minutes, et le trajet depuis Nidau est court." },
        { q: "Dois-je réserver à l'avance si je viens de Nidau ?", a: "Non, pendant les heures d'ouverture tu peux passer sans rendez-vous. Si tu veux une heure fixe, réserve en ligne : la confirmation est immédiate." },
      ],
      en: [
        { q: "Can I walk or cycle from Nidau to GYAN?", a: "Yes. It's only about two kilometres on flat ground from Nidau to Zentralstrasse 22 in Biel, an easy walk or bike ride." },
        { q: "Does an appointment fit into a lunch break if I work or live in Nidau?", a: "Usually, yes. A men's haircut takes about 20 minutes and a beard trim about 15, and the trip from Nidau is short." },
        { q: "Do I need to book ahead when coming from Nidau?", a: "No, walk-ins are welcome during opening hours. If you want a fixed time, book online and you'll get instant confirmation." },
      ],
    },
  },

  // ───────────────────────────── BRÜGG ─────────────────────────────
  {
    key: "bruegg",
    name: { de: "Brügg", fr: "Brügg", en: "Brügg" },
    slug: { de: "coiffeur-bruegg", fr: "coiffeur-brugg", en: "barber-bruegg" },
    km: 5,
    title: {
      de: "Coiffeur für Brügg – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Brügg – barbier à Bienne | GYAN",
      en: "Barber near Brügg – cuts & beards in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Brügg: mit dem Zug nach Biel, wenige Minuten zu GYAN. Bart Trim und Rasur, Do und Fr bis 20 Uhr offen. Jetzt online Termin buchen.",
      fr: "Coiffeur pour Brügg : en train jusqu'à Bienne, puis GYAN à pied. Barbe et rasage, ouvert jusqu'à 20 h jeudi et vendredi. Réserve en ligne.",
      en: "Barber for Brügg: a short train ride to Biel, then a few minutes to GYAN. Beard trims and shaves, open till 8pm Thu and Fri. Book online now.",
    },
    h1: {
      de: "Herrencoiffeur für Brügg",
      fr: "Coiffeur homme près de Brügg",
      en: "Barber near Brügg",
    },
    intro: {
      de: "Brügg hat einen eigenen Bahnhof an der Linie Lyss-Biel. Mit dem Zug bist du schnell in Biel, und vom Bahnhof sind es nur wenige Minuten zu GYAN.",
      fr: "Brügg a sa propre gare sur la ligne Lyss-Bienne. En train, tu es vite à Bienne, et de la gare il ne reste que quelques minutes jusqu'à GYAN.",
      en: "Brügg has its own station on the Lyss-Biel line. The train gets you to Biel fast, and from the station GYAN is only a few minutes' walk.",
    },
    body: {
      de: `## Brügg: Bahnhof gleich um die Ecke

Brügg grenzt im Osten direkt an Biel und liegt am Nidau-Büren-Kanal, der im Zuge der Juragewässerkorrektion gebaut wurde und das Wasser der Aare aus dem Bielersee weiterführt. Für den Weg in die Stadt hat Brügg einen grossen Vorteil: einen eigenen Bahnhof an der Linie zwischen Lyss und Biel. Damit bist du schneller am Bahnhof Biel als mancher, der in der Stadt selbst wohnt.

Vom Bahnhof Biel gehst du nur ein paar Minuten bis zu GYAN an der Zentralstrasse 22. Mit dem Auto fährst du die rund fünf Kilometer ins Zentrum und parkierst auf einem der öffentlichen Parkplätze; rechne mit etwa einer Viertelstunde. Wer gerne Velo fährt, kommt flach und ohne grosse Umwege in die Stadt.

## Feierabend am Donnerstag und Freitag

Viele, die in Brügg wohnen, sind tagsüber ohnehin unterwegs, in Biel, in Bern oder anderswo entlang der Bahnlinie. Für einen Coiffeurtermin bietet sich deshalb der Abend an. Am Donnerstag und Freitag sind wir bis 20 Uhr im Salon, Montag bis Mittwoch bis 19 Uhr. Du steigst in Biel aus, gehst ein paar Minuten zu Fuss, lässt dir die Haare schneiden und nimmst danach den Zug zurück nach Brügg. Am Samstag öffnen wir schon um 8.30 Uhr, falls dir der Morgen lieber ist.

## Wenn der Bart im Mittelpunkt steht

Ein gepflegter Bart braucht regelmässig Aufmerksamkeit, oft öfter als das Haar. Beim [Bart Trim](service:bart-trimmen-biel) bringen wir die Länge mit Maschine und Schere in Form und ziehen die Linien an Wange und Hals mit der Klinge. Das dauert rund 15 Minuten und eignet sich gut zwischen zwei Haarschnitten. Wer es glatt mag, wählt die [Bart Rasur mit heissem Tuch](service:nassrasur-biel): heisses Tuch, warmer Schaum, ruhige Klinge, danach ein kühles Tuch und Balsam.

Haar und Bart zusammen gibt es im GYAN Classic Paket. Wer zusätzlich Wäsche und Styling möchte, nimmt das GYAN Premium Paket.

## Planbar oder spontan

Einen festen Termin [buchst du online](page:booking), die Bestätigung kommt sofort. Das ist praktisch, wenn du den Zug danach schon im Kopf hast. Spontan geht es auch: Während der Öffnungszeiten sind Walk-ins willkommen. Im Salon erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand, bezahlt wird bar, mit Karte oder mit TWINT.

Wohnst du auf der anderen Seite des Kanals, schau auf unserer Seite für [Aegerten](seo:aegerten) vorbei.`,
      fr: `## Brügg : la gare à deux pas

Brügg touche Bienne à l'est et se trouve au bord du canal Nidau-Büren, creusé lors de la correction des eaux du Jura pour conduire l'Aar hors du lac de Bienne. Pour aller en ville, Brügg a un vrai atout : sa propre gare, sur la ligne entre Lyss et Bienne. Résultat : tu es parfois plus vite à la gare de Bienne que certains habitants de la ville.

De la gare de Bienne, il ne faut que quelques minutes à pied jusqu'à GYAN, à la Zentralstrasse 22. En voiture, tu parcours les quelque cinq kilomètres jusqu'au centre et tu te gares sur une place de parc publique ; compte environ un quart d'heure. À vélo, le trajet est plat et direct.

## Le soir, le jeudi et le vendredi

Beaucoup d'habitants de Brügg passent la journée ailleurs, à Bienne, à Berne ou ailleurs le long de la ligne. Le soir est donc souvent le meilleur moment pour le coiffeur. Le jeudi et le vendredi, on est au salon jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h. Tu descends du train à Bienne, quelques minutes à pied, la coupe, puis le train du retour vers Brügg. Le samedi, on ouvre dès 8 h 30 si tu préfères le matin.

## Quand la barbe passe en premier

Une barbe soignée demande de l'attention régulière, souvent plus que les cheveux. Pour la [taille de barbe](service:bart-trimmen-biel), on ajuste la longueur à la tondeuse et aux ciseaux et on trace les lignes des joues et du cou au rasoir. Environ 15 minutes, idéal entre deux coupes. Tu préfères une peau lisse ? Le [rasage à la serviette chaude](service:nassrasur-biel) : serviette chaude, mousse tiède, lame précise, puis serviette fraîche et baume.

Cheveux et barbe ensemble, c'est la formule GYAN Classic. Avec en plus shampooing et coiffage, choisis la formule GYAN Premium.

## Prévu ou improvisé

Pour une heure fixe, [réserve en ligne](page:booking) : la confirmation arrive tout de suite. Pratique quand tu as déjà ton train de retour en tête. Sans rendez-vous, c'est possible aussi : pendant les heures d'ouverture, les clients spontanés sont les bienvenus. Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur ; tu paies en espèces, par carte ou avec TWINT.

Tu habites de l'autre côté du canal ? Va voir notre page pour [Aegerten](seo:aegerten).`,
      en: `## Brügg: the station is right there

Brügg borders Biel to the east and sits on the Nidau-Büren canal, built during the Jura water correction to carry the Aare out of Lake Biel. When it comes to getting into town, Brügg has a real advantage: its own station on the line between Lyss and Biel. That can put you at Biel station faster than some people who actually live in the city.

From Biel station it's just a few minutes on foot to GYAN at Zentralstrasse 22. By car you cover the roughly five kilometres into the centre and use one of the public car parks; allow about a quarter of an hour. On a bike, the ride is flat and direct.

## After work on Thursday and Friday

Lots of people in Brügg spend the day elsewhere, in Biel, in Bern or somewhere else along the line. So the evening is often the best time for a haircut. On Thursday and Friday we're in the salon until 8pm, Monday to Wednesday until 7pm. Get off the train in Biel, walk a few minutes, get your cut and catch the train back to Brügg. On Saturday we open at 8:30am if mornings suit you better.

## When the beard comes first

A well-kept beard needs regular attention, often more than your hair does. With a [beard trim](service:bart-trimmen-biel) we shape the length with clippers and scissors and set the cheek and neck lines with the razor. It takes about 15 minutes and works well between two haircuts. Prefer it smooth? Book the [hot towel shave](service:nassrasur-biel): hot towel, warm lather, a steady blade, then a cool towel and balm.

Hair and beard together come as the GYAN Classic package. If you want a wash and styling on top, pick the GYAN Premium package.

## Planned or spur of the moment

For a fixed time, [book online](page:booking) and the confirmation lands straight away. Handy when you already know which train you're taking home. Dropping in works too, since walk-ins are welcome during opening hours. Inside you'll find brown leather chairs and a red Persian carpet on the wall, and you can pay in cash, by card or with TWINT.

Living on the other side of the canal? Have a look at our page for [Aegerten](seo:aegerten).`,
    },
    neighbors: ["port", "nidau", "orpund", "aegerten"],
    carMin: 15,
    transit: {
      de: "Mit dem Zug auf der Linie Lyss-Biel vom Bahnhof Brügg zum Bahnhof Biel, dann wenige Minuten zu Fuss.",
      fr: "En train sur la ligne Lyss-Bienne depuis la gare de Brügg jusqu'à la gare de Bienne, puis quelques minutes à pied.",
      en: "Take the train on the Lyss-Biel line from Brügg station to Biel station, then walk a few minutes.",
    },
    services: ["bart-trimmen-biel", "nassrasur-biel", "haarschnitt-und-bart", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Wie komme ich von Brügg mit dem Zug zu GYAN?", a: "Vom Bahnhof Brügg fährst du mit dem Zug zum Bahnhof Biel. Von dort sind es nur wenige Minuten zu Fuss bis zur Zentralstrasse 22." },
        { q: "Kann ich nach der Arbeit noch von Brügg aus zum Coiffeur kommen?", a: "Ja, am Donnerstag und Freitag ist der Salon bis 20 Uhr offen, Montag bis Mittwoch bis 19 Uhr. So bleibt nach Feierabend genug Zeit für den Weg von Brügg." },
        { q: "Wo parke ich, wenn ich von Brügg mit dem Auto komme?", a: "Im Bieler Stadtzentrum gibt es öffentliche Parkplätze. Für die rund fünf Kilometer von Brügg rechnest du mit etwa einer Viertelstunde Fahrzeit." },
      ],
      fr: [
        { q: "Comment venir de Brügg chez GYAN en train ?", a: "Depuis la gare de Brügg, tu prends le train jusqu'à la gare de Bienne. De là, il ne reste que quelques minutes à pied jusqu'à la Zentralstrasse 22." },
        { q: "Puis-je encore passer après le travail si j'habite à Brügg ?", a: "Oui, le jeudi et le vendredi le salon est ouvert jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h. Ça laisse assez de temps pour le trajet depuis Brügg." },
        { q: "Où me garer si je viens de Brügg en voiture ?", a: "Le centre de Bienne dispose de places de parc publiques. Pour les quelque cinq kilomètres depuis Brügg, compte environ un quart d'heure de route." },
      ],
      en: [
        { q: "How do I get from Brügg to GYAN by train?", a: "From Brügg station, take the train to Biel station. From there it's just a few minutes' walk to Zentralstrasse 22." },
        { q: "Can I still make it after work if I live in Brügg?", a: "Yes, the salon is open until 8pm on Thursday and Friday and until 7pm Monday to Wednesday. That leaves enough time for the trip from Brügg after work." },
        { q: "Where do I park when driving in from Brügg?", a: "There is public parking in central Biel. For the roughly five kilometres from Brügg, allow about a quarter of an hour." },
      ],
    },
  },

  // ───────────────────────────── PORT ─────────────────────────────
  {
    key: "port",
    name: { de: "Port", fr: "Port", en: "Port" },
    slug: { de: "coiffeur-port", fr: "coiffeur-port", en: "barber-port" },
    km: 4,
    title: {
      de: "Coiffeur für Port – Fade & Schnitt in Biel | GYAN",
      fr: "Coiffeur près de Port – dégradé à Bienne | GYAN",
      en: "Barber near Port – fades & cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Port: per Bus oder Velo rund 4 km zu GYAN in Biel. Fade und Signature Cut, samstags schon ab 8.30 Uhr offen. Jetzt online buchen.",
      fr: "Coiffeur près de Port : en bus ou à vélo, GYAN à Bienne est à 4 km. Dégradé et Signature Cut, ouvert dès 8 h 30 le samedi. Réserve en ligne.",
      en: "Barber near Port: GYAN in Biel is about 4 km by bus or bike. Fades and the Signature Cut, open from 8:30am on Saturdays. Book online now.",
    },
    h1: {
      de: "Herrencoiffeur für Port",
      fr: "Coiffeur homme près de Port",
      en: "Barber near Port",
    },
    intro: {
      de: "Port, die Gemeinde mit dem Regulierwehr am Nidau-Büren-Kanal, liegt rund vier Kilometer von GYAN entfernt. Mit Bus, Velo oder Auto bist du schnell in Biel.",
      fr: "Port, la commune du barrage sur le canal Nidau-Büren, se trouve à environ quatre kilomètres de GYAN. En bus, à vélo ou en voiture, tu es vite à Bienne.",
      en: "Port, home of the weir on the Nidau-Büren canal, is about four kilometres from GYAN. By bus, bike or car you're in Biel in no time.",
    },
    body: {
      de: `## Port und das Wehr am Kanal

Port liegt am Südufer des Nidau-Büren-Kanals, gleich hinter Nidau. Bekannt ist die Gemeinde vor allem für das Regulierwehr Port: Hier wird der Abfluss aus dem Bielersee gesteuert und damit der Wasserstand des Sees geregelt. Das Wehr ist Teil der Juragewässerkorrektion, die das Seeland grundlegend verändert hat. Rund um den Kanal ist Port ruhig und grün, ein Wohnort mit viel Wasser in der Nähe und der Stadt Biel nur wenige Kilometer entfernt.

## Ohne Bahnhof, aber mit Bus und Velo

Einen Bahnhof hat Port nicht, das macht den Weg in die Stadt aber nicht komplizierter. Der Bus bringt dich zum Bahnhof Biel, und von dort gehst du nur wenige Minuten bis zu GYAN an der Zentralstrasse 22. Mit dem Velo fährst du durch Nidau Richtung Biel, flach und ohne Hektik. Mit dem Auto geht es ebenfalls über Nidau ins Bieler Zentrum, wo öffentliche Parkplätze zur Verfügung stehen. Für die rund vier Kilometer rechnest du mit etwa zehn Minuten.

## Fade oder Signature Cut

Ein Fade lebt von seinem Übergang. Beim [Herren Haarschnitt](service:haarschnitt-biel) schauen wir zuerst, wie dein Haar wächst und wo die Wirbel sitzen, und entscheiden dann, wo die Maschine arbeitet und wo die Schere. Ob Low Fade, Skin Fade oder klassischer Seitenscheitel: Das Ziel ist ein Schnitt, der auch nach drei Wochen noch Form hat. Das dauert rund 20 Minuten.

Wenn du nach dem Schnitt wissen willst, wie du den Look selbst hinbekommst, nimm den [GYAN Signature Cut](service:gyan-signature). Wir stylen deine Haare und zeigen dir dabei, welches Produkt du brauchst, wie viel davon und mit welchen Handgriffen. Und wenn dein Gesicht nach einer langen Woche eine Pause braucht, gibt es das GYAN Face Treatment mit heissem Tuch, Reinigung und Pflege.

## Samstagmorgen, bevor das Wochenende losgeht

Am Samstag öffnen wir bereits um 8.30 Uhr. Wer früh aus Port losfährt, hat den Coiffeur erledigt, bevor der Tag richtig beginnt, und ist danach schnell wieder zu Hause, vielleicht für einen Spaziergang am Kanal. Unter der Woche sind wir Montag bis Mittwoch von 9 bis 19 Uhr da, am Donnerstag und Freitag bis 20 Uhr. Sonntags ist geschlossen.

Am Samstag lohnt es sich, den Termin [online zu buchen](page:booking), die Bestätigung kommt sofort. Walk-ins sind während der Öffnungszeiten trotzdem willkommen. Im Salon sitzt du auf braunen Lederstühlen vor einem roten Perserteppich an der Wand. Bezahlt wird bar, mit Karte oder mit TWINT. Wohnst du näher an der Stadt, findest du auch unsere Seite für [Nidau](seo:nidau).`,
      fr: `## Port et son barrage sur le canal

Port se trouve sur la rive sud du canal Nidau-Büren, juste après Nidau. La commune est surtout connue pour son barrage de régulation : c'est ici qu'on contrôle l'écoulement du lac de Bienne, et donc son niveau. Le barrage fait partie de la correction des eaux du Jura, qui a profondément transformé le Seeland. Autour du canal, Port est calme et verdoyant, un lieu de vie proche de l'eau et à quelques kilomètres seulement de Bienne.

## Pas de gare, mais le bus et le vélo

Port n'a pas de gare, ce qui ne complique pas le trajet pour autant. Le bus t'amène à la gare de Bienne, d'où il ne reste que quelques minutes à pied jusqu'à GYAN, à la Zentralstrasse 22. À vélo, tu traverses Nidau en direction de Bienne, sur un terrain plat et sans stress. En voiture, tu passes aussi par Nidau jusqu'au centre de Bienne, où se trouvent des places de parc publiques. Pour les quelque quatre kilomètres, compte une dizaine de minutes.

## Dégradé ou Signature Cut

Un dégradé, c'est d'abord une transition réussie. Pour la [coupe homme](service:haarschnitt-biel), on regarde d'abord comment tes cheveux poussent et où sont les épis, puis on décide où travaille la tondeuse et où interviennent les ciseaux. Low fade, skin fade ou raie classique : le but est une coupe qui tient encore sa forme trois semaines plus tard. Compte environ 20 minutes.

Si tu veux savoir comment refaire le look toi-même, choisis le [GYAN Signature Cut](service:gyan-signature). On coiffe tes cheveux en te montrant quel produit utiliser, en quelle quantité et avec quels gestes. Et si ton visage a besoin d'une pause après une longue semaine, il y a le GYAN Face Treatment : serviette chaude, nettoyage et soin.

## Le samedi matin, avant le week-end

Le samedi, on ouvre dès 8 h 30. En partant tôt de Port, le coiffeur est réglé avant que la journée commence vraiment, et tu es vite de retour, pourquoi pas pour une balade le long du canal. En semaine, on est là du lundi au mercredi de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h. Le dimanche, c'est fermé.

Le samedi, mieux vaut [réserver en ligne](page:booking) : la confirmation est immédiate. Les clients sans rendez-vous restent les bienvenus pendant les heures d'ouverture. Au salon, tu t'assois dans un fauteuil en cuir brun, avec un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT. Tu habites plus près de la ville ? Voici notre page pour [Nidau](seo:nidau).`,
      en: `## Port and the weir on the canal

Port lies on the south bank of the Nidau-Büren canal, just past Nidau. It's best known for the Port regulating weir, which controls the outflow from Lake Biel and so keeps the lake level in check. The weir is part of the Jura water correction that reshaped the whole Seeland region. Around the canal Port is quiet and green, a place to live close to the water and only a few kilometres from Biel.

## No station, but buses and bikes

Port doesn't have a railway station, but that doesn't make getting into town any harder. The bus takes you to Biel station, and from there it's only a few minutes' walk to GYAN at Zentralstrasse 22. By bike you ride through Nidau towards Biel, flat and relaxed. Driving also takes you via Nidau into central Biel, where public parking is available. For the roughly four kilometres, allow about ten minutes.

## Fade or Signature Cut

A fade lives or dies by its blend. For a [men's haircut](service:haarschnitt-biel) we first check how your hair grows and where the crowns sit, then decide where the clippers work and where the scissors take over. Low fade, skin fade or a classic side part, the aim is a cut that still holds its shape three weeks later. It takes about 20 minutes.

If you want to know how to recreate the look yourself, go for the [GYAN Signature Cut](service:gyan-signature). We style your hair and show you which product to use, how much and which moves. And if your face needs a break after a long week, there's the GYAN Face Treatment with hot towel, cleansing and care.

## Saturday morning, before the weekend kicks off

On Saturdays we open at 8:30am. Leave Port early and your haircut is done before the day really starts, with plenty of time left for a walk by the canal back home. During the week we're open Monday to Wednesday 9am to 7pm and Thursday and Friday until 8pm. Sundays we're closed.

Saturdays are worth [booking online](page:booking), with instant confirmation. Walk-ins are still welcome during opening hours. In the salon you sit in a brown leather chair in front of a red Persian carpet on the wall. Pay in cash, by card or with TWINT. Living closer to town? Check out our page for [Nidau](seo:nidau).`,
    },
    neighbors: ["nidau", "bruegg", "ipsach"],
    carMin: 10,
    transit: {
      de: "Mit dem Bus von Port zum Bahnhof Biel, dann wenige Minuten zu Fuss.",
      fr: "En bus de Port jusqu'à la gare de Bienne, puis quelques minutes à pied.",
      en: "Take the bus from Port to Biel station, then walk a few minutes.",
    },
    services: ["haarschnitt-biel", "gyan-signature", "gesichtspflege-biel"],
    faq: {
      de: [
        { q: "Gibt es von Port eine Bahnverbindung zu GYAN?", a: "Port hat keinen eigenen Bahnhof. Du fährst mit dem Bus von Port zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss zur Zentralstrasse 22." },
        { q: "Lohnt sich für Leute aus Port ein Termin am Samstagmorgen?", a: "Ja, am Samstag öffnen wir bereits um 8.30 Uhr und haben bis 18 Uhr offen. So ist der Coiffeur erledigt, bevor das Wochenende in Port richtig beginnt." },
        { q: "Wie lange dauert ein Fade, wenn ich aus Port komme?", a: "Ein Herren Haarschnitt mit Fade dauert rund 20 Minuten, der GYAN Signature Cut mit Styling und Tipps rund 25 Minuten. Dazu kommt die kurze Fahrt von Port nach Biel." },
      ],
      fr: [
        { q: "Y a-t-il un train de Port jusqu'à GYAN ?", a: "Port n'a pas de gare. Tu prends le bus de Port jusqu'à la gare de Bienne, puis quelques minutes à pied jusqu'à la Zentralstrasse 22." },
        { q: "Un rendez-vous le samedi matin vaut-il le coup depuis Port ?", a: "Oui, le samedi on ouvre dès 8 h 30, jusqu'à 18 h. Le coiffeur est fait avant que le week-end ne commence vraiment à Port." },
        { q: "Combien de temps dure un dégradé si je viens de Port ?", a: "Une coupe homme avec dégradé dure environ 20 minutes, le GYAN Signature Cut avec coiffage et conseils environ 25 minutes. Il faut y ajouter le court trajet de Port à Bienne." },
      ],
      en: [
        { q: "Is there a train from Port to GYAN?", a: "Port has no railway station. Take the bus from Port to Biel station, then walk a few minutes to Zentralstrasse 22." },
        { q: "Is a Saturday morning slot worth it if I live in Port?", a: "Yes, on Saturdays we open at 8:30am and stay open until 6pm. Your haircut is done before the weekend in Port really gets going." },
        { q: "How long does a fade take if I'm coming from Port?", a: "A men's haircut with a fade takes about 20 minutes, the GYAN Signature Cut with styling and tips about 25. Add the short trip from Port to Biel." },
      ],
    },
  },

  // ───────────────────────────── IPSACH ─────────────────────────────
  {
    key: "ipsach",
    name: { de: "Ipsach", fr: "Ipsach", en: "Ipsach" },
    slug: { de: "coiffeur-ipsach", fr: "coiffeur-ipsach", en: "barber-ipsach" },
    km: 4,
    title: {
      de: "Coiffeur für Ipsach – Barbier in Biel | GYAN",
      fr: "Coiffeur près d'Ipsach – barbier à Bienne | GYAN",
      en: "Barber near Ipsach – men's salon in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Ipsach: mit der BTI nach Biel zu GYAN, rund 4 km. GYAN Full Service, Nassrasur und Face Treatment. Jetzt online Termin buchen.",
      fr: "Coiffeur pour Ipsach : en train BTI jusqu'à Bienne chez GYAN, à 4 km. Full Service, rasage à la serviette chaude, soin visage. Réserve en ligne.",
      en: "Barber for Ipsach: ride the BTI to GYAN in Biel, about 4 km. GYAN Full Service, hot towel shave and face treatment. Book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Ipsach",
      fr: "Coiffeur homme près d'Ipsach",
      en: "Barber near Ipsach",
    },
    intro: {
      de: "Ipsach liegt am Südufer des Bielersees, rund vier Kilometer von GYAN. Die BTI-Bahn bringt dich ohne Umsteigen zum Bahnhof Biel, von dort sind es wenige Minuten zu uns.",
      fr: "Ipsach se trouve sur la rive sud du lac de Bienne, à environ quatre kilomètres de GYAN. Le train BTI t'amène sans changement à la gare de Bienne, à quelques minutes du salon.",
      en: "Ipsach sits on the south shore of Lake Biel, about four kilometres from GYAN. The BTI line takes you to Biel station without changing, a few minutes from the salon.",
    },
    body: {
      de: `## Ipsach: Seeblick vom Südufer

Ipsach liegt am Südufer des Bielersees, zwischen Nidau und Sutz-Lattrigen. Vom Ufer aus schaust du über das Wasser hinüber auf die Rebhänge und den Jura am Nordufer. Die Gemeinde ist eher ruhig, ein Wohnort am See, und trotzdem ist Biel nur rund vier Kilometer entfernt. Der Weg dorthin führt dem See entlang über Nidau, ob mit Bahn, Auto oder Velo.

## Mit der BTI direkt zum Bahnhof Biel

Ipsach liegt an der BTI-Bahn, die von Ins über Täuffelen dem Südufer entlang nach Biel fährt. Du steigst in Ipsach ein und am Bahnhof Biel aus, umsteigen musst du nicht. Von dort sind es wenige Minuten zu Fuss bis zu GYAN an der Zentralstrasse 22. Mit dem Auto fährst du über Nidau ins Bieler Zentrum und parkierst auf einem der öffentlichen Parkplätze, rechne mit etwa zehn Minuten. Mit dem Velo ist die Strecke flach und angenehm.

## Ein Nachmittag für den Full Service

Wer am See wohnt, hat oft ein Gespür dafür, sich Zeit zu nehmen. Genau dafür ist der [GYAN Full Service](service:gyan-full-service) gedacht: Haarschnitt, Bart, Face Treatment, Wäsche und Styling in einem Termin von rund 50 Minuten. Plane ihn am besten für einen ruhigen Nachmittag oder einen Samstag, dann musst du danach nicht gleich weiter. Etwas kürzer ist das GYAN Premium Paket mit Haarschnitt, Bart, Wäsche und Styling in rund 40 Minuten.

Im Salon sitzt du auf einem braunen Lederstuhl, an der Wand hängt ein roter Perserteppich. Wir nehmen uns Zeit für die Beratung, bevor der erste Schnitt gesetzt wird.

## Rasur und Gesichtspflege einzeln

Nicht jeder Besuch muss das volle Programm sein. Die [Bart Rasur mit heissem Tuch](service:nassrasur-biel) ist ein kleines Ritual für sich: Ein heisses Tuch bereitet die Haut vor, warmer Schaum wird mit dem Pinsel aufgetragen, dann folgt die Klinge, Zug um Zug. Zum Schluss beruhigen ein kühles Tuch und Balsam die Haut. Das GYAN Face Treatment mit heissem Tuch, Reinigung und Pflege kannst du ebenfalls einzeln buchen, es dauert rund 20 Minuten.

Termine [buchst du online](page:booking), auf Deutsch, Französisch oder Englisch, und bekommst sofort eine Bestätigung. Während der Öffnungszeiten sind auch Walk-ins willkommen, für den Full Service lohnt sich aber ein fester Termin. Bezahlt wird bar, mit Karte oder mit TWINT. Wohnst du weiter dem Südufer entlang, findest du auch eine Seite für [Sutz-Lattrigen](seo:sutz-lattrigen).`,
      fr: `## Ipsach : la vue depuis la rive sud

Ipsach se trouve sur la rive sud du lac de Bienne, entre Nidau et Sutz-Lattrigen. Depuis la rive, le regard traverse le lac jusqu'aux vignes et au Jura de la rive nord. La commune est plutôt calme, un lieu de vie au bord de l'eau, et pourtant Bienne n'est qu'à environ quatre kilomètres. Le trajet longe le lac et passe par Nidau, en train, en voiture ou à vélo.

## Avec le BTI jusqu'à la gare de Bienne

Ipsach est desservi par le train BTI, qui relie Anet à Bienne en passant par Täuffelen et en longeant la rive sud. Tu montes à Ipsach et tu descends à la gare de Bienne, sans changement. De là, il ne reste que quelques minutes à pied jusqu'à GYAN, à la Zentralstrasse 22. En voiture, tu passes par Nidau jusqu'au centre de Bienne et tu te gares sur une place de parc publique, compte une dizaine de minutes. À vélo, le trajet est plat et agréable.

## Un après-midi pour le Full Service

Quand on vit au bord du lac, on sait souvent prendre son temps. C'est exactement l'idée du [GYAN Full Service](service:gyan-full-service) : coupe, barbe, Face Treatment, shampooing et coiffage, en un rendez-vous d'environ 50 minutes. Prévois-le pour un après-midi tranquille ou un samedi, pour ne pas devoir repartir en courant. Un peu plus court, la formule GYAN Premium réunit coupe, barbe, shampooing et coiffage en une quarantaine de minutes.

Au salon, tu prends place dans un fauteuil en cuir brun, sous un tapis persan rouge accroché au mur. On prend le temps de discuter avant le premier coup de ciseaux.

## Rasage et soin du visage à la carte

Pas besoin de tout prendre à chaque fois. Le [rasage à la serviette chaude](service:nassrasur-biel) est un petit rituel en soi : la serviette chaude prépare la peau, la mousse tiède est appliquée au blaireau, puis vient la lame, passage après passage. Pour finir, une serviette fraîche et un baume apaisent la peau. Le GYAN Face Treatment, avec serviette chaude, nettoyage et soin, se réserve aussi seul et dure environ 20 minutes.

Tu [réserves en ligne](page:booking), en français, en allemand ou en anglais, et la confirmation arrive tout de suite. Pendant les heures d'ouverture, tu peux aussi passer sans rendez-vous, mais pour le Full Service, une heure fixe est préférable. Paiement en espèces, par carte ou avec TWINT. Tu habites plus loin sur la rive sud ? Il existe aussi une page pour [Sutz-Lattrigen](seo:sutz-lattrigen).`,
      en: `## Ipsach: lake views from the south shore

Ipsach sits on the south shore of Lake Biel, between Nidau and Sutz-Lattrigen. From the shore you look across the water to the vineyards and the Jura on the north side. It's a fairly quiet place to live by the lake, and yet Biel is only about four kilometres away. The way there follows the lake through Nidau, whether you go by train, car or bike.

## Straight to Biel station on the BTI

Ipsach is on the BTI line, which runs from Ins via Täuffelen along the south shore to Biel. You board in Ipsach and get off at Biel station, no change needed. From there it's a few minutes on foot to GYAN at Zentralstrasse 22. By car you drive via Nidau into central Biel and use one of the public car parks, allow about ten minutes. By bike the route is flat and pleasant.

## An afternoon for the Full Service

Living by the lake, you probably know how to take your time. That's exactly what the [GYAN Full Service](service:gyan-full-service) is for: haircut, beard, face treatment, wash and styling in one appointment of about 50 minutes. Plan it for a quiet afternoon or a Saturday so you don't have to rush off afterwards. A bit shorter, the GYAN Premium package covers haircut, beard, wash and styling in about 40 minutes.

In the salon you settle into a brown leather chair beneath a red Persian carpet on the wall. We take time to talk things through before the first cut.

## Shave and face care on their own

Not every visit has to be the full works. The [hot towel shave](service:nassrasur-biel) is a small ritual of its own: a hot towel prepares the skin, warm lather goes on with a brush, then the blade follows, stroke by stroke. A cool towel and balm finish things off. The GYAN Face Treatment, with hot towel, cleansing and care, can also be booked on its own and takes about 20 minutes.

You [book online](page:booking) in English, German or French and get your confirmation straight away. Walk-ins are welcome during opening hours, but for the Full Service a fixed slot is the better bet. Pay in cash, by card or with TWINT. Living further along the south shore? There's also a page for [Sutz-Lattrigen](seo:sutz-lattrigen).`,
    },
    neighbors: ["nidau", "port", "sutz-lattrigen", "taeuffelen"],
    carMin: 10,
    transit: {
      de: "Mit der BTI-Bahn Biel-Täuffelen-Ins von Ipsach zum Bahnhof Biel, dann wenige Minuten zu Fuss.",
      fr: "Avec le train BTI Bienne-Täuffelen-Anet d'Ipsach jusqu'à la gare de Bienne, puis quelques minutes à pied.",
      en: "Take the BTI line Biel-Täuffelen-Ins from Ipsach to Biel station, then walk a few minutes.",
    },
    services: ["gyan-full-service", "nassrasur-biel", "gesichtspflege-biel", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Wie komme ich von Ipsach mit der BTI zu GYAN?", a: "Die BTI-Bahn Biel-Täuffelen-Ins hält in Ipsach und fährt über Nidau zum Bahnhof Biel. Von dort gehst du wenige Minuten zu Fuss zur Zentralstrasse 22." },
        { q: "Wie viel Zeit sollte ich von Ipsach aus für den GYAN Full Service einplanen?", a: "Der GYAN Full Service dauert rund 50 Minuten. Mit der Fahrt von Ipsach hin und zurück planst du am besten einen ruhigen Nachmittag oder einen Samstag ein." },
        { q: "Kann ich als Kunde aus Ipsach auch auf Französisch oder Englisch buchen?", a: "Ja, die Website und die Online-Buchung gibt es auf Deutsch, Französisch und Englisch. Die Bestätigung kommt sofort." },
      ],
      fr: [
        { q: "Comment venir d'Ipsach chez GYAN avec le BTI ?", a: "Le train BTI Bienne-Täuffelen-Anet s'arrête à Ipsach et rejoint la gare de Bienne en passant par Nidau. De là, quelques minutes à pied jusqu'à la Zentralstrasse 22." },
        { q: "Combien de temps prévoir depuis Ipsach pour le GYAN Full Service ?", a: "Le GYAN Full Service dure environ 50 minutes. Avec l'aller-retour depuis Ipsach, le mieux est de prévoir un après-midi tranquille ou un samedi." },
        { q: "Si j'habite à Ipsach, puis-je réserver en français ?", a: "Oui, le site et la réservation en ligne sont disponibles en allemand, en français et en anglais. La confirmation est immédiate." },
      ],
      en: [
        { q: "How do I get from Ipsach to GYAN on the BTI?", a: "The BTI line Biel-Täuffelen-Ins stops in Ipsach and runs via Nidau to Biel station. From there it's a few minutes' walk to Zentralstrasse 22." },
        { q: "How much time should I plan from Ipsach for the GYAN Full Service?", a: "The GYAN Full Service takes about 50 minutes. Add the round trip from Ipsach and a quiet afternoon or a Saturday works best." },
        { q: "Can I book in English if I live in Ipsach?", a: "Yes, the website and online booking are available in English, German and French. Confirmation comes instantly." },
      ],
    },
  },

  // ───────────────────────────── EVILARD / LEUBRINGEN ─────────────────────────────
  {
    key: "evilard",
    name: { de: "Leubringen", fr: "Evilard", en: "Evilard" },
    slug: { de: "coiffeur-leubringen", fr: "coiffeur-evilard", en: "barber-evilard" },
    km: 4,
    title: {
      de: "Coiffeur für Leubringen/Evilard – Biel | GYAN",
      fr: "Coiffeur près d'Evilard – barbier à Bienne | GYAN",
      en: "Barber near Evilard – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Leubringen: mit der Standseilbahn hinunter nach Biel, Haarschnitt oder Signature Cut bei GYAN. Bis 20 Uhr offen, jetzt online Termin buchen.",
      fr: "Coiffeur pour Evilard : descends en funiculaire à Bienne pour une coupe ou un Signature Cut chez GYAN. Ouvert jusqu'à 20 h, réserve en ligne.",
      en: "Barber for Evilard: ride the funicular down to Biel for a haircut or Signature Cut at GYAN. Open until 8 pm on Thu and Fri, book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Leubringen",
      fr: "Coiffeur homme près d'Evilard",
      en: "Barber near Evilard",
    },
    intro: {
      de: "Leubringen liegt am Jurahang direkt über Biel, nur rund vier Kilometer vom Zentrum. Mit der Standseilbahn bist du in wenigen Minuten unten in der Stadt und kurz darauf bei GYAN an der Zentralstrasse 22.",
      fr: "Evilard surplombe Bienne à seulement quatre kilomètres environ du centre. Le funiculaire te descend en ville en quelques minutes, et peu après tu es chez GYAN à la Zentralstrasse 22.",
      en: "Evilard sits on the Jura slope right above Biel, only about four kilometres from the centre. The funicular gets you down into town in minutes, and shortly after you're at GYAN on Zentralstrasse 22.",
    },
    body: {
      de: `## Leubringen: wohnen am Hang, leben mit der Stadt

Leubringen, auf Französisch Evilard, ist eine zweisprachige Gemeinde am Jurahang direkt oberhalb von Biel. Zur Gemeinde gehört auch Magglingen, das noch etwas höher am Berg liegt. Von vielen Ecken des Dorfes schaust du über die Dächer der Stadt auf den Bielersee und an klaren Tagen bis zu den Alpen. Trotzdem ist Leubringen so nah an Biel, dass ein grosser Teil des Alltags unten in der Stadt stattfindet: Arbeit, Schule, Einkauf und eben auch der Besuch beim Coiffeur.

## Mit der Standseilbahn zum Haarschnitt

Seit über hundert Jahren verbindet eine Standseilbahn das Dorf mit Biel. Die Fahrt hinunter dauert nur wenige Minuten. Unten gehst du zu Fuss durch die Stadt oder nimmst den Bus bis zum Bahnhof, von wo du die Zentralstrasse 22 in wenigen Gehminuten erreichst. Der Vorteil: Dein Auto bleibt oben stehen, und in der Innenstadt musst du keinen Parkplatz suchen.

Fährst du lieber selbst, führt die kurvige Strasse den Hang hinunter direkt ins Bieler Zentrum. Für die rund vier Kilometer solltest du etwa zehn Minuten einrechnen, je nach Verkehr in der Stadt auch etwas mehr. In der Innenstadt parkierst du in einem öffentlichen Parkhaus oder auf einem öffentlichen Parkplatz.

## Ein Termin, der in den Pendleralltag passt

Wer in Leubringen wohnt und in Biel arbeitet, fährt ohnehin fast täglich hinunter. Ein [Herren Haarschnitt](service:haarschnitt-biel) dauert bei uns rund 20 Minuten und lässt sich gut vor oder nach der Arbeit einplanen: Von Montag bis Mittwoch sind wir bis 19 Uhr da, am Donnerstag und Freitag sogar bis 20 Uhr. Wenn du nicht nur einen frischen Schnitt willst, sondern auch wissen möchtest, wie du ihn morgens selbst hinbekommst, wähle den [GYAN Signature Cut](service:gyan-signature) mit Styling und Tipps zu Produkt und Handgriffen.

Am Samstag öffnen wir schon um 8.30 Uhr. Das passt, wenn du den Vormittag in der Stadt verbringen und am Nachmittag wieder oben am Hang sein willst.

## Zweisprachig online, ruhig im Salon

In einer zweisprachigen Gemeinde ist es praktisch, wenn auch die Buchung mitzieht: Unsere Website und die Online-Buchung gibt es auf Deutsch, Französisch und Englisch. Du [buchst online](page:booking) und bekommst sofort eine Bestätigung, so kannst du die Fahrt mit der Standseilbahn passend planen. Spontan geht es auch, während der Öffnungszeiten sind Walk-ins willkommen.

Im Salon erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand. Bezahlt wird bar, mit Karte oder mit TWINT. Wohnst du weiter oben, ganz in der Nähe der Sportschule? Dann ist unsere Seite für [Magglingen](seo:magglingen) die passende.`,
      fr: `## Evilard : habiter le coteau, vivre avec la ville

Evilard, Leubringen en allemand, est une commune bilingue accrochée au versant du Jura, juste au-dessus de Bienne. Macolin, un peu plus haut sur la montagne, fait aussi partie de la commune. Depuis de nombreux coins du village, le regard passe par-dessus les toits de la ville jusqu'au lac de Bienne et, par temps clair, jusqu'aux Alpes. Evilard reste pourtant si proche de Bienne qu'une bonne partie du quotidien se passe en bas : travail, école, courses et, bien sûr, le passage chez le coiffeur.

## Le funiculaire comme chemin vers la coupe

Depuis plus de cent ans, un funiculaire relie le village à Bienne. La descente ne prend que quelques minutes. En bas, tu traverses la ville à pied ou tu prends le bus jusqu'à la gare, d'où la Zentralstrasse 22 est à quelques minutes à pied. L'avantage : ta voiture reste en haut et tu n'as pas à chercher de place en ville.

Si tu préfères conduire, la route en lacets descend le coteau directement jusqu'au centre de Bienne. Pour les quelque quatre kilomètres, compte environ dix minutes, un peu plus selon la circulation en ville. Au centre, tu te gares dans un parking public ou sur une place de parc publique.

## Un rendez-vous qui colle au rythme des pendulaires

Si tu habites Evilard et travailles à Bienne, tu descends de toute façon presque chaque jour. Une [coupe homme](service:haarschnitt-biel) dure chez nous une vingtaine de minutes et se glisse facilement avant ou après le travail : du lundi au mercredi, on est là jusqu'à 19 h, le jeudi et le vendredi même jusqu'à 20 h. Tu veux non seulement une coupe nette, mais aussi savoir la refaire le matin ? Choisis le [GYAN Signature Cut](service:gyan-signature), avec coiffage et conseils sur le produit et les gestes.

Le samedi, on ouvre dès 8 h 30. Pratique si tu veux passer la matinée en ville et être de retour sur les hauteurs l'après-midi.

## Bilingue en ligne, calme au salon

Dans une commune bilingue, c'est agréable quand la réservation suit : notre site et la réservation en ligne existent en allemand, en français et en anglais. Tu [réserves en ligne](page:booking) et reçois une confirmation immédiate, ce qui te permet de caler ton trajet en funiculaire. Tu peux aussi venir spontanément : pendant les heures d'ouverture, les clients sans rendez-vous sont les bienvenus.

Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT. Tu habites plus haut, près de l'école de sport ? Alors c'est notre page pour [Macolin](seo:magglingen) qui te concerne.`,
      en: `## Evilard: living on the slope, living with the city

Evilard, Leubringen in German, is a bilingual municipality on the Jura slope right above Biel. Magglingen, a little higher up the mountain, belongs to it as well. From many spots in the village you look out over the city rooftops to Lake Biel and, on clear days, all the way to the Alps. Yet Evilard is so close to Biel that much of everyday life happens down below: work, school, shopping and, of course, getting your hair cut.

## The funicular as your route to a haircut

For more than a hundred years a funicular has linked the village with Biel. The ride down takes only a few minutes. At the bottom you can walk through town or hop on a bus to the station, and from there Zentralstrasse 22 is a few minutes on foot. The upside: your car stays at home and you don't have to hunt for a parking space in the centre.

If you'd rather drive, the winding road takes you down the slope straight into central Biel. Allow about ten minutes for the roughly four kilometres, a bit more depending on city traffic. In the centre you can use a public car park or public parking spaces.

## An appointment that fits a commuter's day

If you live in Evilard and work in Biel, you head down almost every day anyway. A [men's haircut](service:haarschnitt-biel) takes about 20 minutes here and slots easily in before or after work: Monday to Wednesday we're open until 19:00, Thursday and Friday even until 20:00. Want more than a fresh cut, like knowing how to recreate it yourself in the morning? Go for the [GYAN Signature Cut](service:gyan-signature), with styling plus tips on which product to use and how.

On Saturdays we open at 8:30. Handy if you want to spend the morning in town and be back up the hill by the afternoon.

## Bilingual online, calm in the chair

In a bilingual community it helps when booking keeps up: our website and online booking are available in German, French and English. You [book online](page:booking) and get instant confirmation, so you can time your funicular ride around it. Dropping in works too, as walk-ins are welcome during opening hours.

Inside the salon you'll find brown leather chairs and a red Persian carpet on the wall. Pay in cash, by card or with TWINT. Live further up, close to the sports school? Then our page for [Magglingen](seo:magglingen) is the one for you.`,
    },
    neighbors: ["nidau", "pieterlen", "magglingen", "orvin", "twann"],
    carMin: 10,
    transit: {
      de: "Mit der Standseilbahn von Leubringen hinunter nach Biel, dann zu Fuss oder mit dem Bus zum Bahnhof und von dort wenige Minuten zu Fuss zum Salon.",
      fr: "Descends en funiculaire d'Evilard à Bienne, puis rejoins la gare à pied ou en bus, et de là le salon en quelques minutes à pied.",
      en: "Ride the funicular from Evilard down to Biel, walk or take a bus to the station, and from there it is a few minutes on foot to the salon.",
    },
    services: ["haarschnitt-biel", "gyan-signature", "bart-trimmen-biel"],
    faq: {
      de: [
        { q: "Wie komme ich von Leubringen ohne Auto zu GYAN?", a: "Am einfachsten mit der Standseilbahn hinunter nach Biel. Von unten gehst du zu Fuss oder nimmst den Bus zum Bahnhof, von dort sind es nur wenige Gehminuten bis zur Zentralstrasse 22." },
        { q: "Lohnt sich von Leubringen aus ein Termin am Samstagmorgen?", a: "Ja, am Samstag ist der Salon ab 8.30 Uhr bis 18 Uhr geöffnet. So kannst du früh mit der Standseilbahn hinunterfahren und den Rest des Tages in Biel oder wieder oben am Hang verbringen." },
        { q: "Kann ich von Leubringen aus spontan vorbeikommen, ohne zu buchen?", a: "Ja, während der Öffnungszeiten sind Walk-ins willkommen. Wenn du die Fahrt mit der Standseilbahn genau planen willst, buchst du besser online, die Bestätigung kommt sofort." },
      ],
      fr: [
        { q: "Comment venir d'Evilard chez GYAN sans voiture ?", a: "Le plus simple est de descendre en funiculaire à Bienne. En bas, rejoins la gare à pied ou en bus : de là, la Zentralstrasse 22 n'est qu'à quelques minutes à pied." },
        { q: "Un rendez-vous le samedi matin, ça vaut la peine depuis Evilard ?", a: "Oui, le samedi le salon est ouvert de 8 h 30 à 18 h. Tu peux descendre tôt en funiculaire et profiter du reste de la journée à Bienne ou de retour sur les hauteurs." },
        { q: "Depuis Evilard, puis-je passer sans réserver ?", a: "Oui, les clients sans rendez-vous sont les bienvenus pendant les heures d'ouverture. Si tu veux caler ton trajet en funiculaire, réserve plutôt en ligne : la confirmation est immédiate." },
      ],
      en: [
        { q: "How do I get from Evilard to GYAN without a car?", a: "The easiest way is the funicular down to Biel. At the bottom, walk or take a bus to the station, and from there Zentralstrasse 22 is just a few minutes on foot." },
        { q: "Is a Saturday morning appointment a good idea if I live in Evilard?", a: "Yes, on Saturdays the salon is open from 8:30 to 18:00. You can ride the funicular down early and still have the rest of the day in Biel or back up the hill." },
        { q: "Can I just drop in from Evilard without booking?", a: "Yes, walk-ins are welcome during opening hours. If you want to time your funicular ride exactly, booking online is the better choice, and the confirmation is instant." },
      ],
    },
  },

  // ───────────────────────────── ORPUND ─────────────────────────────
  {
    key: "orpund",
    name: { de: "Orpund", fr: "Orpund", en: "Orpund" },
    slug: { de: "coiffeur-orpund", fr: "coiffeur-orpund", en: "barber-orpund" },
    km: 6,
    title: {
      de: "Coiffeur für Orpund – Herrensalon in Biel | GYAN",
      fr: "Coiffeur près d'Orpund – salon homme Bienne | GYAN",
      en: "Barber near Orpund – men's salon in Biel | GYAN",
    },
    description: {
      de: "Herrencoiffeur für Orpund: GYAN in Biel, nur rund 6 km entfernt. Signature Cut, Haarschnitt oder Premium Paket. Jetzt online Termin buchen.",
      fr: "Coiffeur homme pour Orpund : GYAN à Bienne, à environ 6 km seulement. Signature Cut, coupe ou formule Premium. Réserve ton rendez-vous en ligne.",
      en: "Barber for Orpund: GYAN in Biel, only about 6 km away. Signature Cut, men's haircut or Premium package. Book your appointment online right now.",
    },
    h1: {
      de: "Herrencoiffeur für Orpund",
      fr: "Coiffeur homme près d'Orpund",
      en: "Barber near Orpund",
    },
    intro: {
      de: "Orpund liegt an der Aare, nur rund sechs Kilometer östlich vom Bieler Zentrum. Mit dem Auto oder Bus bist du in einer knappen Viertelstunde bei GYAN an der Zentralstrasse 22.",
      fr: "Orpund se trouve au bord de l'Aar, à environ six kilomètres à l'est du centre de Bienne. En voiture ou en bus, tu es chez GYAN en un petit quart d'heure.",
      en: "Orpund sits on the Aare, only about six kilometres east of central Biel. By car or bus you're at GYAN on Zentralstrasse 22 in under a quarter of an hour.",
    },
    body: {
      de: `## Orpund am Nidau-Büren-Kanal

Orpund liegt östlich von Biel am Nidau-Büren-Kanal, auf dem die Aare vom Bielersee Richtung Büren an der Aare fliesst. Der Kanal entstand mit der Juragewässerkorrektion und prägt die Landschaft hier bis heute: flaches Land, Uferwege, Felder. Von allen Seeland-Gemeinden auf dieser Seite der Stadt gehört Orpund zu den nächsten am Bieler Zentrum. Rund sechs Kilometer sind es bis zu unserem Salon.

## Kurzer Weg, kurze Planung

Mit dem Auto fährst du von Orpund ins Bieler Zentrum und bist je nach Verkehr in einer Viertelstunde da. In der Innenstadt parkierst du in einem öffentlichen Parkhaus. Ohne Auto nimmst du den Bus zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss an die Zentralstrasse 22. Bei gutem Wetter ist auch das Velo eine Option, denn die Strecke ist flach.

Weil der Weg so kurz ist, passt ein Termin gut zwischen andere Pläne. Samstags öffnen wir schon um 8.30 Uhr, unter der Woche um 9 Uhr. Donnerstags und freitags bleiben wir bis 20 Uhr, Montag bis Mittwoch bis 19 Uhr.

## Vater und Sohn, zwei Termine am Stück

Kommt ihr zu zweit aus Orpund, wählst du bei der [Online-Buchung](page:booking) einfach zwei freie Zeiten direkt nacheinander. Beide Termine werden sofort bestätigt, so wisst ihr genau, wann ihr losfahren müsst. Spontan vorbeikommen geht natürlich auch, Walk-ins sind während der Öffnungszeiten willkommen. Ohne Termin ist der Herren Haarschnitt sogar etwas günstiger: 35 statt 40 Franken.

## Welcher Schnitt passt zu dir

Der [Herren Haarschnitt](service:haarschnitt-biel) beginnt mit einer Beratung: Wie wächst dein Haar, wo sitzen die Wirbel, wie viel Zeit willst du morgens investieren? Danach arbeiten Schere und Maschine, vom klassischen Seitenscheitel bis zum Skin Fade. Willst du den Look auch zu Hause hinbekommen, buchst du den [GYAN Signature Cut](service:gyan-signature). Nach dem Schnitt stylen wir deine Haare und zeigen dir, welches Produkt du in welcher Menge brauchst. Mit Bart, Wäsche und Styling wird daraus das GYAN Premium Paket.

Du sitzt auf braunen Ledersesseln, an der Wand hängt ein roter Perserteppich. Bezahlt wird bar, mit Karte oder mit TWINT.

Damit du besser planen kannst: Der GYAN Signature Cut dauert rund 25 Minuten und kostet 45 Franken. Das GYAN Premium Paket braucht rund 40 Minuten und kostet 75 Franken, ohne Termin 70 Franken. Im Salon arbeiten Zana und Hikmet, online buchen kannst du im Moment bei Zana.

Wohnst du etwas weiter östlich am Büttenberg oder Richtung Grenchen? Dann schau auch auf den Seiten für [Safnern](seo:safnern) und Pieterlen vorbei.`,
      fr: `## Orpund au bord du canal Nidau-Büren

Orpund se trouve à l'est de Bienne, au bord du canal Nidau-Büren, par lequel l'Aar s'écoule du lac de Bienne vers Büren an der Aare. Ce canal est né de la correction des eaux du Jura et marque encore le paysage : terrain plat, chemins le long de l'eau, champs. Parmi les communes du Seeland de ce côté de la ville, Orpund est l'une des plus proches du centre de Bienne, à environ six kilomètres de notre salon.

## Un trajet court, une organisation simple

En voiture, tu rejoins le centre de Bienne depuis Orpund en un quart d'heure environ, selon le trafic, et tu te gares dans un parking public. Sans voiture, tu prends le bus jusqu'à la gare de Bienne, puis quelques minutes à pied jusqu'à la Zentralstrasse 22. Par beau temps, le vélo est aussi une option, le trajet est plat.

Comme c'est tout près, un rendez-vous se glisse facilement entre deux autres choses. Le samedi, on ouvre dès 8 h 30, en semaine à 9 h. Le jeudi et le vendredi, on reste jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h.

## Père et fils, deux rendez-vous à la suite

Si vous venez à deux d'Orpund, choisis simplement deux créneaux libres consécutifs lors de la [réservation en ligne](page:booking). Les deux rendez-vous sont confirmés immédiatement, vous savez donc exactement quand partir. Passer sans rendez-vous reste possible pendant les heures d'ouverture, et la coupe homme est même un peu moins chère : 35 francs au lieu de 40.

## Quelle coupe te va

La [coupe homme](service:haarschnitt-biel) commence par un conseil : comment poussent tes cheveux, où sont les épis, combien de temps tu veux y passer le matin. Ensuite, ciseaux et tondeuse entrent en jeu, de la raie sur le côté classique au skin fade. Si tu veux réussir le look aussi chez toi, réserve le [GYAN Signature Cut](service:gyan-signature) : après la coupe, on te coiffe et on te montre quel produit utiliser et en quelle quantité. Avec barbe, lavage et coiffage, ça devient la formule GYAN Premium.

Tu t'installes dans un fauteuil en cuir brun, sous un tapis persan rouge accroché au mur. Paiement en espèces, par carte ou avec TWINT.

Pour t'organiser : le GYAN Signature Cut dure environ 25 minutes et coûte 45 francs. La formule GYAN Premium prend environ 40 minutes et coûte 75 francs, 70 francs sans rendez-vous. Au salon travaillent Zana et Hikmet, et pour l'instant, la réservation en ligne se fait chez Zana.

Tu habites un peu plus à l'est, au pied du Büttenberg ou vers Granges ? Jette aussi un œil aux pages pour [Safnern](seo:safnern) et Perles.`,
      en: `## Orpund on the Nidau-Büren canal

Orpund lies east of Biel on the Nidau-Büren canal, which carries the Aare from Lake Biel towards Büren an der Aare. The canal was built as part of the Jura water correction and still shapes the landscape here: flat land, waterside paths, fields. Of the Seeland villages on this side of the city, Orpund is one of the closest to central Biel, about six kilometres from our salon.

## Short trip, easy planning

By car you'll get from Orpund into central Biel in about a quarter of an hour, depending on traffic, and can park in a public car park. Without a car, take the bus to Biel station, then walk a few minutes to Zentralstrasse 22. In good weather, cycling works too, since the route is flat.

Because it's so close, an appointment slots in easily between other plans. We open at 8:30am on Saturdays and 9am on weekdays. On Thursdays and Fridays we stay open until 8pm, Monday to Wednesday until 7pm.

## Father and son, two slots back to back

Coming in as a pair from Orpund? Just pick two free slots one after the other when you [book online](page:booking). Both appointments are confirmed instantly, so you know exactly when to set off. Walking in is fine too during opening hours, and a men's haircut is even a little cheaper without an appointment: CHF 35 instead of 40.

## Which cut suits you

The [men's haircut](service:haarschnitt-biel) starts with a consultation: how does your hair grow, where are the crowns, how much time do you want to spend on it in the morning? Then the scissors and clippers get to work, from a classic side part to a skin fade. If you want to pull off the look at home too, book the [GYAN Signature Cut](service:gyan-signature). After the cut we style your hair and show you which product to use and how much. Add beard, wash and styling and you've got the GYAN Premium package.

You'll sit in a brown leather chair, with a red Persian carpet on the wall. Pay in cash, by card or with TWINT.

To help you plan: the GYAN Signature Cut takes about 25 minutes and costs CHF 45. The GYAN Premium package takes around 40 minutes and costs CHF 75, or CHF 70 as a walk-in. Zana and Hikmet both work in the salon, and for now you can book Zana online.

Live a little further east by the Büttenberg or towards Grenchen? Have a look at our pages for [Safnern](seo:safnern) and Pieterlen too.`,
    },
    neighbors: ["bruegg", "pieterlen", "port", "safnern"],
    carMin: 15,
    transit: {
      de: "Mit dem Bus fährst du von Orpund zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss zum Salon.",
      fr: "En bus, tu vas d'Orpund à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the bus from Orpund to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["gyan-signature", "haarschnitt-biel", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Kann ich aus Orpund mit meinem Sohn zwei Termine hintereinander buchen?", a: "Ja. Wähle bei der Online-Buchung einfach zwei freie Zeiten direkt nacheinander. Beide Termine werden sofort bestätigt." },
        { q: "Passt ein Haarschnitt am Samstagmorgen, bevor ich in Orpund weitere Pläne habe?", a: "Samstags öffnen wir um 8.30 Uhr. Ein Herren Haarschnitt dauert rund 20 Minuten, so bist du früh wieder zurück in Orpund." },
        { q: "Gibt es für Kunden aus Orpund einen Unterschied zwischen Walk-in und Buchung?", a: "Für alle gilt dasselbe: Walk-ins sind während der Öffnungszeiten willkommen, und einige Leistungen wie der Herren Haarschnitt sind ohne Termin etwas günstiger. Mit Online-Buchung hast du dafür eine feste, sofort bestätigte Zeit." },
      ],
      fr: [
        { q: "Depuis Orpund, puis-je réserver deux rendez-vous à la suite avec mon fils ?", a: "Oui. Lors de la réservation en ligne, choisis simplement deux créneaux libres consécutifs. Les deux rendez-vous sont confirmés immédiatement." },
        { q: "Une coupe le samedi matin, avant mes autres projets à Orpund, ça joue ?", a: "Le samedi, on ouvre à 8 h 30. Une coupe homme dure environ 20 minutes, tu es donc vite de retour à Orpund." },
        { q: "Pour les clients d'Orpund, quelle différence entre passer sans rendez-vous et réserver ?", a: "C'est pareil pour tout le monde : sans rendez-vous, tu es le bienvenu pendant les heures d'ouverture, et certaines prestations comme la coupe homme sont un peu moins chères. En réservant en ligne, tu as une heure fixe, confirmée tout de suite." },
      ],
      en: [
        { q: "Can I book two appointments in a row with my son from Orpund?", a: "Yes. When booking online, just pick two free slots back to back. Both appointments are confirmed instantly." },
        { q: "Does a Saturday morning haircut work before my other plans in Orpund?", a: "We open at 8:30am on Saturdays. A men's haircut takes about 20 minutes, so you'll be back in Orpund early." },
        { q: "Is there a difference between walking in and booking for people from Orpund?", a: "It's the same for everyone: walk-ins are welcome during opening hours, and some services like the men's haircut are a little cheaper without an appointment. Booking online gets you a fixed time, confirmed instantly." },
      ],
    },
  },

  // ───────────────────────────── LYSS ─────────────────────────────
  {
    key: "lyss",
    name: { de: "Lyss", fr: "Lyss", en: "Lyss" },
    slug: { de: "coiffeur-lyss", fr: "coiffeur-lyss", en: "barber-lyss" },
    km: 14,
    title: {
      de: "Coiffeur für Lyss – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Lyss – barbier à Bienne | GYAN",
      en: "Barber near Lyss – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Herrencoiffeur für Lyss: mit dem Zug direkt nach Biel, dann kurz zu Fuss zu GYAN. Full Service, Premium Paket oder Haarschnitt, jetzt online buchen.",
      fr: "Coiffeur homme pour Lyss : train direct pour Bienne, puis quelques pas jusqu'à GYAN. Full Service, formule Premium ou coupe, réserve en ligne.",
      en: "Barber for Lyss: direct train to Biel, then a short walk to GYAN. Full Service, Premium package or a classic cut. Book your slot online today.",
    },
    h1: {
      de: "Herrencoiffeur für Lyss",
      fr: "Coiffeur homme près de Lyss",
      en: "Barber near Lyss",
    },
    intro: {
      de: "Lyss liegt rund 14 Kilometer von Biel entfernt, mit dem Zug aber nur eine kurze Fahrt ohne Umsteigen. Vom Bahnhof Biel gehst du wenige Minuten bis zu GYAN an der Zentralstrasse 22.",
      fr: "Lyss est à environ 14 kilomètres de Bienne, mais le train direct en fait un court trajet. De la gare de Bienne, quelques minutes à pied te mènent chez GYAN, Zentralstrasse 22.",
      en: "Lyss is about 14 km from Biel, but the direct train makes it a short ride. From Biel station it's a few minutes' walk to GYAN at Zentralstrasse 22.",
    },
    body: {
      de: `## Lyss, der Bahnknoten im Seeland

Lyss ist eine der grössten Gemeinden im Seeland und vor allem eines: gut angebunden. Am Bahnhof Lyss treffen mehrere Linien zusammen, und die wichtigste für dich ist die Strecke zwischen Bern und Biel. Wer in Lyss wohnt, ist damit in beide Richtungen schnell unterwegs. Seit 2011 gehört auch Busswil zur Gemeinde, das mit eigenem Bahnhof an derselben Strecke liegt.

Biel ist von Lyss aus die nächste grössere Stadt. Hier gibt es die Altstadt, den See und ein Zentrum mit vielen Geschäften rund um den Bahnhof. Genau dort, wenige Gehminuten vom Bahnhof entfernt, liegt unser Salon an der Zentralstrasse 22.

## Zug oder Autostrasse: zwei Wege nach Biel

Der bequemste Weg ist der Zug. Du steigst in Lyss ein, fährst ohne Umsteigen bis Biel und gehst vom Bahnhof zu Fuss weiter. Kein Parkplatz, keine Stadtrundfahrt, und die Fahrzeit kannst du nutzen, um Fotos deines Wunschschnitts herauszusuchen. Zeig sie uns zu Beginn, dann wissen wir sofort, wohin es gehen soll.

Mit dem Auto nimmst du die Autostrasse Richtung Biel. Rechne für die rund 14 Kilometer bis ins Zentrum mit etwa 25 Minuten, je nach Verkehr. In der Innenstadt parkierst du in einem der öffentlichen Parkhäuser und gehst die letzten Meter zu Fuss.

## Ein Termin, der die Anreise wert ist

Wenn du schon extra aus Lyss kommst, darf es ruhig etwas mehr sein als ein schneller Schnitt. Der [GYAN Full Service](service:gyan-full-service) ist unser umfangreichstes Angebot: Haarschnitt, Bart, Face Treatment, Wäsche und Styling in rund 50 Minuten. Etwas kürzer ist das [GYAN Premium Paket](service:gyan-premium-paket) mit Haarschnitt, Bart, Wäsche und Styling. Und wer nur die Haare machen will, bekommt beim Herren Haarschnitt Beratung, Schere, Maschine und saubere Konturen, ob Seitenscheitel, Low Fade oder Skin Fade.

Im Salon sitzt du auf braunen Ledersesseln, an der Wand hängt ein roter Perserteppich. Bezahlt wird bar, mit Karte oder mit TWINT.

## Planen statt warten

Bei einer längeren Anreise lohnt es sich, den Termin [online zu buchen](page:booking). Du wählst Leistung und Zeit, die Bestätigung kommt sofort, und du kannst deinen Zug passend dazu aussuchen. Spontan vorbeikommen geht natürlich auch: Während der Öffnungszeiten sind Walk-ins willkommen. Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, Donnerstag und Freitag bis 20 Uhr, Samstag von 8.30 bis 18 Uhr. Gerade der lange Donnerstag oder Freitag passt gut, wenn du nach der Arbeit noch in Biel bist.

Im Salon arbeiten Zana und Hikmet. Online buchen kannst du im Moment Termine bei Zana, spontan vorbeikommen geht während der Öffnungszeiten.

Wohnst du eher zwischen Lyss und Biel? Dann schau auf unseren Seiten für [Busswil](seo:busswil) und Studen vorbei.`,
      fr: `## Lyss, carrefour ferroviaire du Seeland

Lyss est l'une des plus grandes communes du Seeland et surtout un endroit très bien relié. Plusieurs lignes se croisent à la gare de Lyss, et celle qui t'intéresse est la ligne entre Berne et Bienne. Quand tu habites à Lyss, tu vas vite dans les deux directions. Depuis 2011, Busswil fait aussi partie de la commune, avec sa propre gare sur la même ligne.

Depuis Lyss, Bienne est la grande ville la plus proche : vieille ville, lac et un centre plein de commerces autour de la gare. C'est justement là, à quelques minutes à pied de la gare, que se trouve notre salon, à la Zentralstrasse 22.

## Train ou semi-autoroute : deux façons de rejoindre Bienne

Le plus confortable, c'est le train. Tu montes à Lyss, tu arrives à Bienne sans changement et tu continues à pied depuis la gare. Pas de place à chercher, pas de tour de ville, et tu peux profiter du trajet pour trouver des photos de la coupe que tu veux. Montre-les-nous au début, on saura tout de suite dans quelle direction aller.

En voiture, tu prends la semi-autoroute en direction de Bienne. Compte environ 25 minutes pour les quelque 14 kilomètres jusqu'au centre, selon le trafic. En ville, tu te gares dans un parking public et tu fais les derniers mètres à pied.

## Un rendez-vous qui vaut le déplacement

Si tu viens exprès de Lyss, autant t'offrir plus qu'une coupe rapide. Le [GYAN Full Service](service:gyan-full-service) est notre offre la plus complète : coupe, barbe, soin du visage, lavage et coiffage en 50 minutes environ. Un peu plus court, la [formule GYAN Premium](service:gyan-premium-paket) réunit coupe, barbe, lavage et coiffage. Et si tu veux juste les cheveux, la coupe homme comprend conseil, ciseaux, tondeuse et contours nets, que ce soit une raie sur le côté, un low fade ou un skin fade.

Au salon, tu t'installes dans un fauteuil en cuir brun, avec un tapis persan rouge accroché au mur. Tu paies en espèces, par carte ou avec TWINT.

## Organiser plutôt qu'attendre

Avec un trajet plus long, mieux vaut [réserver en ligne](page:booking). Tu choisis la prestation et l'heure, la confirmation arrive tout de suite, et tu peux prendre le train qui va avec. Passer sans rendez-vous reste possible pendant les heures d'ouverture : du lundi au mercredi de 9 h à 19 h, jeudi et vendredi jusqu'à 20 h, samedi de 8 h 30 à 18 h. Les soirées plus longues du jeudi et du vendredi sont pratiques si tu es encore à Bienne après le travail.

Au salon travaillent Zana et Hikmet. Pour l'instant, la réservation en ligne se fait chez Zana, et tu peux aussi passer sans rendez-vous pendant les heures d'ouverture.

Tu habites plutôt entre Lyss et Bienne ? Jette un œil à nos pages pour [Busswil](seo:busswil) et Studen.`,
      en: `## Lyss, the rail hub of the Seeland

Lyss is one of the largest municipalities in the Seeland, and above all it's well connected. Several lines meet at Lyss station, and the one that matters here is the route between Bern and Biel. Living in Lyss, you can head either way quickly. Since 2011 Busswil has also been part of the municipality, with its own station on the same line.

From Lyss, Biel is the nearest bigger city: the old town, the lake and a busy centre full of shops around the station. That's exactly where you'll find us, a few minutes' walk from the station at Zentralstrasse 22.

## Train or expressway: two ways into Biel

The easiest option is the train. Hop on in Lyss, ride to Biel without changing and walk on from the station. No parking, no circling the city, and you can use the ride to dig out photos of the cut you want. Show them to us at the start and we'll know right away where you're headed.

If you drive, take the expressway towards Biel. Allow about 25 minutes for the roughly 14 km into the centre, depending on traffic. In town, park in one of the public car parks and walk the last bit.

## An appointment worth the trip

If you're coming in specially from Lyss, you might as well get more than a quick trim. The [GYAN Full Service](service:gyan-full-service) is our most complete option: haircut, beard, face treatment, wash and styling in about 50 minutes. A little shorter, the [GYAN Premium package](service:gyan-premium-paket) covers haircut, beard, wash and styling. And if it's just your hair, the men's haircut includes a consultation, scissors, clippers and clean outlines, whether you want a side part, a low fade or a skin fade.

You'll sit in a brown leather chair, with a red Persian carpet hanging on the wall. You can pay in cash, by card or with TWINT.

## Plan it instead of waiting

With a longer journey, it makes sense to [book online](page:booking). Pick your service and time, get instant confirmation, and choose your train to match. Walking in is still fine during opening hours: Monday to Wednesday 9am to 7pm, Thursday and Friday until 8pm, Saturday 8:30am to 6pm. The late Thursday and Friday evenings work well if you're still in Biel after work.

Zana and Hikmet both work in the salon. For now you can book Zana online, and walking in works too during opening hours.

Live somewhere between Lyss and Biel? Check out our pages for [Busswil](seo:busswil) and Studen.`,
    },
    neighbors: ["studen", "bruegg", "busswil"],
    carMin: 25,
    transit: {
      de: "Mit dem Zug auf der Linie zwischen Bern und Biel fährst du ohne Umsteigen von Lyss zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss zum Salon.",
      fr: "En train sur la ligne entre Berne et Bienne, tu vas sans changement de Lyss à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the train on the line between Bern and Biel straight from Lyss to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["gyan-full-service", "gyan-premium-paket", "haarschnitt-biel"],
    faq: {
      de: [
        { q: "Wie komme ich von Lyss am einfachsten zu GYAN?", a: "Mit dem Zug fährst du direkt von Lyss zum Bahnhof Biel, ohne Umsteigen. Vom Bahnhof gehst du wenige Minuten zu Fuss an die Zentralstrasse 22." },
        { q: "Lohnt sich ein grösseres Paket, wenn ich extra aus Lyss anreise?", a: "Wenn du die Fahrt schon machst, kannst du mehr in einen Termin packen: Der GYAN Full Service umfasst Haarschnitt, Bart, Face Treatment, Wäsche und Styling und dauert rund 50 Minuten." },
        { q: "Soll ich aus Lyss mit Termin oder spontan kommen?", a: "Spontan bist du während der Öffnungszeiten willkommen. Bei einer längeren Anreise aus Lyss ist ein online gebuchter Termin sicherer, weil er sofort bestätigt wird und du nicht warten musst." },
      ],
      fr: [
        { q: "Quel est le moyen le plus simple pour venir de Lyss chez GYAN ?", a: "Le train te mène directement de Lyss à la gare de Bienne, sans changement. De la gare, quelques minutes à pied suffisent pour rejoindre la Zentralstrasse 22." },
        { q: "Une formule plus complète vaut-elle la peine si je viens exprès de Lyss ?", a: "Puisque tu fais le trajet, tu peux en profiter : le GYAN Full Service comprend coupe, barbe, soin du visage, lavage et coiffage, pour environ 50 minutes." },
        { q: "Depuis Lyss, vaut-il mieux réserver ou passer sans rendez-vous ?", a: "Tu es le bienvenu sans rendez-vous pendant les heures d'ouverture. Avec un trajet depuis Lyss, réserver en ligne est plus sûr : la confirmation est immédiate et tu n'attends pas." },
      ],
      en: [
        { q: "What's the easiest way to get from Lyss to GYAN?", a: "Take the train straight from Lyss to Biel station, no change needed. From the station it's a few minutes' walk to Zentralstrasse 22." },
        { q: "Is a bigger package worth it if I come all the way from Lyss?", a: "Since you're making the trip anyway, you can fit more into one visit: the GYAN Full Service covers haircut, beard, face treatment, wash and styling in about 50 minutes." },
        { q: "Should I book or just walk in when coming from Lyss?", a: "Walk-ins are welcome during opening hours. With a longer trip from Lyss, booking online is the safer bet, since it's confirmed instantly and you won't have to wait." },
      ],
    },
  },

  // ───────────────────────────── PIETERLEN ─────────────────────────────
  {
    key: "pieterlen",
    name: { de: "Pieterlen", fr: "Perles", en: "Pieterlen" },
    slug: { de: "coiffeur-pieterlen", fr: "coiffeur-perles", en: "barber-pieterlen" },
    km: 9,
    title: {
      de: "Coiffeur für Pieterlen – Herrenschnitt Biel | GYAN",
      fr: "Coiffeur près de Perles – coiffeur homme Bienne | GYAN",
      en: "Barber near Pieterlen – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Herrencoiffeur für Pieterlen: GYAN in Biel, rund 9 km entfernt und per Regionalzug direkt erreichbar. Signature Cut, Bart und Pflege. Jetzt online buchen.",
      fr: "Coiffeur homme pour Perles : GYAN à Bienne, à 9 km, accessible en train régional direct. Signature Cut, barbe et soin du visage. Réserve en ligne.",
      en: "Barber for Pieterlen: GYAN in Biel, about 9 km away and a direct regional train ride. Signature Cut, beard and face care. Book your slot online.",
    },
    h1: {
      de: "Herrencoiffeur für Pieterlen",
      fr: "Coiffeur homme près de Perles",
      en: "Barber near Pieterlen",
    },
    intro: {
      de: "Pieterlen liegt am Jurasüdfuss nur rund neun Kilometer östlich von Biel. Mit dem Regionalzug oder in etwa einer Viertelstunde mit dem Auto bist du bei GYAN an der Zentralstrasse 22.",
      fr: "Perles se trouve au pied du Jura, à seulement neuf kilomètres environ à l'est de Bienne. En train régional ou en un quart d'heure de voiture, tu es chez GYAN à la Zentralstrasse 22.",
      en: "Pieterlen sits at the foot of the Jura only about nine kilometres east of Biel. A regional train or a quarter of an hour in the car gets you to GYAN on Zentralstrasse 22.",
    },
    body: {
      de: `## Pieterlen und Biel: Nachbarn am Jurasüdfuss

Pieterlen, auf Französisch Perles, gehört zum Verwaltungskreis Biel/Bienne und liegt am Jurasüdfuss zwischen Biel und Grenchen. Im Norden steigen die Jurahänge an, im Süden öffnet sich die Ebene Richtung Seeland. Von allen Gemeinden östlich von Biel ist Pieterlen eine der nächsten: Bis zu unserem Salon an der Zentralstrasse 22 sind es nur rund neun Kilometer. Für vieles, was ein Dorf nicht bietet, ist Biel ohnehin das naheliegende Ziel, und ein guter Herrenschnitt gehört dazu.

## Zug oder Auto: dein Weg ab Pieterlen

Pieterlen hat einen eigenen Bahnhof an der Jurasüdfusslinie zwischen Biel und Solothurn. Der Regionalzug bringt dich direkt zum Bahnhof Biel, und von dort gehst du ein paar Minuten zu Fuss bis zum Salon. Umsteigen musst du nicht, und einen Parkplatz suchst du auch nicht. Die Fahrt ist so kurz, dass sie sich auch für einen schnellen Schnitt zwischendurch lohnt.

Mit dem Auto fährst du auf der Hauptstrasse dem Jurafuss entlang westwärts, über Bözingen ins Bieler Zentrum. Rechne grosszügig mit etwa einer Viertelstunde und parkiere in einem der öffentlichen Parkhäuser in der Innenstadt. Von dort ist die Zentralstrasse schnell zu Fuss erreicht.

## Mehr als nur kürzer: Signature Cut und Pflege

Wenn du schon nach Biel fährst, lohnt sich ein Schnitt, der länger hält als bis zum nächsten Wochenende. Beim [GYAN Signature Cut](service:gyan-signature) schneiden wir nicht nur, wir stylen deine Haare danach und zeigen dir, mit welchem Produkt und welchen Handgriffen du den Look zu Hause selbst hinbekommst. Trägst du Bart, nimmst du ihn im GYAN Classic Paket gleich mit. Und wer nach einer langen Woche abschalten will, ergänzt das [GYAN Face Treatment](service:gesichtspflege-biel) mit heissem Tuch, Reinigung und Pflege.

Du sitzt dabei in einem unserer braunen Ledersessel, an der Wand hängt ein roter Perserteppich. Bezahlt wird bar, mit Karte oder mit TWINT.

## Vor der Arbeit, nach Feierabend oder am Samstag

Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, Donnerstag und Freitag bis 20 Uhr, am Samstag schon ab 8.30 Uhr bis 18 Uhr. Sonntags bleibt der Salon zu. Arbeitest du in Biel, passt ein Termin oft direkt vor der Heimfahrt nach Pieterlen. Am Samstagmorgen erledigst du den Schnitt, bevor der Tag richtig losgeht.

Deinen Termin [buchst du online](page:booking) und bekommst sofort eine Bestätigung. Spontan geht es auch: Während der Öffnungszeiten kannst du ohne Termin vorbeikommen. Wohnst du etwas weiter östlich, findest du eine eigene Seite für [Lengnau](seo:lengnau).`,
      fr: `## Perles et Bienne : voisins au pied du Jura

Perles, Pieterlen en allemand, fait partie de l'arrondissement administratif de Biel/Bienne et se trouve au pied du Jura, entre Bienne et Granges. Au nord, les pentes du Jura s'élèvent, au sud la plaine s'ouvre vers le Seeland. Parmi les communes à l'est de Bienne, Perles est l'une des plus proches : notre salon à la Zentralstrasse 22 n'est qu'à neuf kilomètres environ. Pour tout ce qu'un village n'offre pas, Bienne est de toute façon la destination logique, et une bonne coupe homme en fait partie.

## Train ou voiture : ton trajet depuis Perles

Perles a sa propre gare sur la ligne du pied du Jura entre Bienne et Soleure. Le train régional t'amène directement à la gare de Bienne, et de là tu marches quelques minutes jusqu'au salon. Pas de changement, pas de place de parc à chercher.

En voiture, tu suis la route principale vers l'ouest le long du pied du Jura, puis tu passes par Boujean pour rejoindre le centre de Bienne. Compte large environ un quart d'heure et gare-toi dans un des parkings publics du centre-ville. De là, la Zentralstrasse est vite atteinte à pied.

## Plus qu'une simple coupe : Signature Cut et soin

Tant qu'à venir à Bienne, autant repartir avec une coupe qui tient plus longtemps que jusqu'au week-end suivant. Avec le [GYAN Signature Cut](service:gyan-signature), on ne fait pas que couper : on coiffe tes cheveux ensuite et on te montre quel produit et quels gestes utiliser pour refaire le look toi-même. Si tu portes la barbe, prends-la avec la formule GYAN Classic. Et pour décrocher après une longue semaine, ajoute le [GYAN Face Treatment](service:gesichtspflege-biel) avec serviette chaude, nettoyage et soin.

Tu t'installes dans un de nos fauteuils en cuir brun, avec un tapis persan rouge accroché au mur. Paiement en espèces, par carte ou avec TWINT.

## Avant le travail, après le boulot ou le samedi

Du lundi au mercredi, on est là de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, et le samedi dès 8 h 30 jusqu'à 18 h. Le dimanche, le salon est fermé. Si tu travailles à Bienne, un rendez-vous juste avant de rentrer à Perles tombe souvent bien. Le samedi matin, ta coupe est faite avant que la journée commence vraiment.

[Réserve en ligne](page:booking) et la confirmation arrive tout de suite. En mode spontané, ça marche aussi : pendant les heures d'ouverture, tu peux passer sans rendez-vous. Si tu habites un peu plus à l'est, il existe une page pour [Longeau](seo:lengnau).`,
      en: `## Pieterlen and Biel: neighbours at the foot of the Jura

Pieterlen, Perles in French, belongs to the Biel/Bienne administrative district and sits at the foot of the Jura between Biel and Grenchen. The Jura slopes rise to the north, while to the south the plain opens out towards the Seeland. Of all the villages east of Biel, Pieterlen is one of the closest: our salon on Zentralstrasse 22 is only about nine kilometres away. Biel is the natural place to go for anything a village doesn't have, and a proper men's haircut is on that list.

## Train or car: your route from Pieterlen

Pieterlen has its own station on the Jura foot line between Biel and Solothurn. The regional train runs straight to Biel station, and from there it's a few minutes on foot to the salon. No changes, and no hunting for a parking space.

If you drive, follow the main road west along the foot of the Jura and come into central Biel through Bözingen. Allow a generous quarter of an hour and leave the car in one of the public car parks in the city centre. Zentralstrasse is a short walk from there.

## More than a trim: Signature Cut and some care

Since you're making the trip, you might as well leave with a cut that lasts longer than the next weekend. With the [GYAN Signature Cut](service:gyan-signature) we don't just cut: we style your hair afterwards and show you which product and which moves recreate the look at home. Got a beard? Add it with the GYAN Classic package. And if you want to switch off after a long week, finish with the [GYAN Face Treatment](service:gesichtspflege-biel): hot towel, cleansing and care.

You'll sit in one of our brown leather chairs, with a red Persian carpet hanging on the wall. Pay in cash, by card or with TWINT.

## Before work, after work or on a Saturday

We're open Monday to Wednesday from 9am to 7pm, Thursday and Friday until 8pm, and Saturday from 8:30am to 6pm. Sundays we're closed. If you work in Biel, an appointment right before you head home to Pieterlen often works well. On a Saturday morning, you can get the cut done before the day really gets going.

[Book online](page:booking) and get instant confirmation. Spontaneous works too: during opening hours you can simply walk in. Living a little further east? There's a page for [Lengnau](seo:lengnau).`,
    },
    neighbors: ["orpund", "evilard", "lengnau", "safnern", "grenchen"],
    carMin: 15,
    transit: {
      de: "Mit dem Regionalzug auf der Jurasüdfusslinie fährst du direkt zum Bahnhof Biel, von dort sind es ein paar Minuten zu Fuss zum Salon.",
      fr: "Le train régional de la ligne du pied du Jura t'amène directement à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the regional train on the Jura foot line straight to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["gyan-signature", "haarschnitt-und-bart", "gesichtspflege-biel"],
    faq: {
      de: [
        { q: "Wie komme ich von Pieterlen am schnellsten zu GYAN?", a: "Mit dem Regionalzug fährst du direkt zum Bahnhof Biel und gehst von dort ein paar Minuten zu Fuss an die Zentralstrasse 22. Mit dem Auto rechnest du grosszügig mit rund 15 Minuten für die etwa neun Kilometer." },
        { q: "Kann ich als Pendler aus Pieterlen auch nach der Arbeit kommen?", a: "Ja. Donnerstag und Freitag ist der Salon bis 20 Uhr offen, Montag bis Mittwoch bis 19 Uhr. So passt ein Termin gut zwischen Feierabend und Heimfahrt nach Pieterlen." },
        { q: "Muss ich aus Pieterlen vorher einen Termin buchen?", a: "Nein, während der Öffnungszeiten kannst du auch ohne Termin vorbeikommen. Wer eine feste Zeit möchte, bucht online und bekommt sofort eine Bestätigung." },
      ],
      fr: [
        { q: "Comment aller de Perles chez GYAN le plus rapidement ?", a: "Le train régional t'amène directement à la gare de Bienne, puis tu marches quelques minutes jusqu'à la Zentralstrasse 22. En voiture, compte large environ 15 minutes pour les quelque neuf kilomètres." },
        { q: "En tant que pendulaire de Perles, je peux passer après le travail ?", a: "Oui. Le jeudi et le vendredi, le salon est ouvert jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h. Un rendez-vous se glisse donc bien entre la fin du travail et le retour à Perles." },
        { q: "Dois-je réserver avant de venir de Perles ?", a: "Non, pendant les heures d'ouverture tu peux aussi venir sans rendez-vous. Si tu veux une heure fixe, réserve en ligne et la confirmation est immédiate." },
      ],
      en: [
        { q: "What's the quickest way from Pieterlen to GYAN?", a: "The regional train takes you straight to Biel station, then it's a few minutes' walk to Zentralstrasse 22. By car, allow around 15 minutes for the roughly nine kilometres." },
        { q: "I commute from Pieterlen. Can I come after work?", a: "Yes. The salon is open until 8pm on Thursdays and Fridays and until 7pm Monday to Wednesday, so a cut fits nicely between finishing work and heading home to Pieterlen." },
        { q: "Do I need to book before coming in from Pieterlen?", a: "No, walk-ins are welcome during opening hours. If you want a fixed time, book online and you get instant confirmation." },
      ],
    },
  },

  // ───────────────────────────── STUDEN ─────────────────────────────
  {
    key: "studen",
    name: { de: "Studen", fr: "Studen", en: "Studen" },
    slug: { de: "coiffeur-studen", fr: "coiffeur-studen", en: "barber-studen" },
    km: 9,
    title: {
      de: "Coiffeur für Studen – Bart & Fade in Biel | GYAN",
      fr: "Coiffeur près de Studen – barbe à Bienne | GYAN",
      en: "Barber near Studen – beards & fades in Biel | GYAN",
    },
    description: {
      de: "Barbier für Studen: GYAN in Biel, rund 9 km entfernt. Bart Trim, Hot Towel Rasur und Face Treatment für Männer. Jetzt online Termin buchen.",
      fr: "Barbier pour Studen : GYAN à Bienne, à environ 9 km. Taille de barbe, rasage serviette chaude et soin du visage. Réserve ton rendez-vous en ligne.",
      en: "Barber for Studen: GYAN in Biel, about 9 km away. Beard trims, hot towel shaves and face treatments for men. Book your appointment online today.",
    },
    h1: {
      de: "Herrencoiffeur für Studen",
      fr: "Coiffeur homme près de Studen",
      en: "Barber near Studen",
    },
    intro: {
      de: "Studen liegt am Fuss des Jensbergs, rund neun Kilometer von Biel. Mit dem Auto bist du in etwa einer Viertelstunde im Zentrum, mit dem Bus am Bahnhof Biel, nur wenige Minuten von GYAN.",
      fr: "Studen se trouve au pied du Jensberg, à environ neuf kilomètres de Bienne. En voiture, tu es au centre en un quart d'heure environ, en bus à la gare, à deux pas de GYAN.",
      en: "Studen sits at the foot of the Jensberg, about nine kilometres from Biel. By car you're in the centre in around 15 minutes, by bus at Biel station, close to GYAN.",
    },
    body: {
      de: `## Der Jensberg und ein Stück Römerzeit

Das Seeland ist meist flach, doch bei Studen erhebt sich der bewaldete Jensberg. Er ist ein beliebtes Ziel für Spaziergänge, und auf ihm und an seinem Fuss lag in römischer Zeit die Siedlung Petinesca. Studen ist damit ein Ort, an dem Natur und Geschichte nah beieinander liegen. Für den Alltag aber orientieren sich viele hier Richtung Biel: zur Arbeit, zur Schule, zum Einkaufen.

## Von Studen ins Bieler Zentrum

Die rund neun Kilometer nach Biel sind schnell gemacht. Mit dem Auto rechnest du mit etwa 15 Minuten bis ins Zentrum und parkierst dort in einem der öffentlichen Parkhäuser. Ohne Auto nimmst du den Bus zum Bahnhof Biel. Von dort gehst du wenige Minuten zu Fuss bis zur Zentralstrasse 22.

## Bart im Fokus

Auf dieser Seite geht es vor allem um eines: deinen Bart. Beim [Bart Trim](service:bart-trimmen-biel) bringen wir Länge und Form in Ordnung und ziehen die Konturen mit der Klinge nach. Das dauert rund 15 Minuten und kostet 20 Franken. Wer es klassischer mag, bucht die [Bart Rasur mit heissem Tuch](service:nassrasur-biel): eine Nassrasur mit Schaum, heissem Tuch und anschliessender Pflege.

Willst du Haar und Bart in einem Termin erledigen, ist das GYAN Classic Paket die naheliegende Wahl. Und wenn die Haut nach Wind und Wetter etwas Pflege braucht, gibt es das GYAN Face Treatment mit heissem Tuch, Reinigung und Pflege.

Im Salon sitzt du auf braunen Ledersesseln, an der Wand hängt ein roter Perserteppich. Ein ruhiger Ort für eine Viertelstunde, in der nur dein Bart zählt.

## Termin vor dem Ausflug

Samstags öffnen wir schon um 8.30 Uhr. Ein früher Termin lässt dir den Rest des Tages frei, etwa für eine Runde am Jensberg. Unter der Woche sind wir Montag bis Mittwoch von 9 bis 19 Uhr da, Donnerstag und Freitag bis 20 Uhr. Sonntags ist geschlossen.

Einen festen Termin [buchst du online](page:booking), die Bestätigung kommt sofort. Ohne Termin bist du während der Öffnungszeiten ebenfalls willkommen. Bezahlt wird bar, mit Karte oder mit TWINT.

Zur Orientierung bei den Preisen: Die Bart Rasur mit heissem Tuch kostet 28 Franken, das Face Treatment 25 Franken und dauert rund 20 Minuten. Das GYAN Classic Paket mit Haarschnitt und Bart kostet 65 Franken, ohne Termin 60 Franken, und dauert rund eine halbe Stunde. Im Salon arbeiten Zana und Hikmet, online buchbar ist derzeit Zana.

Wohnst du weiter Richtung Bern oder näher an der Aare? Dann schau auf unseren Seiten für [Lyss](seo:lyss) und Aegerten vorbei.`,
      fr: `## Le Jensberg et un peu d'époque romaine

Le Seeland est plutôt plat, mais près de Studen se dresse le Jensberg boisé. C'est un lieu de promenade apprécié, et à l'époque romaine, l'agglomération de Petinesca se trouvait sur la colline et à son pied. À Studen, nature et histoire sont donc toutes proches. Au quotidien, pourtant, beaucoup se tournent vers Bienne : pour le travail, l'école ou les courses.

## De Studen au centre de Bienne

Les quelque neuf kilomètres jusqu'à Bienne passent vite. En voiture, compte environ 15 minutes jusqu'au centre, où tu te gares dans un parking public. Sans voiture, tu prends le bus jusqu'à la gare de Bienne, puis quelques minutes à pied jusqu'à la Zentralstrasse 22.

## La barbe avant tout

Sur cette page, il est surtout question de ta barbe. Avec la [taille de barbe](service:bart-trimmen-biel), on remet en ordre la longueur et la forme, puis on trace les contours au rasoir. Compte environ 15 minutes et 20 francs. Si tu préfères le classique, réserve le [rasage à la serviette chaude](service:nassrasur-biel) : rasage traditionnel avec mousse, serviette chaude et soin.

Pour régler cheveux et barbe en un seul rendez-vous, la formule GYAN Classic est le choix évident. Et si ta peau a besoin d'un peu d'attention après le vent et le froid, il y a le GYAN Face Treatment, avec serviette chaude, nettoyage et soin.

Au salon, tu t'installes dans un fauteuil en cuir brun, sous un tapis persan rouge accroché au mur. Un endroit calme pour un quart d'heure consacré uniquement à ta barbe.

## Un rendez-vous avant la balade

Le samedi, on ouvre dès 8 h 30. Un rendez-vous tôt te laisse le reste de la journée, par exemple pour faire un tour sur le Jensberg. En semaine, on est là du lundi au mercredi de 9 h à 19 h, jeudi et vendredi jusqu'à 20 h. Fermé le dimanche.

Pour un créneau fixe, [réserve en ligne](page:booking) : la confirmation est immédiate. Sans rendez-vous, tu es aussi le bienvenu pendant les heures d'ouverture. Paiement en espèces, par carte ou avec TWINT.

Pour te repérer côté prix : le rasage à la serviette chaude coûte 28 francs, le Face Treatment 25 francs pour environ 20 minutes. La formule GYAN Classic avec coupe et barbe coûte 65 francs, 60 francs sans rendez-vous, et dure environ une demi-heure. Au salon travaillent Zana et Hikmet, et pour l'instant, c'est Zana qu'on réserve en ligne.

Tu habites plus loin vers Berne ou plus près de l'Aar ? Va voir nos pages pour [Lyss](seo:lyss) et Aegerten.`,
      en: `## The Jensberg and a slice of Roman history

The Seeland is mostly flat, but near Studen the wooded Jensberg rises up. It's a popular spot for walks, and in Roman times the settlement of Petinesca stood on the hill and at its foot. So Studen is a place where nature and history sit close together. For everyday life, though, many people here look towards Biel: for work, school or shopping.

## From Studen into central Biel

The roughly nine kilometres to Biel go by quickly. By car, allow about 15 minutes into the centre and park in one of the public car parks. Without a car, take the bus to Biel station, then walk a few minutes to Zentralstrasse 22.

## All about the beard

This page is mostly about one thing: your beard. With a [beard trim](service:bart-trimmen-biel) we sort out length and shape, then sharpen the lines with the razor. It takes about 15 minutes and costs CHF 20. If you prefer something more traditional, book the [hot towel shave](service:nassrasur-biel): a wet shave with lather, a hot towel and aftercare.

Want hair and beard done in one go? The GYAN Classic package is the obvious pick. And if your skin needs some attention after wind and weather, there's the GYAN Face Treatment with hot towel, cleansing and care.

You'll sit in a brown leather chair, with a red Persian carpet on the wall. A calm spot for a quarter of an hour that's all about your beard.

## A trim before your day out

On Saturdays we open at 8:30am. An early slot leaves the rest of the day free, maybe for a loop around the Jensberg. During the week we're open Monday to Wednesday 9am to 7pm, and Thursday and Friday until 8pm. Closed on Sundays.

To lock in a time, [book online](page:booking) and get instant confirmation. Walk-ins are welcome during opening hours as well. Pay in cash, by card or with TWINT.

To give you an idea of prices: the hot towel shave is CHF 28, and the face treatment CHF 25 for about 20 minutes. The GYAN Classic package with haircut and beard is CHF 65, or CHF 60 as a walk-in, and takes around half an hour. Zana and Hikmet both work in the salon, and for now you can book Zana online.

Live further towards Bern or closer to the Aare? Have a look at our pages for [Lyss](seo:lyss) and Aegerten.`,
    },
    neighbors: ["lyss", "bruegg", "aegerten", "busswil"],
    carMin: 15,
    transit: {
      de: "Mit dem Bus fährst du von Studen zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss zum Salon.",
      fr: "En bus, tu vas de Studen à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the bus from Studen to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["bart-trimmen-biel", "gesichtspflege-biel", "haarschnitt-und-bart", "nassrasur-biel"],
    faq: {
      de: [
        { q: "Wie lange fahre ich von Studen mit dem Auto zu GYAN?", a: "Für die rund neun Kilometer von Studen ins Bieler Zentrum rechnest du mit etwa 15 Minuten. Parkieren kannst du in einem der öffentlichen Parkhäuser in der Innenstadt." },
        { q: "Kann ich aus Studen nur für den Bart vorbeikommen?", a: "Ja. Der Bart Trim dauert rund 15 Minuten und kostet 20 Franken, die Bart Rasur mit heissem Tuch rund 20 Minuten. Du kannst online buchen oder während der Öffnungszeiten spontan kommen." },
        { q: "Passt ein Termin am Samstag gut zu einem Ausflug in Studen?", a: "Samstags öffnen wir um 8.30 Uhr. Ein früher Termin lässt dir den restlichen Tag frei, zum Beispiel für einen Spaziergang am Jensberg." },
      ],
      fr: [
        { q: "Combien de temps faut-il en voiture de Studen jusqu'à GYAN ?", a: "Pour les quelque neuf kilomètres de Studen au centre de Bienne, compte environ 15 minutes. Tu peux te garer dans un des parkings publics du centre-ville." },
        { q: "Puis-je venir de Studen seulement pour la barbe ?", a: "Oui. La taille de barbe dure environ 15 minutes et coûte 20 francs, le rasage à la serviette chaude environ 20 minutes. Réserve en ligne ou passe pendant les heures d'ouverture." },
        { q: "Un rendez-vous le samedi se combine-t-il bien avec une sortie à Studen ?", a: "Le samedi, on ouvre à 8 h 30. Un rendez-vous tôt te laisse le reste de la journée libre, par exemple pour une balade sur le Jensberg." },
      ],
      en: [
        { q: "How long is the drive from Studen to GYAN?", a: "For the roughly nine kilometres from Studen into central Biel, allow about 15 minutes. You can park in one of the public car parks in the city centre." },
        { q: "Can I come in from Studen just for my beard?", a: "Yes. A beard trim takes about 15 minutes and costs CHF 20, a hot towel shave about 20 minutes. Book online or drop in during opening hours." },
        { q: "Does a Saturday appointment fit with a day out in Studen?", a: "On Saturdays we open at 8:30am. An early slot leaves the rest of your day free, for example for a walk on the Jensberg." },
      ],
    },
  },

  // ───────────────────────────── LENGNAU ─────────────────────────────
  {
    key: "lengnau",
    name: { de: "Lengnau", fr: "Longeau", en: "Lengnau" },
    slug: { de: "coiffeur-lengnau", fr: "coiffeur-longeau", en: "barber-lengnau" },
    km: 12,
    title: {
      de: "Coiffeur für Lengnau – Herrenschnitt in Biel | GYAN",
      fr: "Coiffeur près de Longeau – barbier à Bienne | GYAN",
      en: "Barber near Lengnau – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Lengnau: GYAN in Biel, rund 12 km entfernt, per Regionalzug ohne Umsteigen. Herrenschnitt, Bart Trim und Full Service. Termin online buchen.",
      fr: "Coiffeur pour Longeau : GYAN à Bienne, à 12 km, en train régional sans changement. Coupe homme, taille de barbe et Full Service. Réserve en ligne.",
      en: "Barber for Lengnau: GYAN in Biel, about 12 km away by regional train, no change needed. Men's cuts, beard trims and Full Service. Book online now.",
    },
    h1: {
      de: "Herrencoiffeur für Lengnau",
      fr: "Coiffeur homme près de Longeau",
      en: "Barber near Lengnau",
    },
    intro: {
      de: "Lengnau ist die östlichste Berner Gemeinde am Jurasüdfuss vor Grenchen, rund zwölf Kilometer von Biel. Der Regionalzug bringt dich ohne Umsteigen zum Bahnhof Biel und damit fast vor unsere Tür.",
      fr: "Longeau est la dernière commune bernoise au pied du Jura avant Granges, à une douzaine de kilomètres de Bienne. Le train régional t'amène sans changement à la gare de Bienne, presque devant notre porte.",
      en: "Lengnau is the last Bernese village at the foot of the Jura before Grenchen, about twelve kilometres from Biel. The regional train takes you to Biel station without changing, almost to our door.",
    },
    body: {
      de: `## Ein Bahnknoten am Kantonsrand

Lengnau, auf Französisch Longeau, ist die letzte Berner Gemeinde am Jurasüdfuss, bevor das Gebiet des Kantons Solothurn mit Grenchen beginnt. Das Dorf ist auch ein kleiner Bahnknoten: Hier trifft die Jurasüdfusslinie zwischen Biel und Solothurn auf die Linie, die durch den Grenchenbergtunnel aus Moutier kommt. Für dich heisst das vor allem eines: Biel ist mit der Bahn sehr gut erreichbar, und unser Salon an der Zentralstrasse 22 liegt nur ein paar Gehminuten vom Bahnhof Biel entfernt.

## Zwölf Kilometer, zwei bequeme Wege

Mit dem Regionalzug fährst du ab dem Bahnhof Lengnau über Pieterlen direkt nach Biel, ohne umzusteigen. Vom Bahnhof Biel gehst du zu Fuss zur Zentralstrasse, und schon bist du da. So kannst du den Schnitt gut mit einem Arbeitstag oder Besorgungen in der Stadt verbinden.

Mit dem Auto folgst du der Hauptstrasse westwärts dem Jurafuss entlang, durch Pieterlen und über Bözingen ins Zentrum. Rechne grosszügig mit etwa 20 Minuten und stell den Wagen in eines der öffentlichen Parkhäuser in der Innenstadt. Alternativ bringt dich die A5 Richtung Biel. Und musst du nach dem Termin weiter, ist der Bahnhof Biel als grösster Knoten der Region der ideale Ausgangspunkt für deine nächste Verbindung.

## Was du aus Lengnau mitnehmen kannst

Für den Alltag reicht oft der [Herren Haarschnitt](service:haarschnitt-biel): Beratung, Schere und Maschine, saubere Konturen, rund 20 Minuten. Ohne Termin kostet er 35 Franken, mit Termin 40 Franken. Ist dein Bart aus der Form geraten, bringen wir ihn beim Bart Trim zurück und ziehen die Konturen mit der Klinge nach.

Hast du dir einen ganzen Vormittag in Biel freigehalten, ist der [GYAN Full Service](service:gyan-full-service) die ausführlichste Variante: Haarschnitt, Bart, Face Treatment, Wäsche und Styling in rund 50 Minuten. Du sitzt dabei in einem braunen Ledersessel, mit dem roten Perserteppich an der Wand im Blick.

## Wann es aus Lengnau am besten passt

Montag bis Mittwoch haben wir von 9 bis 19 Uhr offen, Donnerstag und Freitag bis 20 Uhr, Samstag von 8.30 bis 18 Uhr. Sonntags ist geschlossen. Gerade die langen Abende am Donnerstag und Freitag passen, wenn du tagsüber arbeitest und danach noch Zeit in Biel hast.

Für eine feste Zeit [buchst du online](page:booking), die Bestätigung kommt sofort. Ohne Termin bist du während der Öffnungszeiten ebenfalls willkommen. Bezahlt wird bar, mit Karte oder mit TWINT. Für das Nachbardorf auf dem Weg nach Biel gibt es eine eigene Seite: [Pieterlen](seo:pieterlen).`,
      fr: `## Un nœud ferroviaire à la limite du canton

Longeau, Lengnau en allemand, est la dernière commune bernoise au pied du Jura avant le territoire soleurois et Granges. Le village est aussi un petit nœud ferroviaire : la ligne du pied du Jura entre Bienne et Soleure y rejoint la ligne qui arrive de Moutier par le tunnel du Grenchenberg. Pour toi, cela veut surtout dire une chose : Bienne est très bien desservie, et notre salon à la Zentralstrasse 22 n'est qu'à quelques minutes à pied de la gare de Bienne.

## Douze kilomètres, deux trajets simples

En train régional, tu pars de la gare de Longeau, passes par Perles et arrives directement à Bienne, sans changement. De la gare de Bienne, tu rejoins la Zentralstrasse à pied et tu y es. Pratique pour combiner la coupe avec une journée de travail ou des courses en ville.

En voiture, tu suis la route principale vers l'ouest le long du pied du Jura, à travers Perles puis par Boujean jusqu'au centre. Compte large environ 20 minutes et laisse la voiture dans un des parkings publics du centre-ville. L'A5 en direction de Bienne est l'autre option. Et si tu repars ailleurs après ton rendez-vous, la gare de Bienne, le plus grand nœud ferroviaire de la région, est le point de départ idéal.

## Ce que tu peux t'offrir en venant de Longeau

Pour le quotidien, la [coupe homme](service:haarschnitt-biel) suffit souvent : conseil, ciseaux et tondeuse, contours nets, environ 20 minutes. Sans rendez-vous, elle coûte 35 francs, avec rendez-vous 40 francs. Si ta barbe a perdu sa forme, la taille de barbe la remet en ordre, avec les contours repris au rasoir.

Si tu t'es réservé une matinée entière à Bienne, le [GYAN Full Service](service:gyan-full-service) est la version la plus complète : coupe, barbe, Face Treatment, shampooing et coiffage en environ 50 minutes. Tu es installé dans un fauteuil en cuir brun, face au tapis persan rouge accroché au mur.

## Quand venir depuis Longeau

Du lundi au mercredi, on est ouverts de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, le samedi de 8 h 30 à 18 h. Fermé le dimanche. Les soirées longues du jeudi et du vendredi tombent bien si tu travailles la journée et que tu as encore un moment à Bienne ensuite.

Pour une heure fixe, [réserve en ligne](page:booking), la confirmation est immédiate. Sans rendez-vous, tu es aussi le bienvenu pendant les heures d'ouverture. Paiement en espèces, par carte ou avec TWINT. Le village voisin sur la route de Bienne a sa propre page : [Perles](seo:pieterlen).`,
      en: `## A rail junction on the cantonal border

Lengnau, Longeau in French, is the last Bernese village at the foot of the Jura before you cross into the canton of Solothurn and reach Grenchen. It's also a small rail junction: the Jura foot line between Biel and Solothurn meets the line that comes from Moutier through the Grenchenberg tunnel. What that means for you is simple: Biel is easy to reach by train, and our salon on Zentralstrasse 22 is only a few minutes' walk from Biel station.

## Twelve kilometres, two easy options

The regional train leaves Lengnau station, stops in Pieterlen and runs straight into Biel, no change needed. From Biel station you walk over to Zentralstrasse and you're there. That makes it easy to combine a cut with a working day or some errands in town.

If you drive, follow the main road west along the foot of the Jura, through Pieterlen and on through Bözingen into the centre. Allow a generous 20 minutes and leave the car in one of the public car parks in the city centre. The A5 towards Biel is the other option. And if you're travelling on after your appointment, Biel station is the biggest rail hub in the region, so your next connection is right there.

## What to book when you come from Lengnau

For everyday upkeep, the [men's haircut](service:haarschnitt-biel) is usually all you need: consultation, scissors and clippers, clean outlines, about 20 minutes. It's CHF 35 as a walk-in and CHF 40 with an appointment. If your beard has lost its shape, the beard trim sorts it out, with the lines finished using the razor.

If you've set aside a whole morning in Biel, the [GYAN Full Service](service:gyan-full-service) is the most complete option: haircut, beard, Face Treatment, wash and styling in about 50 minutes. You'll be sitting in a brown leather chair, looking at the red Persian carpet on the wall.

## When it suits you best from Lengnau

We're open Monday to Wednesday from 9am to 7pm, Thursday and Friday until 8pm, and Saturday from 8:30am to 6pm. Closed on Sundays. The longer Thursday and Friday evenings work well if you're busy during the day and still have time in Biel afterwards.

For a fixed time, [book online](page:booking) and get instant confirmation. Walk-ins are welcome during opening hours too. Pay in cash, by card or with TWINT. The neighbouring village on the way to Biel has its own page: [Pieterlen](seo:pieterlen).`,
    },
    neighbors: ["pieterlen", "grenchen", "safnern"],
    carMin: 20,
    transit: {
      de: "Ab dem Bahnhof Lengnau fährt der Regionalzug über Pieterlen direkt zum Bahnhof Biel, von dort gehst du ein paar Minuten zu Fuss.",
      fr: "Depuis la gare de Longeau, le train régional passe par Perles et va directement à la gare de Bienne, puis quelques minutes à pied.",
      en: "From Lengnau station the regional train runs via Pieterlen straight to Biel station, then it's a few minutes on foot.",
    },
    services: ["haarschnitt-biel", "bart-trimmen-biel", "gyan-full-service"],
    faq: {
      de: [
        { q: "Wie lange brauche ich von Lengnau mit dem Auto zu GYAN?", a: "Für die rund zwölf Kilometer rechnest du grosszügig mit etwa 20 Minuten bis ins Bieler Zentrum. Parkieren kannst du in einem der öffentlichen Parkhäuser in der Innenstadt." },
        { q: "Lohnt sich ein Termin aus Lengnau am Samstag?", a: "Ja, am Samstag ist der Salon schon ab 8.30 Uhr und bis 18 Uhr offen. Am frühen Morgen hast du den Schnitt erledigt, bevor das Wochenende richtig beginnt." },
        { q: "Kann ich aus Lengnau auch einfach ohne Termin vorbeikommen?", a: "Ja, Walk-ins sind während der Öffnungszeiten willkommen, und der Herren Haarschnitt kostet ohne Termin 35 statt 40 Franken. Mit einer Online-Buchung hast du dafür eine feste Zeit und sofortige Bestätigung." },
      ],
      fr: [
        { q: "Combien de temps en voiture de Longeau jusqu'à GYAN ?", a: "Pour la douzaine de kilomètres, compte large environ 20 minutes jusqu'au centre de Bienne. Tu peux te garer dans un des parkings publics du centre-ville." },
        { q: "Un rendez-vous le samedi depuis Longeau, ça vaut le coup ?", a: "Oui, le samedi le salon est ouvert dès 8 h 30 et jusqu'à 18 h. Tôt le matin, ta coupe est faite avant que le week-end commence vraiment." },
        { q: "Je peux venir de Longeau sans rendez-vous ?", a: "Oui, les clients sans rendez-vous sont les bienvenus pendant les heures d'ouverture, et la coupe homme coûte alors 35 francs au lieu de 40. En réservant en ligne, tu as une heure fixe et une confirmation immédiate." },
      ],
      en: [
        { q: "How long is the drive from Lengnau to GYAN?", a: "For the roughly twelve kilometres, allow a generous 20 minutes to central Biel. You can park in one of the public car parks in the city centre." },
        { q: "Is a Saturday appointment worth it from Lengnau?", a: "Yes, on Saturdays the salon opens at 8:30am and stays open until 6pm. Come early and the cut is done before the weekend properly starts." },
        { q: "Can I just walk in from Lengnau without booking?", a: "Yes, walk-ins are welcome during opening hours, and the men's haircut costs CHF 35 instead of 40 without an appointment. Booking online gets you a fixed time and instant confirmation." },
      ],
    },
  },

  // ───────────────────────────── GRENCHEN ─────────────────────────────
  {
    key: "grenchen",
    name: { de: "Grenchen", fr: "Granges", en: "Grenchen" },
    slug: { de: "coiffeur-grenchen", fr: "coiffeur-granges", en: "barber-grenchen" },
    km: 16,
    title: {
      de: "Coiffeur für Grenchen – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Granges – barbier à Bienne | GYAN",
      en: "Barber near Grenchen – fades & beards in Biel | GYAN",
    },
    description: {
      de: "Barbier für Grenchen: GYAN in Biel, ab Grenchen Nord oder Süd direkt per Zug. Nassrasur mit heissem Tuch, Bart Trim und Signature Cut. Online buchen.",
      fr: "Barbier pour Granges : GYAN à Bienne, en train direct depuis Granges-Nord ou Sud. Rasage à la serviette chaude, barbe et Signature Cut. Réserve en ligne.",
      en: "Barber for Grenchen: GYAN in Biel, a direct train from Grenchen Nord or Süd. Hot towel shaves, beard trims and the Signature Cut. Book your visit online.",
    },
    h1: {
      de: "Herrencoiffeur für Grenchen",
      fr: "Coiffeur homme près de Granges",
      en: "Barber near Grenchen",
    },
    intro: {
      de: "Grenchen im Kanton Solothurn liegt rund 16 Kilometer von Biel, und gleich zwei Bahnhöfe verbinden die Stadt direkt mit dem Bahnhof Biel. Von dort sind es nur ein paar Gehminuten zu GYAN an der Zentralstrasse 22.",
      fr: "Granges, dans le canton de Soleure, se trouve à environ 16 kilomètres de Bienne, et deux gares relient la ville directement à la gare de Bienne. De là, GYAN à la Zentralstrasse 22 n'est qu'à quelques minutes à pied.",
      en: "Grenchen in the canton of Solothurn is about 16 kilometres from Biel, and two stations link the town directly to Biel station. From there, GYAN on Zentralstrasse 22 is just a few minutes' walk.",
    },
    body: {
      de: `## Von der Uhrenstadt in die Uhrenstadt

Grenchen, auf Französisch Granges, liegt im Kanton Solothurn am Jurasüdfuss, mit dem Grenchenberg im Rücken und dem Regionalflugplatz in der Ebene Richtung Aare. Wie Biel ist Grenchen seit langem eng mit der Uhrenindustrie verbunden, und zwischen den beiden Städten wird viel gependelt. Mit rund 16 Kilometern ist Grenchen einer der weiter entfernten Orte, für die wir eine eigene Seite haben. Umso mehr soll sich die Fahrt nach Biel lohnen. Arbeitest du ohnehin in Biel, verbindest du den Termin einfach mit deinem Arbeitsweg.

## Grenchen Nord oder Grenchen Süd?

Grenchen hat zwei Bahnhöfe, und von beiden kommst du direkt nach Biel. Grenchen Nord liegt an der Linie, die durch den Grenchenbergtunnel aus dem Jura kommt, Grenchen Süd an der Jurasüdfusslinie zwischen Solothurn und Biel. Welchen du nimmst, hängt davon ab, in welchem Teil der Stadt du wohnst. Am Bahnhof Biel steigst du aus und gehst ein paar Minuten zu Fuss bis zur Zentralstrasse 22.

Mit dem Auto führt die A5 von Grenchen nach Biel, alternativ die Hauptstrasse über Lengnau und Pieterlen. Rechne grosszügig mit etwa 25 Minuten und parkiere in einem öffentlichen Parkhaus im Bieler Zentrum.

## Bart und Rasur, wenn du schon da bist

Wer eine längere Anfahrt hat, will mehr als nur kurz nachschneiden. Bei GYAN liegt ein Schwerpunkt auf dem Bart. Beim Bart Trim bringen wir Länge und Form in Ordnung und ziehen die Konturen mit der Klinge nach. Die [Bart Rasur](service:nassrasur-biel) ist die klassische Nassrasur mit heissem Tuch, Schaum und Pflege, rund 20 Minuten für 28 Franken.

Für die Haare empfehlen wir den [GYAN Signature Cut](service:gyan-signature): Haarschnitt plus Styling und konkrete Tipps, wie du die Frisur zu Hause selbst hinbekommst. Das spart dir zwischen zwei Besuchen in Biel manchen Ärger vor dem Spiegel. Alles zusammen gibt es im GYAN Premium Paket mit Haarschnitt, Bart, Wäsche und Styling.

## So planst du den Besuch aus Grenchen

Damit du nach der Anfahrt nicht warten musst, [buchst du am besten online](page:booking), die Bestätigung kommt sofort. Ohne Termin bist du während der Öffnungszeiten trotzdem willkommen: Montag bis Mittwoch 9 bis 19 Uhr, Donnerstag und Freitag 9 bis 20 Uhr, Samstag 8.30 bis 18 Uhr, Sonntag geschlossen.

Im Salon erwarten dich braune Ledersessel und ein roter Perserteppich an der Wand. Bezahlt wird bar, mit Karte oder mit TWINT. Auf dem Weg nach Biel liegt [Lengnau](seo:lengnau), auch dafür gibt es eine eigene Seite.`,
      fr: `## D'une ville horlogère à l'autre

Granges, Grenchen en allemand, se trouve dans le canton de Soleure au pied du Jura, avec le Grenchenberg derrière elle et l'aérodrome régional dans la plaine en direction de l'Aar. Comme Bienne, Granges est liée depuis longtemps à l'horlogerie, et beaucoup de gens font la navette entre les deux villes. Avec environ 16 kilomètres, Granges fait partie des localités les plus éloignées pour lesquelles nous avons une page. Raison de plus pour que le trajet jusqu'à Bienne en vaille la peine.

## Granges-Nord ou Granges-Sud ?

Granges a deux gares, et des deux tu arrives directement à Bienne. Granges-Nord se trouve sur la ligne qui sort du Jura par le tunnel du Grenchenberg, Granges-Sud sur la ligne du pied du Jura entre Soleure et Bienne. Le choix dépend simplement du quartier où tu habites. À la gare de Bienne, tu descends et tu marches quelques minutes jusqu'à la Zentralstrasse 22.

En voiture, l'A5 relie Granges à Bienne, sinon la route principale passe par Longeau et Perles. Compte large environ 25 minutes et gare-toi dans un parking public au centre de Bienne.

## Barbe et rasage, tant que tu es là

Quand le trajet est plus long, on veut plus qu'une petite retouche. Chez GYAN, la barbe est un point fort. La taille de barbe remet longueur et forme en ordre, avec les contours repris au rasoir. Le [rasage à la serviette chaude](service:nassrasur-biel) est le rasage traditionnel avec serviette chaude, mousse et soin, environ 20 minutes pour 28 francs.

Pour les cheveux, on te conseille le [GYAN Signature Cut](service:gyan-signature) : coupe, coiffage et conseils concrets pour refaire la coiffure toi-même. De quoi t'éviter quelques soucis devant le miroir entre deux visites à Bienne. Pour tout réunir, il y a la formule GYAN Premium avec coupe, barbe, shampooing et coiffage.

## Organiser ta visite depuis Granges

Pour ne pas attendre après le trajet, le mieux est de [réserver en ligne](page:booking), la confirmation est immédiate. Sans rendez-vous, tu es quand même le bienvenu pendant les heures d'ouverture : du lundi au mercredi de 9 h à 19 h, jeudi et vendredi de 9 h à 20 h, samedi de 8 h 30 à 18 h, fermé le dimanche.

Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT. Sur la route de Bienne, [Longeau](seo:lengnau) a aussi sa propre page.`,
      en: `## From one watch town to another

Grenchen, Granges in French, lies in the canton of Solothurn at the foot of the Jura, with the Grenchenberg behind it and the regional airfield out on the plain towards the Aare. Like Biel, Grenchen has long been tied to the watch industry, and plenty of people commute between the two towns. At around 16 kilometres, Grenchen is one of the furthest places we have a page for, so the trip to Biel should be worth your while.

## Grenchen Nord or Grenchen Süd?

Grenchen has two stations, and both get you straight to Biel. Grenchen Nord is on the line that comes out of the Jura through the Grenchenberg tunnel, and Grenchen Süd is on the Jura foot line between Solothurn and Biel. Which one you use just depends on which part of town you live in. Get off at Biel station and it's a few minutes' walk to Zentralstrasse 22.

By car, the A5 links Grenchen and Biel, or you can take the main road through Lengnau and Pieterlen. Allow a generous 25 minutes and park in one of the public car parks in central Biel.

## Beard and shave while you're here

When the journey is a bit longer, a quick tidy-up isn't really enough. Beards are a big part of what we do at GYAN. The beard trim gets length and shape back in order, with the lines finished using the razor. The [hot towel shave](service:nassrasur-biel) is a traditional wet shave with hot towel, lather and aftercare, about 20 minutes for CHF 28.

For your hair, go for the [GYAN Signature Cut](service:gyan-signature): a haircut plus styling and practical tips so you can recreate the look yourself. That saves you some frustration in front of the mirror between visits to Biel. If you want the lot, the GYAN Premium package bundles haircut, beard, wash and styling.

## Planning your visit from Grenchen

So you don't have to wait after the journey, it's best to [book online](page:booking), with instant confirmation. Walk-ins are still welcome during opening hours: Monday to Wednesday 9am to 7pm, Thursday and Friday 9am to 8pm, Saturday 8:30am to 6pm, closed on Sundays.

Inside you'll find brown leather chairs and a red Persian carpet on the wall. Pay in cash, by card or with TWINT. On the way to Biel you'll pass [Lengnau](seo:lengnau), which has its own page too.`,
    },
    neighbors: ["lengnau", "pieterlen"],
    carMin: 25,
    transit: {
      de: "Ab Grenchen Nord oder Grenchen Süd fährst du mit dem Zug direkt zum Bahnhof Biel und gehst von dort ein paar Minuten zu Fuss zum Salon.",
      fr: "Depuis Granges-Nord ou Granges-Sud, le train t'amène directement à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "From Grenchen Nord or Grenchen Süd the train takes you straight to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["nassrasur-biel", "bart-trimmen-biel", "gyan-signature", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Welcher Bahnhof in Grenchen ist für die Fahrt zu GYAN besser?", a: "Beide funktionieren: Ab Grenchen Nord und ab Grenchen Süd fahren Züge direkt zum Bahnhof Biel. Nimm einfach den, der näher bei dir liegt, vom Bahnhof Biel sind es ein paar Minuten zu Fuss zum Salon." },
        { q: "Wie lange fahre ich von Grenchen mit dem Auto nach Biel?", a: "Für die rund 16 Kilometer über die A5 oder die Hauptstrasse rechnest du grosszügig mit etwa 25 Minuten. Im Bieler Zentrum parkierst du in einem öffentlichen Parkhaus." },
        { q: "Gibt es bei GYAN eine Nassrasur für Kunden aus Grenchen?", a: "Ja, die Bart Rasur mit heissem Tuch, Schaum und Pflege dauert rund 20 Minuten und kostet 28 Franken. Am besten buchst du sie online, damit nach der Anfahrt aus Grenchen deine Zeit reserviert ist." },
      ],
      fr: [
        { q: "Quelle gare de Granges choisir pour venir chez GYAN ?", a: "Les deux conviennent : depuis Granges-Nord comme depuis Granges-Sud, des trains vont directement à la gare de Bienne. Prends celle qui est la plus proche de chez toi, puis quelques minutes à pied jusqu'au salon." },
        { q: "Combien de temps en voiture de Granges à Bienne ?", a: "Pour les quelque 16 kilomètres par l'A5 ou la route principale, compte large environ 25 minutes. Au centre de Bienne, gare-toi dans un parking public." },
        { q: "GYAN propose-t-il un rasage traditionnel aux clients de Granges ?", a: "Oui, le rasage à la serviette chaude avec mousse et soin dure environ 20 minutes et coûte 28 francs. Le mieux est de réserver en ligne pour que ton créneau t'attende à ton arrivée de Granges." },
      ],
      en: [
        { q: "Which Grenchen station is better for getting to GYAN?", a: "Either works: trains run straight to Biel station from both Grenchen Nord and Grenchen Süd. Take whichever is closer to you, then it's a few minutes' walk from Biel station to the salon." },
        { q: "How long does the drive from Grenchen to Biel take?", a: "For the roughly 16 kilometres via the A5 or the main road, allow a generous 25 minutes. In central Biel, park in one of the public car parks." },
        { q: "Can I get a wet shave at GYAN if I come from Grenchen?", a: "Yes, the hot towel shave with lather and aftercare takes about 20 minutes and costs CHF 28. It's best to book online so your slot is waiting when you arrive from Grenchen." },
      ],
    },
  },

  // ───────────────────────────── MAGGLINGEN ─────────────────────────────
  {
    key: "magglingen",
    name: { de: "Magglingen", fr: "Macolin", en: "Magglingen" },
    slug: { de: "coiffeur-magglingen", fr: "coiffeur-macolin", en: "barber-magglingen" },
    km: 8,
    title: {
      de: "Coiffeur für Magglingen – Herrenschnitt in Biel | GYAN",
      fr: "Coiffeur près de Macolin – barbier à Bienne | GYAN",
      en: "Barber near Magglingen – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Magglingen: mit der Standseilbahn nach Biel zu GYAN. Haarschnitt, Face Treatment oder Premium Paket nach dem Training. Jetzt online buchen.",
      fr: "Coiffeur pour Macolin : en funiculaire jusqu'à Bienne chez GYAN. Coupe, Face Treatment ou formule Premium après l'entraînement. Réserve en ligne.",
      en: "Barber for Magglingen: take the funicular down to GYAN in Biel. Haircut, Face Treatment or Premium package after training. Book your slot online now.",
    },
    h1: {
      de: "Herrencoiffeur für Magglingen",
      fr: "Coiffeur homme près de Macolin",
      en: "Barber near Magglingen",
    },
    intro: {
      de: "Magglingen liegt auf einer Sonnenterrasse hoch über Biel, rund acht Kilometer vom Zentrum. Die Standseilbahn bringt dich in wenigen Minuten hinunter, von dort ist GYAN an der Zentralstrasse 22 nicht weit.",
      fr: "Macolin domine Bienne depuis sa terrasse ensoleillée, à environ huit kilomètres du centre. Le funiculaire te descend en quelques minutes, et GYAN à la Zentralstrasse 22 n'est alors plus très loin.",
      en: "Magglingen sits on a sunny terrace high above Biel, about eight kilometres from the centre. The funicular brings you down in a few minutes, and from there GYAN on Zentralstrasse 22 isn't far.",
    },
    body: {
      de: `## Magglingen: Sportplateau hoch über dem See

Magglingen, auf Französisch Macolin, liegt auf einer Terrasse am Jurahang deutlich oberhalb von Leubringen und gehört zur Gemeinde Leubringen. Schweizweit bekannt ist der Ort als Zentrum des Sports: Hier befindet sich die Eidgenössische Hochschule für Sport. Rundherum gibt es Wald, Wiesen und Wanderwege, und von der Terrasse geht der Blick über Biel und den Bielersee bis zu den Alpen. Wer hier wohnt, studiert oder trainiert, lebt ruhig und doch nur eine kurze Fahrt von der Stadt entfernt.

## Hinunter mit der Magglingenbahn

Die Standseilbahn zwischen Biel und Magglingen gehört zu den ältesten der Region und überwindet den steilen Hang in wenigen Minuten. Unten in Biel gehst du zu Fuss oder fährst mit dem Bus bis zum Bahnhof. Von dort erreichst du die Zentralstrasse 22 in wenigen Gehminuten. So brauchst du in der Stadt weder Auto noch Parkplatz. Wer gerne zu Fuss unterwegs ist, kann an einem schönen Tag auch auf einem der Waldwege hinunter nach Biel wandern und nach dem Termin bequem mit der Bahn wieder hinauffahren.

Mit dem Auto fährst du über Leubringen den Hang hinunter ins Bieler Zentrum. Für die rund acht Kilometer solltest du etwa eine Viertelstunde einplanen. Parkieren kannst du in einem öffentlichen Parkhaus oder auf einem öffentlichen Parkplatz in der Innenstadt.

## Nach dem Training in den Stuhl

Wer viel Sport treibt, will einen Schnitt, der unter der Mütze, nach dem Duschen und nach dem Lauf im Wald gut aussieht. Ein kurzer, sauber konturierter [Herren Haarschnitt](service:haarschnitt-biel) dauert bei uns rund 20 Minuten. Nach einem langen Tag an der frischen Luft tut das [GYAN Face Treatment](service:gesichtspflege-biel) gut: heisses Tuch, Reinigung und Pflege in etwa 20 Minuten.

Wenn du dir mehr Zeit nehmen willst, kombiniert das [GYAN Premium Paket](service:gyan-premium-paket) Haarschnitt, Bart, Wäsche und Styling in rund 40 Minuten. Das passt gut an einem trainingsfreien Tag oder am Samstag, wenn wir schon um 8.30 Uhr öffnen.

## Zeiten, die zu Training und Studium passen

Von Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, am Donnerstag und Freitag bis 20 Uhr, am Samstag von 8.30 bis 18 Uhr. Am Sonntag ist geschlossen. Mit der [Online-Buchung](page:booking) siehst du freie Zeiten auf einen Blick und bekommst sofort eine Bestätigung, auf Deutsch, Französisch oder Englisch. Walk-ins sind während der Öffnungszeiten ebenfalls willkommen.

Im Salon sitzt du auf braunen Lederstühlen, an der Wand hängt ein roter Perserteppich. Bezahlt wird bar, mit Karte oder mit TWINT.`,
      fr: `## Macolin : le plateau du sport au-dessus du lac

Macolin, Magglingen en allemand, s'étend sur une terrasse du versant jurassien, nettement au-dessus d'Evilard, et fait partie de la commune d'Evilard. Le lieu est connu dans toute la Suisse comme centre du sport : c'est ici que se trouve la Haute école fédérale de sport. Tout autour, forêts, prés et sentiers de randonnée, et depuis la terrasse la vue file au-dessus de Bienne et du lac jusqu'aux Alpes. Qui y habite, y étudie ou s'y entraîne vit au calme, tout en étant à un court trajet de la ville.

## Descendre avec le funiculaire de Macolin

Le funiculaire entre Bienne et Macolin compte parmi les plus anciens de la région et avale la pente raide en quelques minutes. En bas, à Bienne, tu continues à pied ou en bus jusqu'à la gare. De là, la Zentralstrasse 22 est à quelques minutes à pied. Pas besoin de voiture ni de place de parc en ville. Si tu aimes marcher, tu peux aussi, par beau temps, descendre à Bienne par un des chemins forestiers et remonter tranquillement en funiculaire après ton rendez-vous.

En voiture, tu descends le coteau par Evilard jusqu'au centre de Bienne. Pour les quelque huit kilomètres, prévois environ un quart d'heure. Pour te garer, il y a des parkings publics et des places de parc publiques au centre-ville.

## De l'entraînement au fauteuil

Quand on fait beaucoup de sport, on veut une coupe qui tient sous le bonnet, après la douche et après une course en forêt. Une [coupe homme](service:haarschnitt-biel) courte aux contours nets dure chez nous une vingtaine de minutes. Après une longue journée au grand air, le [GYAN Face Treatment](service:gesichtspflege-biel) fait du bien : serviette chaude, nettoyage et soin en environ 20 minutes.

Si tu as plus de temps, la [formule GYAN Premium](service:gyan-premium-paket) réunit coupe, barbe, shampoing et coiffage en une quarantaine de minutes. Idéal un jour sans entraînement ou le samedi, quand on ouvre dès 8 h 30.

## Des horaires compatibles avec l'entraînement et les études

Du lundi au mercredi, on est là de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, le samedi de 8 h 30 à 18 h. Le dimanche, c'est fermé. Avec la [réservation en ligne](page:booking), tu vois les créneaux libres d'un coup d'œil et tu reçois une confirmation immédiate, en français, en allemand ou en anglais. Les clients sans rendez-vous sont aussi les bienvenus pendant les heures d'ouverture.

Au salon, tu t'installes dans un fauteuil en cuir brun, avec un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT.`,
      en: `## Magglingen: the sports plateau high above the lake

Magglingen, Macolin in French, sits on a terrace on the Jura slope well above Evilard and is part of the municipality of Evilard. It's known across Switzerland as a hub of sport, being home to the Swiss Federal Institute of Sport. Around it you'll find forest, meadows and hiking trails, and from the terrace the view stretches over Biel and the lake to the Alps. If you live, study or train up here, life is quiet, yet the city is only a short trip away.

## Down the hill on the Magglingen funicular

The funicular between Biel and Magglingen is one of the oldest in the region and climbs the steep slope in a few minutes. Down in Biel, carry on on foot or by bus to the station. From there Zentralstrasse 22 is a few minutes' walk. No car and no parking space needed in town. If you like being on foot, on a nice day you can also hike down to Biel on one of the forest paths and ride the funicular back up after your appointment.

By car, drive down the slope via Evilard into central Biel. Plan around a quarter of an hour for the roughly eight kilometres. For parking, there are public car parks and public spaces in the city centre.

## From training session to barber chair

When you do a lot of sport, you want a cut that looks right under a beanie, after a shower and after a run in the woods. A short, cleanly outlined [men's haircut](service:haarschnitt-biel) takes about 20 minutes here. After a long day outdoors, the [GYAN Face Treatment](service:gesichtspflege-biel) does your skin good: hot towel, cleansing and care in about 20 minutes.

If you've got more time, the [GYAN Premium package](service:gyan-premium-paket) combines haircut, beard, wash and styling in around 40 minutes. A good fit for a rest day, or for Saturday, when we open at 8:30.

## Hours that work around training and lectures

Monday to Wednesday we're here from 9:00 to 19:00, Thursday and Friday until 20:00, Saturday from 8:30 to 18:00. Sunday we're closed. With [online booking](page:booking) you see free slots at a glance and get instant confirmation, in English, German or French. Walk-ins are welcome during opening hours too.

In the salon you sit in a brown leather chair, with a red Persian carpet hanging on the wall. Pay in cash, by card or with TWINT.`,
    },
    neighbors: ["evilard", "orvin", "twann"],
    carMin: 15,
    transit: {
      de: "Mit der Standseilbahn von Magglingen hinunter nach Biel, dann zu Fuss oder mit dem Bus zum Bahnhof und von dort wenige Minuten zu Fuss zum Salon.",
      fr: "Descends en funiculaire de Macolin à Bienne, puis rejoins la gare à pied ou en bus, et de là le salon en quelques minutes à pied.",
      en: "Take the funicular from Magglingen down to Biel, then walk or catch a bus to the station, and from there it is a few minutes on foot to the salon.",
    },
    services: ["haarschnitt-biel", "gesichtspflege-biel", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Wie lange brauche ich von Magglingen bis zu GYAN?", a: "Mit dem Auto rechnest du für die rund acht Kilometer über Leubringen mit etwa einer Viertelstunde. Mit der Standseilbahn fährst du hinunter nach Biel und gehst dann zu Fuss oder nimmst den Bus zum Bahnhof, von dort sind es wenige Gehminuten." },
        { q: "Kann ich in Magglingen trainieren und danach direkt zum Haarschnitt?", a: "Ja, am Donnerstag und Freitag sind wir bis 20 Uhr offen, von Montag bis Mittwoch bis 19 Uhr. Ein Herren Haarschnitt dauert rund 20 Minuten, das Premium Paket mit Wäsche und Styling rund 40 Minuten." },
        { q: "Muss ich aus Magglingen einen Termin buchen?", a: "Nein, während der Öffnungszeiten sind Walk-ins willkommen. Mit der Online-Buchung bekommst du aber sofort eine Bestätigung und kannst die Fahrt hinunter genau planen." },
      ],
      fr: [
        { q: "Combien de temps faut-il de Macolin jusqu'à GYAN ?", a: "En voiture, compte environ un quart d'heure pour les quelque huit kilomètres via Evilard. En funiculaire, tu descends à Bienne puis tu rejoins la gare à pied ou en bus, d'où le salon est à quelques minutes à pied." },
        { q: "Puis-je m'entraîner à Macolin et aller me faire couper les cheveux juste après ?", a: "Oui, le jeudi et le vendredi on est ouverts jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h. Une coupe homme dure une vingtaine de minutes, la formule Premium avec shampoing et coiffage environ 40 minutes." },
        { q: "Faut-il réserver quand on vient de Macolin ?", a: "Non, les clients sans rendez-vous sont les bienvenus pendant les heures d'ouverture. Avec la réservation en ligne, tu as toutefois une confirmation immédiate et tu peux planifier ta descente." },
      ],
      en: [
        { q: "How long does it take from Magglingen to GYAN?", a: "By car, allow about a quarter of an hour for the roughly eight kilometres via Evilard. By funicular, ride down to Biel, then walk or take a bus to the station, which is a few minutes on foot from the salon." },
        { q: "Can I train in Magglingen and get a haircut straight after?", a: "Yes, we're open until 20:00 on Thursday and Friday and until 19:00 Monday to Wednesday. A men's haircut takes about 20 minutes, the Premium package with wash and styling about 40 minutes." },
        { q: "Do I need to book if I'm coming from Magglingen?", a: "No, walk-ins are welcome during opening hours. Booking online does give you instant confirmation, though, so you can plan your trip down the hill." },
      ],
    },
  },

  // ───────────────────────────── TWANN ─────────────────────────────
  {
    key: "twann",
    name: { de: "Twann", fr: "Douanne", en: "Twann" },
    slug: { de: "coiffeur-twann", fr: "coiffeur-douanne", en: "barber-twann" },
    km: 9,
    title: {
      de: "Coiffeur für Twann/Tüscherz – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Douanne – barbier à Bienne | GYAN",
      en: "Barber near Twann – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Twann: mit Regionalzug oder Schiff dem Bielersee entlang zu GYAN in Biel. Classic Paket oder Full Service mit Rasur. Jetzt online buchen.",
      fr: "Coiffeur pour Douanne : en train ou en bateau le long du lac jusqu'à GYAN à Bienne. Formule Classic ou Full Service avec rasage. Réserve en ligne.",
      en: "Barber for Twann: ride the train or boat along Lake Biel to GYAN in Biel. Classic package, Full Service or hot towel shave. Book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Twann und Tüscherz",
      fr: "Coiffeur homme près de Douanne et Daucher",
      en: "Barber near Twann and Tüscherz",
    },
    intro: {
      de: "Twann liegt zwischen Rebbergen und See am Nordufer des Bielersees, rund neun Kilometer von Biel. Mit dem Regionalzug oder im Sommer mit dem Schiff erreichst du GYAN an der Zentralstrasse 22 bequem.",
      fr: "Douanne s'étire entre vignes et lac sur la rive nord du lac de Bienne, à environ neuf kilomètres de la ville. En train régional ou, l'été, en bateau, tu rejoins facilement GYAN à la Zentralstrasse 22.",
      en: "Twann sits between vineyards and water on the north shore of Lake Biel, about nine kilometres from town. By regional train, or by boat in summer, GYAN on Zentralstrasse 22 is an easy trip.",
    },
    body: {
      de: `## Twann: Rebdorf am Nordufer des Bielersees

Twann, auf Französisch Douanne, bildet zusammen mit Tüscherz-Alfermée die Gemeinde Twann-Tüscherz. Das Dorf liegt eingeklemmt zwischen dem Bielersee und den steilen Rebbergen am Jurafuss, mit einem alten Dorfkern und schmalen Gassen. Bekannt ist die Twannbachschlucht, durch die ein Wanderweg hinauf zum Tessenberg führt. Gegenüber im See liegt die St. Petersinsel. Für Arbeit, Schule und Einkauf ist Biel das nächste Zentrum, nur rund neun Kilometer seeaufwärts.

## Zug, Schiff oder Seestrasse

Die Bahnlinie zwischen Neuenburg und Biel führt direkt dem Nordufer entlang. Die Regionalzüge halten in Twann und bringen dich in kurzer Zeit zum Bahnhof Biel. Von dort gehst du wenige Minuten bis zur Zentralstrasse 22. Das ist der schnellste Weg ohne Auto, und unterwegs hast du auf der einen Seite die Rebberge und auf der anderen den See.

Im Sommer gibt es eine schönere Variante: Das Kursschiff fährt von Twann über den See nach Biel. Vom Hafen aus gehst du zu Fuss oder nimmst den Bus zum Bahnhof. Mit dem Auto folgst du der Strasse dem Seeufer entlang über Tüscherz direkt in die Stadt, rechne mit etwa einer Viertelstunde. Wer gerne wandert, kann auch auf dem Rebenweg durch die Weinberge nach Biel gehen.

## Haar und Bart ohne Eile

Wenn du schon den Weg dem See entlang machst, lohnt sich ein Termin, bei dem nichts gehetzt wird. Im [GYAN Classic Paket](service:haarschnitt-und-bart) bekommst du Haarschnitt und Bart in rund 30 Minuten. Für die volle Pflege gibt es den [GYAN Full Service](service:gyan-full-service): Haarschnitt, Bart, Face Treatment, Wäsche und Styling in etwa 50 Minuten.

Trägst du deinen Bart lang und willst nur die Form auffrischen, reicht ein Bart Trim mit Konturen an der Klinge, das dauert rund 15 Minuten. Lieber ganz glatt? Dann ist die Rasur mit heissem Tuch, Schaum und Pflege die richtige Wahl, in etwa 20 Minuten.

## Vom Rebberg in den Lederstuhl

Im Salon erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand. Geöffnet ist von Montag bis Mittwoch von 9 bis 19 Uhr, am Donnerstag und Freitag bis 20 Uhr und am Samstag von 8.30 bis 18 Uhr. Deinen Termin [buchst du online](page:booking) mit sofortiger Bestätigung, so kannst du Zug oder Schiff passend wählen. Walk-ins sind während der Öffnungszeiten ebenfalls willkommen. Bezahlt wird bar, mit Karte oder mit TWINT.

Wohnst du weiter oben am Jurahang über Biel? Dann schau auf unsere Seite für [Magglingen](seo:magglingen).`,
      fr: `## Douanne : village vigneron sur la rive nord

Douanne, Twann en allemand, forme avec Daucher-Alfermée la commune de Douanne-Daucher. Le village est serré entre le lac de Bienne et les vignes en pente du pied du Jura, avec un vieux noyau et des ruelles étroites. Les gorges de Douanne sont réputées : un sentier y monte jusqu'au Plateau de Diesse. En face, sur le lac, se trouve l'île Saint-Pierre. Pour le travail, l'école et les courses, Bienne est le centre le plus proche, à environ neuf kilomètres en remontant le lac.

## Train, bateau ou route du lac

La ligne de chemin de fer entre Neuchâtel et Bienne longe directement la rive nord. Les trains régionaux s'arrêtent à Douanne et t'amènent rapidement à la gare de Bienne. De là, quelques minutes à pied jusqu'à la Zentralstrasse 22. C'est le moyen le plus rapide sans voiture, avec les vignes d'un côté et le lac de l'autre pendant tout le trajet.

En été, il y a plus joli : le bateau de ligne traverse le lac de Douanne à Bienne. Depuis le port, tu continues à pied ou en bus jusqu'à la gare. En voiture, tu suis la route au bord du lac par Daucher jusqu'en ville, compte environ un quart d'heure. Si tu aimes marcher, le chemin des vignes à travers le vignoble mène aussi jusqu'à Bienne.

## Cheveux et barbe sans se presser

Quand on fait le trajet le long du lac, autant s'offrir un rendez-vous où rien n'est bâclé. Avec la [formule GYAN Classic](service:haarschnitt-und-bart), tu as coupe et barbe en une trentaine de minutes. Pour le soin complet, il y a le [GYAN Full Service](service:gyan-full-service) : coupe, barbe, Face Treatment, shampoing et coiffage en une cinquantaine de minutes.

Tu portes la barbe longue et veux juste rafraîchir la forme ? Une taille de barbe avec contours à la lame suffit. Tu préfères un visage parfaitement lisse ? Alors le rasage à la serviette chaude, avec mousse et soin, est le bon choix.

## Des vignes au fauteuil en cuir

Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. On est ouverts du lundi au mercredi de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, et le samedi de 8 h 30 à 18 h. [Réserve en ligne](page:booking) avec confirmation immédiate, pour choisir ensuite le bon train ou le bon bateau. Les clients sans rendez-vous sont aussi les bienvenus pendant les heures d'ouverture. Paiement en espèces, par carte ou avec TWINT.

Tu habites plus haut, sur les hauteurs du Jura au-dessus de Bienne ? Jette un œil à notre page pour [Macolin](seo:magglingen).`,
      en: `## Twann: a wine village on Lake Biel's north shore

Twann, Douanne in French, forms the municipality of Twann-Tüscherz together with Tüscherz-Alfermée. The village is squeezed between Lake Biel and the steep vineyards at the foot of the Jura, with an old core and narrow lanes. It's known for the Twannbach gorge, where a trail climbs up to the Plateau de Diesse. Out in the lake opposite lies St. Peter's Island. For work, school and shopping, Biel is the nearest centre, only about nine kilometres up the lake.

## Train, boat or lakeside road

The railway between Neuchâtel and Biel runs right along the north shore. Regional trains stop in Twann and get you to Biel station quickly. From there it's a few minutes on foot to Zentralstrasse 22. That's the fastest option without a car, with the vineyards on one side and the lake on the other the whole way.

In summer there's a more scenic alternative: the scheduled boat crosses the lake from Twann to Biel. From the harbour, walk or take a bus to the station. By car, follow the road along the shore via Tüscherz straight into town, allowing about a quarter of an hour. If you enjoy hiking, the vineyard trail through the vines also leads to Biel.

## Hair and beard, no rush

If you're making the trip along the lake, it's worth booking an appointment where nothing gets rushed. The [GYAN Classic package](service:haarschnitt-und-bart) covers haircut and beard in about 30 minutes. For the full treatment there's the [GYAN Full Service](service:gyan-full-service): haircut, beard, Face Treatment, wash and styling in around 50 minutes.

Wearing your beard long and just want to refresh the shape? A beard trim with razor-sharp outlines does the job in about 15 minutes. Prefer completely smooth? Then the hot towel shave with lather and aftercare is the one, taking around 20 minutes.

## From the vineyards to the leather chair

In the salon you'll find brown leather chairs and a red Persian carpet on the wall. We're open Monday to Wednesday from 9:00 to 19:00, Thursday and Friday until 20:00, and Saturday from 8:30 to 18:00. [Book online](page:booking) with instant confirmation, then pick the train or boat that fits. Walk-ins are welcome during opening hours too. Pay in cash, by card or with TWINT.

Live higher up on the Jura slope above Biel? Take a look at our page for [Magglingen](seo:magglingen).`,
    },
    neighbors: ["magglingen", "evilard"],
    carMin: 15,
    transit: {
      de: "Mit dem Regionalzug auf der Linie zwischen Neuenburg und Biel bis zum Bahnhof Biel oder im Sommer mit dem Kursschiff über den Bielersee, dann wenige Minuten zu Fuss zum Salon.",
      fr: "En train régional sur la ligne entre Neuchâtel et Bienne jusqu'à la gare de Bienne, ou en été en bateau sur le lac de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the regional train on the line between Neuchâtel and Biel to Biel station, or in summer the boat across Lake Biel, then it is a few minutes on foot to the salon.",
    },
    services: ["haarschnitt-und-bart", "gyan-full-service", "nassrasur-biel", "bart-trimmen-biel"],
    faq: {
      de: [
        { q: "Wie komme ich von Twann mit dem Zug zu GYAN?", a: "Die Regionalzüge Richtung Biel halten in Twann und fahren dem Nordufer entlang bis zum Bahnhof Biel. Von dort sind es nur wenige Gehminuten bis zur Zentralstrasse 22." },
        { q: "Kann ich von Twann aus mit dem Schiff zum Coiffeur fahren?", a: "Im Sommer verkehrt das Kursschiff zwischen Twann und Biel. Vom Bieler Hafen gehst du dann durch die Stadt oder nimmst den Bus bis zum Bahnhof, von wo der Salon wenige Minuten entfernt ist." },
        { q: "Lohnt sich von Twann aus ein längerer Termin?", a: "Wenn du dir Zeit nehmen willst, ja: Der GYAN Full Service mit Haarschnitt, Bart, Face Treatment, Wäsche und Styling dauert rund 50 Minuten. Buche ihn online, damit dein Platz nach der Anreise sicher ist." },
      ],
      fr: [
        { q: "Comment venir de Douanne chez GYAN en train ?", a: "Les trains régionaux en direction de Bienne s'arrêtent à Douanne et longent la rive nord jusqu'à la gare de Bienne. De là, la Zentralstrasse 22 est à quelques minutes à pied." },
        { q: "Peut-on venir de Douanne chez le coiffeur en bateau ?", a: "En été, le bateau de ligne relie Douanne à Bienne. Depuis le port de Bienne, traverse la ville à pied ou prends le bus jusqu'à la gare, à quelques minutes du salon." },
        { q: "Un rendez-vous plus long vaut-il la peine depuis Douanne ?", a: "Si tu veux prendre ton temps, oui : le GYAN Full Service avec coupe, barbe, Face Treatment, shampoing et coiffage dure environ 50 minutes. Réserve-le en ligne pour être sûr de ta place à l'arrivée." },
      ],
      en: [
        { q: "How do I get from Twann to GYAN by train?", a: "Regional trains towards Biel stop in Twann and run along the north shore to Biel station. From there it's only a few minutes' walk to Zentralstrasse 22." },
        { q: "Can I take the boat from Twann to the barber?", a: "In summer, the scheduled boat runs between Twann and Biel. From Biel's harbour, walk through town or take a bus to the station, a few minutes from the salon." },
        { q: "Is a longer appointment worth it if I come from Twann?", a: "If you want to take your time, yes: the GYAN Full Service with haircut, beard, Face Treatment, wash and styling takes about 50 minutes. Book it online so your slot is secured when you arrive." },
      ],
    },
  },

  // ───────────────────────────── SUTZ-LATTRIGEN ─────────────────────────────
  {
    key: "sutz-lattrigen",
    name: { de: "Sutz-Lattrigen", fr: "Sutz-Lattrigen", en: "Sutz-Lattrigen" },
    slug: { de: "coiffeur-sutz-lattrigen", fr: "coiffeur-sutz-lattrigen", en: "barber-sutz-lattrigen" },
    km: 7,
    title: {
      de: "Coiffeur für Sutz-Lattrigen – Fade in Biel | GYAN",
      fr: "Coiffeur près de Sutz-Lattrigen – Bienne | GYAN",
      en: "Barber near Sutz-Lattrigen – cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Sutz-Lattrigen: mit der BTI-Bahn am Südufer entlang zu GYAN in Biel. Haarschnitt, Bart Trim oder Premium Paket. Jetzt online Termin buchen.",
      fr: "Coiffeur pour Sutz-Lattrigen : en train BTI le long de la rive sud jusqu'à GYAN à Bienne. Coupe, barbe ou formule Premium. Réserve en ligne.",
      en: "Barber for Sutz-Lattrigen: ride the BTI train along the south shore to GYAN in Biel. Haircut, beard trim or Premium package. Book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Sutz-Lattrigen",
      fr: "Coiffeur homme près de Sutz-Lattrigen",
      en: "Barber near Sutz-Lattrigen",
    },
    intro: {
      de: "Sutz-Lattrigen liegt am Südufer des Bielersees, rund sieben Kilometer von Biel. Die BTI-Bahn bringt dich über Ipsach und Nidau zum Bahnhof Biel, von dort sind es wenige Minuten zu GYAN.",
      fr: "Sutz-Lattrigen borde la rive sud du lac de Bienne, à environ sept kilomètres de la ville. Le train BTI t'amène par Ipsach et Nidau à la gare de Bienne, à quelques minutes de GYAN.",
      en: "Sutz-Lattrigen sits on the south shore of Lake Biel, about seven kilometres from town. The BTI train takes you via Ipsach and Nidau to Biel station, a few minutes from GYAN.",
    },
    body: {
      de: `## Sutz-Lattrigen: Pfahlbauten, Felder und flaches Ufer

Sutz-Lattrigen liegt am Südufer des Bielersees, zwischen Ipsach und Mörigen. Das Dorf besteht aus den beiden Ortsteilen Sutz und Lattrigen, umgeben von Feldern des Seelands und mit Blick über das Wasser auf die Jurakette. Im flachen Wasser vor dem Ufer liegen Reste prähistorischer Pfahlbausiedlungen. Sie gehören zur Stätte «Prähistorische Pfahlbauten um die Alpen», die von der UNESCO als Welterbe anerkannt ist. Für Arbeit und Einkauf orientiert sich das Dorf vor allem nach Biel, das rund sieben Kilometer entfernt liegt.

## Mit der BTI am Südufer entlang

Die BTI-Bahn verbindet Ins und Täuffelen mit Biel und hält auch in Sutz. Sie fährt dem Südufer entlang über Ipsach und Nidau bis zum Bahnhof Biel. Von dort gehst du wenige Minuten bis zur Zentralstrasse 22. Das ist praktisch, wenn du ohnehin in Biel arbeitest: Du kannst den Termin direkt an den Arbeitsweg hängen.

Mit dem Auto fährst du über Ipsach und Nidau ins Bieler Zentrum. Für die rund sieben Kilometer solltest du etwa eine Viertelstunde einplanen. In der Innenstadt parkierst du in einem öffentlichen Parkhaus.

## Kurz und sauber für Sommer am See

Wer im Sommer viel am See ist, schwimmt oder Velo fährt, will meist eine Frisur, die wenig Aufwand macht. Ein [Herren Haarschnitt](service:haarschnitt-biel) mit Schere und Maschine dauert rund 20 Minuten, ein Bart Trim mit Konturen an der Klinge etwa 15 Minuten. Beides passt auch in eine Mittagspause.

Nach Sonne, Wind und Wasser tut deiner Haut das GYAN Face Treatment gut, mit heissem Tuch, Reinigung und Pflege. Und wenn du alles in einem Termin willst, gibt es das [GYAN Premium Paket](service:gyan-premium-paket) mit Haarschnitt, Bart, Wäsche und Styling in rund 40 Minuten.

## Wann es von Sutz aus am besten passt

Wir sind von Montag bis Mittwoch von 9 bis 19 Uhr da, am Donnerstag und Freitag bis 20 Uhr und am Samstag von 8.30 bis 18 Uhr. Am Sonntag ist geschlossen. Am Abend nach der Arbeit oder am Samstagmorgen lässt sich der Besuch gut mit einer Fahrt in die Stadt verbinden. Deinen Termin [buchst du online](page:booking), sofort bestätigt, auf Deutsch, Französisch oder Englisch. Walk-ins sind während der Öffnungszeiten ebenfalls willkommen.

Im Salon erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand. Bezahlt wird bar, mit Karte oder mit TWINT. Wohnst du ein paar Stationen weiter Richtung Ins? Dann passt unsere Seite für [Täuffelen](seo:taeuffelen).`,
      fr: `## Sutz-Lattrigen : palafittes, champs et rive basse

Sutz-Lattrigen se trouve sur la rive sud du lac de Bienne, entre Ipsach et Mörigen. Le village réunit les deux localités de Sutz et de Lattrigen, entourées des champs du Seeland, avec vue sur la chaîne du Jura de l'autre côté du lac. Dans les eaux peu profondes au large de la rive reposent des vestiges de villages palafittiques préhistoriques. Ils font partie du site « Sites palafittiques préhistoriques autour des Alpes », inscrit au patrimoine mondial de l'UNESCO. Pour le travail et les courses, le village se tourne surtout vers Bienne, à environ sept kilomètres.

## Le long de la rive sud avec le BTI

Le train BTI relie Anet et Täuffelen à Bienne et s'arrête aussi à Sutz. Il longe la rive sud par Ipsach et Nidau jusqu'à la gare de Bienne. De là, quelques minutes à pied jusqu'à la Zentralstrasse 22. Pratique si tu travailles à Bienne : tu peux accrocher le rendez-vous à ton trajet quotidien.

En voiture, tu rejoins le centre de Bienne par Ipsach et Nidau. Pour les quelque sept kilomètres, prévois environ un quart d'heure. Au centre-ville, tu te gares dans un parking public.

## Court et net pour l'été au bord du lac

Quand on passe l'été au lac, à nager ou à vélo, on veut en général une coiffure qui demande peu d'effort. Une [coupe homme](service:haarschnitt-biel) aux ciseaux et à la tondeuse dure une vingtaine de minutes, une taille de barbe avec contours à la lame environ 15 minutes. Les deux tiennent dans une pause de midi.

Après le soleil, le vent et l'eau, le GYAN Face Treatment fait du bien à ta peau, avec serviette chaude, nettoyage et soin. Et si tu veux tout en un seul rendez-vous, la [formule GYAN Premium](service:gyan-premium-paket) réunit coupe, barbe, shampoing et coiffage en une quarantaine de minutes.

## Le meilleur moment pour venir de Sutz

On est là du lundi au mercredi de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, et le samedi de 8 h 30 à 18 h. Fermé le dimanche. Le soir après le travail ou le samedi matin, la visite se combine facilement avec un passage en ville. [Réserve en ligne](page:booking), avec confirmation immédiate, en français, en allemand ou en anglais. Les clients sans rendez-vous sont aussi les bienvenus pendant les heures d'ouverture.

Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT. Tu habites quelques arrêts plus loin vers Anet ? Alors notre page pour [Täuffelen](seo:taeuffelen) est pour toi.`,
      en: `## Sutz-Lattrigen: pile dwellings, fields and a low shoreline

Sutz-Lattrigen lies on the south shore of Lake Biel, between Ipsach and Mörigen. The village is made up of two parts, Sutz and Lattrigen, surrounded by Seeland farmland and looking across the water to the Jura range. In the shallow water off the shore lie the remains of prehistoric pile-dwelling settlements. They're part of the "Prehistoric Pile Dwellings around the Alps", a UNESCO World Heritage site. For work and shopping, the village mainly looks to Biel, about seven kilometres away.

## Along the south shore on the BTI

The BTI train links Ins and Täuffelen with Biel and also stops in Sutz. It runs along the south shore via Ipsach and Nidau to Biel station. From there it's a few minutes on foot to Zentralstrasse 22. Handy if you work in Biel anyway: you can tack your appointment onto your commute.

By car, head via Ipsach and Nidau into central Biel. Plan around a quarter of an hour for the roughly seven kilometres. In the city centre you can park in a public car park.

## Short and clean for summer by the lake

If you spend your summers at the lake, swimming or cycling, you probably want a cut that's low effort. A [men's haircut](service:haarschnitt-biel) with scissors and clippers takes about 20 minutes, and a beard trim with razor outlines about 15. Both fit into a lunch break.

After sun, wind and water, the GYAN Face Treatment is good for your skin, with hot towel, cleansing and care. And if you want everything in one go, the [GYAN Premium package](service:gyan-premium-paket) brings haircut, beard, wash and styling together in around 40 minutes.

## When it works best from Sutz

We're here Monday to Wednesday from 9:00 to 19:00, Thursday and Friday until 20:00, and Saturday from 8:30 to 18:00. Closed on Sundays. An evening after work or a Saturday morning pairs easily with a trip into town. [Book online](page:booking) with instant confirmation, in English, German or French. Walk-ins are welcome during opening hours too.

Inside you'll find brown leather chairs and a red Persian carpet on the wall. Pay in cash, by card or with TWINT. Live a few stops further towards Ins? Then our page for [Täuffelen](seo:taeuffelen) is the one for you.`,
    },
    neighbors: ["ipsach", "taeuffelen", "nidau"],
    carMin: 15,
    transit: {
      de: "Mit der BTI-Bahn von Ins über Täuffelen bis zum Bahnhof Biel, dann wenige Minuten zu Fuss zum Salon.",
      fr: "Avec le train BTI qui vient d'Anet par Täuffelen jusqu'à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the BTI train from Ins via Täuffelen to Biel station, then it is a few minutes on foot to the salon.",
    },
    services: ["haarschnitt-biel", "bart-trimmen-biel", "gesichtspflege-biel", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Wie komme ich von Sutz-Lattrigen mit der Bahn zu GYAN?", a: "Die BTI-Bahn fährt dem Südufer entlang über Ipsach und Nidau bis zum Bahnhof Biel. Von dort sind es nur wenige Gehminuten bis zur Zentralstrasse 22." },
        { q: "Wo parkiere ich, wenn ich von Sutz-Lattrigen mit dem Auto komme?", a: "Du fährst über Ipsach und Nidau ins Bieler Zentrum und parkierst in einem öffentlichen Parkhaus. Für die rund sieben Kilometer rechnest du mit etwa einer Viertelstunde." },
        { q: "Passt ein Haarschnitt in die Mittagspause, wenn ich in Sutz-Lattrigen wohne und in Biel arbeite?", a: "Ein Herren Haarschnitt dauert rund 20 Minuten, ein Bart Trim etwa 15 Minuten. Mit einer Online-Buchung sicherst du dir die passende Zeit und bekommst sofort eine Bestätigung." },
      ],
      fr: [
        { q: "Comment venir de Sutz-Lattrigen chez GYAN en train ?", a: "Le train BTI longe la rive sud par Ipsach et Nidau jusqu'à la gare de Bienne. De là, la Zentralstrasse 22 n'est qu'à quelques minutes à pied." },
        { q: "Où me garer si je viens de Sutz-Lattrigen en voiture ?", a: "Tu rejoins le centre de Bienne par Ipsach et Nidau et tu te gares dans un parking public. Pour les quelque sept kilomètres, compte environ un quart d'heure." },
        { q: "Une coupe pendant la pause de midi, c'est possible si j'habite Sutz-Lattrigen et travaille à Bienne ?", a: "Une coupe homme dure une vingtaine de minutes, une taille de barbe environ 15 minutes. En réservant en ligne, tu bloques le bon créneau et reçois une confirmation immédiate." },
      ],
      en: [
        { q: "How do I get from Sutz-Lattrigen to GYAN by train?", a: "The BTI train runs along the south shore via Ipsach and Nidau to Biel station. From there it's only a few minutes' walk to Zentralstrasse 22." },
        { q: "Where do I park if I drive in from Sutz-Lattrigen?", a: "Drive via Ipsach and Nidau into central Biel and use a public car park. Allow about a quarter of an hour for the roughly seven kilometres." },
        { q: "Can I fit a haircut into my lunch break if I live in Sutz-Lattrigen and work in Biel?", a: "A men's haircut takes about 20 minutes and a beard trim about 15. Booking online locks in the right time and you get instant confirmation." },
      ],
    },
  },

  // ───────────────────────────── TÄUFFELEN ─────────────────────────────
  {
    key: "taeuffelen",
    name: { de: "Täuffelen", fr: "Täuffelen", en: "Täuffelen" },
    slug: { de: "coiffeur-taeuffelen", fr: "coiffeur-taeuffelen", en: "barber-taeuffelen" },
    km: 12,
    title: {
      de: "Coiffeur für Täuffelen – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Täuffelen – barbier à Bienne | GYAN",
      en: "Barber near Täuffelen – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Täuffelen und Gerolfingen: GYAN in Biel, mit der BTI-Bahn direkt erreichbar. Classic, Premium oder Full Service. Jetzt online Termin buchen.",
      fr: "Coiffeur pour Täuffelen et Gerolfingen : GYAN à Bienne, accessible en train BTI direct. Formules Classic, Premium ou Full Service. Réserve en ligne.",
      en: "Barber for Täuffelen and Gerolfingen: GYAN in Biel, a direct ride on the BTI train. Classic, Premium or Full Service packages. Book online today.",
    },
    h1: {
      de: "Herrencoiffeur für Täuffelen",
      fr: "Coiffeur homme près de Täuffelen",
      en: "Barber near Täuffelen",
    },
    intro: {
      de: "Täuffelen liegt am Südufer des Bielersees, rund zwölf Kilometer von Biel. Die BTI-Bahn bringt dich dem See entlang direkt zum Bahnhof Biel, nur ein paar Gehminuten von GYAN entfernt.",
      fr: "Täuffelen se trouve sur la rive sud du lac de Bienne, à une douzaine de kilomètres de Bienne. Le train BTI longe le lac jusqu'à la gare de Bienne, à quelques minutes à pied de GYAN.",
      en: "Täuffelen sits on the south shore of Lake Biel, about twelve kilometres from Biel. The BTI train follows the lake straight to Biel station, a few minutes' walk from GYAN.",
    },
    body: {
      de: `## Täuffelen-Gerolfingen am Südufer

Täuffelen bildet zusammen mit Gerolfingen eine Gemeinde am Südufer des Bielersees. Gerolfingen liegt direkt am Wasser, Täuffelen etwas erhöht dahinter, und rundherum ziehen sich die Felder des Seelands. Nicht weit westlich mündet die Aare durch den Hagneckkanal in den See, ein Werk der Juragewässerkorrektion aus dem 19. Jahrhundert. Biel liegt am anderen Ende des Sees, rund zwölf Kilometer entfernt, und ist für das Südufer die nächste Stadt.

## Mit der BTI dem See entlang nach Biel

Die bequemste Verbindung ist die BTI-Bahn, die Biel, Täuffelen und Ins verbindet und heute von Aare Seeland mobil betrieben wird. Ab Täuffelen fährt sie dem Südufer entlang über Ipsach und Nidau bis zum Bahnhof Biel. Von dort gehst du ein paar Minuten zu Fuss bis zur Zentralstrasse 22. Unterwegs schaust du auf den See statt auf den Verkehr, und am Ziel musst du keinen Parkplatz suchen.

Mit dem Auto folgst du der Strasse am Südufer über Sutz und Ipsach nach Nidau und weiter ins Bieler Zentrum. Rechne grosszügig mit etwa 20 Minuten und parkiere in einem der öffentlichen Parkhäuser in der Innenstadt.

## Eine Fahrt, alles erledigt

Wenn du extra vom Südufer nach Biel fährst, lohnt es sich, Haar und Bart in einem Besuch zu erledigen. Das [GYAN Classic Paket](service:haarschnitt-und-bart) verbindet Haarschnitt und Bart in rund 30 Minuten für 65 Franken, ohne Termin 60 Franken. Beim [GYAN Premium Paket](service:gyan-premium-paket) kommen Wäsche und Styling dazu, rund 40 Minuten für 75 Franken.

Willst du dir richtig Zeit nehmen, ist der GYAN Full Service mit Haarschnitt, Bart, Face Treatment, Wäsche und Styling die ausführlichste Wahl, rund 50 Minuten. Das Face Treatment mit heissem Tuch, Reinigung und Pflege kannst du auch einzeln buchen. Du sitzt dabei in einem braunen Ledersessel, an der Wand hängt ein roter Perserteppich.

## Den Biel-Tag planen

Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, Donnerstag und Freitag bis 20 Uhr, Samstag von 8.30 bis 18 Uhr. Sonntags ist geschlossen. Ein früher Samstagstermin lässt sich gut mit Einkäufen in der Bieler Innenstadt verbinden, bevor du mit der BTI zurück ans Südufer fährst.

Deinen Termin [buchst du online](page:booking) und bekommst sofort eine Bestätigung, so ist deine Zeit nach der Anreise reserviert. Ohne Termin bist du während der Öffnungszeiten ebenfalls willkommen. Bezahlt wird bar, mit Karte oder mit TWINT. Wohnst du näher an Biel, schau auf der Seite für [Sutz-Lattrigen](seo:sutz-lattrigen) vorbei.`,
      fr: `## Täuffelen-Gerolfingen, sur la rive sud

Täuffelen forme avec Gerolfingen une commune sur la rive sud du lac de Bienne. Gerolfingen est au bord de l'eau, Täuffelen un peu plus haut derrière, et tout autour s'étendent les champs du Seeland. Un peu plus à l'ouest, l'Aar se jette dans le lac par le canal de Hagneck, un ouvrage de la correction des eaux du Jura au XIXe siècle. Bienne se trouve à l'autre bout du lac, à une douzaine de kilomètres, et c'est la ville la plus proche pour la rive sud.

## En BTI le long du lac jusqu'à Bienne

La liaison la plus confortable, c'est le train BTI, qui relie Bienne, Täuffelen et Anet et qui est aujourd'hui exploité par Aare Seeland mobil. Depuis Täuffelen, il longe la rive sud par Ipsach et Nidau jusqu'à la gare de Bienne. De là, quelques minutes à pied jusqu'à la Zentralstrasse 22. En route, tu regardes le lac plutôt que les bouchons.

En voiture, tu suis la route de la rive sud par Sutz et Ipsach jusqu'à Nidau, puis vers le centre de Bienne. Compte large environ 20 minutes et gare-toi dans un des parkings publics du centre-ville.

## Un trajet, tout est réglé

Quand tu viens exprès de la rive sud, autant faire cheveux et barbe en une seule visite. La [formule GYAN Classic](service:haarschnitt-und-bart) réunit coupe et barbe en environ 30 minutes pour 65 francs, 60 francs sans rendez-vous. Avec la [formule GYAN Premium](service:gyan-premium-paket), shampooing et coiffage s'ajoutent, environ 40 minutes pour 75 francs.

Si tu veux vraiment prendre ton temps, le GYAN Full Service avec coupe, barbe, Face Treatment, shampooing et coiffage est l'option la plus complète, environ 50 minutes. Le Face Treatment avec serviette chaude, nettoyage et soin se réserve aussi seul. Tu es installé dans un fauteuil en cuir brun, avec un tapis persan rouge au mur.

## Organiser ta journée à Bienne

Du lundi au mercredi, on est là de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, le samedi de 8 h 30 à 18 h. Fermé le dimanche. Un rendez-vous tôt le samedi se combine bien avec des courses au centre de Bienne, avant de reprendre le BTI vers la rive sud.

[Réserve en ligne](page:booking) et la confirmation arrive tout de suite : ton créneau t'attend à ton arrivée. Sans rendez-vous, tu es aussi le bienvenu pendant les heures d'ouverture. Paiement en espèces, par carte ou avec TWINT. Si tu habites plus près de Bienne, jette un œil à la page pour [Sutz-Lattrigen](seo:sutz-lattrigen).`,
      en: `## Täuffelen-Gerolfingen on the south shore

Täuffelen and Gerolfingen together form one municipality on the south shore of Lake Biel. Gerolfingen is right on the water, Täuffelen sits a little higher up behind it, and the fields of the Seeland stretch out all around. A short way to the west, the Aare flows into the lake through the Hagneck canal, built as part of the Jura water correction in the 19th century. Biel is at the other end of the lake, about twelve kilometres away, and is the nearest town for the whole south shore.

## Along the lake to Biel on the BTI

The easiest way in is the BTI train, which links Biel, Täuffelen and Ins and is run today by Aare Seeland mobil. From Täuffelen it follows the south shore through Ipsach and Nidau to Biel station. From there it's a few minutes' walk to Zentralstrasse 22. On the way you get a view of the lake instead of traffic.

By car, take the south shore road through Sutz and Ipsach to Nidau and on into central Biel. Allow a generous 20 minutes and park in one of the public car parks in the city centre.

## One trip, everything sorted

If you're coming all the way from the south shore, it makes sense to get hair and beard done in one visit. The [GYAN Classic package](service:haarschnitt-und-bart) combines haircut and beard in about 30 minutes for CHF 65, or CHF 60 as a walk-in. The [GYAN Premium package](service:gyan-premium-paket) adds a wash and styling, about 40 minutes for CHF 75.

If you really want to take your time, the GYAN Full Service with haircut, beard, Face Treatment, wash and styling is the most complete option, about 50 minutes. The Face Treatment, with hot towel, cleansing and care, can also be booked on its own. You'll be in a brown leather chair, with a red Persian carpet on the wall.

## Planning your day in Biel

We're open Monday to Wednesday from 9am to 7pm, Thursday and Friday until 8pm, and Saturday from 8:30am to 6pm. Closed on Sundays. An early Saturday slot pairs well with some shopping in central Biel before you take the BTI back to the south shore.

[Book online](page:booking) and get instant confirmation, so your slot is waiting when you arrive. Walk-ins are welcome during opening hours too. Pay in cash, by card or with TWINT. Living closer to Biel? Have a look at the page for [Sutz-Lattrigen](seo:sutz-lattrigen).`,
    },
    neighbors: ["sutz-lattrigen", "ipsach"],
    carMin: 20,
    transit: {
      de: "Mit der BTI-Bahn Biel-Täuffelen-Ins fährst du dem Südufer entlang direkt bis zum Bahnhof Biel, von dort sind es ein paar Minuten zu Fuss.",
      fr: "Le train BTI Bienne-Täuffelen-Anet longe la rive sud jusqu'à la gare de Bienne, puis il reste quelques minutes à pied.",
      en: "The BTI line Biel-Täuffelen-Ins runs along the south shore straight to Biel station, then it's a few minutes on foot.",
    },
    services: ["haarschnitt-und-bart", "gyan-premium-paket", "gesichtspflege-biel", "gyan-full-service"],
    faq: {
      de: [
        { q: "Wie komme ich von Täuffelen ohne Auto zu GYAN?", a: "Die BTI-Bahn fährt von Täuffelen dem Südufer des Bielersees entlang bis zum Bahnhof Biel. Von dort gehst du ein paar Minuten zu Fuss zur Zentralstrasse 22." },
        { q: "Passt ein Termin aus Täuffelen am Samstagmorgen?", a: "Ja, samstags öffnen wir schon um 8.30 Uhr und haben bis 18 Uhr offen. So kannst du den Schnitt mit dem Wocheneinkauf oder anderen Besorgungen in Biel verbinden." },
        { q: "Welches Paket lohnt sich, wenn ich extra aus Täuffelen anreise?", a: "Wer Haare und Bart in einem Besuch erledigen will, nimmt das GYAN Classic Paket für 65 Franken. Mit Wäsche und Styling dazu ist es das GYAN Premium Paket für 75 Franken, mit Face Treatment der GYAN Full Service für 90 Franken." },
      ],
      fr: [
        { q: "Comment venir de Täuffelen chez GYAN sans voiture ?", a: "Le train BTI part de Täuffelen et longe la rive sud du lac de Bienne jusqu'à la gare de Bienne. De là, tu marches quelques minutes jusqu'à la Zentralstrasse 22." },
        { q: "Un rendez-vous le samedi matin depuis Täuffelen, c'est possible ?", a: "Oui, le samedi on ouvre dès 8 h 30 et jusqu'à 18 h. Tu peux ainsi combiner la coupe avec tes courses ou d'autres commissions à Bienne." },
        { q: "Quelle formule choisir si je viens exprès de Täuffelen ?", a: "Pour régler cheveux et barbe en une visite, prends la formule GYAN Classic à 65 francs. Avec shampooing et coiffage, c'est la formule GYAN Premium à 75 francs, et avec le Face Treatment, le GYAN Full Service à 90 francs." },
      ],
      en: [
        { q: "How do I get from Täuffelen to GYAN without a car?", a: "The BTI train runs from Täuffelen along the south shore of Lake Biel to Biel station. From there it's a few minutes' walk to Zentralstrasse 22." },
        { q: "Does a Saturday morning appointment work from Täuffelen?", a: "Yes, on Saturdays we open at 8:30am and stay open until 6pm. That way you can combine the cut with your weekly shop or other errands in Biel." },
        { q: "Which package makes sense if I come all the way from Täuffelen?", a: "To sort out hair and beard in one visit, go for the GYAN Classic package at CHF 65. Add wash and styling and it's the GYAN Premium package at CHF 75, or the GYAN Full Service at CHF 90 with a Face Treatment included." },
      ],
    },
  },

  // ───────────────────────────── AEGERTEN ─────────────────────────────
  {
    key: "aegerten",
    name: { de: "Aegerten", fr: "Aegerten", en: "Aegerten" },
    slug: { de: "coiffeur-aegerten", fr: "coiffeur-aegerten", en: "barber-aegerten" },
    km: 6,
    title: {
      de: "Coiffeur für Aegerten – Herrenschnitt in Biel | GYAN",
      fr: "Coiffeur près d'Aegerten – barbier à Bienne | GYAN",
      en: "Barber near Aegerten – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Aegerten: über Brügg nach Biel zu GYAN, rund 6 km. Signature Cut mit Styling-Tipps für zu Hause. Jetzt online Termin buchen.",
      fr: "Coiffeur pour Aegerten : par Brügg jusqu'à GYAN à Bienne, à 6 km. Signature Cut avec conseils de coiffage pour la maison. Réserve en ligne.",
      en: "Barber for Aegerten: via Brügg to GYAN in Biel, about 6 km. Signature Cut with styling tips to recreate at home. Book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Aegerten",
      fr: "Coiffeur homme près d'Aegerten",
      en: "Barber near Aegerten",
    },
    intro: {
      de: "Aegerten liegt gegenüber von Brügg am Nidau-Büren-Kanal, rund sechs Kilometer von GYAN. Über die Brücke und mit dem Zug ab Brügg bist du schnell in Biel.",
      fr: "Aegerten fait face à Brügg sur le canal Nidau-Büren, à environ six kilomètres de GYAN. Par le pont puis en train depuis Brügg, tu es vite à Bienne.",
      en: "Aegerten faces Brügg across the Nidau-Büren canal, about six kilometres from GYAN. Cross the bridge, take the train from Brügg and you're soon in Biel.",
    },
    body: {
      de: `## Aegerten, Brügg und die Brücke über den Kanal

Aegerten liegt am Nidau-Büren-Kanal, auf der anderen Seite des Wassers gegenüber von Brügg, und grenzt an Studen. Durch den Kanal fliesst hier die Aare, nachdem sie den Bielersee verlassen hat. Über die Brücke bist du in wenigen Minuten in Brügg, und von dort ist es nicht mehr weit bis an den Stadtrand von Biel. Entlang dem Kanal führen Wege, die sich gut zu Fuss oder mit dem Velo nutzen lassen.

## Der Weg über Brügg nach Biel

Bis zu GYAN an der Zentralstrasse 22 sind es rund sechs Kilometer. Ohne Auto gehst oder radelst du über die Kanalbrücke zum Bahnhof Brügg und nimmst den Zug zum Bahnhof Biel. Von dort sind es nur wenige Minuten zu Fuss bis in den Salon. Mit dem Auto fährst du über Brügg ins Bieler Zentrum, wo es öffentliche Parkplätze gibt; rechne mit etwa einer Viertelstunde. Mit dem Velo folgst du dem Kanal Richtung Stadt.

## Den Look zu Hause selbst hinbekommen

Ein Schnitt sieht im Salon meistens gut aus. Die Frage ist, wie er am nächsten Morgen vor deinem eigenen Spiegel in Aegerten aussieht. Genau dafür gibt es den [GYAN Signature Cut](service:gyan-signature): Nach dem Haarschnitt stylen wir deine Haare und zeigen dir dabei, welches Produkt passt, wie viel du davon brauchst und mit welchen Handgriffen du den Look selbst hinbekommst. Das dauert rund 25 Minuten.

Wenn du schon genau weisst, was du willst, reicht der [Herren Haarschnitt](service:haarschnitt-biel) mit Beratung, Schere und Maschine und sauberen Konturen in rund 20 Minuten. Und wer Haar und Bart in einem Termin erledigen und dazu Wäsche und Styling möchte, nimmt das GYAN Premium Paket in rund 40 Minuten.

## Planen oder spontan vorbeikommen

Weil der Weg über Brügg etwas länger ist als aus der Stadt, lohnt es sich, den Termin [online zu buchen](page:booking). Die Bestätigung kommt sofort, und du kannst deine Zugverbindung danach richten. Wer flexibel ist, kommt einfach während der Öffnungszeiten vorbei, Walk-ins sind willkommen. Montag bis Mittwoch sind wir von 9 bis 19 Uhr da, am Donnerstag und Freitag bis 20 Uhr, am Samstag von 8.30 bis 18 Uhr. Sonntags ist geschlossen.

Im Salon erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand. Bezahlen kannst du bar, mit Karte oder mit TWINT. Für die Nachbarn auf der anderen Seite des Kanals gibt es die Seite für [Brügg](seo:bruegg).`,
      fr: `## Aegerten, Brügg et le pont sur le canal

Aegerten se trouve au bord du canal Nidau-Büren, de l'autre côté de l'eau face à Brügg, et touche Studen. C'est l'Aar qui coule ici dans le canal, après avoir quitté le lac de Bienne. Par le pont, tu es à Brügg en quelques minutes, et de là, la périphérie de Bienne n'est plus très loin. Le long du canal, des chemins se prêtent bien à la marche ou au vélo.

## Par Brügg jusqu'à Bienne

Jusqu'à GYAN, à la Zentralstrasse 22, il y a environ six kilomètres. Sans voiture, tu traverses le pont à pied ou à vélo jusqu'à la gare de Brügg, puis tu prends le train jusqu'à la gare de Bienne. De là, il ne reste que quelques minutes à pied jusqu'au salon. En voiture, tu passes par Brügg jusqu'au centre de Bienne, où se trouvent des places de parc publiques ; compte environ un quart d'heure. À vélo, suis le canal en direction de la ville.

## Refaire le look toi-même à la maison

Au salon, une coupe a presque toujours belle allure. La vraie question, c'est à quoi elle ressemble le lendemain matin devant ton miroir à Aegerten. C'est pour ça qu'existe le [GYAN Signature Cut](service:gyan-signature) : après la coupe, on coiffe tes cheveux en te montrant quel produit convient, en quelle quantité et avec quels gestes tu refais le look toi-même. Compte environ 25 minutes.

Si tu sais déjà exactement ce que tu veux, la [coupe homme](service:haarschnitt-biel) suffit : conseil, ciseaux et tondeuse, contours nets, en une vingtaine de minutes. Et pour régler cheveux et barbe en un seul rendez-vous, avec shampooing et coiffage en plus, il y a la formule GYAN Premium, en une quarantaine de minutes.

## Réserver ou passer spontanément

Comme le trajet par Brügg est un peu plus long que depuis la ville, mieux vaut [réserver en ligne](page:booking). La confirmation est immédiate et tu peux caler ton train en fonction. Si tu es flexible, passe simplement pendant les heures d'ouverture : les clients sans rendez-vous sont les bienvenus. Du lundi au mercredi, on est là de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, le samedi de 8 h 30 à 18 h. Le dimanche, c'est fermé.

Au salon t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. Tu paies en espèces, par carte ou avec TWINT. Pour les voisins de l'autre côté du canal, il y a la page pour [Brügg](seo:bruegg).`,
      en: `## Aegerten, Brügg and the bridge over the canal

Aegerten lies on the Nidau-Büren canal, across the water from Brügg, and borders Studen. The canal here carries the Aare after it leaves Lake Biel. Cross the bridge and you're in Brügg within minutes, and from there the edge of Biel isn't far. Paths run along the canal that work well on foot or by bike, so the first part of the trip into town can be a pleasant one even before you reach a station or a main road.

## Via Brügg into Biel

It's about six kilometres to GYAN at Zentralstrasse 22. Without a car, walk or cycle over the canal bridge to Brügg station and take the train to Biel station. From there it's just a few minutes' walk to the salon. By car you drive via Brügg into central Biel, where there's public parking; allow about a quarter of an hour. By bike, simply follow the canal towards town.

## Getting the look right at home

A cut almost always looks good in the salon. The real question is how it looks the next morning in front of your own mirror in Aegerten. That's what the [GYAN Signature Cut](service:gyan-signature) is for: after the haircut we style your hair and show you which product suits it, how much to use and which moves get you the look on your own. It takes about 25 minutes.

Prefer to keep things simple? If you already know exactly what you want, the [men's haircut](service:haarschnitt-biel) does the job: consultation, scissors and clippers, clean outlines, in about 20 minutes. And if you want hair and beard done in one visit with a wash and styling on top, there's the GYAN Premium package, about 40 minutes.

## Book ahead or just drop in

Since the trip via Brügg takes a little longer than from inside the city, it's worth [booking online](page:booking). Confirmation comes instantly, so you can plan your train around it and know exactly when you need to leave Aegerten. If you're flexible, just drop in during opening hours, walk-ins are welcome. Monday to Wednesday we're open 9am to 7pm, Thursday and Friday until 8pm, and Saturday from 8:30am to 6pm. Sundays we're closed.

Inside you'll find brown leather chairs and a red Persian carpet on the wall. Pay in cash, by card or with TWINT. For the neighbours across the canal, there's our page for [Brügg](seo:bruegg).`,
    },
    neighbors: ["bruegg", "studen", "busswil"],
    carMin: 15,
    transit: {
      de: "Über die Kanalbrücke zum Bahnhof Brügg und mit dem Zug zum Bahnhof Biel, dann wenige Minuten zu Fuss.",
      fr: "Par le pont sur le canal jusqu'à la gare de Brügg, puis en train jusqu'à la gare de Bienne et quelques minutes à pied.",
      en: "Cross the canal bridge to Brügg station, take the train to Biel station, then walk a few minutes.",
    },
    services: ["gyan-signature", "haarschnitt-biel", "gyan-premium-paket"],
    faq: {
      de: [
        { q: "Wie weit ist es von Aegerten bis zu GYAN?", a: "Von Aegerten bis zur Zentralstrasse 22 in Biel sind es rund sechs Kilometer. Mit dem Auto rechnest du mit etwa einer Viertelstunde, mit Zug ab Brügg plus Fussweg ähnlich." },
        { q: "Wie bezahle ich als Kunde aus Aegerten im Salon?", a: "Du kannst bar, mit Karte oder mit TWINT bezahlen. Online buchst du deinen Termin und bekommst sofort eine Bestätigung." },
        { q: "Kann ich von Aegerten aus auch am Wochenende kommen?", a: "Am Samstag sind wir von 8.30 bis 18 Uhr offen, am Sonntag ist geschlossen. Für einen Samstag von Aegerten aus lohnt sich eine Online-Buchung." },
      ],
      fr: [
        { q: "À quelle distance se trouve GYAN depuis Aegerten ?", a: "D'Aegerten à la Zentralstrasse 22 à Bienne, il y a environ six kilomètres. En voiture, compte un quart d'heure environ, en train depuis Brügg avec la marche, c'est comparable." },
        { q: "Comment payer au salon si je viens d'Aegerten ?", a: "Tu peux payer en espèces, par carte ou avec TWINT. En ligne, tu réserves ton rendez-vous et la confirmation est immédiate." },
        { q: "Puis-je venir d'Aegerten le week-end ?", a: "Le samedi, on est ouverts de 8 h 30 à 18 h, le dimanche c'est fermé. Pour un samedi depuis Aegerten, mieux vaut réserver en ligne." },
      ],
      en: [
        { q: "How far is GYAN from Aegerten?", a: "It's about six kilometres from Aegerten to Zentralstrasse 22 in Biel. By car allow about a quarter of an hour, and the train from Brügg plus the walk takes about the same." },
        { q: "How do I pay at the salon if I come from Aegerten?", a: "You can pay in cash, by card or with TWINT. Book online and you get instant confirmation." },
        { q: "Can I come from Aegerten at the weekend?", a: "On Saturday we're open from 8:30am to 6pm, and closed on Sunday. For a Saturday visit from Aegerten, booking online is a good idea." },
      ],
    },
  },

  // ───────────────────────────── SAFNERN ─────────────────────────────
  {
    key: "safnern",
    name: { de: "Safnern", fr: "Safnern", en: "Safnern" },
    slug: { de: "coiffeur-safnern", fr: "coiffeur-safnern", en: "barber-safnern" },
    km: 8,
    title: {
      de: "Coiffeur für Safnern – Herrensalon in Biel | GYAN",
      fr: "Coiffeur près de Safnern – salon homme Bienne | GYAN",
      en: "Barber near Safnern – men's salon in Biel | GYAN",
    },
    description: {
      de: "Herrencoiffeur für Safnern: GYAN in Biel, rund 8 km über Orpund. Hot Towel Rasur, Face Treatment und Full Service. Jetzt online Termin buchen.",
      fr: "Coiffeur homme pour Safnern : GYAN à Bienne, à environ 8 km via Orpund. Rasage serviette chaude, soin du visage, Full Service. Réserve en ligne.",
      en: "Barber for Safnern: GYAN in Biel, about 8 km away via Orpund. Hot towel shaves, face treatments and the Full Service. Book your appointment online.",
    },
    h1: {
      de: "Herrencoiffeur für Safnern",
      fr: "Coiffeur homme près de Safnern",
      en: "Barber near Safnern",
    },
    intro: {
      de: "Safnern liegt am Fuss des Büttenbergs, rund acht Kilometer östlich von Biel. Über Orpund fährst du ins Zentrum, mit dem Bus kommst du zum Bahnhof Biel, nur wenige Minuten von GYAN.",
      fr: "Safnern se trouve au pied du Büttenberg, à environ huit kilomètres à l'est de Bienne. Par Orpund, tu rejoins le centre, et le bus t'amène à la gare, tout près de GYAN.",
      en: "Safnern lies at the foot of the Büttenberg, about eight kilometres east of Biel. Drive in via Orpund, or take the bus to Biel station, a few minutes from GYAN.",
    },
    body: {
      de: `## Zwischen Büttenberg und Aare-Ebene

Safnern liegt östlich von Biel, angelehnt an den bewaldeten Büttenberg. Auf der einen Seite der Wald, auf der anderen die weite, flache Ebene Richtung Aare. Das Dorf ist ruhig und ländlich, und doch ist Biel nah genug für Arbeit, Einkauf oder einen Termin beim Coiffeur. Rund acht Kilometer sind es bis zu unserem Salon an der Zentralstrasse 22.

## Über Orpund in die Stadt

Mit dem Auto führt der Weg von Safnern über Orpund ins Bieler Zentrum. Rechne mit etwa 20 Minuten, je nach Verkehr, und parkiere in einem der öffentlichen Parkhäuser in der Innenstadt. Ohne Auto nimmst du den Bus zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss weiter.

Für Velofahrer ist die Strecke angenehm: grösstenteils flach durch die Ebene, vorbei an Orpund. Plane etwas Reserve ein, damit du entspannt ankommst.

## Eine halbe Stunde nur für dich

Wer vom ruhigen Dorfleben in die Stadt kommt, muss sich nicht hetzen. Bei uns geht es nicht nur um den schnellen Schnitt. Die [Bart Rasur mit heissem Tuch](service:nassrasur-biel) ist eine klassische Nassrasur mit Schaum, heissem Tuch und Pflege, rund 20 Minuten lang. Das [GYAN Face Treatment](service:gesichtspflege-biel) setzt auf heisses Tuch, Reinigung und Pflege für die Haut. Und wer alles auf einmal möchte, bucht den GYAN Full Service: Haarschnitt, Bart, Face Treatment, Wäsche und Styling in rund 50 Minuten.

Natürlich gibt es auch den einfachen Herren Haarschnitt mit Beratung, Schere und Maschine. Im Salon arbeiten wir mit Schere, Maschine und Klinge und nehmen uns Zeit für das Gespräch vor dem ersten Schnitt. Du sitzt auf braunen Ledersesseln, an der Wand hängt ein roter Perserteppich.

## Wann es am besten passt

Samstags öffnen wir um 8.30 Uhr und schliessen um 18 Uhr, ideal für einen Termin ohne Zeitdruck. Unter der Woche sind wir Montag bis Mittwoch von 9 bis 19 Uhr da, Donnerstag und Freitag bis 20 Uhr. Sonntags bleibt der Salon geschlossen.

Deinen Termin [buchst du online](page:booking), die Bestätigung kommt sofort. Ohne Termin bist du während der Öffnungszeiten willkommen. Bezahlt wird bar, mit Karte oder mit TWINT.

Ein Überblick über die Preise: Die Bart Rasur mit heissem Tuch kostet 28 Franken, das Face Treatment 25 Franken. Der GYAN Full Service kostet 90 Franken, ohne Termin 85 Franken. Im Salon arbeiten Zana und Hikmet, online buchbar ist derzeit Zana.

Auf dem Weg nach Biel liegt [Orpund](seo:orpund), und weiter am Jurasüdfuss findest du Pieterlen. Für beide gibt es eine eigene Seite.`,
      fr: `## Entre le Büttenberg et la plaine de l'Aar

Safnern se trouve à l'est de Bienne, adossé au Büttenberg boisé. D'un côté la forêt, de l'autre la vaste plaine qui s'étend vers l'Aar. Le village est calme et campagnard, et pourtant Bienne est assez proche pour le travail, les courses ou un rendez-vous chez le coiffeur. Il y a environ huit kilomètres jusqu'à notre salon, à la Zentralstrasse 22.

## Par Orpund jusqu'en ville

En voiture, la route va de Safnern au centre de Bienne en passant par Orpund. Compte une vingtaine de minutes selon le trafic, et gare-toi dans un des parkings publics du centre-ville. Sans voiture, tu prends le bus jusqu'à la gare de Bienne, puis tu continues quelques minutes à pied.

À vélo, le trajet est agréable : presque tout plat à travers la plaine, en passant par Orpund. Prévois un peu de marge pour arriver détendu.

## Une demi-heure rien que pour toi

Quand on vient d'un village tranquille, pas besoin de se presser en ville. Chez nous, il ne s'agit pas seulement d'une coupe rapide. Le [rasage à la serviette chaude](service:nassrasur-biel) est un rasage traditionnel avec mousse, serviette chaude et soin, d'environ 20 minutes. Le [GYAN Face Treatment](service:gesichtspflege-biel) mise sur la serviette chaude, le nettoyage et le soin de la peau. Et si tu veux tout d'un coup, réserve le GYAN Full Service : coupe, barbe, soin du visage, lavage et coiffage en 50 minutes environ.

Bien sûr, il y a aussi la simple coupe homme, avec conseil, ciseaux et tondeuse. Au salon, on travaille aux ciseaux, à la tondeuse et au rasoir, et on prend le temps d'échanger avant le premier coup de ciseaux. Tu t'installes dans un fauteuil en cuir brun, sous un tapis persan rouge accroché au mur.

## Le bon moment pour venir

Le samedi, on ouvre à 8 h 30 et on ferme à 18 h, parfait pour un rendez-vous sans stress. En semaine, on est là du lundi au mercredi de 9 h à 19 h, jeudi et vendredi jusqu'à 20 h. Le dimanche, le salon est fermé.

[Réserve en ligne](page:booking) ton rendez-vous, la confirmation est immédiate. Sans rendez-vous, tu es le bienvenu pendant les heures d'ouverture. Paiement en espèces, par carte ou avec TWINT.

Un aperçu des prix : le rasage à la serviette chaude coûte 28 francs, le Face Treatment 25 francs. Le GYAN Full Service coûte 90 francs, 85 francs sans rendez-vous. Au salon travaillent Zana et Hikmet, et pour l'instant, c'est Zana qu'on réserve en ligne.

Sur la route de Bienne se trouve [Orpund](seo:orpund), et plus loin au pied du Jura, Perles. Les deux ont leur propre page.`,
      en: `## Between the Büttenberg and the Aare plain

Safnern lies east of Biel, tucked against the wooded Büttenberg. On one side the forest, on the other the wide, flat plain stretching towards the Aare. The village is quiet and rural, yet Biel is close enough for work, shopping or a trip to the barber. It's about eight kilometres to our salon at Zentralstrasse 22.

## Into town via Orpund

By car, the route from Safnern runs through Orpund into central Biel. Allow about 20 minutes depending on traffic, and park in one of the public car parks in the city centre. Without a car, take the bus to Biel station and walk the last few minutes.

For cyclists the ride is a pleasant one: mostly flat across the plain, past Orpund. Leave a little extra time so you arrive relaxed.

## Half an hour that's all yours

Coming in from quiet village life, there's no need to rush. At GYAN it's not just about a quick cut. The [hot towel shave](service:nassrasur-biel) is a traditional wet shave with lather, a hot towel and aftercare, taking about 20 minutes. The [GYAN Face Treatment](service:gesichtspflege-biel) focuses on a hot towel, cleansing and skin care. And if you want the lot, book the GYAN Full Service: haircut, beard, face treatment, wash and styling in about 50 minutes.

There's also the straightforward men's haircut with consultation, scissors and clippers. We work with scissors, clippers and razor, and take time to talk before the first snip. You'll sit in a brown leather chair, with a red Persian carpet on the wall.

## When it suits you best

On Saturdays we open at 8:30am and close at 6pm, perfect for an unhurried appointment. During the week we're open Monday to Wednesday 9am to 7pm, and Thursday and Friday until 8pm. The salon is closed on Sundays.

[Book your appointment online](page:booking) and get instant confirmation. Walk-ins are welcome during opening hours. Pay in cash, by card or with TWINT.

A quick look at prices: the hot towel shave is CHF 28 and the face treatment CHF 25. The GYAN Full Service is CHF 90, or CHF 85 as a walk-in. Zana and Hikmet both work in the salon, and for now you can book Zana online.

On the way to Biel you'll pass [Orpund](seo:orpund), and further along the foot of the Jura is Pieterlen. Both have their own page.`,
    },
    neighbors: ["orpund", "pieterlen", "lengnau"],
    carMin: 20,
    transit: {
      de: "Mit dem Bus fährst du von Safnern zum Bahnhof Biel und gehst von dort wenige Minuten zu Fuss zum Salon.",
      fr: "En bus, tu vas de Safnern à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the bus from Safnern to Biel station, then it's a few minutes on foot to the salon.",
    },
    services: ["nassrasur-biel", "gesichtspflege-biel", "gyan-full-service", "haarschnitt-biel"],
    faq: {
      de: [
        { q: "Wo parkiere ich, wenn ich aus Safnern mit dem Auto komme?", a: "Du fährst über Orpund ins Bieler Zentrum und parkierst in einem der öffentlichen Parkhäuser. Von dort gehst du zu Fuss an die Zentralstrasse 22." },
        { q: "Kann ich aus Safnern mit dem Velo zu GYAN fahren?", a: "Ja, die rund acht Kilometer führen grösstenteils durch die flache Ebene an der Aare. Plane etwas Zeit ein, damit du entspannt zu deinem Termin kommst." },
        { q: "Welche Leistung lohnt sich für einen ruhigen Samstag aus Safnern?", a: "Für einen entspannten Termin passt die Bart Rasur mit heissem Tuch oder das GYAN Face Treatment, beide rund 20 Minuten. Samstags sind wir von 8.30 bis 18 Uhr da." },
      ],
      fr: [
        { q: "Où me garer si je viens de Safnern en voiture ?", a: "Tu rejoins le centre de Bienne par Orpund et tu te gares dans un des parkings publics. De là, tu vas à pied jusqu'à la Zentralstrasse 22." },
        { q: "Puis-je venir de Safnern à vélo chez GYAN ?", a: "Oui, les quelque huit kilomètres traversent surtout la plaine de l'Aar. Prévois un peu de marge pour arriver détendu à ton rendez-vous." },
        { q: "Quelle prestation choisir pour un samedi tranquille depuis Safnern ?", a: "Pour un moment de détente, le rasage à la serviette chaude ou le GYAN Face Treatment, environ 20 minutes chacun. Le samedi, on est là de 8 h 30 à 18 h." },
      ],
      en: [
        { q: "Where do I park if I drive in from Safnern?", a: "Drive into central Biel via Orpund and use one of the public car parks. From there it's a walk to Zentralstrasse 22." },
        { q: "Can I cycle from Safnern to GYAN?", a: "Yes, the roughly eight kilometres run mostly across the flat Aare plain. Leave a bit of extra time so you arrive relaxed for your appointment." },
        { q: "What's a good service for a slow Saturday when coming from Safnern?", a: "For something relaxing, try the hot towel shave or the GYAN Face Treatment, about 20 minutes each. On Saturdays we're open from 8:30am to 6pm." },
      ],
    },
  },

  // ───────────────────────────── BUSSWIL ─────────────────────────────
  {
    key: "busswil",
    name: { de: "Busswil", fr: "Busswil", en: "Busswil" },
    slug: { de: "coiffeur-busswil", fr: "coiffeur-busswil", en: "barber-busswil" },
    km: 10,
    title: {
      de: "Coiffeur für Busswil – Barbier in Biel | GYAN",
      fr: "Coiffeur près de Busswil – barbier à Bienne | GYAN",
      en: "Barber near Busswil – fades & beards in Biel | GYAN",
    },
    description: {
      de: "Herrencoiffeur für Busswil: mit der S-Bahn über Brügg nach Biel, dann kurz zu Fuss zu GYAN. Haar und Bart, Hot Towel Rasur. Jetzt online buchen.",
      fr: "Coiffeur homme pour Busswil : RER via Brügg jusqu'à Bienne, puis quelques pas jusqu'à GYAN. Coupe et barbe, rasage serviette chaude. Réserve en ligne.",
      en: "Barber for Busswil: S-Bahn via Brügg to Biel, then a short walk to GYAN. Haircut and beard or a hot towel shave. Book your appointment online now.",
    },
    h1: {
      de: "Herrencoiffeur für Busswil",
      fr: "Coiffeur homme près de Busswil",
      en: "Barber near Busswil",
    },
    intro: {
      de: "Busswil hat einen eigenen Bahnhof an der Strecke nach Biel. Mit der S-Bahn über Brügg bist du schnell am Bahnhof Biel und von dort in wenigen Gehminuten bei GYAN.",
      fr: "Busswil a sa propre gare sur la ligne de Bienne. Avec le RER via Brügg, tu es vite à la gare de Bienne, puis à quelques minutes à pied de GYAN.",
      en: "Busswil has its own station on the line to Biel. Ride the S-Bahn via Brügg to Biel station and you're a few minutes' walk from GYAN.",
    },
    body: {
      de: `## Ein Dorf mit Bahnhof vor der Tür

Busswil ist seit 2011 ein Ortsteil von Lyss, hat aber seinen eigenen Charakter behalten: ein Dorf im Seeland, umgeben von Feldern, mit einem eigenen Bahnhof an der Strecke zwischen Lyss und Biel. Genau dieser Bahnhof macht den Weg zum Coiffeur so einfach. Du gehst zu Fuss oder mit dem Velo zum Perron, steigst in die S-Bahn und bist ohne Umsteigen in Biel.

Die Fahrt führt über Brügg in die Stadt. Am Bahnhof Biel steigst du aus und gehst wenige Minuten bis zur Zentralstrasse 22. Eine Parkplatzsuche entfällt komplett.

## Feierabend in Biel, Haarschnitt inklusive

Wer aus Busswil in Biel arbeitet oder zur Schule geht, kommt ohnehin am Bahnhof Biel vorbei. Da liegt es nahe, den Coiffeur einfach in den Heimweg einzubauen. Donnerstags und freitags sind wir bis 20 Uhr da, Montag bis Mittwoch bis 19 Uhr. Ein [Herren Haarschnitt](service:haarschnitt-biel) dauert rund 20 Minuten, das [GYAN Classic Paket](service:haarschnitt-und-bart) mit Haarschnitt und Bart rund 30 Minuten. Danach nimmst du die nächste S-Bahn zurück nach Busswil.

Am Samstag öffnen wir schon um 8.30 Uhr und schliessen um 18 Uhr. Sonntags ist der Salon geschlossen.

## Haar, Bart und ein Moment für dich

Bei GYAN beginnt jeder Termin mit einer kurzen Beratung. Danach arbeiten wir mit Schere und Maschine, die Konturen am Bart ziehen wir mit der Klinge. Wer sich etwas Besonderes gönnen will, bucht die Bart Rasur mit heissem Tuch: Nassrasur mit Schaum, heissem Tuch und Pflege. Und wenn du lernen willst, deine Frisur zu Hause selbst hinzubekommen, ist der GYAN Signature Cut das Richtige. Nach dem Schnitt stylen wir deine Haare und zeigen dir, welches Produkt du wie verwendest.

Du sitzt auf braunen Ledersesseln, an der Wand hängt ein roter Perserteppich. Bezahlt wird bar, mit Karte oder mit TWINT.

## Buchen oder einfach vorbeikommen

Einen fixen Termin [buchst du online](page:booking), die Bestätigung kommt sofort. So kannst du die passende S-Bahn gleich mitplanen. Die Website und die Buchung gibt es auf Deutsch, Französisch und Englisch. Spontan vorbeikommen geht während der Öffnungszeiten ebenfalls, Walk-ins sind willkommen.

Ein kleiner Tipp für Spontane: Ohne Termin kostet der Herren Haarschnitt 35 statt 40 Franken und das GYAN Classic Paket 60 statt 65 Franken. Mit Termin bezahlst du etwas mehr, hast dafür aber deine feste Zeit und musst nicht warten, falls gerade viel los ist. Im Salon arbeiten Zana und Hikmet, online buchbar ist im Moment Zana.

Wohnst du im Zentrum von Lyss oder im Nachbardorf Studen? Dann findest du auch Seiten für [Lyss](seo:lyss) und Studen.`,
      fr: `## Un village avec la gare à deux pas

Depuis 2011, Busswil fait partie de la commune de Lyss, mais il a gardé son caractère : un village du Seeland entouré de champs, avec sa propre gare sur la ligne entre Lyss et Bienne. C'est justement cette gare qui rend le trajet jusqu'au coiffeur si simple. Tu vas au quai à pied ou à vélo, tu montes dans le RER et tu arrives à Bienne sans changement.

Le trajet passe par Brügg. À la gare de Bienne, tu descends et tu marches quelques minutes jusqu'à la Zentralstrasse 22. Pas de place de parc à chercher.

## Fin de journée à Bienne, coupe comprise

Si tu habites Busswil et que tu travailles ou étudies à Bienne, tu passes de toute façon par la gare. Autant glisser le coiffeur sur le chemin du retour. Le jeudi et le vendredi, on est là jusqu'à 20 h, du lundi au mercredi jusqu'à 19 h. Une [coupe homme](service:haarschnitt-biel) dure environ 20 minutes, la [formule GYAN Classic](service:haarschnitt-und-bart) avec coupe et barbe environ 30 minutes. Ensuite, tu prends le prochain RER pour Busswil.

Le samedi, on ouvre dès 8 h 30 et on ferme à 18 h. Le dimanche, le salon est fermé.

## Cheveux, barbe et un moment pour toi

Chez GYAN, chaque rendez-vous commence par un court conseil. Ensuite, on travaille aux ciseaux et à la tondeuse, et on trace les contours de la barbe au rasoir. Pour te faire plaisir, réserve le rasage à la serviette chaude : rasage traditionnel avec mousse, serviette chaude et soin. Et si tu veux apprendre à refaire ta coiffure toi-même, le GYAN Signature Cut est fait pour toi : après la coupe, on te coiffe et on te montre quel produit utiliser et comment.

Tu t'installes dans un fauteuil en cuir brun, sous un tapis persan rouge accroché au mur. Paiement en espèces, par carte ou avec TWINT.

## Réserver ou passer spontanément

Pour un créneau fixe, [réserve en ligne](page:booking) : la confirmation est immédiate et tu peux prévoir le bon RER. Le site et la réservation existent en allemand, en français et en anglais. Tu peux aussi passer sans rendez-vous pendant les heures d'ouverture.

Un petit conseil si tu es spontané : sans rendez-vous, la coupe homme coûte 35 francs au lieu de 40, et la formule GYAN Classic 60 francs au lieu de 65. Avec rendez-vous, tu paies un peu plus, mais tu as ton heure fixe et tu n'attends pas s'il y a du monde. Au salon travaillent Zana et Hikmet, et pour l'instant, c'est Zana qu'on peut réserver en ligne.

Tu habites au centre de Lyss ou dans le village voisin de Studen ? Il y a aussi des pages pour [Lyss](seo:lyss) et Studen.`,
      en: `## A village with the station on its doorstep

Busswil has been part of Lyss since 2011, but it has kept its own character: a Seeland village surrounded by fields, with its own station on the line between Lyss and Biel. That station is what makes getting to the barber so easy. Walk or cycle to the platform, hop on the S-Bahn and you're in Biel without changing.

The ride runs via Brügg into town. Get off at Biel station and walk a few minutes to Zentralstrasse 22. No parking to worry about.

## After work in Biel, haircut included

If you live in Busswil and work or study in Biel, you pass through Biel station anyway. So why not fit the barber into your trip home? We're open until 8pm on Thursdays and Fridays, and until 7pm Monday to Wednesday. A [men's haircut](service:haarschnitt-biel) takes about 20 minutes, the [GYAN Classic package](service:haarschnitt-und-bart) with haircut and beard about 30. Then you catch the next S-Bahn back to Busswil.

On Saturdays we open at 8:30am and close at 6pm. The salon is closed on Sundays.

## Hair, beard and a moment for yourself

Every appointment at GYAN starts with a short consultation. Then we work with scissors and clippers, and shape your beard lines with the razor. If you want a treat, book the hot towel shave: a wet shave with lather, hot towel and aftercare. And if you'd like to recreate your look at home, the GYAN Signature Cut is the one. After the cut we style your hair and show you which product to use and how.

You'll sit in a brown leather chair, with a red Persian carpet on the wall. Pay in cash, by card or with TWINT.

## Book ahead or just drop in

To lock in a time, [book online](page:booking) and get instant confirmation, so you can plan the right train. The website and booking are available in German, French and English. Walk-ins are welcome during opening hours too.

A quick tip if you like to be spontaneous: without an appointment, the men's haircut costs CHF 35 instead of 40, and the GYAN Classic package CHF 60 instead of 65. Booking costs a little more, but you get a fixed time and won't have to wait if it's busy. Zana and Hikmet both work in the salon, and for now Zana is the one you can book online.

Live in central Lyss or next door in Studen? There are pages for [Lyss](seo:lyss) and Studen as well.`,
    },
    neighbors: ["lyss", "studen", "aegerten"],
    carMin: 20,
    transit: {
      de: "Mit der S-Bahn fährst du vom Bahnhof Busswil über Brügg direkt zum Bahnhof Biel und gehst von dort wenige Minuten zum Salon.",
      fr: "Le RER te mène de la gare de Busswil, via Brügg, directement à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the S-Bahn from Busswil station via Brügg straight to Biel station, then walk a few minutes to the salon.",
    },
    services: ["haarschnitt-und-bart", "nassrasur-biel", "gyan-signature"],
    faq: {
      de: [
        { q: "Brauche ich aus Busswil ein Auto, um zu GYAN zu kommen?", a: "Nein. Busswil hat einen eigenen Bahnhof, und die S-Bahn fährt über Brügg direkt nach Biel. Vom Bahnhof Biel sind es nur wenige Gehminuten zur Zentralstrasse 22." },
        { q: "Passt ein Termin auf dem Heimweg nach Busswil?", a: "Ja, donnerstags und freitags haben wir bis 20 Uhr geöffnet. Ein Haarschnitt dauert rund 20 Minuten, das GYAN Classic Paket mit Bart rund 30 Minuten, danach nimmst du die S-Bahn zurück nach Busswil." },
        { q: "Kann ich aus Busswil auch online auf Französisch buchen?", a: "Die Website und die Online-Buchung gibt es auf Deutsch, Französisch und Englisch. Die Bestätigung deines Termins kommt sofort." },
      ],
      fr: [
        { q: "Ai-je besoin d'une voiture pour venir de Busswil chez GYAN ?", a: "Non. Busswil a sa propre gare et le RER rejoint directement Bienne via Brügg. De la gare de Bienne, il n'y a que quelques minutes à pied jusqu'à la Zentralstrasse 22." },
        { q: "Un rendez-vous sur le chemin du retour vers Busswil, c'est possible ?", a: "Oui, le jeudi et le vendredi, on est ouverts jusqu'à 20 h. Une coupe dure environ 20 minutes, la formule GYAN Classic avec barbe environ 30 minutes, puis tu reprends le RER pour Busswil." },
        { q: "Depuis Busswil, puis-je réserver en ligne en français ?", a: "Oui, le site et la réservation en ligne existent en allemand, en français et en anglais. La confirmation de ton rendez-vous est immédiate." },
      ],
      en: [
        { q: "Do I need a car to get from Busswil to GYAN?", a: "No. Busswil has its own station and the S-Bahn runs via Brügg straight to Biel. From Biel station it's just a few minutes' walk to Zentralstrasse 22." },
        { q: "Can I fit an appointment in on the way home to Busswil?", a: "Yes, we're open until 8pm on Thursdays and Fridays. A haircut takes about 20 minutes, the GYAN Classic package with beard about 30, and then you catch the S-Bahn back to Busswil." },
        { q: "Can I book in English or French from Busswil?", a: "Yes, the website and online booking are available in German, French and English. Your appointment is confirmed instantly." },
      ],
    },
  },

  // ───────────────────────────── ORVIN ─────────────────────────────
  {
    key: "orvin",
    name: { de: "Orvin", fr: "Orvin", en: "Orvin" },
    slug: { de: "coiffeur-orvin", fr: "coiffeur-orvin", en: "barber-orvin" },
    km: 8,
    title: {
      de: "Coiffeur für Orvin & Frinvillier – Biel | GYAN",
      fr: "Coiffeur près d'Orvin – coiffeur homme Bienne | GYAN",
      en: "Barber near Orvin – men's cuts in Biel | GYAN",
    },
    description: {
      de: "Coiffeur für Orvin: über Frinvillier oder Leubringen nach Biel zu GYAN. Haar und Bart im Classic Paket oder Nassrasur. Online buchen, auch auf Französisch.",
      fr: "Coiffeur pour Orvin : par Frinvillier ou Evilard jusqu'à GYAN à Bienne. Coupe et barbe, rasage à la serviette chaude. Réserve en ligne, en français.",
      en: "Barber for Orvin: drive via Frinvillier or Evilard to GYAN in Biel. Hair and beard package or hot towel shave. Book online in French, German or English.",
    },
    h1: {
      de: "Herrencoiffeur für Orvin und Frinvillier",
      fr: "Coiffeur homme près d'Orvin et Frinvillier",
      en: "Barber near Orvin and Frinvillier",
    },
    intro: {
      de: "Orvin, auf Deutsch Ilfingen, liegt in einem Juratal rund acht Kilometer nördlich von Biel. Über Frinvillier oder Leubringen bist du in etwa einer Viertelstunde bei GYAN an der Zentralstrasse 22.",
      fr: "Orvin se niche dans un vallon jurassien à environ huit kilomètres au nord de Bienne. Par Frinvillier ou Evilard, tu es chez GYAN à la Zentralstrasse 22 en un quart d'heure environ.",
      en: "Orvin, Ilfingen in German, lies in a Jura valley about eight kilometres north of Biel. Via Frinvillier or Evilard you'll reach GYAN on Zentralstrasse 22 in roughly a quarter of an hour.",
    },
    body: {
      de: `## Ein Juratal gleich hinter dem Hausberg

Orvin, auf Deutsch Ilfingen, ist ein französischsprachiges Dorf im Berner Jura. Es liegt in einem Tal nördlich von Biel, hinter dem Hang, an dem Leubringen und Magglingen liegen. Rund um das Dorf gibt es Wiesen, Weiden und Wald, und oberhalb liegen die Prés-d'Orvin, eine offene Hochfläche, die zum Wandern und im Winter zum Langlaufen einlädt. Obwohl das Tal sich ländlich anfühlt, ist Biel das nächste Zentrum, für Arbeit, Einkauf und vieles mehr. Der Bahnhof, die Läden der Innenstadt und viele Arbeitsplätze liegen unten in der Stadt, und so führt der Weg fast automatisch regelmässig hinunter.

## Zwei Strassen hinunter in die Stadt

Von Orvin aus hast du zwei Wege nach Biel. Der eine führt durch das Tal hinunter nach Frinvillier, auf Deutsch Friedliswart, und von dort durch die Taubenlochschlucht in den Osten der Stadt. Die Strasse durch die Schlucht ist zugleich die Verbindung Richtung Sonceboz. Der andere führt über die Höhe nach Leubringen und dann den Hang hinunter ins Zentrum. Für die rund acht Kilometer solltest du je nach Weg und Verkehr etwa eine Viertelstunde einrechnen. In der Innenstadt parkierst du in einem öffentlichen Parkhaus.

Ohne Auto fährst du mit dem Bus hinunter nach Biel bis zum Bahnhof. Von dort sind es wenige Gehminuten bis zur Zentralstrasse 22.

## Haar und Bart in einem Besuch

Wer extra aus dem Tal herunterfährt, will den Termin gut nutzen. Im [GYAN Classic Paket](service:haarschnitt-und-bart) bekommst du Haarschnitt und Bart zusammen in rund 30 Minuten. Trägst du keinen Bart, sondern willst eine richtig glatte Rasur, ist die [Bart Rasur mit heissem Tuch](service:nassrasur-biel) das Richtige: Schaum, Klinge und Pflege in etwa 20 Minuten. Und wenn du nach dem Schnitt wissen willst, wie du die Frisur zu Hause hinbekommst, zeigt dir der [GYAN Signature Cut](service:gyan-signature) in rund 25 Minuten, welches Produkt und welche Handgriffe passen.

## Auf Französisch buchen, in Biel geniessen

Für viele in Orvin ist Französisch die Alltagssprache. Unsere Website und die [Online-Buchung](page:booking) gibt es deshalb auf Französisch, Deutsch und Englisch, und die Bestätigung kommt sofort. Du kannst aber auch ohne Termin vorbeikommen, während der Öffnungszeiten sind Walk-ins willkommen.

Geöffnet ist von Montag bis Mittwoch von 9 bis 19 Uhr, am Donnerstag und Freitag bis 20 Uhr und am Samstag von 8.30 bis 18 Uhr. Am Sonntag bleibt der Salon zu. Drinnen erwarten dich braune Lederstühle und ein roter Perserteppich an der Wand. Bezahlt wird bar, mit Karte oder mit TWINT.`,
      fr: `## Un vallon jurassien juste derrière la montagne

Orvin, Ilfingen en allemand, est un village francophone du Jura bernois. Il se niche dans un vallon au nord de Bienne, derrière le versant où se trouvent Evilard et Macolin. Autour du village, des prés, des pâturages et des forêts, et plus haut les Prés-d'Orvin, un vaste plateau ouvert idéal pour la randonnée et, en hiver, pour le ski de fond. Même si le vallon a un air bien campagnard, Bienne reste le centre le plus proche pour le travail, les courses et le reste. La gare, les commerces du centre-ville et de nombreux emplois se trouvent en bas, si bien que le chemin y mène presque naturellement, et régulièrement.

## Deux routes pour descendre en ville

Depuis Orvin, deux chemins mènent à Bienne. Le premier descend le vallon jusqu'à Frinvillier, puis traverse les gorges du Taubenloch pour arriver dans l'est de la ville. Cette route des gorges est aussi l'axe vers Sonceboz. Le second passe par les hauteurs jusqu'à Evilard, puis descend le coteau vers le centre. Pour les quelque huit kilomètres, compte environ un quart d'heure selon l'itinéraire et la circulation. Au centre, tu te gares dans un parking public.

Sans voiture, tu prends le bus jusqu'à la gare de Bienne. De là, la Zentralstrasse 22 est à quelques minutes à pied.

## Cheveux et barbe en une seule visite

Quand on descend exprès du vallon, autant bien profiter du rendez-vous. Avec la [formule GYAN Classic](service:haarschnitt-und-bart), tu as coupe et barbe ensemble en une trentaine de minutes. Tu ne portes pas la barbe mais tu veux un visage vraiment net ? Le [rasage à la serviette chaude](service:nassrasur-biel) est fait pour toi : mousse, lame et soin en environ 20 minutes. Et si tu veux savoir comment refaire ta coiffure à la maison, le [GYAN Signature Cut](service:gyan-signature) te montre le bon produit et les bons gestes.

## Réserver en français, profiter à Bienne

À Orvin, le français est la langue du quotidien. C'est pourquoi notre site et la [réservation en ligne](page:booking) existent en français, en allemand et en anglais, avec une confirmation immédiate. Tu peux aussi passer sans rendez-vous : pendant les heures d'ouverture, les clients spontanés sont les bienvenus.

Le salon est ouvert du lundi au mercredi de 9 h à 19 h, le jeudi et le vendredi jusqu'à 20 h, et le samedi de 8 h 30 à 18 h. Fermé le dimanche. À l'intérieur t'attendent des fauteuils en cuir brun et un tapis persan rouge au mur. Paiement en espèces, par carte ou avec TWINT.`,
      en: `## A Jura valley just over the hill

Orvin, Ilfingen in German, is a French-speaking village in the Bernese Jura. It lies in a valley north of Biel, behind the slope where Evilard and Magglingen sit. Around the village there are meadows, pastures and forest, and above it lie the Prés-d'Orvin, an open upland that's great for hiking and, in winter, for cross-country skiing. The valley feels rural, but Biel is still the nearest centre for work, shopping and much else. The station, the city-centre shops and plenty of jobs are all down in town, so the road leads there almost by itself, and often.

## Two roads down into town

From Orvin, two routes lead to Biel. One runs down the valley to Frinvillier, Friedliswart in German, and on through the Taubenloch gorge into the east of the city. The gorge road is also the main link towards Sonceboz. The other climbs over to Evilard and then drops down the slope into the centre. Allow about a quarter of an hour for the roughly eight kilometres, depending on route and traffic. In the centre you can park in a public car park.

Without a car, take the bus down to Biel station. From there it's a few minutes' walk to Zentralstrasse 22.

## Hair and beard in one visit

If you're coming down from the valley specially, you'll want to make the most of it. The [GYAN Classic package](service:haarschnitt-und-bart) gets you haircut and beard together in about 30 minutes. No beard, but after a properly smooth face? The [hot towel shave](service:nassrasur-biel) is your pick: lather, blade and aftercare in about 20 minutes. And if you want to know how to style your hair at home afterwards, the [GYAN Signature Cut](service:gyan-signature) shows you the right product and technique in about 25 minutes.

## Book in French, enjoy it in Biel

In Orvin, French is the everyday language. That's why our website and [online booking](page:booking) are available in French, German and English, with instant confirmation. You can also just drop in, since walk-ins are welcome during opening hours.

We're open Monday to Wednesday from 9:00 to 19:00, Thursday and Friday until 20:00, and Saturday from 8:30 to 18:00. Closed on Sundays. Inside, brown leather chairs and a red Persian carpet on the wall are waiting for you. Pay in cash, by card or with TWINT.`,
    },
    neighbors: ["evilard", "magglingen"],
    carMin: 15,
    transit: {
      de: "Mit dem Bus von Orvin hinunter nach Biel bis zum Bahnhof, dann wenige Minuten zu Fuss zum Salon.",
      fr: "En bus d'Orvin jusqu'à la gare de Bienne, puis quelques minutes à pied jusqu'au salon.",
      en: "Take the bus from Orvin down to Biel station, then it is a few minutes on foot to the salon.",
    },
    services: ["haarschnitt-und-bart", "nassrasur-biel", "gyan-signature"],
    faq: {
      de: [
        { q: "Welche Strasse nehme ich von Orvin nach Biel?", a: "Du fährst entweder über Frinvillier hinunter nach Biel oder über Leubringen. Für die rund acht Kilometer solltest du etwa eine Viertelstunde einrechnen." },
        { q: "Ist die Website auch für Kunden aus Orvin auf Französisch?", a: "Ja, Website und Online-Buchung gibt es auf Französisch, Deutsch und Englisch. Du kannst deinen Termin also in deiner Sprache buchen und bekommst sofort eine Bestätigung." },
        { q: "Passt ein Termin für Haar und Bart, wenn ich von Orvin nur kurz nach Biel fahre?", a: "Ja, das GYAN Classic Paket mit Haarschnitt und Bart dauert rund 30 Minuten. Mit einer Online-Buchung weisst du vorher genau, wann du dran bist." },
      ],
      fr: [
        { q: "Quelle route prendre d'Orvin à Bienne ?", a: "Tu descends soit par Frinvillier, soit par Evilard. Pour les quelque huit kilomètres, compte environ un quart d'heure." },
        { q: "Le site est-il en français pour les clients d'Orvin ?", a: "Oui, le site et la réservation en ligne existent en français, en allemand et en anglais. Tu réserves donc dans ta langue et reçois une confirmation immédiate." },
        { q: "Un rendez-vous cheveux et barbe, c'est faisable si je descends d'Orvin juste pour ça ?", a: "Oui, la formule GYAN Classic avec coupe et barbe dure environ 30 minutes. En réservant en ligne, tu sais à l'avance quand c'est ton tour." },
      ],
      en: [
        { q: "Which road do I take from Orvin to Biel?", a: "You can drive down either via Frinvillier or via Evilard. Allow about a quarter of an hour for the roughly eight kilometres." },
        { q: "Is the website available in French for people from Orvin?", a: "Yes, the website and online booking are available in French, German and English. So you can book in your own language and get instant confirmation." },
        { q: "Does a hair and beard appointment work if I come down from Orvin just for that?", a: "Yes, the GYAN Classic package with haircut and beard takes about 30 minutes. Booking online means you know in advance exactly when it's your turn." },
      ],
    },
  },
];
