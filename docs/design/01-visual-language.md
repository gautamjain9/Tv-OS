# 01 — Visual Language (Apple-TV-inspired, licensed-asset-free)

**Rule:** nothing in this document copies Apple's actual assets, trademarks, SF Pro font, or
any proprietary IP. We take the *principles* (restraint, large focus, generous negative
space, deliberate motion) and re-ground them in free / open equivalents.

## 1. Typography

| Role | Font | Why |
|---|---|---|
| Primary UI | **Inter** (variable) | Free, Apple-adjacent proportions, excellent at 10-ft viewing distance |
| Numbers/time | **Inter Display** or **JetBrains Mono** for monospace | Clear glyphs, no numeric ambiguity |

Sizes (based on 1920×1080 render; scale ×2 for 4K):
- Hero title: 56 / 64 line-height / weight 700
- Section header: 32 / 40 / weight 600
- Tile label: 22 / 28 / weight 500
- Body / meta: 18 / 24 / weight 400
- Caption / timestamp: 14 / 20 / weight 500 uppercase, +4 letter-spacing

## 2. Color tokens

Dark-first (TVs are dark). All tokens live in `app/src/theme/tokens.ts`.

```
bg.base         #0A0A0C   // the deep near-black (not pure black — avoids OLED crush)
bg.elevated     #141418   // card / tile base
bg.hover        #1E1E24   // tile at rest when focus is near
bg.focus        rgba(255,255,255,0.08) // overlay added to focused tile
fg.primary      #FFFFFF
fg.secondary    rgba(255,255,255,0.72)
fg.tertiary     rgba(255,255,255,0.48)
accent          #7C9CFF   // cool periwinkle — distinct from Apple blue
accent.glow     rgba(124,156,255,0.35)
border.subtle   rgba(255,255,255,0.08)
```

## 3. Focus system (TV-critical)

TVs are driven by a remote; the focused element is the single most important visual.
- Focus ring: **4px solid white @ 90% opacity**, outside the tile edge, **12px offset**.
- Behind the ring: a **soft glow** matching `accent.glow`, blurred 24px, scale 1.04.
- Focused tile scales **1.06** over **200ms** with easing `cubic-bezier(0.2, 0.8, 0.2, 1)`.
- Unfocused tiles stay at 1.0.
- Enact's `@enact/sandstone` focus manager handles the plumbing; we only style.

## 4. Motion

| Interaction | Duration | Curve |
|---|---|---|
| Focus move | 200ms | cubic-bezier(0.2, 0.8, 0.2, 1) — "snappy out" |
| Tile hover scale | 200ms | same |
| View transition (page change) | 350ms | cubic-bezier(0.4, 0, 0.2, 1) — "material standard" |
| Modal / dialog | 300ms | cubic-bezier(0.2, 0.8, 0.2, 1) |

**Rule:** NEVER animate more than 2 properties at once on this hardware. On a 1GB-RAM
Hub box, every animated property is a cost. Prefer `transform` + `opacity` only.

## 5. Layout math

Base canvas: 1920×1080 (scale directly for 4K via CSS zoom or Enact's resolution system).
- 8px grid; everything a multiple of 8.
- Side gutters: **80px** (feels wide at 10-ft).
- Hero band height: 420px.
- Tile grid: 5 columns @ 1920w → tile width (1920 - 160 - 4×32) / 5 = **326.4px**;
  round to **320px**. Tile height **180px** (16:9).
- Row gaps: 32px vertical, 32px horizontal.

## 6. The home screen (first pass)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   09:42 · Monday, Oct 20       ⚙  🔍                            │
│                                                                 │
│   [Big hero: last-watched / featured]                           │
│                                                                 │
│   Apps                                                          │
│   [tile] [tile] [tile] [tile] [tile]  →                         │
│                                                                 │
│   Inputs                                                        │
│   [HDMI1] [HDMI2] [HDMI3] [Live TV]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Minimal, no ads, no "trending now from LG," no partner promotions.

## 7. What we are NOT doing (keep this list)

- No translucent "liquid glass" blur layers on backgrounds — the Hub SoC will stutter.
- No video autoplay in tiles (RAM budget).
- No per-tile fetching of remote images on focus (lag). Pre-load the visible grid once.
- No skeuomorphism.
