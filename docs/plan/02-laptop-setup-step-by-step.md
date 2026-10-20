# 02 — Laptop Setup, Step By Step (For Someone Who's Never Done This)

This is the beginner-friendly, zero-jargon version of `01-sideload-guide.md`.
Read on mobile; run on laptop.

It installs the **v0.2 launcher** (plain HTML/CSS/JS, built with `npm run deploy`). The
old v0.1 steps (`npm run pack-p`) are gone along with Enact.

Every grey command box below is safe to paste into the Mac Terminal: one command per
line, no `#` comments, no apostrophes. Paste one line at a time if you are unsure.

**Before you start**, write down these three things on paper or in a note:
- Your TV's IP address (shown on the Developer Mode app on the TV): __________
- Your TV's Dev Mode passphrase (shown on the Developer Mode app on the TV): __________
- Your laptop operating system: macOS / Windows / Linux

---

## PART A — Install Node.js (once, ever)

Node.js is a program that lets your laptop run the webOS developer tool.

### If you're on **macOS**:

1. Open **Safari** or Chrome.
2. Go to **https://nodejs.org**
3. On the home page, click the big button that says **"LTS"** (not "Current"). It will download a file ending in `.pkg`.
4. Open the downloaded `.pkg` file.
5. Click **Continue → Continue → Agree → Install**. Enter your Mac password when asked.
6. When it finishes, close the installer.

### If you're on **Windows**:

1. Open **Edge** or Chrome.
2. Go to **https://nodejs.org**
3. On the home page, click the big button that says **"LTS"** (not "Current"). It will download a file ending in `.msi`.
4. Open the downloaded `.msi` file.
5. Click **Next → check "I accept" → Next → Next → Next → Install**. Click "Yes" if Windows asks for permission.
6. When it finishes, close the installer.

### If you're on **Linux**:

Open a terminal and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Verify (all operating systems):

Open a terminal (see Part B below for how). Type:
```bash
node -v
```
Press Enter. You should see something like `v18.20.0` or higher. If you see "command not found," Node didn't install — redo Part A.

---

## PART B — Open a terminal

A terminal is a window where you type commands.

- **macOS:** Press **⌘ + Space** → type **Terminal** → press **Enter**. A black/white window opens.
- **Windows:** Press the **Windows key** → type **PowerShell** → press **Enter**. A blue window opens.
- **Linux:** You know how. Press Ctrl+Alt+T usually.

**Leave this terminal window open for the rest of this guide.** Every command below gets typed into this window.

---

## PART C — Install the webOS tool (once, ever)

In the terminal window, type exactly this and press Enter:

```bash
npm install -g @webos-tools/cli
```

