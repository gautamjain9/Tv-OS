# Tv-OS

Building a custom, Apple-TV-inspired launcher to replace the slow stock experience on
Digie / LG webOS Hub TVs.

> This is a personal-use project on a TV the author owns. See
> `docs/research/00-master-findings.md` for the honest feasibility report and the three
> hard constraints we're building within.

## Current status

- **Phase 0 (research):** complete. See `docs/research/`.
- **Phase 1 (L1 — no-root launcher):** scaffolded. App skeleton under `app/`.
  Blocked on TV-side readout (see `docs/tv-side/00-things-to-do-on-the-tv.md`).
- **Phase 2 (L2 — root, debloat, HOME takeover):** deferred. Research task open.
- **Phase 3 (L3 — Raspberry Pi 5 universal box):** not started.

## Repo layout

```
Tv-OS/
├── README.md                                 This file.
├── app/                                      The Enact launcher (L1 + L2 share this).
│   ├── README.md                             How to build + sideload.
│   ├── package.json
│   ├── webos-meta/appinfo.json               webOS app manifest.
│   └── src/
│       ├── App/, views/, components/
│       ├── services/webosBridge.js           LS2 API shim.
│       └── theme/tokens.less                 Design tokens.
└── docs/
    ├── plan/
    │   ├── 00-project-plan.md                Three-layer plan + orchestration rules.
    │   └── 01-sideload-guide.md              Exact laptop ↔ TV workflow.
    ├── research/
    │   ├── 00-master-findings.md             Single source of truth. Every claim tagged.
    │   ├── 01-device-decision.md             Readout of the user's TV; path decision.
    │   └── 02-l1-blockers-resolved.md        L1 unknowns, resolved.
    ├── design/
    │   └── 01-visual-language.md             Visual + motion system (tokens live in app/).
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
