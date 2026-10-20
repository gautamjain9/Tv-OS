# 05 — Comparison with Ansub/tv-detox (2026-10-20)

User reference: https://github.com/Ansub/tv-detox — "Make an old Android TV
fast again with Claude Code or Codex."

## Bottom line

- Spiritually: same project. Minimal launcher + a cleanup pass that disables
  bloat without deleting it. "Reversible" is a first-class design goal.
- Technically: **not portable to our target.** It's Android TV only. The
  README states explicitly: "Does not work on Roku, Samsung (Tizen), or LG
  (webOS)."
- The reason it can skip root — the whole magic — does not exist on webOS.
  Covered in detail below.

## What tv-detox is

| Aspect | TV Detox |
|---|---|
| Target OS | Android TV 9 / 11 / 12 / Google TV 14 (Fire TV: partial) |
| Launcher app language | Java, no libraries, no Gradle |
| Launcher app content | Apps grid + HDMI inputs + clock + 14 color wallpapers + network icon (+ optional BT/Sound/Picture shortcuts) |
| Build tool | `build.sh` with Android SDK (Java 17, platforms;android-34, build-tools;34.0.0) |
| Install tool | `adb` (over USB or WiFi debugging) |
| How it "takes over" HOME | `adb shell cmd package set-home-activity` points the HOME intent at the TV Detox activity, and `install.sh` disables the stock launcher via `adb pm disable-user` |
| Cleanup mechanism | Disables (not deletes) bloatware via `adb pm disable-user` so changes can be reverted |
| Undo | `undo.sh` restores stock launcher + re-enables disabled apps |
| Scan tool | `candidates.sh` lists installed packages so the user picks what to disable |
| Root required | No. Developer mode + USB/WiFi debugging is enough. |
| License | MIT |

## Why tv-detox's "no-root HOME takeover" trick does not port to webOS

Android:
- Every launcher is just an app whose manifest declares
  `android.intent.category.HOME` and `category.LAUNCHER_APP`.
- `adb shell cmd package set-home-activity <package>/<activity>` tells the
  system which registered launcher gets the HOME intent.
- Developer-mode privilege is enough.

webOS:
- The HOME button is a system-shell interaction, not an app-level intent.
  It's processed by SAM (System Application Manager) and the webOS
  compositor.
- No sideloaded, non-privileged app can register itself as "the launcher."
- Developer-mode apps live in the app grid, that's it.
- To actually intercept HOME, you need root + Homebrew Channel's input hook
  (or an equivalent SAM configuration change). This matches our earlier
  research in `02-l1-blockers-resolved.md`.

**Consequence for our project:** nothing new. L1 (Dev Mode) remains a tile
you open manually. L2 (root) is what unlocks HOME takeover. Already baked
into the plan.

## What we take from tv-detox

1. **Feature scope.** Clock + Apps + HDMI inputs. Nothing else in v0.1. Our
   design doc (`docs/design/01-visual-language.md`) is being pruned to match:
   the planned hero band and top-right icons are removed.
2. **"Disable not delete" principle for L2 bloat removal.** When we open L2,
   use webOS equivalents to disable (not uninstall) LG's bloat so changes
   are reversible by a single script.
3. **`install.sh` / `undo.sh` as a non-negotiable pair.** No L2 install
   lands without a working undo script.
4. **Explicit "do not disable this" list for L2.** tv-detox has a core list
   of system components that must never be turned off (keyboard, HDMI
   inputs, store, etc.). We'll build the webOS equivalent before we touch
   `pkg disable` or any root command on the TV.
5. **A `candidates.sh`-equivalent for L2.** With root (Homebrew Channel's
   `listApps` on the privileged bus), we can enumerate every installed
   webOS app ID, filter obvious bloat vs. system essentials, present them to
   the user, and only act on their picks.

## What we deliberately do NOT take

- **The stack.** Java + Android SDK doesn't apply to us. Our Enact + Sandstone
  choice stands for v0.1 because it buys us Spotlight (TV focus system)
  that we'd otherwise have to hand-roll in vanilla JS.
- **The "paste a prompt into Claude Code" install UX.** Clever on their end;
  not relevant to us because the user is already working with Claude Code —
  we don't need the launcher to re-invoke an agent.
- **ADB.** `ares-*` is our equivalent and it already works on their Mac.
- **14 color wallpapers.** Overkill for v0.1. One well-chosen dark background
  with the accent token.

## Items added to the project backlog from this comparison

- [ ] (L2) `install.sh` script: enables root (via faultmanager if applicable),
      installs Homebrew Channel, installs Tv-OS, disables LG bloat from a
      curated allow-list, sets Tv-OS as HOME takeover.
- [ ] (L2) `undo.sh` script: reverses every change above. Must be tested on
      a reset TV before ANY `install.sh` run.
- [ ] (L2) `candidates.sh` equivalent: enumerate installed app IDs via root,
      cross-reference against a "do not touch" list, present a candidate
      list for disable.
- [ ] (L2) "do-not-touch" list of system-essential webOS app IDs (HDMI
      inputs, settings, keyboard, software update, Developer Mode itself if
      still present, remote control services, EPG, etc.).
- [ ] (L1) Prune the design doc hero band and settings/search icons.
      [DONE in this commit.]

None of these change the Part E path. All of them are v0.2+ or L2 items.
