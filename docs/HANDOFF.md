# HANDOFF — Resume Here

**For any new Claude Code session (or human) picking up this project.**

If you're a new Claude instance: this is your single required read. Everything else is reference.
If you're the user: your first message to the new Claude session is at the bottom under "User's first message."

Last updated: 2026-10-20
Last code commit: `e03a2bd` (v0.2.1)
Installed on the TV and verified: **v0.2.1** (vanilla, in `app/`; = v0.2.0 + LS2-bridge fix + audit fixes)

---

## 1. Project in one line

Build a minimal, Apple-TV-quality launcher for a Digie LG-webOS-22-based TV. Replace the stock bloated webOS launcher. User owns the TV; this is personal use.

## 2. State of play, blunt

- **Repo is merged and current on the Mac.** Two lines of work ran in parallel and were merged in `f607a64`: the cloud session's v0.2.0 rewrite + this handoff + the postmortem (`dc6405a`), and the local session's docs audit (`14842e4`) + an Enact v0.1.4 fix attempt (`bf92770`, never installed, preserved on branch `backup/local-v0.1.4`). The user's `~/Tv-OS` already has the merge. **Do not reset it to origin** (see §9). If `git status` says the branch is ahead of origin, that only means it has not been pushed yet.
- **TV paired and reachable.** Dev Mode installed, Key Server ON, auto-update OFF, SSH key fetched; `ares-device -i -d tv` returns live data. Once on 2026-10-20 it did not answer (`EHOSTUNREACH`) because the TV was off; it came back at the same IP. The IP is DHCP, so §5 keeps a reachability check and a one-line IP fix. See `docs/research/01-device-decision.md`.
- **TV facts:** Digie AR-50, webOS22 / 7.5.8-28, firmware 04.56.35, 1.58 GB free of 1.92 GB, boardType `K8LP_DVB_AJ`, otaId `HE_DTV_C22P_AFADATAA`, last known LAN IP 192.168.29.246, SSH port 9922, device name `tv`.
- **L1 Enact (v0.1.0–0.1.4) abandoned.** The install cycles chased an Enact + Sandstone + Spotlight focus bug that never resolved; v0.1.3 was installed on the TV (focus result not recorded); v0.1.4 never ran. A later source audit explains it (wrong focus class, OK handler on the wrong component, launch call needing `webOSTV.js`). Full postmortem: `docs/research/06-enact-postmortem.md`.
- **L1 is proven: v0.2.1 is installed and passed all three checks on the TV (2026-10-20).** `app/` is ~300 lines of vanilla JS + one CSS file, 6.3 KB IPK, zero frameworks, zero bundlers; the only devDep is `@webos-tools/cli`. Results and platform facts read off the TV (Chromium 87.0.4280.88, native bridge present, `window.webOS` absent, LG Smart UI font present, Back = 461 swallowed, HOME never reaches the app): `docs/research/07-l1-on-tv-verification.md`.
- **Critical bug fixed before any install.** v0.2.0's `main.js` called `window.webOS.service.request`, which only exists when LG's `webOSTV.js` is loaded — and we do not load it. On the TV, OK would have done nothing. `main.js` now calls the native `WebOSServiceBridge` / `PalmServiceBridge` directly. That fix plus the other audit fixes ship as **v0.2.1**, which is what is on the TV now.
- **L2 (root + home-screen takeover) not started.** L1 is proven, so this is the next layer. No L2 research file and no L2 tooling exist yet (no `l2/` directory). Verified on the TV: without root, HOME always opens the stock webOS home, and exiting an app (e.g. Back out of YouTube) also lands there, not in Tv-OS. See §7.

## 3. The one rule

See `docs/plan/04-design-philosophy.md`. User's words:

> we aren't trying to utilize the 1.58gb of free storage, rather we are trying to debloat and only use the required frontend and backend usage of tv and giving it a clean, easy, zero stutter, smooth running model.

Every decision gets measured against that. If a feature fails the test, it doesn't ship. The reason we abandoned Enact and rewrote in vanilla JS is this rule.

## 4. Repo layout

