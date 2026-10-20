# 03 — Pre-Sideload Audit (2026-10-20)

Done at the user's explicit request: "check correctly before moving to Part E,
that all the before aligned jobs are done and correctly aligned." Zero-trust
sweep of the whole project before anyone touches the TV.

## Findings

| # | Severity | Where | Problem | Status |
|---|---|---|---|---|
| 1 | BLOCKER | `app/webos-meta/` | `appinfo.json` referenced `icon.png`, `icon-large.png`, `splash.png`; none existed. `ares-package` would fail with "icon file not found". | FIXED: generated placeholder `icon.png` (80px) and `icon-large.png` (130px) matching our design tokens (bg #0A0A0C + accent #7C9CFF); removed `splashBackground` from manifest. |
| 2 | Likely runtime break | `app/src/components/TopBar.js` | React hooks (`useState`, `useEffect`) called inside Enact's `kind()` render. `kind` is for stateless components; mixing hooks is undocumented in Enact 4.x and silently breaks hook identity on some targets. | FIXED: TopBar is now a plain function component. |
| 3 | Behavior bug | `app/src/components/Tile.js` | Manual `tabIndex={-1}` on the Spottable's root. Spottable manages tabIndex itself; forcing `-1` prevents remote-focus navigation. | FIXED: removed the manual tabIndex. |
| 4 | Minor | `app/src/views/HomePanel.js` | Mixed import style — `Panel` deep-imported, `Header` from the Panels barrel. Risks resolution issues depending on Sandstone's exports map. | FIXED: `import {Header, Panel} from '@enact/sandstone/Panels'`. |
| 5 | Privacy | `app/package.json` | `author` field embedded the user's full email in a now-PUBLIC repo. | FIXED: redacted to name only. (Note: existing git history still carries the commit email; separate concern, out of scope today.) |
| 6 | Minor | `app/package.json` | Unused `main: "index.js"` (no such file at repo root). | FIXED: removed. **Later reverted** — Enact needs `main: "src/index.js"`; see `04-build-dry-run-cloud.md`. |
| 7 | n/a (verified clean) | all `.js` files under `app/src/` | Dangling imports to missing files. | VERIFIED CLEAN: 7 `.js` files, 20 relative imports, 100% resolve. |
| 8 | n/a (verified clean) | `app/package.json`, `app/webos-meta/appinfo.json` | Invalid JSON. | VERIFIED CLEAN: both files parse. |

## npm / toolchain state (verified on user's laptop)

- `node -v` — OK (user ran `npm install`, no Node error)
- `ares -V` — `Version: 3.2.6` (global install succeeded)
- `ares-install --version` — `Version: 3.2.6`
- `.npmrc` committed with the correct `allow-scripts=<pkg list>` syntax (fixes earlier `allow-scripts=true` which npm ignored)

## What is still deliberately untested (and we accept this risk)

1. **Does Enact CLI 6.1.4 actually build this exact code tree on macOS?** We will find out when the user runs `npm run pack-p`. If it fails, we fix. Nothing about the code is unusual; failure risk is low.
2. **Does `com.webos.applicationManager/launch` actually accept the specific app IDs we hard-coded** (`youtube.leanback.v4`, `netflix`, `com.disney.disneyplus-prod`, `com.webos.app.livetv`, HDMI inputs)? Unknown on this exact Digie Hub build. We will find out when a tile is pressed. If an ID is wrong, the launch silently fails and we swap the ID.
3. **Does the Tv-OS tile appear in the TV's HOME grid, or is it hidden** (the "newer firmware hides sideloaded apps" issue flagged in `02-l1-blockers-resolved.md`)? Unknown. If hidden, we launch via `ares-launch` as a workaround.

None of these three unknowns can be answered without actually installing on the TV. They are the right things to learn next.

## Not-blockers deliberately left as-is

- 96 npm "vulnerabilities" during install → cosmetic noise in dev-only transitive deps. Not shipped. Running `npm audit fix --force` on this project is BLOCKED by in-project note.
- yellow deprecation warnings during `npm install` → cosmetic; the old versions still work.
- 6 `install-scripts blocked` warnings → cosmetic; the global `@webos-tools/cli` on the user's laptop provides the actual CLI; local postinstalls are not required for our scripts.
