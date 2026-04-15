#!/bin/bash
set -euo pipefail

gjs_pid=""
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"

start() {
  pkill -x dunst || true
  pkill -x gjs || true
  "$SCRIPT_DIR/app" &
  gjs_pid=$!
}

cleanup() {
  kill "$gjs_pid" 2>/dev/null
  exit 0
}

trap cleanup INT TERM EXIT

start

wait -n "$gjs_pid"
cleanup
