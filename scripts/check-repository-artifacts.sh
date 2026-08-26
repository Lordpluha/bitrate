#!/usr/bin/env bash

set -euo pipefail

readonly max_file_bytes=$((5 * 1024 * 1024))
violations=()

while IFS= read -r -d '' file; do
  [[ -f "$file" ]] || continue

  size=$(stat -c '%s' -- "$file")
  if [[ "$file" == output/playwright/* || "$file" == pencil/* ]]; then
    violations+=("$file: generated output directory is forbidden")
  fi
  if [[ "$file" =~ (^|/)generated-[0-9]{10,}\.(png|jpg|jpeg|webp)$ ]]; then
    violations+=("$file: timestamp-named generated image is forbidden")
  fi
  size_exempt=false
  if [[ "$file" == apps/web-artists/public/carousel/video/*.webm ]]; then
    size_exempt=true
  elif [[ "$file" == apps/web-player/public/images/default-playlist.jpg ]]; then
    size_exempt=true
  fi
  if (( size > max_file_bytes )) && [[ "$size_exempt" == false ]]; then
    violations+=("$file: $size bytes exceeds the $max_file_bytes-byte limit")
  fi
done < <(git ls-files -z)

if (( ${#violations[@]} > 0 )); then
  echo 'Repository artifact policy failed:' >&2
  printf -- '- %s\n' "${violations[@]}" >&2
  exit 1
fi

echo 'Repository artifact policy passed'
