# BK-Dach GmbH — Demo-Website

Gestaltungsentwurf für das Erstgespräch. Vorbild ist **klindworthroofing.com**: Aufbau,
Sektionsfolge, Farbrhythmus und Bewegung sind 1:1 übernommen, angepasst sind Inhalte,
Bilder und die Farbwelt (der Kunde will ein dunkles Layout mit dem Firmenblau).

## Ansehen

```
node tools/serve.js      →  http://localhost:4173/
```

Ohne Server funktioniert die Seite auch per Doppelklick auf `demo/index.html`, dann können
je nach Browser die lokalen Schriften blockiert werden.

## Seiten

| Datei | Inhalt |
|---|---|
| `demo/index.html` | Landingpage, folgt der Referenz Abschnitt für Abschnitt |
| `demo/leistungen.html` | die sechs Leistungen, je mit Bild und Erklärtext |
| `demo/referenzen.html` | drei Projekte mit Projektdaten |
| `demo/kontakt.html` | Kontaktdaten, Zeiten, Ansprechpartner — **kein Formular** |
| `demo/impressum.html`, `demo/datenschutz.html` | Rechtstexte |

## Wo was liegt

```
demo/assets/css/site.css      Designsystem, Farben, Bewegung
demo/assets/js/site.js        Auftritte, Parallax, Menü, Karussells
demo/assets/js/lenis.min.js   weiches Scrollen (wie die Referenz)
demo/assets/fonts/            Satoshi + Zodiak, lokal
demo/assets/img/              ausgelieferte WebP in mehreren Breiten
demo/assets/img-orig/         Originale aus der Bildgenerierung, nicht ausgeliefert

analyse/                      alles von bkdach.com: Texte, Screenshots, Farben
referenz-klindworth/          Screenshots und Theme-Quellen der Referenz
qa/                           Prüfbilder, Frame-Vergleiche Referenz ↔ Umsetzung
tools/                        Server, Screenshot- und Prüfskripte
PRODUCT.md, DESIGN.md         Briefing und Designsystem
```

## Prüfen

```
node tools/qa.js v1        Overflow, Konsolenfehler, fehlende Bilder, alle Seiten, 1440 + 390
node tools/reduced.js      sichtbar ohne JavaScript und bei reduzierter Bewegung
node tools/links.js        interne Verweise und verwaiste Assets
node tools/frames.js <url> <praefix>   Bilder bei gleicher relativer Scrolltiefe
```

## Offene Punkte für das Gespräch

- **Bilder**: alle 12 Motive sind KI-generiert (kie.ai, gpt-image-2) und zeigen kein
  tatsächlich ausgeführtes Projekt. Für die echte Seite brauchen wir Fotos vom Betrieb.
  Das kie.ai-Guthaben war nach 12 Motiven aufgebraucht.
- **Projektdaten** (Namen, Flächen, Jahre, Bauherren) und **Kundenstimmen** sind Platzhalter.
- **Einsatzgebiete** im Fuß sind ein Vorschlag.
- Der Firmenwagen trägt ein nachträglich einmontiertes Logo.
- Die beiden großen Sektionswörter heißen **REFERENZEN** und **ÜBER UNS**. Ihre Größe steht
  je Wort im Inline-Stil `--huge` und ist so eingemessen, dass beide auf jeder Fensterbreite
  den Satzspiegel exakt von Rand zu Rand füllen.

Alle Firmendaten — Name, Anschrift, Telefon, E-Mail, Geschäftsführer, Leistungen,
Geschäftszeiten, Register- und Steuernummer, 30 Jahre, über 200 Projekte, rund 15
Mitarbeitende — stammen unverändert von bkdach.com.
