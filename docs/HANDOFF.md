# HANDOFF — Resume Here

**For any new Claude Code session (or human) picking up this project.**

If you're a new Claude instance: this is your single required read. Everything else is reference.
If you're the user: your first message to the new Claude session is at the bottom under "User's first message."

Last updated: 2026-10-20
Last commit before this handoff: `7b662fe` (v0.1.3, abandoned)
Current version to install: **v0.2.0** (vanilla rewrite, in `app/`)

---

## 1. Project in one line

Build a minimal, Apple-TV-quality launcher for a Digie LG-webOS-22-based TV. Replace the stock bloated webOS launcher. User owns the TV; this is personal use.

## 2. State of play, blunt

- **TV paired and reachable.** Dev Mode installed, Key Server ON, auto-update OFF, SSH key fetched, `ares-device -i --device tv` returns live data. See `docs/research/01-device-decision.md`.
- **TV facts:** Digie AR-50, webOS22 / 7.5.8-28, firmware 04.56.35, 1.58 GB free of 1.92 GB, boardType `K8LP_DVB_AJ`, otaId `HE_DTV_C22P_AFADATAA`, LAN IP (today) 192.168.29.246.
- **L1 Enact scaffold abandoned.** Four install cycles iterated on an Enact + Sandstone + Spotlight focus bug that never resolved. Full postmortem: `docs/research/06-enact-postmortem.md`.
- **L1 v0.2 vanilla rewrite complete and build-verified in cloud.** `app/` now contains ~200 lines of vanilla JS, 5.3 KB IPK, zero frameworks, zero bundlers. **Not yet installed on the TV.** That's where the next session picks up.
- **L2 (root + home-screen takeover) deferred.** Research task #4 open; blocked on L1 proving out. See the L2 section below for what L2 would involve.

## 3. The one rule

See `docs/plan/04-design-philosophy.md`. User's words:

> we aren't trying to utilize the 1.58gb of free storage, rather we are trying to debloat and only use the required frontend and backend usage of tv and giving it a clean, easy, zero stutter, smooth running model.

Every decision gets measured against that. If a feature fails the test, it doesn't ship. The reason we abandoned Enact and rewrote in vanilla JS is this rule.

## 4. Repo layout

```
Tv-OS/
├── README.md                             High-level project overview.
├── app/                                   The vanilla launcher (v0.2).
│   ├── README.md                          Install + deploy quickstart.
│   ├── package.json                       Only devDep is @webos-tools/cli.
│   ├── .npmrc                             allow-scripts list for the webOS tool.
│   ├── scripts/build.js                   ~50-line copy-only build.
│   ├── webos-meta/
│   │   ├── appinfo.json                   id com.tvos.launcher · requiredACG set.
│   │   ├── icon.png                       (regen from the script in postmortem if needed)
│   │   └── icon-large.png
│   └── src/
│       ├── index.html                     The entry.
│       ├── styles.css                     All CSS. Tokens as :root custom properties.
│       └── main.js                        The whole app — clock, tiles, keyboard, LS2 bridge.
└── docs/
    ├── HANDOFF.md                         You are here.
    ├── plan/                              Project plan + install guides + philosophy.
    │   ├── 00-project-plan.md
    │   ├── 01-sideload-guide.md
    │   ├── 02-laptop-setup-step-by-step.md
    │   ├── 03-recovery-after-audit-fix.md
    │   └── 04-design-philosophy.md
    ├── research/                          Single source of truth. Every claim tagged.
    │   ├── 00-master-findings.md
    │   ├── 01-device-decision.md
    │   ├── 02-l1-blockers-resolved.md
    │   ├── 03-pre-sideload-audit.md
    │   ├── 04-build-dry-run-cloud.md
    │   ├── 05-tv-detox-comparison.md
    │   └── 06-enact-postmortem.md
    ├── design/
    │   └── 01-visual-language.md          Tokens live in app/src/styles.css now.
    └── tv-side/
        └── 00-things-to-do-on-the-tv.md   TV-screen steps the user runs by hand.
```

## 5. The exact next thing to do

**Install v0.2.0 on the TV.** Then verify three things.

Commands (user runs on their Mac, one line at a time):

```
cd ~/Tv-OS && git fetch origin && git reset --hard origin/research/phase-0-feasibility
cd ~/Tv-OS/app && npm install
npm run deploy
```

`npm run deploy` runs: `build` → `ares-package .` in `dist/` → `ares-install -d tv ./dist/com.tvos.launcher_0.2.0_all.ipk` → `ares-launch -d tv com.tvos.launcher`.

Expected: ~5 seconds total.

### Three verification questions after launch

1. **Does focus land on YouTube on open?** (visible: white ring, scale, glow)
2. **Do arrow keys move the ring between tiles?**
3. **Does pressing OK on a focused tile launch the real app?**

If all three are YES → L1 proven. Open L2 research.
If any NO → read the `#debug` overlay at the bottom-left of the screen (it reports what the launcher thinks is happening) and open `ares-inspect --device tv --app com.tvos.launcher --open` to attach Chrome DevTools.

## 6. The hard constraints — do not forget

- **Do not run `npm audit fix --force`.** Not needed here (no deps that would benefit). Breaks pins.
- **Bump the version in BOTH `webos-meta/appinfo.json` AND `package.json` on every change you install.** webOS caches the WebView assets if the version is the same. We hit this in v0.1.
- **Do not install LG's Developer Mode app on a rooted TV.** We're not rooted yet; relevant only if we start L2.
- **Do not accept any firmware update** on the TV. Auto-update is OFF; keep it that way. An update may close the root window if we later open L2.

## 7. L2 — the user's actual end goal

User wants Tv-OS to replace the stock webOS home screen entirely: press HOME → Tv-OS opens, not Digie's launcher. On webOS this requires:

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

- **CSS Modules + `:global(.spottable-focused)` in Enact 4.0.9.** Caused focus to never visibly land. Abandoned Enact over this.
- **Dev Mode + root are mutually exclusive.** Installing LG's Dev Mode app on a rooted TV breaks it. Pick one path.
- **webOS Hub != real LG webOS.** Digie uses the Hub (licensed, re-skinnable) variant. Homebrew community tests on real LG. Hub-specific behavior is `[UNVERIFIED]` by default.
- **A Mac paste-block with `#` comments or apostrophes breaks zsh.** Give the user one command per line, no prose mixed in, no `'` in words like "haven't."
- **Package-lock cross-platform.** We don't commit the vanilla v0.2 `package-lock.json` (only dep is `@webos-tools/cli` dev — fine without one). If a future refactor adds real deps, add the lock back.

## 10. Attribution

Every commit this project makes ends with:

```
Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GJSK85d6PYM4gChzn5q7gh
```

The specific model line may change by session (this handoff was written by claude-opus-4-7).

Every PR body ends with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

https://claude.ai/code/session_01GJSK85d6PYM4gChzn5q7gh
```

User has not asked for PRs on this project. Push directly to `research/phase-0-feasibility` or whatever branch is current.

---

## 11. User's first message to the new Claude session

Paste exactly:

> Read docs/HANDOFF.md and continue from there. The TV is paired, dev mode is on, I'm on my Mac in ~/Tv-OS. Walk me through installing v0.2.0 one command at a time. Zero prose mixed into commands, zero apostrophes, zero `#` comments — zsh breaks on them.

Then proceed with the three verification questions in §5.