- On macOS/Linux, if it fails saying "permission denied," run instead:
  ```bash
  sudo npm install -g @webos-tools/cli
  ```
  It will ask for your Mac/Linux password. Type it (nothing will appear as you type — that's normal). Press Enter.

Wait for it to finish (30-60 seconds). You'll see your command prompt again when it's done.

Verify:
```bash
ares -V
```
Should print a version like `Version: 3.0.0`. If "command not found," the install didn't put the tool on your PATH — tell me which OS and I'll give the fix.

---

## PART D — Download the Tv-OS code

**Already have a `Tv-OS` folder on this laptop?** Skip the download. Do not download it
again and do not reset it (that can wipe work that only exists on your laptop). Just run
these two lines, then go to Part E (or straight to Part F if the TV is already paired):

```bash
cd ~/Tv-OS/app
npm install
```

**First time on this laptop?** Still in the terminal:

```bash
cd ~
git clone https://github.com/gautamjain9/Tv-OS.git
cd Tv-OS
git checkout research/phase-0-feasibility
cd app
npm install
```

Explanation of each line:
- `cd ~` → go to your home folder (so the code lands in a sensible place)
- `git clone ...` → downloads the Tv-OS code from GitHub
- `cd Tv-OS` → enter the folder you just downloaded
- `git checkout research/phase-0-feasibility` → switch to the branch with the latest work
- `cd app` → enter the launcher-app sub-folder
- `npm install` → downloads the webOS tool the build uses (the launcher itself needs no libraries). Usually under a minute; some yellow warnings are normal

If any line fails, STOP and paste the exact error message to me.

---

## PART E — Pair the TV with your laptop (once)

Still in the terminal. Type:
```bash
ares-setup-device
```

An interactive menu will appear in the terminal. Use arrow keys to move, Enter to select.

1. It shows a list. Choose **"add"**.
2. It asks "device name" — type `tv` and press Enter.
3. It asks "device description" — type anything, like `Digie TV`, and Enter.
4. It asks "device ip" — type your TV's IP (the one you wrote down). Enter.
5. It asks "device port" — type `9922`. Enter.
6. It asks "device username" — type `prisoner`. Enter.
7. It asks "ssh private key" — just press **Enter** (leave blank).
8. It asks "device passphrase" — just press **Enter** (leave blank).
9. It asks "device password" — just press **Enter** (leave blank).
10. It asks about "connection type" or "device type" — pick **developer**.
11. Finally, choose **"save"**.
12. Then choose **"exit"**.

Now fetch the SSH key from the TV:
```bash
ares-novacom --device tv --getkey
```

It will prompt: `Input key server passphrase:` — type the passphrase shown on the TV's Developer Mode app screen (CASE SENSITIVE — type the exact characters shown on the TV). Press Enter.

Should print "Success". If not — most common fix is making sure the Dev Mode app on the TV says "Dev Mode Status: ON" and "Key Server: ON", and the passphrase on the TV screen hasn't changed.

Verify pairing works:
```bash
ares-install --device tv --list
```

If this prints a list of app IDs installed on the TV, pairing is good. Move on.

---

## PART F — Build the launcher and install it on the TV

Still in the terminal, still inside the `app` folder.

First, check the TV answers (the TV must be on, with the Developer Mode app showing Dev Mode Status ON):

```bash
ares-device -i -d tv
```

If it prints a list of details about the TV, go on. If it says `EHOSTUNREACH` or hangs, see "TV IP changed" at the bottom of this page, then try again.

Now build, package, install and launch, all in one:

```bash
npm run deploy
```

It takes a few seconds. You should see lines starting with `[build]`, then a line naming a file like `com.tvos.launcher_0.2.1_all.ipk` (the number is the app version, so it changes as we ship updates), then "Success".

**Look at the TV.** The Tv-OS launcher should open on screen.

If you ever want to do the same thing one step at a time, these lines do exactly what `npm run deploy` does. The `.` after `ares-package` means "the current folder", and the last line takes you back to the `app` folder:

```bash
npm run build
cd dist
ares-package .
ares-install -d tv ./com.tvos.launcher_*_all.ipk
ares-launch -d tv com.tvos.launcher
cd ..
```

---

## PART G — What to tell me after you see it on the TV

Please answer these three things so we know what to build next:

1. **Did the Tv-OS launcher open on the TV?** (dark screen, time at the top, "Apps" row, "Inputs" row, a white ring around the first tile, and a small grey text line at the bottom-left)
2. **Pick a tile with the remote, press OK — does it launch the real app?** (e.g. selecting "YouTube" opens YouTube)
3. **Press the HOME button on the remote. Then look for "Tv-OS" in the app list.** Is it there, or hidden?

Those three answers decide whether we polish the launcher next, start the root path (L2), or route around a firmware restriction.

---

## Common things that go wrong

- **"command not found: ares"** → Node is installed but the webOS CLI isn't on PATH. On Windows, close terminal and reopen. On macOS, run `echo $PATH` and tell me the output.
- **TV IP changed** (or `ares-device -i -d tv` says `EHOSTUNREACH`) → make sure the TV is on, read the IP on the Developer Mode app screen, and run this line with that IP in place of `NEW_IP`. Then rerun `ares-device -i -d tv`.
  ```bash
  ares-setup-device -m tv -i host=NEW_IP
  ```
- **Dev Mode expired** → open Dev Mode app on TV, press **Extend**. It gives you more hours. Then rerun from Part E's verify step.
- **"ssh: connect to host X port 9922: Connection refused"** → Dev Mode is OFF on the TV, or Key Server is OFF, or wrong IP.
- **The app installs but doesn't appear in the TV's app grid when you press HOME** → this is the "firmware may hide sideloaded apps" issue we expected. Launching via `ares-launch` still works. We'll handle this in L2.
