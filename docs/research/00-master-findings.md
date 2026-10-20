# Tv-OS — Master Research & Findings

**Single source of truth for this project.** The orchestrator (Claude) appends verified
findings here so nothing has to be re-derived. Every factual claim is tagged:

- `[VERIFIED]` — confirmed by a cited source (link in the Sources section of the relevant entry).
- `[UNVERIFIED]` — plausible but not yet confirmed; must be proven before we rely on it.
- `[FALSE]` — a thing we initially assumed or a common myth that the research disproved.

Last updated: 2026-10-20 (second docs audit: Enact abandoned, v0.2 vanilla, LS2-bridge finding)

---

## 0. The target device (THIS IS THE CONSTRAINT THAT DECIDES EVERYTHING)

The user's TV is a **Digie-brand webOS TV**, not a genuine LG TV.

- `[VERIFIED]` Digie is an Indian consumer-electronics brand. Amazon.in listings name the
  manufacturer/packer as **CANDID AUTOMATION, Kavinagar, Ghaziabad** — the same address on
  Digie's own contact page. Digie licenses the webOS platform; it does not develop it.
- `[VERIFIED]` The software is **LG's webOS "Hub"** — the version LG licenses to third-party
  TV makers (launched Oct 2022, ~200 partner brands incl. Seiki, Aiwa, Hyundai, Konka). LG
  itself states this is **"not the exact same experience as LG TVs, but a customized version
  designed for third parties."** Partners can re-skin the home screen, add their logo, etc.
- `[VERIFIED]` At least some Digie webOS models ship with **1GB RAM / 8GB storage**
  (e.g. the 43-inch DG-series on Amazon.in). This is extremely low-end hardware.

### Hard implications (blunt)
1. **The slowness is primarily a HARDWARE problem.** 1GB RAM + cheap ARM SoC + slow eMMC +
   cheap WiFi radio. For comparison, Apple TV 4K has ~4GB RAM and a far faster chip. **No
   software can make 1GB RAM feel like Apple TV.** This is a physics/economics ceiling, not a
   tuning problem.
2. **The homebrew/root ecosystem targets genuine LG TVs**, keyed to LG's own firmware version
   tables. A third-party webOS Hub build (Digie/Candid) is a **different, untested firmware
   lineage.** Nobody maintains compatibility data for it. `[UNVERIFIED]` whether any root
   tool works on it.
3. **Developer Mode** (the officially supported, no-root path) depends on the TV having a
   working LG Content Store + LG developer-account plumbing. `[VERIFIED]` working on this
   Hub TV (2026-10-20, see below).

### On-TV readout — resolved 2026-10-20 (details + photos: `01-device-decision.md`)
- `[VERIFIED]` Model **AR-50**; webOS **22 / 7.5.8-28**; firmware build **04.56.35**;
  platform **webOS Hub**; board `K8LP_DVB_AJ`; OTA ID `HE_DTV_C22P_AFADATAA`.
- `[VERIFIED]` Developer Mode app is available on this Hub TV and works: Dev Mode ON,
  Key Server ON, `ares-device -i` pairing verified, Tv-OS v0.1.x (Enact) IPKs sideloaded
  and running (focus broken — see `06-enact-postmortem.md`). v0.2.x not yet installed.
- `[VERIFIED]` Last known LAN IP 192.168.29.246, SSH port 9922, device name `tv`. At the
  last check (2026-10-20) the TV did not answer at that IP (`EHOSTUNREACH`) — `[UNVERIFIED]`
  whether it was off or DHCP gave it a new IP.
- `[VERIFIED]` Storage: 1.92 GB total, 1.58 GB free at project start.
- `[UNVERIFIED]` RAM of this specific unit (other Digie models list 1 GB; not read off
  this TV yet).

---

## 1. Can you REPLACE the OS / flash your own OS? — NO

- `[FALSE]` "I can flash my own OS / webOS OSE onto the TV." **webOS OSE (Open Source Edition)
  runs on Raspberry Pi and emulators, NOT on retail LG/third-party TVs.** Different target
  entirely. (To be re-cited in a dedicated research pass, but this is well established.)
- `[VERIFIED-by-principle]` Retail smart TVs have locked bootloaders and signed firmware; there
  is no supported path to replace the base OS. Rooting (below) modifies the existing userland;
  it does not replace the OS.
- `[FALSE]` "Universal — one OS for any TV." LG webOS, Samsung Tizen, Android/Google TV, Roku,
  Fire OS, Vidaa are mutually incompatible platforms. No universal flashable TV OS exists.

---

## 2. Rooting the existing webOS (the user's chosen path) — status

Context: these are **legitimate open-source homebrew tools for devices you own** (the
webosbrew community). Research framed strictly around that.

- `[VERIFIED]` **RootMyTV** first-patched webOS versions by model year: 2018 → 4.4.2,
  2019 → 4.9.7, 2020 → 5.4.0, 2021 → 6.3.0. Never worked below webOS 3.4.0, nor on webOS
  1/2/7(22)/8(23). → **Dead for this TV** (ships webOS 22); see `01-device-decision.md`. v1 covered 3.4–6.0; v2 covered 4.x–6.2+. Unlikely to work on firmware
  released since mid-2022.
