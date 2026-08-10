# DESIGN.md — BK-Dach GmbH Demo

## Welt

Ein Dach ist eine Schräge. Die ganze Seite baut auf dieser einen Geste auf: die **45°-Diagonale**
aus dem Firmenlogo. Sie schneidet das Hero-Bild, sie trennt die Sektionen, sie führt den Blick.
Nichts ist abgerundet, nichts schwebt in Karten. Zwei dunkle Sektionstöne im Wechsel, große
Serifen-Versalien, sehr viel Ruhe — der Ton eines Architekturbüros, nicht eines Handwerkerportals.

**Vorbild: klindworthroofing.com.** Aufbau, Sektionsfolge, Farbrhythmus und Bewegung sind 1:1
übernommen. Angepasst sind nur Inhalte, Bilder und die Farbwelt.

## Farben

Die Referenz wechselt zwischen `#24262b` (dunkel) und `#ede9e2` (beige). Dieser Entwurf übernimmt
denselben Wechsel, nur beide Töne dunkel — der Kundenwunsch ist ein dunkles Layout.

| Token | Hex | Rolle |
|---|---|---|
| `--ink` | `#121519` | dunkles Band — entspricht `bg-black` der Referenz |
| `--graphite` | `#3A424E` | helles Band — entspricht `bg-beige` der Referenz |
| `--fg` | `#E9EDF1` | Fließtext, Überschriften |
| `--fg-2` | `#AEB7C2` | Sekundärtext |
| `--fg-3` | `#8E97A3` (auf `--graphite`: `#A6AEB9`) | Labels |
| `--accent` | `#52A5DB` | **Firmenblau** aus dem Logo |
| `--accent-2` / `--accent-3` | `#A3C7E9` / `#C4DAF1` | die helleren Logo-Bänder |

Jede `bg-graphite`-Sektion trägt zusätzlich eine Haarlinie an Ober- und Unterkante, damit die
Kapitelgrenze auch dann sitzt, wenn der Helligkeitsunterschied allein nicht trägt.

**Sektionsfolge der Startseite** (identisch zur Referenz):
Hero `graphite` → Was wir machen `ink` → Referenzen + Projektbänder `ink` → Leistungen `graphite`
→ Vollbild Firmenwagen → Stimmen `ink` → Zahlen `ink` → Telefon-CTA `ink` → Fußzeile `graphite`.

Blau wird sparsam gesetzt: vertikales Label, ein Wort in der H1, Pfeile, die Leistungszeile im
Projektband, die Kennzahlen. Nie als Fläche, nie als Verlauf, nie als Textverlauf.

## Typografie

Die Referenz nutzt Larken + Satoshi. Satoshi ist frei verfügbar und wird übernommen, für die
Display-Rolle steht **Zodiak** (gleiches Foundry, hoher Strichkontrast, scharfe Serifen).

| Rolle | Familie | Einsatz |
|---|---|---|
| Display | Zodiak Bold / Regular | H1, Sektionswörter, Projektnamen, Zitate, Telefonnummer |
| Text | Satoshi Regular / Medium / Bold | Fließtext, Navigation, Labels |

Die Sektionswörter füllen den Satzspiegel von Rand zu Rand und erreichen dieselbe Versalhöhe
wie in der Referenz (rund 265 px). Das geht nur mit kurzen Wörtern — **WERK** und **DANK**
statt „Referenzen" und „Stimmen", so wie die Referenz „WORK" und „KUDOS" setzt. Die Größe
steht je Wort in `--huge`.

Satzspiegel: Außenabstand `clamp(20px, 8.3vw, 120px)` wie in der Referenz.

## Bewegung

Die Grammatik ist aus der Referenz ausgelesen und nachgebaut:

| Baustein | Verhalten |
|---|---|
| Weiches Scrollen | **Lenis**, lokal eingebunden, auf Touch und bei reduzierter Bewegung aus |
| `data-animate="fade-up"` | `opacity 0 → 1`, `translateY(40px) → 0`, `ease .6s` |
| `data-animate="img"` | eine Fläche in der Sektionsfarbe liegt über dem Bild und fährt nach oben weg: `scaleY(1) → 0`, `cubic-bezier(.165,.84,.44,1) .6s` |
| `data-animate="words"` | Überschrift wird in Zeilen und Wörter zerlegt, Wörter steigen aus `translateY(200%)` auf, je Zeile 0,1 s versetzt |
| Auslöser | Elementoberkante ≤ Scrollposition + 85 % Fensterhöhe, einmalig |
| `data-parallax` | setzt `--parallax-percent` (0…1); Bilder laufen 12 % nach, Sektionswörter 45 % |
| Kennzahlen | zählen beim Erscheinen von 0 hoch, 1,4 s, weiches Auslaufen, einmalig |
| Angeheftetes Karussell | die Leistungs-Sektion klebt am oberen Rand, das senkrechte Scrollen schiebt die Reihe 1:1 waagerecht durch; danach läuft die Seite weiter |

Die Anheftung ist auf Schirmen unter 900 px und bei reduzierter Bewegung abgeschaltet — dort
bleibt es beim normalen Wischen. Während sie aktiv ist, sind Einrasten und Ziehen aus, und die
Pfeiltasten bewegen die Seite statt der Reihe.

Das Zerlegen der Überschriften passiert erst, wenn die Schriften geladen sind — sonst stimmen die
Zeilenumbrüche nicht. Ohne JavaScript ist alles sichtbar, `prefers-reduced-motion` schaltet
sämtliche Bewegung ab.

## Layout

Projektbänder in voller Viewporthöhe mit Innenabstand und leichter Überlappung (`-5 %`), Titel am
oberen Kartenrand. Leistungs-Karussell mit 4:3-Bildern, 130 px Spaltenabstand, läuft bis an den
Bildschirmrand, Pfeile im Zwischenraum. Der Intro-Block ist asymmetrisch eingerückt: vertikales
Label bei 18 % der Satzbreite, Text danach bis zum rechten Rand.

## Grenzen

Alle Bilder sind KI-generiert und zeigen keine ausgeführten Projekte. Projektnamen, Flächen,
Jahreszahlen und Kundenstimmen sind Platzhalter. Kein Kontaktformular — ausdrücklicher
Kundenwunsch. Das Logo auf dem Firmenwagen ist nachträglich einmontiert.
