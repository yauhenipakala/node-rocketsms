# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-08-04

### Added

- `bulkSend()` method for sending a message to multiple recipients
  (`POST /simple/bulkSend`), per RocketSMS API v1.5.0.
- `ENDPOINTS` export (also `RocketSMS.ENDPOINTS`) with the four connection
  hosts, and an optional `endpoint` constructor argument to select one.
- `samples/` folder with a runnable usage example (loads credentials from a
  `.env` file via the built-in `process.loadEnvFile`). Not published to npm.

### Changed

- Refactored internals into single-responsibility modules: `Md5` (`src/md5.js`)
  for hashing and `Client` (`src/client.js`) for authentication, request
  building and query serialization. `RocketSMS` now composes them.

### Removed

- The `username` and `hash` instance fields on `RocketSMS` (credentials now
  live inside the internal client). These were undocumented internals.

## [0.4.0] - 2026-08-04

### Added

- Zero runtime dependencies — the client now runs entirely on Node.js built-ins.

### Changed

- Replaced `axios` with the native `fetch` API.
- Replaced the `md5` package with native `node:crypto`
  (`createHash('md5')`) — produces byte-for-byte identical hashes.

### Removed

- Dependencies `axios` and `md5`.

### ⚠ BREAKING CHANGES

- **Error handling:** requests no longer reject automatically on HTTP `4xx`/`5xx`
  (native `fetch` semantics). RocketSMS application errors are returned in the
  response body as `{ "error": "..." }` — check for an `error` field on the
  result. Only network / HTTP-level failures reject.
- **Error shape:** thrown errors are now plain `Error`/`TypeError`. Code relying
  on the axios error shape (`err.response.status`, `err.response.data`) must be
  updated.

## [0.3.0] - 2026-08-03

### Added

- ESLint (flat config) and Prettier, with `lint` / `lint:fix` scripts.
- Jest test suite with mocked HTTP and 100% enforced coverage.
- `jsconfig.json` for editor and module-resolution support.
- `engines` constraint requiring Node.js >= 18.
- `"files": ["src"]` allowlist for a leaner published package.

### Changed

- **ESM-only:** converted from CommonJS to ES modules (`"type": "module"`).
- Migrated the test runner from Mocha/Should to Jest.
- Updated dependencies (`axios` → `^1.19.0`).
- Updated repository, homepage and issues URLs.

### Removed

- Dev dependencies `mocha` and `should`.

### ⚠ BREAKING CHANGES

- **ESM-only:** the package must be loaded with `import` — `require()` is no
  longer supported.
- **Node.js >= 18** is now required.

[0.5.0]: https://github.com/yauhenipakala/node-rocketsms/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/yauhenipakala/node-rocketsms/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yauhenipakala/node-rocketsms/compare/v0.2.2...v0.3.0
