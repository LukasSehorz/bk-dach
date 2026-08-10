#!/usr/bin/env bash
# Skaliert alle Originale nach WebP in mehreren Breiten und schneidet die
# quadratischen Detailmotive aus vorhandenen Aufnahmen.
set -u
cd "$(dirname "$0")/../demo/assets" || exit 1
SRC=img-orig
OUT=img
mkdir -p "$OUT"

wide() {  # name, breiten…
  local n=$1; shift
  for w in "$@"; do
    ffmpeg -y -loglevel error -i "$SRC/$n.png" \
      -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 80 "$OUT/$n-$w.webp"
  done
}

# Querformat 3:2
for n in lst-flachdach lst-begruenung lst-sanierung lst-steildach lst-spenglerei lst-service fahrzeug; do
  wide "$n" 1200 760
done

# Projektbänder – volle Breite
for n in work-wohnanlage work-gewerbehalle work-stadthaus; do
  wide "$n" 1800 1200 760
done

# Hochformat 2:3 für die Hero-Masken
for n in hero-steildach hero-flachdach; do
  wide "$n" 1100 700
done

# Quadratische Detailmotive aus vorhandenen Aufnahmen schneiden
crop_sq() { # quelle, ziel, cropfilter
  ffmpeg -y -loglevel error -i "$SRC/$1.png" -vf "$3,scale=760:760:flags=lanczos" \
    -c:v libwebp -quality 82 "$OUT/$2-760.webp"
  ffmpeg -y -loglevel error -i "$SRC/$1.png" -vf "$3,scale=520:520:flags=lanczos" \
    -c:v libwebp -quality 80 "$OUT/$2-520.webp"
}
# jeweils ein quadratischer Ausschnitt aus der Bildmitte bzw. leicht versetzt
crop_sq hero-steildach   detail-ziegel     "crop=in_h:in_h:(in_w-in_h)/2:0"
crop_sq lst-begruenung   detail-gruendach  "crop=in_h:in_h:(in_w-in_h)*0.25:0"
crop_sq lst-spenglerei   detail-spengler   "crop=in_h:in_h:(in_w-in_h)*0.6:0"

ls -la "$OUT" | tail -40
echo "---"
du -sh "$OUT"