```
Tv-OS/
├── README.md                              High-level project overview.
├── app/                                   The vanilla launcher (v0.2).
│   ├── README.md                          Install + deploy quickstart.
│   ├── package.json                       Scripts build / package / install-tv / launch-tv / deploy. Only devDep is @webos-tools/cli.
│   ├── .npmrc                             allow-scripts list for the webOS tool.
│   ├── .gitignore                         Ignores dist/ and node_modules/.
│   ├── scripts/build.js                   ~60-line copy-only build: wipes dist/, copies src/ + webos-meta/ into it.
│   ├── webos-meta/
│   │   ├── appinfo.json                   id com.tvos.launcher · requiredACG application.launcher · version.
│   │   ├── icon.png                       80 px placeholder (see research/03, finding 1).
│   │   └── icon-large.png                 130 px placeholder.
│   └── src/
│       ├── index.html                     The entry.
│       ├── styles.css                     All CSS. Tokens as :root custom properties.
│       └── main.js                        The whole app — clock, tiles, keyboard, LS2 bridge.
└── docs/
    ├── HANDOFF.md                         You are here.
    ├── plan/                              Project plan + install guides + philosophy.
    │   ├── 00-project-plan.md             Three-layer plan + orchestration rules.
    │   ├── 01-sideload-guide.md           Laptop to TV workflow.
    │   ├── 02-laptop-setup-step-by-step.md  Beginner version of 01.
    │   ├── 03-recovery-after-audit-fix.md v0.1-only history (Enact npm recovery).
    │   └── 04-design-philosophy.md        The one rule.
    ├── research/                          Single source of truth. Every claim tagged.
    │   ├── 00-master-findings.md
    │   ├── 01-device-decision.md
    │   ├── 02-l1-blockers-resolved.md
    │   ├── 03-pre-sideload-audit.md       v0.1 history.
    │   ├── 04-build-dry-run-cloud.md      v0.1 history.
    │   ├── 05-tv-detox-comparison.md
    │   ├── 06-enact-postmortem.md
    │   └── 07-l1-on-tv-verification.md    v0.2.1 on-TV results + measurements to take.
    ├── design/
    │   └── 01-visual-language.md          Tokens live in app/src/styles.css now.
    └── tv-side/
        └── 00-things-to-do-on-the-tv.md   TV-screen steps the user runs by hand.
```

Not in git: `app/dist/` (build output), `app/node_modules/` (`@webos-tools/cli` only; the old Enact packages were pruned on 2026-10-20) and `app/package-lock.json` (gitignored, see §9).

## 5. The exact next thing to do

**Done on 2026-10-20: v0.2.1 is installed and all three checks passed.** Use this section to reinstall after any change (bump the version first, see §6).

The Mac repo is already merged and current. Do **not** fetch-and-reset it (an earlier version of this section said to; that would have destroyed unpushed local commits — see §9).

The user runs these on the Mac, one line at a time. First turn the TV on and open the Developer Mode app: Dev Mode Status must be ON (press Extend if the session timer is low). Then check that the TV answers:

```
cd ~/Tv-OS/app
ares-device -i -d tv
```

If that prints device info, go on to the install. If it fails (`EHOSTUNREACH` or a timeout), the TV is off or has a new IP. Read the IP shown in the Developer Mode app, put it in place of `NEW_IP` below, then run `ares-device -i -d tv` again:

```
ares-setup-device -m tv -i host=NEW_IP
```

Then install and deploy:

```
npm install
npm run deploy
```

`npm run deploy` runs: `build` (wipes `dist/`, copies `src/` + `webos-meta/` in) → `cd dist && ares-package .` → `ares-install -d tv ./dist/com.tvos.launcher_*.ipk` (for this release that file is `com.tvos.launcher_0.2.1_all.ipk`) → `ares-launch -d tv com.tvos.launcher`.

Expected: the deploy takes about 5 seconds.

### Three verification questions after launch

1. **Does focus land on YouTube on open?** (visible: white ring, scale, glow)
2. **Do arrow keys move the ring between tiles?**
3. **Does pressing OK on a focused tile launch the real app?**

If all three are YES → L1 proven (it is, as of v0.2.1). Next: the measurements listed in `docs/research/07-l1-on-tv-verification.md`, then L2.
If any NO → read the `#debug` overlay at the bottom-left of the screen (it reports what the launcher thinks is happening) and open `ares-inspect --device tv --app com.tvos.launcher --open` to attach Chrome DevTools.

## 6. The hard constraints — do not forget

- **Do not run `npm audit fix --force`.** Not needed here (no deps that would benefit). Breaks pins. (`docs/plan/03-recovery-after-audit-fix.md` is v0.1-only history.)
- **Bump the version in BOTH `webos-meta/appinfo.json` AND `package.json` on every change you install.** webOS caches the WebView assets if the version is the same. We hit this in v0.1.
- **Do not install LG's Developer Mode app on a rooted TV.** We're not rooted yet; relevant only if we start L2.
- **Do not accept any firmware update** on the TV. Auto-update is OFF; keep it that way. An update may close the root window if we later open L2.

