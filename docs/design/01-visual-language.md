# 01 — Visual Language (Apple-TV-inspired, licensed-asset-free)

**Rule:** nothing in this document copies Apple's actual assets, trademarks, SF Pro font, or
any proprietary IP. We take the *principles* (restraint, large focus, generous negative
space, deliberate motion) and re-ground them in free / open equivalents.

## 1. Typography

| Role | Font | Why |
|---|---|---|
| Primary UI | System fonts only — the `font-family` stack on `html, body` in `app/src/styles.css` | No font download, nothing to preload (`docs/plan/04-design-philosophy.md`) |
| Numbers/time | same stack | — |

History: the first pass put `'Inter'` first in the stack (never bundled); v0.1 (Enact,
abandoned) fell back to the Sandstone fonts; v0.1.4 dropped Inter; v0.2 uses system
fonts. Bundling one brand weight (.woff2) is a later decision, measured against IPK size.

Sizes as implemented in v0.2 (`styles.css`, 1920×1080 canvas): clock 48 / weight 700,
date 28, row title 44 / 52 line-height / weight 600, tile label 30 / 36 / weight 600.

First-pass spec, before the tiles were enlarged for 50"+ screens (based on 1920×1080
render; scale ×2 for 4K):
- Hero title: 56 / 64 line-height / weight 700
- Section header: 32 / 40 / weight 600
- Tile label: 22 / 28 / weight 500
- Body / meta: 18 / 24 / weight 400
- Caption / timestamp: 14 / 20 / weight 500 uppercase, +4 letter-spacing

## 2. Color tokens

Dark-first (TVs are dark). All tokens live in `app/src/styles.css` as `:root` CSS custom
properties (v0.1 kept them in `app/src/theme/tokens.less`, deleted with Enact). The values
below mirror `styles.css` as of v0.2.1; if the two ever disagree, `styles.css` wins.

```
--bg-base         #0A0A0C                  the deep near-black (not pure black, avoids OLED crush)
--bg-elevated     #1A1A20                  card / tile base
--bg-focus        rgba(255,255,255,0.08)   overlay added to the focused tile
--fg-primary      #FFFFFF
--fg-secondary    rgba(255,255,255,0.72)
--fg-tertiary     rgba(255,255,255,0.48)
--accent          #7C9CFF                  cool periwinkle, distinct from Apple blue
--accent-glow     rgba(124,156,255,0.5)
--border-subtle   rgba(255,255,255,0.12)
```

Dropped since v0.1: `bg.hover` (#26262E) and `border.strong` — the focused state is now
drawn entirely by the overlay below.

## 3. Focus system (TV-critical)

TVs are driven by a remote; the focused element is the single most important visual.
As implemented in v0.2 (`styles.css`):
- Focus ring: **6px white @ 95% opacity**, hugging the tile edge (a `box-shadow` spread, no offset).
- Behind the ring: a **soft glow** in `--accent-glow`, 48px blur, 12px spread, plus the
  `--bg-focus` tint over the tile.
- Ring, glow and tint all live on one `::after` layer whose **opacity** fades in, so a
  focus move animates only `transform` + `opacity` (see §4).
- Focused tile scales **1.06** over **180ms** (`--dur-focus`) with easing
  `cubic-bezier(0.2, 0.8, 0.2, 1)` (`--ease-snap`). Unfocused tiles stay at 1.0.
- Plumbing: every tile is a native `<button>`; `main.js` handles the arrow keys and calls
  `element.focus()`; the `:focus` rule draws the state. No focus framework.

First-pass spec (kept for reference): 4px ring @ 90% with a 12px offset, 24px glow at scale
1.04. In v0.1 Enact's Spotlight was meant to do the plumbing; it never showed focus on the
TV (`docs/research/06-enact-postmortem.md`).

## 4. Motion

| Interaction | Duration | Curve |
|---|---|---|
| Focus move | 180ms | cubic-bezier(0.2, 0.8, 0.2, 1) — "snappy out" |
| Tile hover scale | 180ms | same |
| View transition (page change) | 350ms | cubic-bezier(0.4, 0, 0.2, 1) — "material standard" |
| Modal / dialog | 300ms | cubic-bezier(0.2, 0.8, 0.2, 1) |

**Rule:** NEVER animate more than 2 properties at once on this hardware. On a 1GB-RAM
Hub box, every animated property is a cost. Prefer `transform` + `opacity` only.

## 5. Layout math

Base canvas: 1920×1080 (`appinfo.json` `resolution` and the `index.html` viewport are both
set to 1920 wide; for 4K, scale with CSS rather than re-laying out).
- 8px grid; everything a multiple of 8.
- Side gutters: **120px** in v0.2 (`--gutter`; the first pass said 80px).
- No hero band (removed after the tv-detox comparison — see §6).
- Tiles enlarged for 50"+ screens (in v0.1.x, kept in v0.2 as `--tile-*` in `styles.css`):
  app tiles **420×240px**, input tiles **280×160px**, gap **40px**.

## 6. The home screen (first pass)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   09:42  ·  Monday, Oct 20                                      │
│                                                                 │
│   Apps                                                          │
│   [YouTube] [Netflix] [Prime Video] [Disney+] [Live TV]  →      │
│                                                                 │
│   Inputs                                                        │
│   [HDMI 1] [HDMI 2] [HDMI 3]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

The tile list is the `APPS` / `INPUTS` arrays in `app/src/main.js` (v0.2 moved Live TV
into the Apps row). Until the build is stable there is also a small grey debug line at
the bottom-left; it goes away once v0.2 is proven on the TV.

Minimal. Nothing else. No hero band. No settings or search icons in the
top-right. No ads. No "trending now from LG." No partner promotions. No
weather. No recently-played strip. No nothing.

**Reasoning for the deletions:** After reviewing `Ansub/tv-detox` (the
closest-spirit project on Android TV), its launcher ships clock + apps +
inputs + nothing. That's the right scope. Features earn their place by
being asked for after v0.1 ships, not by being pre-added.

## 7. What we are NOT doing (keep this list)

- No translucent "liquid glass" blur layers on backgrounds — the Hub SoC will stutter.
- No video autoplay in tiles (RAM budget).
- No per-tile fetching of remote images on focus (lag). Pre-load the visible grid once.
- No skeuomorphism.
