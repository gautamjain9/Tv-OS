# 06 — Enact v0.1 Postmortem (2026-10-20)

**Decision:** abandoned Enact + Sandstone, rewrote the launcher in vanilla HTML/CSS/JS as v0.2.0. This doc records why so the next person (or the next Claude) doesn't repeat the detour.

## What worked in v0.1 (keep for the record)

- `enact pack -p` built on both Node v22 (cloud) and Node v24 (user's Mac).
- `ares-package .` produced valid `.ipk` files (14.9 MB).
- `ares-install` + `ares-launch` loaded the app on Digie webOS 22 / 7.5.8-28 Chromium with no errors.
- The dark theme + fonts + tiles + clock rendered correctly on the TV screen.
- The install permission (`requiredACG: ["application.launcher"]`) stopped the "silent launch-failure" warning that would have broken tile launching.

## What never worked in v0.1

Focus. Four iterations:

| Version | Change | On-TV result |
|---|---|---|
| 0.1.0 | Default Enact + Sandstone scaffold with `<Panels><Panel><Header>`. | Content clustered top-left; Panels close-X in top-right stole all focus. |
| 0.1.1 | Removed Panels/Panel/Header; added `Spotlight.focus()` in `useEffect`; bigger layout. | X gone, tiles bigger — but focus never visibly reached any tile. OK did nothing. |
| 0.1.2 | Rewrote `Tile` as `forwardRef` instead of `kind()`; wrapped `App` in `SpotlightRootDecorator` explicitly; added visible debug overlay. | Debug overlay confirmed: `spottable count: 8` and `focused: ...tile__XF5f3 spottable` — Spotlight TRACKS focus internally, but `.spottable-focused` class never lands on the DOM. So focus CSS doesn't match. |
| 0.1.3 | Called native `element.focus()` BEFORE `Spotlight.focus()`; added `:focus` CSS as safety net. | Never tested — user accepted the pivot before this install. |

## Likely root cause

In Enact 4.0.9 + webOS 22 Chromium, `Spottable`'s `.spottable-focused` class is applied in response to **real DOM focus events** (an `onFocus` handler on the wrapped element). `Spotlight.focus(elem)` updates Spotlight's internal state and returns the element from `Spotlight.getCurrent()`, but — in our composition of `kind()` → `Spottable` HOC → CSS Modules — the DOM `focus` event wasn't firing, so the class was never added.

Why we never confirmed the exact mechanism: debugging requires `ares-inspect` (Chrome DevTools attached to the TV WebView). We didn't open the inspector until after the pivot was proposed. The debug overlay narrowed the bug to "class not added," but didn't pinpoint whether `Spottable`'s `componentDidMount` short-circuited, the CSS Modules compose chain lost the class name, or React 18 strict-mode-like double-mount broke the ref.

## Why vanilla JS was the right pivot (not just "give up on Enact")

Three independent reasons, each sufficient on its own:

1. **Debloat philosophy (`docs/plan/04-design-philosophy.md`) explicitly rules out Enact's cost.** 14.9 MB IPK vs. ~5 KB vanilla IPK is a 2800× size reduction. 85 MB installed vs. ~32 KB installed is a 2700× reduction. Enact ships 83 MB of ilib locale data for a feature we don't use, plus Sandstone fonts, plus Spotlight — the whole reason we picked it. The reason we picked it (Spotlight) failed us. The costs stayed.

2. **Faster debug cycles.** Vanilla JS has ~200 lines of app code we fully control. Enact composed through 5+ decorators (Theme / Spotlight root / Sandstone / Spottable / forwardRef) and 50+ transitive packages. Each unknown bounces off multiple layers before we can see what happened.

3. **L2 (home-screen takeover via Homebrew Channel) wants the smallest, fastest-starting app possible.** A rooted TV launching the home screen on every HOME press cares about startup time and memory. 5 KB cold-starts faster than 15 MB.

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
