#!/bin/sh
# Renders both orientations, then encodes web-sized loops + posters into out/.
# Height is capped at 1080: many Android decoders top out at 1920x1088 and don't swap axes for portrait.
set -e
scale="scale=-2:'min(1080,ih)'"
mkdir -p out/tmp
for comp in Landscape Portrait; do
  name=$(echo "$comp" | tr '[:upper:]' '[:lower:]')
  npx remotion render src/index.ts "$comp" "out/tmp/$name-master.mp4" --codec=h264 --crf=12 --log=error
  ffmpeg -y -loglevel error -i "out/tmp/$name-master.mp4" -vf "$scale" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an "out/hero-$name.mp4"
  ffmpeg -y -loglevel error -i "out/tmp/$name-master.mp4" -vf "$scale" -c:v libvpx-vp9 -crf 40 -b:v 0 -row-mt 1 -an "out/hero-$name.webm"
  npx remotion still src/index.ts "$comp" "out/poster-$name.jpg" --frame=150 --image-format=jpeg --jpeg-quality=80 --log=error
done
mkdir -p ../site/src/media && cp out/hero-* out/poster-* ../site/src/media/
