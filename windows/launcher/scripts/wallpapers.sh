#!/bin/bash

WALLPAPERS_PATH="$HOME/Pictures/wallpapers/"

find "$WALLPAPERS_PATH" -type f -iname "*.jpg" \
  | jq -Rn '
    [ inputs
      | {
          path: .,
          name: (
            .
            | gsub(".*/"; "")
            | sub("\\.[Jj][Pp][Ee]?[Gg]$"; "")
            | sub("[-_ ]?\\((FHD|QHD|4K|custom)\\)$"; "")
          )
        }
    ]
  '

