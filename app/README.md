# Tv-OS Launcher (v0.2 — vanilla rewrite)

Zero frameworks. One `index.html`, one `styles.css`, one `main.js`.
Build is a 50-line Node script that copies files into `dist/`.

## Why

v0.1 tried Enact + Sandstone. Build worked; focus never worked on the TV
despite 4 iterations. See `docs/research/06-enact-postmortem.md`. The
root cause (likely: Spottable focus-class injection timing in Enact 4.0.9
on the Hub WebView) was deeper than the time we had budgeted. Vanilla
HTML gives us 100% control over focus + keyboard events and matches the
project's debloat philosophy anyway.

## Prereqs (on your laptop)

- Node.js 18+ (only used by the tiny build script — no bundler, no deps
  for the launcher itself)
- The TV paired via `ares-setup-device` (see `docs/plan/02-laptop-setup-step-by-step.md`)
- The webOS CLI globally: `sudo npm install -g @webos-tools/cli`

## Install + deploy

```bash
cd app
npm install          # installs only @webos-tools/cli locally
npm run deploy       # build + ares-package + install + launch, all in one
```

If you want the steps individually:

```bash
npm run build        # writes dist/
cd dist && ares-package .
ares-install -d tv ./com.tvos.launcher_0.2.0_all.ipk
ares-launch -d tv com.tvos.launcher
```

**Every edit → bump `version` in `webos-meta/appinfo.json` AND
`package.json`.** Same version numbers cause webOS to cache the WebView
assets. We hit this in v0.1.

## Structure

```
app/
├── package.json
├── scripts/build.js          # 50-line copy-only builder
├── webos-meta/
│   ├── appinfo.json          # id com.tvos.launcher, requiredACG set
│   ├── icon.png              # (regenerate per docs/research/03-pre-sideload-audit.md)
│   └── icon-large.png
└── src/
    ├── index.html            # the entry
    ├── styles.css            # all CSS, with tokens as :root custom properties
    └── main.js               # ~200 lines total: clock, tiles, keyboard nav, LS2 bridge
```

## What's in main.js

- `APPS[]` + `INPUTS[]` — curated tile list. Edit here to add/remove tiles.
- `launchApp(id)` — the one LS2 bridge call: `luna://com.webos.applicationManager/launch`.
- Clock that ticks every 15 s (not every 1 s — saves CPU).
- Keyboard handler for arrow keys + Enter/OK (webOS keyCodes).
- Focus is just `element.focus()` on native `<button>`s. The `:focus` CSS
  rule in `styles.css` draws the ring + glow. No framework in between.
- A `#debug` overlay at bottom-left shows what the launcher thinks is
  happening. Remove `<div id="debug">` from `index.html` once stable.

## Debug

If something doesn't work:

- Read the debug line at the bottom-left of the TV screen first.
- Enable the web inspector: `ares-inspect --device tv --app com.tvos.launcher --open`
  (opens Chrome DevTools on your Mac pointed at the TV's app).
- Any error in `main.js` lands in that Console tab.
