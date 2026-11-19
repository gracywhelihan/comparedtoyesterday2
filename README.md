# Compared to Yesterday

A weather app that answers one question: **how does today compare to yesterday?**
The headline says it ("6° warmer"), the whole page turns warmer or cooler to match, and a
chart shows today vs. yesterday hour by hour.

Live (once deployed): **https://gracywhelihan.com/comparedToYesterday/**

## Run it

```bash
npm install
npm run dev        # http://localhost:5173/comparedToYesterday/
npm run build      # type-checks, then builds to dist/
```

No API keys or `.env` needed — weather comes from [Open-Meteo](https://open-meteo.com/)
(free, keyless) and place names from BigDataCloud's free reverse-geocoding endpoint.

### Preview helpers

| Add to the URL | Shows |
|---|---|
| `?demo=-8` | pretend today is 8° colder (preview the background colors; try `0`, `5`, `10`) |
| `?windy` | pretend every third hour has 32 mph gusts (preview the wind line) |

## Deploying

Merging to `main` deploys automatically (`.github/workflows/deploy.yml`):

1. GitHub Actions runs `npm ci && npm run build`.
2. It force-pushes the built files (`dist/`) to the **`deploy` branch** — that branch only
   ever contains the latest build.
3. It SSHes into the droplet as the no-sudo `deploy` user with this repo's own key, which is
   locked to one command, `/usr/local/bin/deploy-cty` (source: `deploy/deploy-cty.sh`): it
   resets `/var/www/comparedtoyesterday` to the `deploy` branch. The server never builds
   anything, so it doesn't need Node.
4. nginx serves that folder at `/comparedToYesterday/` (config lives in the portfolio repo,
   `gracy-website2.0/deploy/nginx/`).

Repo secrets (Settings → Secrets and variables → Actions): `DEPLOY_HOST`, `DEPLOY_USER`
(`deploy`), `DEPLOY_KEY` (this repo's own key), `DEPLOY_KNOWN_HOSTS`. You can also redeploy
from the **Actions** tab → *Build and deploy* → *Run workflow*.

## How it works

- **One request** to Open-Meteo with `past_days=1`, so the hourly data starts at yesterday
  00:00: index 0–23 is yesterday, 24–47 today, and "same hour yesterday" is index − 24.
- **Units:** always fetched in °F/mph and converted on the device, so the °F/°C switch is
  instant. Temperatures convert with `C = (F − 32) × 5/9`; *differences* just `× 5/9`.
- **Background:** the °F difference, clamped to ±10°, picks a mix between yellow (same),
  blue (colder), and orange (warmer), blended in OKLCH so the middle stays vivid. Ink text
  stays ≥ 7:1 contrast on every color in the blend.
- **Headline:** sized to fill the width exactly: measure at 100px, then
  `size = 100 × available width ÷ measured width`.
- **Privacy:** the visitor's position is rounded to ~1 km before it's sent anywhere.

## Project structure

```
src/
  lib/          plain TypeScript, no React (easy to test)
    weather.ts    Open-Meteo request + shaping raw data into what the page shows
    format.ts     units, number formatting, wind threshold
    location.ts   geolocation + place name
    background.ts the comparison → color mapping
  hooks/        useWeather (load/reload, latest-request-wins), useUnit (°F/°C, remembered)
  components/   Headline, TodayYesterday, HourStrip, HourlyChart, Icons, Sections
  styles.css    design tokens at the top (:root) — colors, type, spacing
```

## Design

Angular, colorful, one bold color per page. Archivo at its narrowest width (`wdth` 62) for
the big type, Space Mono for everything else, hairline rules instead of cards, an 8px
spacing grid, and custom straight-edged weather icons in the ink color.

## Tests

None yet. Good first candidates: `shapeWeather()` in `src/lib/weather.ts` (index math,
rounding so the words match the numbers) and `backgroundFor()`.
