# Hoag Interview Prep

This repository hosts the prep assets for the Hoag interview exercise. The `frontend/` directory contains a minimal React + TypeScript + Vite app, and the repo root now includes a helper script to streamline local development.

## Quick Start

```bash
./run-dev.sh
```

- The script automatically changes into `frontend/`, installs dependencies if needed, and runs `npm run dev`.
- When you press `Ctrl+C`, the dev server stops and immediately restarts once so you can recover from accidental interrupts.
- Press `Ctrl+C` again during the second run to exit completely; the script returns to the repo root even though it temporarily `cd`s into `frontend/`.

If you prefer to run commands manually, you can still `cd frontend && npm install && npm run dev`.
