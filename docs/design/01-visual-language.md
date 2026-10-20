# 01 — Visual Language (Apple-TV-inspired, licensed-asset-free)

**Rule:** nothing in this document copies Apple's actual assets, trademarks, SF Pro font, or
any proprietary IP. We take the *principles* (restraint, large focus, generous negative
space, deliberate motion) and re-ground them in free / open equivalents.

## 1. Typography

| Role | Font | Why |
|---|---|---|
| Primary UI | `'Inter'` first in the CSS stack, falling back to system sans | Apple-adjacent proportions at 10-ft |
| Numbers/time | same stack | — |

Note: Inter is **not bundled** — per `docs/plan/04-design-philosophy.md` we add no
font downloads, so on the TV the stack falls back to whatever system/Sandstone font
is present. Bundling a single Inter weight is a v0.2 decision, measured against IPK size.

Sizes (based on 1920×1080 render; scale ×2 for 4K):
- Hero title: 56 / 64 line-height / weight 700
- Section header: 32 / 40 / weight 600
- Tile label: 22 / 28 / weight 500
- Body / meta: 18 / 24 / weight 400
- Caption / timestamp: 14 / 20 / weight 500 uppercase, +4 letter-spacing

## 2. Color tokens

Dark-first (TVs are dark). All tokens live in `app/src/theme/tokens.less`; values below mirror that file.

```
bg.base         #0A0A0C   // the deep near-black (not pure black — avoids OLED crush)
bg.elevated     #1A1A20   // card / tile base
bg.hover        #26262E   // tile at rest when focus is near
bg.focus        rgba(255,255,255,0.08) // overlay added to focused tile
fg.primary      #FFFFFF
fg.secondary    rgba(255,255,255,0.72)
fg.tertiary     rgba(255,255,255,0.48)
accent          #7C9CFF   // cool periwinkle — distinct from Apple blue
accent.glow     rgba(124,156,255,0.5)
border.subtle   rgba(255,255,255,0.12)
border.strong   rgba(255,255,255,0.24)
```

## 3. Focus system (TV-critical)

TVs are driven by a remote; the focused element is the single most important visual.
- Focus ring: **4px solid white @ 90% opacity**, outside the tile edge, **12px offset**.
- Behind the ring: a **soft glow** matching `accent.glow`, blurred 24px, scale 1.04.
- Focused tile scales **1.06** over **180ms** with easing `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Unfocused tiles stay at 1.0.
- Enact's `@enact/sandstone` focus manager handles the plumbing; we only style.

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

Base canvas: 1920×1080 (scale directly for 4K via CSS zoom or Enact's resolution system).
- 8px grid; everything a multiple of 8.
- Side gutters: **80px** (feels wide at 10-ft).
- No hero band (removed after the tv-detox comparison — see §6).
- v0.1.x tiles were enlarged for 50"+ screens (see `tokens.less`): app tiles
  **420×240px**, input tiles **280×160px**, gap **40px**.

## 6. The home screen (first pass)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   09:42  ·  Monday, Oct 20                                      │
│                                                                 │
│   Apps                                                          │
│   [tile] [tile] [tile] [tile] [tile]  →                         │
│                                                                 │
│   Inputs                                                        │
│   [HDMI1] [HDMI2] [HDMI3] [Live TV]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

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