- `[VERIFIED]` **DejaVuln autoroot**: works on webOS 3.5+; not on 2016-or-earlier TVs; all
  release versions of webOS 9 ("webOS 24") are patched.
- `[VERIFIED]` **Faultmanager autoroot**: targets webOS 4.0+; the underlying issue is present
  webOS 4.0 through 10.0 (per the tool's README — breadth to be re-confirmed independently).
- `[VERIFIED]` There is NO single official "supported models" list. Vulnerability depends on
  the specific firmware version. The canonical check is **CanI.RootMy.TV**.
- `[VERIFIED]` **Fallback if not rootable:** enable **Developer Mode** and use the webosbrew
  **Device Manager** app — this is the no-root route and is what we'll lean on.

### What rooting would/wouldn't buy us (blunt, for the chosen TV-modification path)
- Even if root worked, it gives a rooted userland ON TOP of webOS. It does NOT replace LG's
  compositor/launcher with something Apple-TV-fast. `[UNVERIFIED]` and fragile to try.
- Biggest realistic wins from root: remove bloat, disable telemetry/ads, SSH access, run
  homebrew apps, set a custom startup app. Real but modest, and capped by 1GB RAM.
- L2 research in progress: `docs/research/07-l2-boot-takeover.md` (being written). No L2
  tooling exists yet (there is no `l2/` directory).

---

## 3. The officially supported path (NO root) — build & sideload custom webOS apps

- `[VERIFIED]` LG deprecated the old "webOS TV CLI" in **March 2024**; the current tool is the
  **webOS CLI** (`@webos-tools/cli`, v3.0.0), supporting both webOS OSE and webOS TV.
- `[VERIFIED]` Standard flow: install **Developer Mode** app from LG Content Store → sign in
  with a developer account → enable Dev Mode + Key Server → `ares-setup-device` →
  `ares-novacom --getkey` → package app → `ares-install -d <device> app.ipk`.
- `[VERIFIED]` Dev Mode sessions time out; extend via the Dev Mode app or `ares-extend-dev`.
- `[VERIFIED]` Do NOT install LG's Developer Mode app on a ROOTED TV — it can break the system
  and force a factory reset. Pick ONE path (root OR dev-mode), not both.
- webOS apps are essentially **web apps** (HTML/CSS/JS, often React/Enyo) packaged as `.ipk`.
  A custom launcher-style "home" app is buildable this way. `[VERIFIED]` (via community
  sources, `02-l1-blockers-resolved.md`) that Dev Mode alone gives **no** boot persistence
  or HOME takeover — that needs root (L2).
- `[VERIFIED]` (LG `webOSTV.js` API; installed `@enact/webos` 4.9.8 source) `window.webOS.service.request`
  exists only when LG's `webOSTV.js` library is loaded. Without it, call the native
  `window.WebOSServiceBridge` (older name `window.PalmServiceBridge`) — that is what
  `webOSTV.js` and Enact's `LS2Request` do internally. Both v0.1 and v0.2.0 got this wrong;
  v0.2.1 calls the bridge directly. `[UNVERIFIED]` on this TV until v0.2.1 is installed.
  Details: `06-enact-postmortem.md` → "Later source audit".

---

## 4. Current orchestration decision

- User chose: **"Modify the TV itself (webOS homebrew)."**
- Orchestrator's honest assessment: hardware (1GB RAM) caps the ceiling hard; the third-party
  Hub firmware makes root `[UNVERIFIED]`. First gate (Developer Mode on the physical TV) is
  **passed**. L1 v0.1.x (Enact) was sideloaded, never got working focus, and was abandoned;
  L1 v0.2.1 (vanilla HTML/CSS/JS, ~5 KB IPK) is built and waiting for its first install.
  L2 research is open (`07-l2-boot-takeover.md`).

### Open action items (need the physical TV / user input)
- [x] Read exact model number + webOS version off the TV — AR-50, webOS 22 / 7.5.8-28.
- [x] Check if LG Content Store exists and lists a "Developer Mode" app — yes, working.
- [x] Confirm storage of the unit — 1.92 GB total / 1.58 GB free.
- [ ] Confirm RAM of the unit.

---

## Sources (Section 0–3)
- Digie / manufacturer: Amazon.in Digie webOS listings; digie.in product + contact pages.
- webOS Hub licensing: lg.com newsroom (Oct 2022); streamtvinsider.com; broadbandtvnews.com.
- webOS CLI / Dev Mode: webostv.developer.lge.com (CLI intro + release notes); webosbrew.org/devmode; webosbrew.org/pages/sdk-configuration.
- Root tool status: RootMyTV, DejaVuln-autoroot, faultmanager-autoroot GitHub READMEs; CanI.RootMy.TV; webosbrew.org.
