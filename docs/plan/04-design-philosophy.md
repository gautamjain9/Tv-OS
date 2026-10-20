# 04 — Design Philosophy (The One Rule)

User's words, 2026-10-20:

> "we aren't trying to utilize the 1.58gb of free storage, rather we are
> trying to debloat and only use the required frontend and backend usage
> of tv and giving it a clean, easy, zero stutter, smooth running model."

This is the project's **one rule**. Every decision gets measured against it.
Everything else is a style choice.

## What "debloat" means for us, concretely

| Dimension | We do | We don't do |
|---|---|---|
| **IPK size** | Smallest IPK that still looks right. Current (v0.2, vanilla): ~5 KB (5.3 KB for v0.2.0). v0.1 (Enact, abandoned) was 14.9 MB; its v0.2 target had been "under 5 MB after locale pruning" — dropping Enact beat that by ~1000×. | Ship 83 MB of ilib locales when the TV runs in one language (what v0.1 did). |
| **RAM footprint** | `requiredMemory: 64` MB declared in v0.2 (v0.1 declared 128 and aimed at the Enact minimum, ~60 MB resident). Real resident memory not yet measured. | Add parallax layers, blurred backgrounds, autoplay previews — all the design flourishes that eat frames on a 1 GB TV. |
| **Fonts** | v0.2: system fonts only — the `font-family` stack in `app/src/styles.css` (webOS system font first); no font files bundled. v0.1 (Enact, abandoned) used the Sandstone fonts (Miso, MuseoSans). | Add Google-Fonts imports, variable fonts, fallback stacks the TV won't preload. |
| **Startup time** | Boot the home screen in under 2 s from app launch. Measure. | Eagerly import every tile, every modal, every settings panel at startup. Lazy-load. |
| **Scroll / focus** | 60 fps steady on tile focus moves. `transform` + `opacity` only. | Animate `width`, `height`, `box-shadow` as if it's a desktop app. |
| **Network** | Zero network at startup. The home screen renders fully offline. | Fetch weather, images, remote config, analytics on launch. |
| **Tracking / telemetry** | None. Ever. | "Just a tiny anonymous metric" — no. |
| **Features in v0.1 / v0.2** | Clock, apps row, inputs row. Full stop. | Weather widget, music player, voice assistant, smart-home dashboard, screensaver. All tempting; all later. |
| **Permissions** | Ask only for the ACGs we actually use. (`application.launcher`, v0.1 and v0.2.) | Request the full Luna bus "just in case." |

## The design-system corollary

When a UI choice conflicts with the rule, the rule wins. Examples we've
already locked in:

- No translucent "liquid glass" blur on backgrounds — Hub SoC stutters on
  `backdrop-filter`.
- Clock updates every 15 s, not every 1 s — avoids per-second re-renders.
- Tile grid is static layout, not virtualized — but we also pre-cap how
  many tiles render per row.
- No per-tile image fetches on focus — pre-load the visible grid once.
- No video previews in tiles.
- No full-page transitions with multi-layer motion — one view-change at a
  time, 350 ms, single curve.

## Where this fought our choice of Enact / Sandstone (v0.1 — superseded)

*Kept as the record of the v0.1 bet. Outcome, 2026-10-20: we left Enact for v0.2, but
not for the reason this bet named. Focus never worked on the TV across the v0.1
installs, and the 14.9 MB build was the opposite of this rule. Frame rate was never
measured. See `docs/research/06-enact-postmortem.md`.*

**Honest tradeoff:** Enact + Sandstone gives us for free:
- Spatial-navigation focus (`Spottable`, `SpotlightRootDecorator`)
- Themed components that LG tests on their TVs
- Panels / Headers / Buttons that already feel right on a remote

The cost:
- ~1 MB of fonts
- ilib locale data (currently 83 MB of bloat we DO NOT NEED and will prune)
- A larger initial JS bundle than hand-rolled HTML + CSS

**Our bet, blunt:** v0.1 keeps Enact so we can see something on the TV in
hours, not weeks. v0.2 earns the right to migrate off Enact ONLY IF the
measured frame-rate on real TV is poor and Enact is the culprit. We don't
pre-migrate.

## What this does NOT change in the plan

The three-layer plan still stands:
- **L1 (right now):** vanilla HTML/CSS/JS launcher (v0.2.1) sideloaded via Dev
  Mode. Narrow by design: tiles, time, inputs. (v0.1 was Enact; abandoned.)
- **L2 (later):** Root + Homebrew Channel + boot-takeover of HOME button
  + system debloat (remove LG ads, telemetry, promotional launchers).
  This is where "debloat" grows from "our app is small" to "the whole TV
  is small."
- **L3 (future):** External box, same codebase, universal.

L2 is where the storage story gets interesting. On webOS 10, the Home app
was rewritten in Flutter and third-party replacements use a boot bind-mount
to swap the launcher binary; the mount isn't persistent across reboots, so
a Homebrew-Channel startup script re-applies it. Same mechanism likely
applies to webOS 22 on Digie Hub, but Hub-specific behavior is
`[UNVERIFIED]` and will be its own research pass when we open L2.

## What I'll measure on first install

- Cold start time: `ares-launch` → first paint.
- Resident memory from webOS Developer Mode's performance panel.
- Frame rate during tile focus moves (Chrome DevTools remote via webOS
  Inspector).
- IPK size on disk once installed (TV reports "Available Internal Storage"
  — compare 1.58 GB free before and after install).

Numbers go in a dedicated `docs/research/NN-l1-measurements.md` (next free number;
`05`–`07` are taken: tv-detox comparison, Enact postmortem, L2 boot-takeover research —
so probably `08`). Not yet written; nothing has been measured on the TV yet.
