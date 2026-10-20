# 01 — Device Readout & Path Decision

## The physical device (confirmed by user, 2026-10-20)

| Field | Value |
|---|---|
| Device name on TV | "Gautam tv" |
| Brand | Digie |
| Model | **AR-50** |
| Serial | AR24070…2A0884 (partially occluded by camera glare) |
| webOS TV version | **webOS22 / 7.5.8-28** `[VERIFIED by photo]` |
| TV firmware / software build | **04.56.35** (Digie model-specific build string) `[VERIFIED by photo]` |
| Underlying platform | **webOS Hub** `[VERIFIED by photo]` — "webOS Hub" branding visible on Software Update screen |
| Total internal storage | 1.92 GB |
| Free internal storage at project start | **1.58 GB** (budget constraint for everything we install) |
| Total power-on time | 2456 hours (TV is well-used, not new) |
| Auto-update | **OFF** (verified by photo; toggle in left position) |
| TV LAN IP (today) | **192.168.29.246** |
| Developer Mode | Installed, Dev Mode Status ON, Key Server ON |
| **Board type** | `K8LP_DVB_AJ` (LG K8LP SoC family, DVB tuner, Asia region — reported by ares-device -i, 2026-10-20) |
| **OTA ID** | `HE_DTV_C22P_AFADATAA` (Hub Edition DTV, C22P platform — reported by ares-device -i) |
| SSH pairing | Verified via `ares-device -i --device tv` returning real values. |

## What this version means — hard facts from the live research

### Path A — RootMyTV (older exploit)
**STATUS: DEAD on this device.** The RootMyTV project page explicitly states it "never
worked on any TVs that came with webOS 1, 2, 7 (22), or 8 (23)." This device came with
webOS 22. Not "patched" — never worked. Do not try it.

### Path B — faultmanager-autoroot
**STATUS: LIKELY VIABLE but UNVERIFIED on third-party Hub.**
- Targets webOS 4.0+, including webOS 7, 8, 9.
- Community fork reports personal testing on webOS 4.5, 6, 7, 8, 9.
- webosbrew.org (as of Jan 2025): "No patched firmware exists."
- **CAVEAT: all testing has been on genuine LG TVs. Digie webOS Hub is a different firmware
  lineage, untested in the community.** This is first-time-ever territory on this hardware.

### Path C — DejaVuln
**STATUS: PARTIALLY PATCHED, but still works on 7.x.**
- Target range: webOS 3.5 ~ 8.x.
- LG began rolling out patches starting from recent models.
- Author warning: **"Do not update your firmware if you want to be able to root your TV."**

### Path D — Developer Mode (official, no-root)
**STATUS: CONFIRMED WORKING by user.** Zero brick risk. Only limitation: 1000-hour app
session timer (resettable). Cannot modify the base OS, but CAN sideload custom webOS apps,
including a replacement launcher-style home-screen app.

## Hard constraints that must be respected

1. **Developer Mode and Rooting are mutually exclusive.**
   - Rooting a TV with Dev Mode installed can break it (confirmed by both RootMyTV and
     faultmanager docs).
   - Fix: uninstall Developer Mode before rooting; do not reinstall after.
2. **Firmware updates close the window.**
   - LG is actively patching. If this TV auto-updates past 7.5.8-28, the root path may die.
   - Fix: disable auto-update on the TV BEFORE anything else.
3. **1.92 GB storage total** on this unit means the custom app budget is tiny (hundreds of
   MB max, probably <100 MB per app for comfort). Design accordingly.
4. **Hardware ceiling:** cheap ARM SoC + low RAM. Even perfect software cannot deliver
   Apple-TV-grade smoothness on this chassis. For true Apple-TV feel, L3 (external box)
   is the only honest path.

## Chosen branch: a 3-layer project

| Layer | Path | Why | Risk |
|---|---|---|---|
| L1 | Build a custom webOS launcher app via Developer Mode | Delivers immediate visible improvement, zero risk, teaches us the webOS app model | None |
| L2 | Root via faultmanager-autoroot → debloat + custom startup | Removes ads/bloat, unlocks full control, enables L1 as true home | Real brick risk (untested firmware) |
| L3 | Raspberry Pi 5 running a custom "TV OS" launcher | The only path that delivers "universal, any TV, Apple-TV quality" | None (TV untouched) |

Order: **L1 → L2 → L3**. L1 is the fastest-feedback loop and gives us a working codebase
that mostly carries over to L3.
