# Tv-OS Launcher (v0.2.1 — vanilla)

Zero frameworks. One `index.html`, one `styles.css`, one `main.js`
(about 10 KB unminified, 4 KB after `ares-package` minifies it with terser).
Build is a 60-line Node script that copies files into `dist/`.
The whole IPK is about 6 KB.

## Why

v0.1 tried Enact + Sandstone. Build worked; focus never worked on the TV
despite 4 iterations. See `docs/research/06-enact-postmortem.md`. Vanilla
HTML gives us full control over focus + keyboard events and matches the
project's debloat philosophy anyway.

## Prereqs (on your laptop)

- Node.js 20+ (`@webos-tools/cli` 3.x refuses older Node). Node is only
  used by the build script and the webOS CLI; the launcher has no deps.
- The TV paired via `ares-setup-device` (see `docs/plan/02-laptop-setup-step-by-step.md`).
- The webOS CLI. `npm install` below installs it locally, and `npm run`
  scripts use that copy. A global install is optional.

## Install + deploy

From the repo root:

```bash
cd app
npm install
npm run deploy
```

`npm install` installs only `@webos-tools/cli`. If an old Enact
`node_modules/` is still on disk from v0.1, this same command prunes it.
`npm run deploy` = build + package + install + launch.

The same steps one at a time (run inside `app/`):

```bash
npm run build
npm run package
npx ares-install -d tv dist/com.tvos.launcher_0.2.1_all.ipk
npx ares-launch -d tv com.tvos.launcher
```

`npm run build` wipes and rewrites `dist/`, so stale files (including the
old Enact build) never end up in the IPK. `ares-package` writes the IPK
into `dist/` and skips any `.ipk` already there, so packages never nest.

**Every edit → bump `version` in `webos-meta/appinfo.json` AND
`package.json`.** Same version numbers cause webOS to cache the WebView
assets. We hit this in v0.1.

## Structure

```
app/
├── package.json
├── .npmrc                    # lets the CLI's install scripts run (npm 12 allow-scripts)
├── scripts/build.js          # copy-only builder, no bundler
├── webos-meta/
│   ├── appinfo.json          # id com.tvos.launcher, requiredACG set
│   ├── icon.png              # 80x80
│   └── icon-large.png        # 130x130
└── src/
    ├── index.html            # the entry
    ├── styles.css            # all CSS, tokens as :root custom properties
    └── main.js               # clock, tiles, remote nav, LS2 bridge, lifecycle
```

## What's in main.js

- `APPS[]` + `INPUTS[]` — curated tile list. Edit here to add/remove tiles.
- `launchApp(id)` — one LS2 call, `luna://com.webos.applicationManager/launch`,
  made through the native `WebOSServiceBridge` / `PalmServiceBridge` (no
  webOSTV.js). 5 s timeout; failures show on the debug line.
- Clock that ticks every 15 s, and not at all while the app is hidden.
- Remote keys: arrows move focus, OK/Enter launches, Back does nothing
  (`disableBackHistoryAPI` hands it to us and we are the home screen).
- Magic Remote pointer: the cursor stays visible; hovering a tile focuses
  it, pointing at empty space drops focus. Any arrow key brings focus back.
- Focus is just `element.focus()` on native `<button>`s. `:focus` in
  `styles.css` shows the ring + glow by fading a `::after` in, so focus
  moves animate only `transform` + `opacity`. Rows are scrolled by
  `reveal()` in main.js (not the browser), so the focused tile always
  keeps the 120 px gutter and its ring + glow are never clipped.
- On boot, return to the foreground, or relaunch (`webOSRelaunch`), focus
  goes back to the last tile used (YouTube on first boot).
- A `#debug` overlay at bottom-left shows what the launcher thinks is
  happening. Remove `<div id="debug">` from `index.html` once stable.

## Engine

webOS TV 22 runs Chromium 87. Keep CSS and JS within what Chromium 87
supports (no `aspect-ratio`, no `scrollbar-width`, no `:has()`).

## Debug

If something does not work:

- Read the debug line at the bottom-left of the TV screen first.
- Enable the web inspector: `npx ares-inspect -d tv -a com.tvos.launcher -o`
  (opens Chrome DevTools on your Mac pointed at the TV's app).
- Any error in `main.js` lands in that Console tab.
