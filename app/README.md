# Tv-OS Launcher (app/)

Enact 4.0.9 + Sandstone 2.0.5 launcher app, targeting webOS 22 (Digie Hub).

## Prereqs (on the laptop)

- Node.js 18+ and npm
- The TV on the same WiFi network, with Developer Mode installed and running
- The TV's IP address and Dev Mode passphrase

## Install

```bash
cd app
npm install
```

This also installs `@webos-tools/cli` locally. For global `ares-*` commands,
run `npm install -g @webos-tools/cli` once.

## Pair the TV once

```bash
ares-setup-device
# Add a new device: name=tv, host=<TV IP>, port=9922,
# username=prisoner, type=developer
ares-novacom --device tv --getkey
# When prompted, enter the exact passphrase shown on the TV's Dev Mode app.
```

## Dev loop

```bash
npm run pack-p           # production build into ./dist
cd dist && ares-package .   # produce com.tvos.launcher_0.1.0_all.ipk
ares-install -d tv ./com.tvos.launcher_0.1.0_all.ipk
ares-launch -d tv com.tvos.launcher
```

Or, after the first pair + first install:

```bash
npm run package-webos && npm run install-webos && npm run launch-webos
```

## Local browser preview

```bash
npm run serve
# Open http://localhost:8080
```

Browser preview has no `window.webOS`; the `webosBridge` falls back to console
logs. Visual tuning and navigation can be done entirely in the browser.

## Structure

```
app/
├── package.json           Enact + webOS CLI deps
├── webos-meta/
│   └── appinfo.json       webOS app manifest (id: com.tvos.launcher)
└── src/
    ├── App/               Top-level Enact app
    ├── views/             Panels (HomePanel for now)
    ├── components/        Reusable UI (Tile, AppsRow, InputsRow, TopBar)
    ├── services/
    │   └── webosBridge.js LS2 shim (launchApp, openSettings)
    └── theme/
        └── tokens.less    Design tokens — see docs/design/01-visual-language.md
```
