#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
MAX_AUTORESTARTS=1
restart_count=0

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Error: frontend directory not found at $FRONTEND_DIR" >&2
  exit 1
fi

cleanup() {
  cd "$ROOT_DIR"
}
trap cleanup EXIT
handle_sigint() {
  # Allow the child process to handle Ctrl+C while keeping this wrapper alive
  :
}
trap handle_sigint SIGINT

cd "$FRONTEND_DIR"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found. Installing dependencies..."
  npm install
fi

while true; do
  echo "Starting Vite dev server (restart ${restart_count}/${MAX_AUTORESTARTS})..."
  if npm run dev; then
    break
  else
    exit_status=$?
  fi

  if [[ $exit_status -eq 130 && $restart_count -lt $MAX_AUTORESTARTS ]]; then
    ((restart_count++))
    echo "Ctrl+C detected. Restarting dev server automatically ($restart_count/$MAX_AUTORESTARTS). Press Ctrl+C again to exit."
    continue
  elif [[ $exit_status -eq 130 ]]; then
    echo "Ctrl+C detected. Exiting wrapper after reaching restart limit."
    break
  else
    echo "Dev server exited with status $exit_status. Exiting wrapper."
    break
  fi

done

echo "Dev helper script finished. Returned to $ROOT_DIR."
