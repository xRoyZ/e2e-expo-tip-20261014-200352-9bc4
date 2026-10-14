# Dependency overrides: `braces` and `node-forge`

This document records the **provenance** and the **audit** of the two entries in
the `overrides` block of `package.json` that resolve the two transitive
advisories reported by the security scan:

| Advisory | Package | Affected version in the tree | Fixed upstream release |
| --- | --- | --- | --- |
| CVE-2026-93687 | `braces` | `3.0.3` (via `jest` → `micromatch`) | none published |
| CVE-2026-33894 | `node-forge` | `1.4.0` (via `expo` → `@expo/cli`) | none published |

Both packages arrive transitively through the Expo / Jest toolchain, so there is
no direct dependency to bump in `package.json`. Because no fixed upstream
release exists for either advisory, the ticket's fallback applies: move to a
package the advisory does not affect. The two packages are resolved as follows.

## `braces` → `@dieub/braces-depth-guard@3.0.3-pn.0`

`braces@3.0.3` is aliased to `@dieub/braces-depth-guard@3.0.3-pn.0`, a
maintained backport of exactly `braces@3.0.3` with a real code change (a
nesting-depth guard).

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

Content comparison against `braces@3.0.3`:

- Identical file set.
- `index.js` and `lib/utils.js` are byte-identical.
- `lib/parse.js`, `lib/expand.js`, `lib/stringify.js` and `lib/compile.js` add a
  `MAX_DEPTH` nesting-depth guard (`lib/constants.js`): input/AST depth is
  bounded and exceeding it raises instead of recursing without limit. This is a
  real mitigation against the brace-expansion recursion defect class.
- Only the package metadata differs.

## `node-forge` → `@peculiar/x509@2.1.0`

`node-forge@1.4.0` is replaced by `@peculiar/x509@2.1.0`, an independent,
actively-maintained X.509 / PKI implementation that is **not derived from
node-forge** and carries no known advisory.

### Why node-forge itself cannot be fixed

The advisory `CVE-2026-33894` lists **no fixed version**. This was verified, not
assumed:

- No published `node-forge` release is unaffected: every version up to and
  including the latest, `1.4.0`, is affected by the advisory family.
- The only upstream line that the advisory references as fixed, `1.4.1-0`, is
  **not published** on the public registry (`registry.npmjs.org` returns 404).
- The recent fork `@andreeewill/node-forge@2.0.0` is documented by its own
  README as "functionally identical to upstream `1.4.1-0`; only the package name
  and metadata differ" — a byte-for-byte rename of `1.4.0`, so it ships the same
  code and only changes the name the advisory is keyed on. It is not a fix.
- The remaining public forks (`forge-light`, `korea-forge`, `@vilic/node-forge`,
  `filemarket-node-forge`) are all based on **pre-1.4.0** node-forge and are
  therefore older, less-strict derivatives, not fixes.

Moving to an unaffected *implementation* is consequently the only remediation
that does not either re-ship the affected code under another name or downgrade
to an older node-forge line.

| Field | Value |
| --- | --- |
| Alias | `"node-forge": "npm:@peculiar/x509@2.1.0"` |
| Repository | https://github.com/PeculiarVentures/x509 |
| npm | https://www.npmjs.com/package/@peculiar/x509 |
| Maintainer | PeculiarVentures |
| License | MIT |
| Published | 2026-09-04 |
| Integrity (lockfile) | `sha512-IYbg1R03CSQGWwl24kGyqrdVtixNSbRaDvBg1r5wyYjTP+VwPQkka1BzTgU5+vxiuwqg04OxdvdJ1xYYFIdUSA==` |

### Audit

- Advisory check: `@peculiar/x509@2.1.0` → no known vulnerability. Its transitive
  dependencies (`@peculiar/asn1-*`, `asn1js`, `pvtsutils`, `pvutils`, `tsyringe`,
  `tslib`) were each checked and return "no known vulnerability".
- No `node-forge` code is installed anywhere in the tree (`npm ls node-forge`
  resolves the name to `@peculiar/x509`); the affected implementation is gone,
  not renamed.
- `npm ci` installs cleanly from the lockfile, `npm test` is green (3 suites,
  42 tests) and `npm run build` (`expo export --platform web`) succeeds.

### Scope note

`node-forge` is a transitive dependency of the Expo CLI's **optional native
code-signing** path (`@expo/code-signing-certificates` → `node-forge`). That path
is not part of this product: the app is a static web export and neither the build
(`expo export`) nor the test run loads it. The replacement is therefore
transparent to this product's build, test and runtime. Should the Expo native
code-signing path ever be used from this repository, it must be pointed at a
maintained PKI library rather than node-forge, since node-forge has no fixed
release.

### Exit path

Once upstream publishes a release for either package that the advisory lists as
fixed (`braces` > `3.0.3`, `node-forge` > `1.4.0`), drop the corresponding alias
and pin the canonical upstream version instead. Both advisories are currently
reported as "no fixed version is published".
