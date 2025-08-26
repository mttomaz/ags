#!/bin/bash

[[ -f "$1" ]] && swww img "$1" --transition-type wipe \
  --transition-fps 60 --transition-duration 1.5
