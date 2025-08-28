#!/bin/bash
set -euo pipefail

HYPRLAND_SOCKET="${XDG_RUNTIME_DIR}/hypr/${HYPRLAND_INSTANCE_SIGNATURE}/.socket2.sock"

gjs_pid=""

start() {
  pkill -x dunst || true
  pkill -x gjs || true
  "$HOME/.config/ags/app" &
  gjs_pid=$!
}

cleanup() {
  pkill -x socat  2>/dev/null
  kill "$gjs_pid" 2>/dev/null
  exit 0
}

monitor_added() {
  # INFO: https://github.com/Aylur/astal/issues/296
  case "$1" in
    monitoradded*) start ;;
  esac
}

trap cleanup INT TERM EXIT

start

while read -r line; do
  monitor_added "$line"
done < <(socat -u UNIX-CONNECT:"$HYPRLAND_SOCKET" -) &

wait -n "$gjs_pid"
cleanup
