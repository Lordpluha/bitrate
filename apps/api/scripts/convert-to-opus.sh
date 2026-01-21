#!/bin/bash

# Script to convert MP3 files to Opus format with CBR
# Usage: ./convert-to-opus.sh <input-file.mp3> [output-file.opus]

set -e

INPUT_FILE="$1"
OUTPUT_FILE="${2:-${INPUT_FILE%.mp3}.opus}"
BITRATE="128k"

if [ -z "$INPUT_FILE" ]; then
    echo "Usage: $0 <input-file.mp3> [output-file.opus]"
    echo "Example: $0 song.mp3"
    echo "Example: $0 song.mp3 converted.opus"
    exit 1
fi

if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: Input file '$INPUT_FILE' not found"
    exit 1
fi

echo "Converting: $INPUT_FILE"
echo "Output: $OUTPUT_FILE"
echo "Bitrate: $BITRATE CBR"

# Convert to Opus with CBR (VBR off)
# -c:a libopus - use Opus codec
# -b:a 128k - set bitrate to 128 kbps
# -vbr off - disable variable bitrate (use CBR)
# -application audio - optimize for music (not voip)
# -compression_level 10 - highest quality encoding

ffmpeg -i "$INPUT_FILE" \
    -c:a libopus \
    -b:a "$BITRATE" \
    -vbr off \
    -application audio \
    -compression_level 10 \
    -y \
    "$OUTPUT_FILE"

echo "✓ Conversion complete!"
echo "  Input size:  $(du -h "$INPUT_FILE" | cut -f1)"
echo "  Output size: $(du -h "$OUTPUT_FILE" | cut -f1)"
