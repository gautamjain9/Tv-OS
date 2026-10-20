# 06 — Enact v0.1 Postmortem (2026-10-20)

**Decision:** abandoned Enact + Sandstone, rewrote the launcher in vanilla HTML/CSS/JS as v0.2.0 (shipping as v0.2.1 = v0.2.0 + the LS2-bridge fix below). This doc records why so the next person (or the next Claude) doesn't repeat the detour.

Version note: every "Enact 4.0.9" below is the version LG maps to webOS 22 and the *floor* in our `package.json` (`^4.0.9`). What npm actually installed was Enact 4.9.8 / Sandstone 2.9.13 — see "Later source audit" at the end.

## What worked in v0.1 (keep for the record)

- `[VERIFIED]` `enact pack -p` built on both Node v22 (cloud) and Node v24 (user's Mac).
- `[VERIFIED]` `ares-package .` produced valid `.ipk` files (14.9 MB).
- `[VERIFIED]` `ares-install` + `ares-launch` loaded the app on Digie webOS 22 / 7.5.8-28 Chromium with no errors (v0.1.0–0.1.2, observed by the user).
- `[VERIFIED]` The dark theme + fonts + tiles + clock rendered correctly on the TV screen.
- `[UNVERIFIED]` The install permission (`requiredACG: ["application.launcher"]`) stopped the "silent launch-failure" warning that would have broken tile launching. (No tile ever launched an app in v0.1, so the permission itself was never exercised on the TV.)

## What never worked in v0.1

Focus. Four iterations:

| Version | Change | On-TV result |
|---|---|---|
| 0.1.0 | Default Enact + Sandstone scaffold with `<Panels><Panel><Header>`. | Content clustered top-left; Panels close-X in top-right stole all focus. |
| 0.1.1 | Removed Panels/Panel/Header; added `Spotlight.focus()` in `useEffect`; bigger layout. | X gone, tiles bigger — but focus never visibly reached any tile. OK did nothing. |
| 0.1.2 | Rewrote `Tile` as `forwardRef` instead of `kind()`; wrapped `App` in `SpotlightRootDecorator` explicitly; added visible debug overlay. | Debug overlay confirmed: `spottable count: 8` and `focused: ...tile__XF5f3 spottable` — Spotlight TRACKS focus internally, but `.spottable-focused` class never lands on the DOM. So focus CSS doesn't match. |
| 0.1.3 | Called native `element.focus()` BEFORE `Spotlight.focus()`; added `:focus` CSS as safety net. | `[VERIFIED]` (user, 2026-10-20) installed on the TV. On-TV focus result not recorded before the pivot. |
| 0.1.4 | Source-audit fixes (commit `bf92770`, branch `backup/local-v0.1.4`). | Never installed — built on the Mac only. See "Later source audit" below. |

## Likely root cause (original hypothesis — superseded by the later source audit below)

`[UNVERIFIED]` In Enact 4.0.9 + webOS 22 Chromium, `Spottable`'s `.spottable-focused` class is applied in response to **real DOM focus events** (an `onFocus` handler on the wrapped element). `Spotlight.focus(elem)` updates Spotlight's internal state and returns the element from `Spotlight.getCurrent()`, but — in our composition of `kind()` → `Spottable` HOC → CSS Modules — the DOM `focus` event wasn't firing, so the class was never added.

Why we never confirmed the exact mechanism: debugging requires `ares-inspect` (Chrome DevTools attached to the TV WebView). We didn't open the inspector until after the pivot was proposed. The debug overlay narrowed the bug to "class not added," but didn't pinpoint whether `Spottable`'s `componentDidMount` short-circuited, the CSS Modules compose chain lost the class name, or React 18 strict-mode-like double-mount broke the ref.

## Why vanilla JS was the right pivot (not just "give up on Enact")

Three independent reasons, each sufficient on its own:

1. **Debloat philosophy (`docs/plan/04-design-philosophy.md`) explicitly rules out Enact's cost.** `[VERIFIED]` (cloud builds) 14.9 MB IPK vs. ~5 KB (5.3 KB for v0.2.0) vanilla IPK is a 2800× size reduction. 85 MB installed vs. ~32 KB installed is a 2700× reduction. Enact ships 83 MB of ilib locale data for a feature we don't use, plus Sandstone fonts, plus Spotlight — the whole reason we picked it. The reason we picked it (Spotlight) failed us. The costs stayed.

2. **Faster debug cycles.** Vanilla JS has ~200 lines of app code we fully control. Enact composed through 5+ decorators (Theme / Spotlight root / Sandstone / Spottable / forwardRef) and 50+ transitive packages. Each unknown bounces off multiple layers before we can see what happened.

3. **L2 (home-screen takeover via Homebrew Channel) wants the smallest, fastest-starting app possible.** A rooted TV launching the home screen on every HOME press cares about startup time and memory. `[UNVERIFIED]` 5 KB cold-starts faster than 15 MB (expected, not yet measured on the TV).

## What vanilla JS gives up (be honest)

- **Enact's TV-tuned animation easings and focus-ring motion** — had to rebuild as plain CSS transitions on `:focus`.
- **Sandstone's Miso + MuseoSans typography.** v0.2 uses `-apple-system / BlinkMacSystemFont` system fonts. Replace with a bundled .woff2 later if we want brand type.
- **Enact's spatial-navigation algorithm** (which handles tricky layouts like non-aligned grids). Our hand-rolled `moveFocus(dx, dy)` works for a 2-row grid; for anything irregular we'd need to expand it.
- **i18n / RTL / locale-aware formatting.** We call `Date.toLocaleDateString()` and that's it. For L2+ if we add CJK text or RTL languages, we revisit.

None of these are blockers for v0.2. All are fixable later without touching the architecture.

## Lessons for v0.2 and beyond

- **Debug the ACTUAL hardware before iterating.** `ares-inspect` from day one, not day four. Blind iteration costs the user time.
- **Match the stack to the philosophy.** A debloat project should default to the lightest tool that can do the job, not the framework-first tool. We chose Enact for "fast feedback"; it cost us more total time than vanilla would have.
- **Version bumps on every install.** webOS caches WebView assets when the IPK version is unchanged. New fix → new version number, always.
- **The IPK is a zip.** 5 KB launchers are a thing. 15 MB launchers are a mistake we make once.
- **A caret is not a pin.** `^4.0.9` installed 4.9.8. If an exact version matters, pin it exactly and check `node_modules/<pkg>/package.json`.
- **Check that the global you call exists on the target.** `window.webOS.service` only exists when LG's `webOSTV.js` is loaded. Call the native bridge instead (see below).

## Later source audit, never run on the TV (added 2026-10-20)

While the cloud session wrote v0.2.0, a local session on the user's Mac audited the v0.1.3 Enact app against the Enact source actually installed in `app/node_modules`. The result was commit `bf92770` (v0.1.4). It was built on the Mac but **never packaged or installed** — the vanilla v0.2 rewrite replaced it on merge (`f607a64`). The tree is preserved on branch `backup/local-v0.1.4`. These are source-reading findings; none of them was confirmed on the TV.

- `[VERIFIED]` (read from `app/node_modules/@enact/*/package.json` on the Mac) The `^4.0.9` / `^2.0.5` ranges installed **Enact 4.9.8 / Sandstone 2.9.13**, not the 4.0.9 / 2.0.5 that LG maps to webOS 22.
- `[VERIFIED]` (grep of the installed `@enact/spotlight` 4.9.8 and `@enact/sandstone` 2.9.13 source) No `spottable-focused` class exists in this Enact. `Spottable` adds only `spottable`; focus is native DOM focus, so the style hook is `:focus`. This matches the 0.1.2 overlay (`... spottable`, never `-focused`). `[UNVERIFIED]` whether the `:focus` rule made the ring visible on the TV: 0.1.3 was installed (user, 2026-10-20) but its focus result was not recorded; 0.1.4 never ran.
- `[VERIFIED]` (installed `Spottable.js` source) Spottable emulates a click on OK/Enter (keyCodes 13 and 16777221) by forwarding to **its own** `onClick` prop on key-up. The v0.1 `Tile` put `onClick` on the inner `TileBase`, so remote OK called nothing; only pointer clicks could reach the handler. `[UNVERIFIED]` on the TV, but it fits "OK did nothing" in 0.1.1–0.1.2.
- `[VERIFIED]` (v0.1 `services/webosBridge.js` in `7b662fe`, and the built `dist/index.html`) The v0.1 bridge called `window.webOS.service.request` and, when `window.webOS` was missing, resolved silently as a "(dev)" no-op. `window.webOS.service` is provided by LG's `webOSTV.js` library, and the Enact build loads no such script. Enact's own `@enact/webos/LS2Request` calls the native `window.WebOSServiceBridge` (fallback `window.PalmServiceBridge`) instead `[VERIFIED]` (installed source). `[UNVERIFIED]` on the TV that its WebView injects no `window.webOS` of its own; if it does not, every v0.1 launch would have been a silent no-op even with focus and OK fixed.
- **The same bug was in the v0.2.0 vanilla code, and is fixed there.** `[VERIFIED]` (code review) `dc6405a`'s `main.js` also called `window.webOS.service.request` without loading `webOSTV.js`, so OK on the remote would have done nothing on the TV. Fixed before any install: `main.js` now calls `WebOSServiceBridge` / `PalmServiceBridge` directly, with a timeout and the result written to the debug line. Ships as v0.2.1. `[UNVERIFIED]` on the TV until v0.2.1 is installed.
- `[VERIFIED]` (installed `@enact/sandstone/ThemeDecorator` source imports `SpotlightRootDecorator`) ThemeDecorator already applies SpotlightRootDecorator, so 0.1.2's explicit second wrap doubled the document key/focus listeners. `[UNVERIFIED]` whether that caused any visible symptom.
- `[VERIFIED]` (v0.1 `HomePanel.js` takes no props) HomePanel did not forward `className`, so ThemeDecorator's root classes and the `.app` styles never reached the DOM. Visible effect on the TV `[UNVERIFIED]`.

What this changes: the "Likely root cause" hypothesis above is superseded by a simpler explanation — our CSS targeted a class this Enact never sets, the OK handler sat on the wrong component, and the launch call depended on a library we never loaded. It does not change the pivot: the size and debloat argument above stands on its own.
