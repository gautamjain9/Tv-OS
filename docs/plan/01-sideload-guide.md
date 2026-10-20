# 01 — Sideload Guide (Laptop ↔ TV)

Everything you need to do on your laptop to push the Tv-OS launcher onto the Digie TV
over WiFi. **No root required.** Zero brick risk.

## Prerequisites

**On the laptop:**
- Node.js 18 or newer. Check: `node -v`
- A terminal (macOS Terminal, Windows PowerShell, or Linux shell)
- The laptop and TV on the SAME WiFi network

**On the TV:**
- Developer Mode app installed and Dev Mode Status = ON (you already have this)
- Key Server = ON in Dev Mode app
- Note the IP address shown on the Dev Mode app screen
- Note the passphrase shown (case-sensitive, exact characters)

## Step 1 — Install the webOS CLI once

```bash
npm install -g @webos-tools/cli
```

Verify:
```bash
ares -V
```
Should print a version. If "command not found," you may need to add npm's global bin to
your PATH, or use `npx @webos-tools/cli` prefixed on every command below.

## Step 2 — Pair the TV once

```bash
ares-setup-device
```

Interactive menu will appear. Pick **Add**. Fill in:
- **Device name:** `tv` (we reference this everywhere)
- **IP address:** the TV's IP from the Dev Mode app
- **Port:** `9922`
- **Username:** `prisoner`
- **Description:** anything (e.g. `Digie webOS 22`)
- **Type:** `developer`
- When it asks for "SSH private key file" — leave blank; we'll fetch it next
- When it asks for "Password" — leave blank
- Save.

Then fetch the SSH key from the TV:
```bash
ares-novacom --device tv --getkey
```
It will prompt for the passphrase shown on the TV's Dev Mode app screen. Type it
exactly (case-sensitive).

Verify the pairing:
```bash
ares-install --device tv --list
```
Should return the list of installed apps on the TV. If it does, you're paired. If it
errors — most common cause is wrong IP (TV moved networks) or Dev Mode session expired
(open the Dev Mode app on TV and press "Extend").

## Step 3 — Clone this repo on the laptop and install

```bash
git clone https://github.com/gautamjain9/Tv-OS.git
cd Tv-OS
git checkout research/phase-0-feasibility  # or whatever branch is current
cd app
npm install
```

(Watch for errors here — this is the first point where Node version mismatches surface.)

## Step 4 — Build the IPK

```bash
npm run pack-p
```

This outputs `./dist/` with the production build.

Then package into an IPK:
```bash
cd dist
ares-package .
```

Output: `com.tvos.launcher_<version>_all.ipk` in the current directory, where `<version>`
is the `version` field of `webos-meta/appinfo.json` (currently `0.1.3`).

## Step 5 — Install on the TV

```bash
ares-install -d tv ./com.tvos.launcher_*_all.ipk
```

Should print "Success". The app appears in the TV's app list (recent apps / all apps).

## Step 6 — Launch

```bash
ares-launch -d tv com.tvos.launcher
```

The launcher opens on the TV.

## Dev-cycle shortcut

After the first install, you can shortcut all of 4+5+6 from `app/`:
```bash
npm run package-webos && npm run install-webos && npm run launch-webos
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ares-install --list` hangs or times out | Dev Mode session expired | Open Dev Mode app on TV → press "Extend" |
| "No such device: tv" | Pairing was never saved | Rerun `ares-setup-device` |
| "ssh: connect to host X port 9922: Connection refused" | Dev Mode is OFF or wrong IP | Check TV: Dev Mode Status ON, note current IP |
| `ares-package .` says "appinfo.json missing" | You're in the wrong folder — must be in `dist/` after `pack-p` | `cd dist` first |
| TV says "Not supported app" | Memory/version mismatch | Lower `requiredMemory` in `webos-meta/appinfo.json`; already set to 128 |
| App installs but doesn't appear in app list | Known issue on newer firmware (`[UNVERIFIED]` for Digie Hub) | Launch directly via `ares-launch`; we'll research persistence post-install |

## What to report back after Step 6

- Did the app launch? (expected: a dark screen with "Tv-OS" header, clock, Apps row, Inputs row)
- Press RIGHT and OK on a tile — does the target app launch, or does webOS throw an error?
- Is the Tv-OS tile visible in the TV's app grid when you press HOME, or only via
  `ares-launch`? (This tells us whether the "hidden sideloaded apps" firmware issue bites.)
