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

## Dev Logging Pipeline

- During development, every `console.log`/`info`/`warn`/`error` (plus window error events) is mirrored to the repo-root `system.log` file via `src/devLogger.ts` and a dev-only Vite middleware (`frontend/vite.config.ts`).
- Tail the log with `tail -f system.log` from the repo root—no more copying details out of the browser console.
- The logger only runs when `import.meta.env.DEV` is true, and `system.log` is ignored by Git so you never commit noisy diagnostics.
- To adjust verbosity or payload caps, call `configureDevLogger` before `installDevLogger` in `src/main.tsx`, for example:

```ts
import { configureDevLogger, installDevLogger } from './devLogger'

if (import.meta.env.DEV) {
  configureDevLogger({ levels: ['warn', 'error'], maxArgLength: 800 })
  installDevLogger()
}
```

- If the dev server rejects a payload (size/validation), the client falls back to a console warning so you can fine-tune the configuration.
