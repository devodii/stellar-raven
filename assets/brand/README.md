# assets/brand/ — brand masters (upload source-of-truth)

Brand assets for **external dashboards** — currently the WorkOS AuthKit sign-in customizer.
**Nothing here is served by the Worker.** The live site inlines all of its own assets as
generated code (`FAVICON` data URI + `ravenSvg()` in `src/site.ts`, fonts in `src/fonts.ts`,
`/og.png` in `src/og.ts`); there is no `assets` binding in `wrangler.jsonc`. These files exist
only so brand uploads are versioned and reproducible.

Source-of-truth for the shape and palette is `src/site.ts` (the `RAVEN_PATH` and `TOKENS`
blocks). If those change, regenerate here.

## Files

| File | Upload slot |
|------|-------------|
| `raven-icon.svg` / `raven-icon-512.png` | Logo icon — light **and** dark (mark reads on both) |
| `raven-favicon.svg` / `raven-favicon-256.png` | Favicon — light **and** dark (identical to the icon) |
| `raven-logo-dark.svg` | Logo (full lockup) — dark-mode page (light wordmark) |
| `raven-logo-light.svg` | Logo (full lockup) — light-mode page (dark wordmark) |

The mark is a single hot-orange spark (`#FF5500`) on transparent, so one icon/favicon file
serves both light and dark slots. The full lockups differ only in wordmark color.

## Palette (from `TOKENS` in `src/site.ts`)

| Token | Hex | AuthKit use |
|-------|-----|-------------|
| `--orange` | `#FF5500` | mark, button background, dark-mode link (see below) |
| on-orange text | `#180A00` | button text (both modes) |
| `--bg` | `#0E150D` | page background — dark |
| `--fog` | `#EEF0E2` | page background — light; wordmark on dark |
| `--green` | `#151F14` | wordmark on light |
| `--orange-2` | `#FF7A33` | link — dark page (7:1) |
| darkened orange | `#B23C00` | link — light page (`#FF5500` fails contrast there; 5.2:1) |

Font family: **IBM Plex Sans** (fallback **Inter**). Corner radius: **Medium**.

## Regenerating

```sh
# icon + favicon (edge-to-edge orange mark, transparent)
magick -background none raven-icon.svg -resize 512x512 raven-icon-512.png
magick -background none raven-favicon.svg -resize 256x256 raven-favicon-256.png
```

The SVGs embed the exact `RAVEN_PATH` from `src/site.ts` scaled to fill the frame width.
