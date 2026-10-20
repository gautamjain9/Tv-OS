# Tv-OS — Project Plan

**Project goal (user's words):** Replace the slow Digie/webOS experience with a custom,
Apple-TV-quality UI. Make it universal across TVs where possible.

**Reality after Phase 0 research:**
- Full OS replacement on retail smart TVs is not possible (locked bootloaders, signed FW).
- "Universal" across different TV OSes (webOS/Tizen/Android TV/Roku) is not possible from
  a single codebase at the OS level. "Universal across any TV" is only realistic via an
  external HDMI box (L3).
- Apple-TV-grade feel is capped by this TV's hardware (cheap ARM, low RAM). Realistic on
  L3 only; on-device (L1/L2) delivers "much better than stock" but not Apple-TV-equal.
- The user has accepted these constraints and the root risk.

## Three-layer architecture

### Layer 1 — Custom webOS Launcher App (no root)
Build a webOS app (web tech: HTML/CSS/JS, likely React or vanilla + CSS animations).
Sideload via official Developer Mode. Set as startup/home-replacement where possible.

**Deliverables:**
- A working `.ipk` installable on the TV via `ares-install`.
- A home screen app that shows: apps grid, now-playing hero, time/weather, settings quick-access.
- "Apple-TV-inspired" means: generous spacing, large focus-ring, parallax on tile hover,
  smooth 60fps transitions where the SoC permits, SF Pro-style typography (via free
  equivalent — Inter or similar), subtle gradients, zero clutter.

**Blockers to resolve first:** can the TV launch an arbitrary user app at startup, or
does webOS Hub lock the home screen? → research task.

### Layer 2 — Root + System Tuning
Only after L1 works. Only if user still wants to proceed knowing the risk.
Uninstall Developer Mode → run faultmanager-autoroot → install Homebrew Channel →
remove bloat → optionally install L1 as the real home.

**Deliverables:**
- Research doc on exact faultmanager flow and Digie-specific unknowns.
- Pre-root checklist (backups, recovery info, exact firmware pin).
- Post-root tuning script (telemetry off, bloat removed, launcher pinned).

### Layer 3 — Universal External Box
A Raspberry Pi 5 (or N100 mini-PC) running the same launcher UI as a native Linux app,
rendering over HDMI. Any TV, any brand, becomes a "dumb display." This is where the
"Apple-TV quality" promise actually becomes real.

**Deliverables:**
- Pi 5 image with auto-boot into launcher.
- Same codebase as L1 where possible (web runtime inside Electron/Chromium kiosk).
- Hardware list, cost sheet, setup script.

## Research still owed (before coding starts)

- [x] Can a sideloaded webOS app be set as the home/startup screen without root? — **No**;
  needs root. See `docs/research/02-l1-blockers-resolved.md`.
- [x] Which webOS 7.x APIs are exposed to third-party apps (app launching, settings deep links,
  network status, HDMI input switching)? — see `02-l1-blockers-resolved.md`.
- [ ] Does the Digie Hub build strip any LG-standard APIs?
- [ ] faultmanager-autoroot current status: latest release, known failures on third-party
  Hub firmware, exact prerequisites.
- [ ] Backup/recovery options: can we dump the TV's current firmware before rooting?

## Orchestration rules (how we work)

1. **Master research doc** = `docs/research/00-master-findings.md` — single source of truth,
   every claim tagged `[VERIFIED]` / `[UNVERIFIED]` / `[FALSE]` with sources.
2. **No hallucination:** if I don't know, I say "unknown — research task opened."
3. **No fake validation:** I will not tell you a plan is sound when it isn't.
4. **Research agents** are spawned only for well-defined, bounded searches, and their
   findings are reviewed and tagged before entering the master doc.
5. **TV-side instructions** live in `docs/tv-side/` so you can follow them on mobile while I
   work in the repo on the laptop/cloud.
6. **Everything is committed to the branch** so you can pull on either device.

## Immediate next steps (as of plan creation — superseded; see README "Current status")

1. **You:** follow `docs/tv-side/00-things-to-do-on-the-tv.md` — disable auto-update, confirm
   firmware, get TV IP, report back.
2. **Me:** research the three unresolved L1 blockers (startup-app lock, API surface,
   Hub stripping) and update master doc.
3. **Me:** scaffold the launcher app repo structure (webOS app skeleton, build system,
   placeholder UI) so we can sideload a "hello world" IPK the moment you're ready.

I'll do (2) and (3) now, in parallel.
