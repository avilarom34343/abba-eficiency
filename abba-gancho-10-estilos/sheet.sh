#!/bin/sh
# sheet.sh <id> <out.jpg> — tiles the 8 preview stills of a style side by side
cd "$(dirname "$0")/out/preview" && ffmpeg -y -loglevel error $(for s in 0.6 2.2 3.4 4.8 6.3 7 7.8 9.4; do printf -- "-i $1-$s.png "; done) -filter_complex "$(for i in 0 1 2 3 4 5 6 7; do printf "[$i]scale=240:427[v$i];"; done)[v0][v1][v2][v3][v4][v5][v6][v7]hstack=8" "$2"
