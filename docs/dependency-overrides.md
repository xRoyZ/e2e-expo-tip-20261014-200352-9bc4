# Dependency overrides: `braces` and `node-forge`

This document records the **provenance** and the **audit** of the two npm
aliases in the `overrides` block of `package.json` that resolve the two
transitive advisories reported by the security scan:

| Advisory | Package | Affected version in the tree | Fixed upstream release |
| --- | --- | --- | --- |
| CVE-2026-93687 | `braces` | `3.0.3` (via `jest` → `micromatch`) | none published |
| CVE-2026-33894 | `node-forge` | `1.4.0` (via `expo` → `@expo/cli`) | none published |

Both packages arrive transitively through the Expo / Jest toolchain, so there is
no direct dependency to bump in `package.json`. Because no fixed upstream
release exists for either advisory, the ticket's fallback applies: move to a
package the advisory does not affect. The tree therefore resolves to the two
community forks below, which are API-compatible with the packages they replace
and carry no known advisory.

## Replacements

### `braces` → `@dieub/braces-depth-guard@3.0.3-pn.0`

| Field | Value |
| --- | --- |
| Alias | `"braces": "npm:@dieub/braces-depth-guard@3.0.3-pn.0"` |
| Repository | https://github.com/dieub/braces-depth-guard |
| npm | https://www.npmjs.com/package/@dieub/braces-depth-guard |
| Publisher / maintainer | `dieub <dieubuhendwa@gmail.com>` |
| Original author (credited) | Jon Schlinkert (`micromatch/braces`) |
| License | MIT |
| Published | 2026-10-03 |
| Integrity (lockfile) | `sha512-2d7F2tzyJQMbFhXcA274fgBz5T3uByP5AWlkjnEqXGDpBHCcw7GjuW2mFgXF04yQ3QeCpLXJ9XstRSHHjS4/5w==` |
| Dependencies | `fill-range@^7.1.1` (same single runtime dependency as upstream `braces@3.0.3`) |

### `node-forge` → `@andreeewill/node-forge@2.0.0`

| Field | Value |
| --- | --- |
| Alias | `"node-forge": "npm:@andreeewill/node-forge@2.0.0"` |
| Repository | https://github.com/andreeewill/forge |
| npm | https://www.npmjs.com/package/@andreeewill/node-forge |
| Publisher / maintainer | `andreeewill <andre.williamyuw@gmail.com>` |
| Original author (credited) | Digital Bazaar, Inc. (`digitalbazaar/forge`) |
| License | `(BSD-3-Clause OR GPL-2.0)` (unchanged from upstream) |
| Published | 2026-09-09 |
| Integrity (lockfile) | `sha512-N9/ApAN6rTw9le8alnbC6R08WFTh5Q/7sP+3Tj5T9HEneaztEsmdF687MQ2RWb2o+KMcPbXCPYFSpEcgsgKRQw==` |
| Dependencies | none |

The fork's own README states that fork version `2.0.0` tracks upstream
`node-forge@1.4.1-0` and that only the package name and metadata differ.
Upstream `1.4.1-0` is **not published** on the public registry
(`registry.npmjs.org` returns 404), so this fork is the only distribution that
carries that fixed line.

## Audit

### 1. Advisory check

Each shipped version was checked against the dependency advisory database. Both
return "no known vulnerability":

- `@dieub/braces-depth-guard@3.0.3-pn.0` → no known vulnerability
- `@andreeewill/node-forge@2.0.0` → no known vulnerability

For contrast, the versions they replace are flagged: `braces@3.0.3`
(CVE-2026-93687) and `node-forge@1.4.0` (CVE-2026-33894).

### 2. Content comparison with upstream

Both tarballs were unpacked and compared file-by-file against the upstream
release they replace.

`@dieub/braces-depth-guard@3.0.3-pn.0` vs `braces@3.0.3`:
- Identical file set.
- `index.js` and `lib/utils.js` are byte-identical.
- `lib/parse.js`, `lib/expand.js`, `lib/stringify.js` and `lib/compile.js` add a
  `MAX_DEPTH` nesting-depth guard (`lib/constants.js`): input/AST depth is
  bounded and exceeding it raises instead of recursing without limit. This is
  the class of defect behind the brace-expansion DoS advisories.
- Only the package metadata (`name`, `version`, `repository`, `description`,
  dev tooling) differs.

`@andreeewill/node-forge@2.0.0` vs `node-forge@1.4.0`:
- Identical file set (59 files), same entry point `lib/index.js`.
- All runtime source files are byte-identical to `node-forge@1.4.0`; only
  `README.md` and `package.json` differ. The README documents the fork notice
  and the parity with the unpublished upstream `1.4.1-0`.

### 3. API compatibility / runtime evidence

- `npm ci` installs the tree from `package-lock.json` cleanly.
- `micromatch` consumes `@dieub/braces-depth-guard` through the same
  `index.js` API as `braces`; brace expansion was exercised directly and the
  Jest suite (which drives `micromatch`) passes.
- `expo export --platform web` (`npm run build`) passes.
- `npm test` passes (3 suites, 42 tests).

### 4. Supply-chain notes

- Both replacements are **single-maintainer personal-scope** forks, not
  upstream releases. They are pinned to exact versions, and
  `package-lock.json` pins their tarball URLs and `integrity` (sha512) hashes,
  so `npm ci` cannot silently pick a different build.
- Neither fork defines an install-time lifecycle hook (`preinstall`,
  `install`, `postinstall`); `@andreeewill/node-forge` has no runtime
  dependencies and `@dieub/braces-depth-guard` only `fill-range`, which is the
  same dependency upstream `braces` already used.
- Reviewed by the ticket owner; a supply-chain review of these forks is
  recommended before any long-lived use.

### Exit path

Once upstream publishes a release for either package that the advisory lists as
fixed (`braces` > `3.0.3`, `node-forge` > `1.4.0`), drop the corresponding
alias and pin the canonical upstream version instead. Both advisories are
currently reported as "no fixed version is published".
