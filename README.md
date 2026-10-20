# Tv-OS

Building a custom, Apple-TV-inspired launcher to replace the slow stock experience on
Digie / LG webOS Hub TVs.

> This is a personal-use project on a TV the author owns. See
> `docs/research/00-master-findings.md` for the honest feasibility report and the three
> hard constraints we're building within.

## Current status

Start here: **`docs/HANDOFF.md`** (state of play + the exact next commands).

- **Phase 0 (research):** complete. See `docs/research/`.
- **Phase 1 (L1 — no-root launcher):**
  - v0.1.x (Enact + Sandstone, abandoned): v0.1.0–0.1.2 were sideloaded via Developer
    Mode; remote focus never worked; v0.1.3 was installed on the TV (focus result not recorded); v0.1.4 never ran. See
    `docs/research/06-enact-postmortem.md`.
  - **v0.2.1 (vanilla HTML/CSS/JS, ~5 KB IPK):** built, not yet installed. It fixes a
    v0.2.0 bug that would have made OK on the remote do nothing (the launch call needed
    LG's `webOSTV.js`; it now uses the native service bridge).
  - The TV did not answer at its last known IP at the last check — see HANDOFF §5.
  - TV readout: `docs/research/01-device-decision.md`.
- **Phase 2 (L2 — root, debloat, HOME takeover):** research in progress in
  `docs/research/07-l2-boot-takeover.md`. No L2 tooling yet.
- **Phase 3 (L3 — Raspberry Pi 5 universal box):** not started.

## Repo layout

```
Tv-OS/
├── README.md                                 This file.
├── app/                                      The vanilla launcher, v0.2 (L1 + L2 share this).
│   ├── README.md                             How to build + sideload.
│   ├── package.json                          npm scripts (build, deploy). Only devDep: @webos-tools/cli.
│   ├── .npmrc                                allow-scripts list for the webOS tool.
│   ├── scripts/build.js                      Copy-only build: src/ + webos-meta/ into dist/.
│   ├── webos-meta/                           appinfo.json (webOS manifest) + 2 placeholder icons.
│   └── src/
│       ├── index.html                        The entry.
│       ├── styles.css                        All CSS. Design tokens as :root custom properties.
│       └── main.js                           Clock, tiles, remote keys, LS2 bridge.
└── docs/
    ├── HANDOFF.md                            Resume here. State of play + next commands.
    ├── plan/
    │   ├── 00-project-plan.md                Three-layer plan + orchestration rules.
    │   ├── 01-sideload-guide.md              Exact laptop ↔ TV workflow.
    │   ├── 02-laptop-setup-step-by-step.md   Beginner version of the sideload guide.
    │   ├── 03-recovery-after-audit-fix.md    v0.1-only history: undo a bad `npm audit fix --force`.
    │   └── 04-design-philosophy.md           The one rule: debloat, do not fill space.
    ├── research/
    │   ├── 00-master-findings.md             Single source of truth. Every claim tagged.
    │   ├── 01-device-decision.md             Readout of the TV; path decision.
    │   ├── 02-l1-blockers-resolved.md        L1 unknowns, resolved.
    │   ├── 03-pre-sideload-audit.md          v0.1 history: zero-trust sweep before first install.
    │   ├── 04-build-dry-run-cloud.md         v0.1 history: Enact build verified in a container.
    │   ├── 05-tv-detox-comparison.md         What we take from Ansub/tv-detox.
    │   ├── 06-enact-postmortem.md            Why Enact was abandoned for vanilla JS.
    │   └── 07-l2-boot-takeover.md            L2 research (being written).
    ├── design/
    │   └── 01-visual-language.md             Visual + motion system (tokens live in app/src/styles.css).
    └── tv-side/
        └── 00-things-to-do-on-the-tv.md      Steps for the user to run on the TV.
```

## Orchestration rules (how we work)

1. The master research doc is **the one place** facts live. Every claim is tagged
   `[VERIFIED]` / `[UNVERIFIED]` / `[FALSE]`.
2. **No hallucination.** Unknown = "unknown, research task opened."
3. **No fake validation.** Plans are honest about what the hardware can and can't do.
4. Instructions for the TV live in `docs/tv-side/` so they're readable on mobile while
   the laptop runs the build.

## Not goals (so we don't drift)

- Replacing webOS or installing a different OS on this TV. **Not possible** on retail
  smart TVs; locked bootloader, signed firmware.
- "Universal across any TV brand" from one on-TV codebase. **Not possible.** The L3
  Raspberry Pi path is the only honest "universal" answer.
- Matching Apple TV's actual *speed* on this specific TV. 1-2GB RAM caps the ceiling.
  L1/L2 deliver "much better than stock"; only L3 can match Apple TV's feel.
