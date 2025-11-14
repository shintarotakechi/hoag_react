# Statement of Work (SOW)

## Objective
Provide a development-only logging workflow that captures browser console activity and critical runtime errors into a repo-root `system.log`, so interviewers do not need to copy logs from the browser console. The solution must stay within the existing Vite + React stack (no new backend services).

## Scope of Work
1. **Dev Logging Pipeline Design**
   - Implement a client-side logging utility that wraps `console` methods during development, enriches entries with timestamps, log levels, and stack metadata, and POSTs them to the dev server only when `import.meta.env.DEV` is true.
   - Guard against null/undefined payloads, large objects, and serialization errors by performing runtime validation before sending.

2. **Vite Middleware for File Logging**
   - Build a custom Vite plugin that registers a middleware (e.g., `POST /__system-log`) via `configureServer`.
   - Ensure the middleware validates incoming payloads, appends formatted lines to `system.log` at the repo root, and rotates/creates the file if missing.
   - Include defensive logging for failures and terminate requests with descriptive HTTP errors when validation fails.

3. **Configuration & Developer Experience**y
   - Expose light configuration (log level toggles, max payload size) via a small module so future interview tasks can adjust behavior without touching the middleware.
   - Make sure production builds tree-shake out the logging shim to avoid shipping unnecessary network calls.

4. **Documentation & Governance**
   - Update `README.md` with instructions on tailing `system.log`, explaining the dev-only nature, and noting how to disable/adjust the logger.
   - Increment the project version (patch) and record the work in `CHANGELOG.md` plus `tasks.md`, capturing the original prompting context per governance rules.

5. **Verification**
   - Run `npm run dev` (via `run-dev.sh`) to confirm: console calls produce entries in `system.log`, malformed payloads are rejected with clear errors, and disabling the logger in production mode stops file writes.

## Out of Scope
- Introducing separate backend frameworks (Express/Fastify) or hosted logging services.
- Implementing advanced log rotation, compression, or multi-user authentication for the log endpoint.
- Instrumenting application-level analytics beyond console/error logging.

## Deliverables
- `system.log` file creation logic plus the custom Vite middleware plugin.
- Client logging utility integrated with the React app (or a development bootstrap file).
- Updated documentation, changelog, and task tracking with synchronized version numbers.
- Verification notes describing how the log file behaves during dev sessions.

## Assumptions & Dependencies
- Workflows run through `npm run dev` or `./run-dev.sh`, ensuring the middleware is active.
- Node.js filesystem access is available wherever the dev server runs (WSL/macOS/Linux).
- Developers tail `system.log` directly; no UI viewer is required yet.

## Risks
- Excessive logging could bloat `system.log`; mitigated by enforcing payload size limits and log levels.
- Network failures between browser and dev server could drop log entries; mitigated with retry/backoff or at least console warnings when POST requests fail.
- If validation is too strict, legitimate logs may be rejected; scope includes clear error messaging for quick debugging.

## Acceptance Criteria
- User explicitly approves this SOW with “y”.
- Running the dev server results in browser console messages appearing in `system.log` with timestamps and levels.
- No logging code executes in production builds.
- Documentation and governance files reflect the new capability and version number.
