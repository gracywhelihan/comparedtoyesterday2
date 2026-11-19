# Compared to Yesterday — project notes

React 18 + TypeScript + Vite. No CSS framework: plain CSS with design tokens in `src/styles.css`.
Served under `/comparedToYesterday/` (Vite `base`). See README.md.

## Run
- `npm run dev` · `npm run build` (runs `tsc` first)
- Preview helpers: `?demo=<°F diff>` and `?windy`

## Conventions
- Data logic lives in `src/lib/` with no React imports; components only display a `WeatherView`.
- Never add an API key to the frontend. Anything prefixed `VITE_` ships to every visitor.
  Open-Meteo needs no key; keep it that way.
- All numbers on screen are derived from rounded values so differences always match
  (`shownDelta`, table/tooltip diffs). Keep that when adding new comparisons.
- Colors/sizes come from the tokens in `:root`. Text stays in ink; dark ink must keep ≥ 7:1
  contrast on every background in the cold→same→warm blend if the stops change.
- Mobile first: check at 390px wide.
- Gracy reviews UI in her own browser (local dev server), not screenshots.
