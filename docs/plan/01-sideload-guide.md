# 01 — Sideload Guide (Laptop ↔ TV)

Everything you need to do on your laptop to push the Tv-OS launcher onto the Digie TV
over WiFi. **No root required.** Zero brick risk.

This guide is for the **v0.2 vanilla launcher** (`npm run build` / `npm run deploy`).
The v0.1 Enact build (`npm run pack-p`, `enact pack`) no longer exists; see
`docs/research/06-enact-postmortem.md`. If you already set everything up once, skip to
"Dev-cycle shortcut" — the current exact sequence is in `docs/HANDOFF.md` §5.

Code blocks below are safe to paste into macOS zsh: one command per line, no `#`
comments, no apostrophes. Explanations are in the text above each block.

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

If the TV's IP changed later, you do not need to pair again. Read the new IP from the
Dev Mode app, put it in place of `NEW_IP`, and run:
```bash
ares-setup-device -m tv -i host=NEW_IP
```

## Step 3 — Clone this repo on the laptop and install

Only on a laptop that does not have the repo yet. If `~/Tv-OS` already exists, do not
clone again and do not reset it — just `cd ~/Tv-OS/app` and run `npm install`. The
checkout line picks the branch with the current work (use whichever branch is current).

```bash
git clone https://github.com/gautamjain9/Tv-OS.git
cd Tv-OS
git checkout research/phase-0-feasibility
cd app
npm install
```

(Watch for errors here — this is the first point where Node version mismatches surface.
In v0.2 `npm install` only fetches `@webos-tools/cli`; the launcher itself has no
dependencies.)

## Step 4 — Build the IPK

This copies `src/` and `webos-meta/` into a fresh `./dist/` (no bundler):

```bash
npm run build
```

Then package into an IPK:
```bash
cd dist
ares-package .
```

Output: `com.tvos.launcher_<version>_all.ipk` in the current directory, where `<version>`
is the `version` field of `webos-meta/appinfo.json` (0.2.1 at the time of writing).

## Step 5 — Install on the TV

Still inside `dist/`:

```bash
ares-install -d tv ./com.tvos.launcher_*_all.ipk
```

Should print "Success". The app appears in the TV's app list (recent apps / all apps).

## Step 6 — Launch

```bash
ares-launch -d tv com.tvos.launcher
cd ..
```

The launcher opens on the TV. The `cd ..` takes you back to `app/`.

## Dev-cycle shortcut

After the first install, `npm run deploy` from `app/` does all of 4+5+6 (build, package,
install, launch). Bump `version` in both `webos-meta/appinfo.json` and `package.json`
before each install, or webOS may keep showing the cached old version.
```bash
npm run deploy
```

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `ares-install --list` hangs or times out | Dev Mode session expired | Open Dev Mode app on TV → press "Extend" |
| "No such device: tv" | Pairing was never saved | Rerun `ares-setup-device` |
| "ssh: connect to host X port 9922: Connection refused" | Dev Mode is OFF or wrong IP | Check TV: Dev Mode Status ON, note current IP |
| `ares-device -i -d tv` fails with `EHOSTUNREACH` or times out | TV off, or its IP changed | Turn the TV on; read the IP in the Dev Mode app; run `ares-setup-device -m tv -i host=NEW_IP` |
| `ares-package .` says "appinfo.json missing" | You're in the wrong folder — must be in `dist/` after `npm run build` | `cd dist` first |
| TV says "Not supported app" | Memory/version mismatch | Lower `requiredMemory` in `webos-meta/appinfo.json`; v0.2 already sets 64 (v0.1 used 128) |
| Tile focused, OK pressed, nothing happens | App ID wrong on this TV, or the launch call failed | Read the debug line at the bottom-left of the screen; it shows `launch failed: <id> / <error>` |
| App installs but doesn't appear in app list | Known issue on newer firmware (`[UNVERIFIED]` for Digie Hub) | Launch directly via `ares-launch`; we'll research persistence post-install |

## What to report back after Step 6

- Did the app launch? (expected: a dark screen with the clock and date at the top, an Apps
  row, an Inputs row, a small grey debug line at the bottom-left, and a white focus ring
  on the first tile)
- Press RIGHT and OK on a tile — does the target app launch, or does webOS throw an error?
  (Read the debug line either way.)
- Is the Tv-OS tile visible in the TV's app grid when you press HOME, or only via
  `ares-launch`? (This tells us whether the "hidden sideloaded apps" firmware issue bites.)
