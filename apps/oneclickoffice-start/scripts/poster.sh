#!/usr/bin/env bash
# Erzeugt das Startbild (public/video-poster.webp) aus einem Zeitpunkt des Videos.
#   ./scripts-poster.sh 262      → Bild bei Sekunde 262
# Braucht ffmpeg und cwebp (brew install ffmpeg webp).
set -euo pipefail
SEC="${1:-2}"
DIR="$(cd "$(dirname "$0")" && pwd)"
ffmpeg -v error -ss "$SEC" -i "$DIR/public/video/oneclick-office.mp4" \
  -frames:v 1 -vf "scale=1600:-2" -y /tmp/oco-poster.png
cwebp -quiet -q 82 /tmp/oco-poster.png -o "$DIR/public/video-poster.webp"
echo "Startbild aus Sekunde $SEC erzeugt: public/video-poster.webp"
