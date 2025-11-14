# Statement of Work (SOW)

## Objective
Provide a root-level helper script that launches the Vite dev server from `frontend/`, and when the dev process is stopped via Ctrl+C, immediately starts it again (while ensuring the shell returns to the repository root regardless of directory changes).

## Scope of Work
1. **Script Design**
   - Decide on a portable Bash script name (e.g., `run-dev.sh`) placed at the repo root.
   - Implement logic to `cd frontend`, run `npm install` guard if node_modules missing, start `npm run dev`, and detect Ctrl+C to trigger exactly one automatic restart before exiting cleanly back at the root.
2. **Restart & Cleanup Behavior**
   - Ensure the script captures SIGINT so that the first Ctrl+C stops the running Vite instance and re-launches it once more; a second Ctrl+C should terminate both the child process and wrapper without leaving orphaned processes.
   - Guarantee the script restores the original working directory even if errors occur.
3. **Documentation & Governance**
   - Update `README.md` (root or frontend) with instructions for using the new script.
   - Increment semantic versioning where applicable and record the change in `CHANGELOG.md` plus `tasks.md` per governance rules.
4. **Verification**
   - Execute the script to prove it launches the dev server, handle Ctrl+C to confirm automatic relaunch, and document the observed behavior.

## Out of Scope
- Modifying the underlying Vite configuration or application code.
- Introducing cross-platform wrappers beyond Bash (PowerShell/batch support not required yet).
- Managing backend services or Docker resources.

## Deliverables
- Root-level Bash script implementing the described restart behavior.
- Updated documentation explaining how to use the script before the interview.
- Updated `CHANGELOG.md` and `tasks.md` capturing work performed, plus any version bumps (e.g., `frontend/package.json`).
- Verification notes describing the restart sequence outcome.

## Assumptions & Dependencies
- Bash environment available (WSL/macOS/Linux assumed for the interview setup).
- Node.js/npm already installed so `npm run dev` works as before.
- Only one automatic restart is requested after the initial Ctrl+C.

## Risks
- Improper signal handling could leave zombie Vite processes; mitigated by explicit trap/cleanup.
- Looping behavior might be interpreted differently; behavior limited to “restart once” to match the request and avoid infinite loops.

## Acceptance Criteria
- User explicitly approves this SOW with "y".
- Running the script from repo root launches Vite, restarts once automatically after Ctrl+C, and returns to root when finished.
- Documentation and governance files updated with matching version numbers.
