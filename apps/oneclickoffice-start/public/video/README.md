# Videodatei

`oneclick-office.mp4` — das Verkaufsvideo, eingebunden über
`video.source.src` in `src/lib/content.ts`.

## Wie die aktuelle Datei entstanden ist

Original: `OneClickOffice VSL V2.mp4`, 384 MB, 1920×1080 mit 8 Mbit/s und
schwarzen Balken (oben 36 px, unten 124 px).

Daraus wurde:

```bash
ffmpeg -i "OneClickOffice VSL V2.mp4" \
  -vf "crop=1920:920:0:36" \
  -c:v libx264 -crf 24 -preset medium -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 96k -ac 2 \
  -movflags +faststart -y oneclick-office.mp4
```

Ergebnis: **16 MB** statt 384 MB, ohne sichtbaren Qualitätsverlust (der Inhalt
ist überwiegend statischer Text auf dunklem Grund und komprimiert entsprechend
gut). Die drei entscheidenden Teile:

- `crop=1920:920:0:36` schneidet die schwarzen Balken weg. Das Seitenverhältnis
  ist deshalb **nicht** 16:9 — es steht als `VIDEO_ASPECT_RATIO` in `content.ts`
  und wird von Player und Startbild verwendet.
- `-crf 24` steuert die Qualität (kleiner = besser und grösser; 18–28 ist der
  sinnvolle Bereich).
- `-movflags +faststart` schiebt den Index an den Dateianfang, damit die
  Wiedergabe sofort startet statt erst nach dem vollständigen Laden.

## Bei einem neuen Videoschnitt

1. Balken neu vermessen: `ffmpeg -i neu.mp4 -vf cropdetect -frames:v 24 -f null -`
2. Mit dem Befehl oben komprimieren (Crop-Werte anpassen).
3. `VIDEO_ASPECT_RATIO` in `src/lib/content.ts` auf das neue Format setzen.
4. Startbild neu ziehen: `./scripts/poster.sh <sekunde>`
5. Laufzeit in `content.ts` bei `optin.poster.duration` anpassen.

Bleibt die Datei deutlich unter 50 MB, kann sie im Repository liegen. Wird sie
grösser, besser über einen externen Host oder ein CDN ausliefern — GitHub
blockiert Einzeldateien über 100 MB.
