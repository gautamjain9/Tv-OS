# 07 — L1 v0.2.1 On-TV Verification (2026-10-20)

First install of the vanilla launcher on the real TV (Digie AR-50, webOS 22 / 7.5.8-28,
firmware 04.56.35). This file records what was observed, so later sessions do not
re-derive it. It is also where the L1 measurements from `docs/plan/04-design-philosophy.md`
go once they are taken.

How things were observed:
- **User:** what the user saw on the TV screen and reported in chat.
- **Inspector:** read from the running app page over `ares-inspect` (Chrome DevTools
  Protocol), using `Runtime.evaluate` and page event listeners. Nothing was changed on the
  TV through the inspector.

## Install

- `[VERIFIED]` (Mac build log) `npm install` in `app/` removed 1,358 stale Enact packages;
  `node_modules` went from 475 MB to 85 MB (`@webos-tools/cli` only). It also reported
  "6 vulnerabilities" in that dev tool's dependencies. `npm audit fix` was not run (see
  HANDOFF §6).
- `[VERIFIED]` (Mac build log) `npm run package` produced `com.tvos.launcher_0.2.1_all.ipk`,
  **6,304 bytes**. `ares-package` minified `main.js` from 9.9 KB to 3.9 KB; the IPK holds only
  the six app files plus `packageinfo.json`.
- `[VERIFIED]` (ares-install / ares-launch output) Install: `Success`. Launch:
  `Launched application com.tvos.launcher`. It replaced the v0.1.3 Enact build that was
  installed before.
- `[VERIFIED]` (ares-device) The TV answered at 192.168.29.246 again. It was unreachable
  earlier the same day (`EHOSTUNREACH`), so it was off, not re-addressed.

## The three L1 questions — all YES

| # | Question | Result |
|---|---|---|
| 1 | Does focus land on YouTube on open? | `[VERIFIED]` YES (user). Inspector: `document.activeElement` = YouTube tile, `.tile:focus` matches, `::after` opacity 1, transform `matrix(1.06, …)`. |
| 2 | Do arrow keys move the ring between tiles? | `[VERIFIED]` YES (user). Inspector saw keydown 37 / 39 arrive. |
| 3 | Does OK on a focused tile launch the real app? | `[VERIFIED]` YES (user): YouTube opened through the native bridge. |

**L1 is proven on the target TV.**

## Platform facts read off the TV

- `[VERIFIED]` (inspector) User agent:
  `Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 WebAppManager`.
  The web engine is **Chromium 87.0.4280.88**, matching LG's webOS TV 22 table.
- `[VERIFIED]` (inspector) `typeof window.webOS === 'undefined'`. This confirms that
  v0.2.0's `window.webOS.service.request` call would have done nothing on the TV.
- `[VERIFIED]` (inspector) `typeof (window.WebOSServiceBridge || window.PalmServiceBridge)
  === 'function'`. The native bridge that v0.2.1 uses is present.
- `[VERIFIED]` (inspector) `document.fonts.check('30px "LG Smart UI"')` is true. The webOS
  system font is installed locally, so the launcher uses it with no font download.
- `[VERIFIED]` (inspector) Viewport is 1920×1080; 8 tiles rendered.

## Remote keys and lifecycle

- `[VERIFIED]` (inspector + user) **Back** arrives as `keydown` keyCode **461**,
  `key = "GoBack"` (keyup reports `key = "Unidentified"`). With `disableBackHistoryAPI: true`
  plus our `preventDefault`, Tv-OS **stays open**. Five Back presses in a row were all
  swallowed.
- `[VERIFIED]` (inspector + user) **HOME** never reaches the app as a key event. webOS
  handles it itself: the page gets `window blur`, then `visibilitychange hidden=true`, and
  the stock webOS home screen comes up. Tv-OS keeps running in the background
  (`ares-launch --running` still lists it). Without root, a web app cannot take the HOME
  button. That is L2 work.
- `[VERIFIED]` (user + `ares-launch --running`) In the first session, Back inside YouTube
  closed YouTube, and webOS showed its **own** home screen instead of returning to Tv-OS.
  Afterwards **nothing** was running, Tv-OS included.
  - `[UNVERIFIED]` Why Tv-OS was gone: webOS may close background web apps under memory
    pressure on this low-RAM TV while a heavy app like YouTube runs, or it may close them
    on app exit. Not yet tested.

## Still to measure (from `04-design-philosophy.md`)

- [ ] Cold start: `ares-launch` → first paint.
- [ ] Resident memory of the launcher.
- [ ] Frame rate during focus moves (DevTools Performance panel over `ares-inspect`).
- [ ] Free storage after install (1.58 GB free at project start).
- [ ] RAM of this unit.
