# 02 — L1 Blockers: Research Results

Research done 2026-10-20. All claims tagged.

## Can a sideloaded app replace the home screen without root?

**`[VERIFIED]` NO.** This is the single most important finding of this research pass.

- Plain LG Developer Mode supports **sideloading + running**, but **not boot persistence
  nor HOME-button takeover**. Both require root.
- Every community launcher that actually "takes over" the TV (`webos-custom-home`,
  `webos-launch-home`) requires root to work.
- The one no-root launcher found (`meneerkrabs/webos-launcher` for webOS 6) is explicit:
  "doesn't take over the HOME button... no root, no background service, no startup scripts."
- `[UNVERIFIED]` observation from one author: on **newer webOS firmware, launcher visibility
  may be hidden for sideloaded apps.** May affect webOS 22; must test.

### Practical consequence
- **L1 (no root):** app lives in the app grid; user opens it manually; press HOME → still
  see Digie's ugly launcher. Useful as a proof-of-concept and a nice "second screen", not
  as a true replacement.
- **L2 (root):** same app, but auto-starts on boot, intercepts HOME, sees all apps, feels
  like the real home screen.

## Which webOS APIs are available to a sideloaded (non-root) web app?

- `[VERIFIED]` `com.webos.applicationManager` → **`launch`** method with target app ID
  works for sideloaded web apps. This is the one API we actually need.
  Example (Home Assistant community reference):
  ```js
  webOS.service.request("luna://com.webos.applicationManager", {
    method: "launch",
    parameters: { id: "youtube.leanback.v4" }
  });
  ```
- `[VERIFIED]` Can open specific Settings screens via `com.palm.app.settings` with a
  `target` parameter (`picture`, `sound`, `network`, …) — older community source, needs
  re-verification on webOS 22.
- `[VERIFIED]` **Denied to non-root web apps on webOS 6+:** `listApps`,
  `listLaunchPoints`, `getAppInfo`, `getForegroundAppInfo`. **This means the launcher
  cannot discover installed apps on its own; the user must pre-register the apps they
  want shown, by name + webOS app ID.**
- `[VERIFIED]` `applicationManager.close` is **deprecated on TV/signage** — do not use.
- `[VERIFIED]` `com.webos.service.systemservice` → `getPreferences` / `setPreferences`
  is the official API for reading/writing system preferences. Access rules apply.

## Which UI framework matches webOS 22 (user's TV)?

- `[VERIFIED]` LG's official mapping: **webOS TV 22 → Enact 4.0.9 + Sandstone 2.0.5.**
- `[VERIFIED]` Enact is built on React; it's LG's official TV UI framework; has
  built-in spatial-navigation focus management (critical for remote-control UIs).
- Decision: **use Enact 4.0.9 with Sandstone 2.0.5** for the L1 launcher. This is the
  lowest-friction, best-polish path and future-proofs us for L2 (same code runs rooted).

## New blockers (opened by this pass)

- `[UNVERIFIED]` Does the Digie Hub firmware expose the full set of standard LG app IDs
  (e.g. `youtube.leanback.v4`, `netflix`, `com.webos.app.hdmi1`)? Needs on-TV testing.
- `[UNVERIFIED]` Does the "newer firmware hides sideloaded apps from the home grid" issue
  affect webOS 7.5.8-28 on Digie? Needs on-TV testing (will discover when we install
  the first `.ipk`).

## Sources
- github.com/meneerkrabs/webos-launcher, marc-fischer/webos-custom-home,
  gprot42/webos-launch-home, PB-Yashwanth/Reverse-Engineering-webOS-App-Restrictions
- webosose.org LS2 API reference: applicationmanager, systemservice, settings
- webostv.developer.lge.com/develop/guides/enyo-enact-guide (version mapping)
- Home Assistant community: LG webOS TV launching an application