## 7. L2 — the user's actual end goal

User wants Tv-OS to replace the stock webOS home screen entirely: press HOME → Tv-OS opens, not Digie's launcher. (No L2 research file exists yet; the steps below are the earlier outline, still unverified.) On webOS this requires:

1. **Root the TV** via `faultmanager-autoroot` (works webOS 4.0+ incl. 7.5.8; `[UNVERIFIED]` on Digie Hub).
2. **Install Homebrew Channel** on the rooted TV.
3. **Hook the HOME button** via Homebrew Channel's input hook so it opens com.tvos.launcher.
4. **Set Tv-OS as the boot startup app.**
5. **Disable LG bloat / ads / promos** via Homebrew Channel scripts.

**Non-negotiable prereqs before any L2 attempt:**
- A tested `install.sh` + `undo.sh` script pair (see `docs/research/05-tv-detox-comparison.md`).
- A written "do-not-touch" list of webOS apps that must stay enabled.
- An accepted explicit risk acknowledgement from the user — this is a Digie Hub build untested by the webosbrew community; worst case = brick with no community recovery image.

User has already said they accept the root risk once. Re-confirm before action.

## 8. Research doc protocol

Every claim in `docs/research/` is tagged:

- `[VERIFIED]` — confirmed by a cited source or by direct observation (e.g. a cloud build log, a photo from the user).
- `[UNVERIFIED]` — plausible but not confirmed. Must be verified before relied on.
- `[FALSE]` — a thing we initially believed that research disproved.

When you add a claim, add the tag. When you verify an `[UNVERIFIED]` one, upgrade it with a note on how you verified. Do not delete `[FALSE]` entries — they prevent re-making the same mistake.

## 9. Where there be dragons

Things that have bitten us or almost did, so you look for them first:

- **CSS Modules + `:global(.spottable-focused)` in Enact.** Caused focus to never visibly land. Abandoned Enact over this. (Later source audit: `^4.0.9` installed Enact 4.9.8, which never sets that class — see `docs/research/06-enact-postmortem.md`.)
- **`window.webOS.service` needs `webOSTV.js` — call the native bridge.** It only exists when LG's `webOSTV.js` library is loaded, and we do not load it. Both v0.1 and v0.2.0 called it, so OK would have launched nothing on the TV. Use `window.WebOSServiceBridge` (fallback `window.PalmServiceBridge`), as `main.js` now does.
- **Never `git reset --hard` when the local branch has unpushed commits — merge instead.** The old §5 said `git fetch origin && git reset --hard origin/...`; on the Mac that would have wiped `14842e4` and `bf92770`. Check `git status` / `git log origin/<branch>..HEAD` first, and merge.
- **Dev Mode + root are mutually exclusive.** Installing LG's Dev Mode app on a rooted TV breaks it. Pick one path.
- **webOS Hub != real LG webOS.** Digie uses the Hub (licensed, re-skinnable) variant. Homebrew community tests on real LG. Hub-specific behavior is `[UNVERIFIED]` by default.
- **A Mac paste-block with `#` comments or apostrophes breaks zsh.** Give the user one command per line, no prose mixed in, no `#` comment lines or trailing `# comments` in a block, no `'` in words like "haven't."
- **Package-lock cross-platform.** We don't commit the vanilla v0.2 `package-lock.json` (only dep is `@webos-tools/cli` dev — fine without one). If a future refactor adds real deps, add the lock back.

## 10. Attribution

Every commit this project makes ends with a `Co-Authored-By` line naming the model the current session runs on. For this session that is:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

A different session uses its own model name. Older commits (up to `dc6405a`) used `Claude Opus 4.7` and also appended a `Claude-Session:` URL; that URL line is not required.

Every PR body ends with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

User has not asked for PRs on this project. Push directly to `research/phase-0-feasibility` or whatever branch is current.

---

## 11. User's first message to the new Claude session

Paste exactly:

> Read docs/HANDOFF.md and continue from there. The TV is paired, dev mode is on, I'm on my Mac in ~/Tv-OS and the repo is already merged, so do not reset it. Walk me through installing v0.2.1 one command at a time, starting with checking that the TV answers. Zero prose mixed into commands, zero apostrophes, zero `#` comments — zsh breaks on them.

Then proceed with the three verification questions in §5. (As of 2026-10-20 they all passed on v0.2.1; a new session should start from §2 instead.)
