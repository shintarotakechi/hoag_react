# Changelog

This file records all important changes for Hoag React App.

## [0.0.2]

### Changed
- Added `run-dev.sh` at the repository root so it automatically `cd`s into `frontend/`, launches the Vite dev server, and handles the Ctrl+C auto-restart logic.
- Created a root-level README.md describing how to run `./run-dev.sh`, what happens on the first and second Ctrl+C, and how the script returns to the root directory afterward.

### Added
- Documented the completed dev-script work in `tasks.md`, clarifying the Developer Experience roadmap.

### Fixed
- Updated `frontend/package.json` and `package-lock.json` to version 0.0.2 so they match this changelog entry.

### Prompts Used
<prompt>make script on root to run the dev once it's closed with Ctrl+C, make sure to come back to root if the script moved to frontend folder</prompt>

## [0.0.1]

### Changed
- Set `package.json` to version 0.0.1 and expanded the frontend README with local startup steps to make interview prep straightforward.

### Added
- Scaffolded the `frontend` directory with the Vite + React + TypeScript template and verified it with `npm install` and `npm run build`.

### Fixed
- None.

### Prompts Used
<prompt>ok make it ready to run as well y</prompt>

[The following are previous versions and no changes are permitted under any circumstances]
##[0.0.0]

## Changelog Format

The changelog follows the recommendations of @Keep a Changelog.

This project adheres to @Semantic Versioning.

### Meaning of Version Numbers
- Major version: "Changed" for incompatible API changes
- Minor version: "Added" for functionality in a backwards-compatible manner
- Patch version: "Fixed" for backwards-compatible bug fixes
