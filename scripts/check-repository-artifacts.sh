#!/usr/bin/env bash

set -euo pipefail

readonly max_file_bytes=$((5 * 1024 * 1024))
violations=()

while IFS= read -r -d '' file; do
  [[ -f "$file" ]] || continue

  # `stat -c` is GNU-only; BSD/macOS needs `-f`. Keep the script runnable outside CI.
  size=$(stat -c '%s' -- "$file" 2>/dev/null || stat -f '%z' -- "$file")
  if [[ "$file" == output/playwright/* ]]; then
    violations+=("$file: generated output directory is forbidden")
  fi
  # Pencil files and the assets they reference are canonical design sources.
  # Some legacy Pencil assets retain editor-generated names because renaming them
  # would break references inside existing design documents.
  if [[ "$file" =~ (^|/)generated-[0-9]{10,}\.(png|jpg|jpeg|webp)$ ]] &&
    [[ "$file" != pencil/images/* ]]; then
    violations+=("$file: timestamp-named generated image is forbidden")
  fi
  size_exempt=false
  if [[ "$file" == apps/web-artists/public/carousel/video/*.webm ]]; then
    size_exempt=true
  elif [[ "$file" == apps/web-player/public/images/default-playlist.jpg ]]; then
    size_exempt=true
  elif [[ "$file" == pencil/*.pen || "$file" == pencil/*/*.pen ]]; then
    # Design documents can legitimately exceed the general source-file limit.
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
