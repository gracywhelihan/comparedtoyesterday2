import { useEffect, useMemo } from "react";
import { Headline } from "./components/Headline";
import { HourlyChart } from "./components/HourlyChart";
import { HourStrip } from "./components/HourStrip";
import { Credit, Forecast, HourlyTable } from "./components/Sections";
import { TodayYesterday } from "./components/TodayYesterday";
import { useUnit } from "./hooks/useUnit";
import { useWeather } from "./hooks/useWeather";
import { backgroundFor } from "./lib/background";
import { fmtHour } from "./lib/format";
import { describe, shapeWeather } from "./lib/weather";

// Preview helpers: ?demo=-8 (pretend 8° colder) shows the background colors,
// ?windy shows the wind line on a calm day.
const params = new URLSearchParams(window.location.search);
const DEMO_DELTA = params.has("demo") ? Number(params.get("demo")) : null;
const WINDY_DEMO = params.has("windy");

export default function App() {
  const [unit, setUnit] = useUnit();
  const { place, weather, error, reload } = useWeather();

  // Re-shaped (not re-fetched) when the unit changes
  const { view, shapeError } = useMemo(() => {
    if (!weather) return { view: null, shapeError: null };
    try {
      return { view: shapeWeather(weather, unit, { demoDelta: DEMO_DELTA, windyDemo: WINDY_DEMO }), shapeError: null };
    } catch (err) {
      return { view: null, shapeError: err instanceof Error ? err.message : String(err) };
    }
  }, [weather, unit]);

  // The page color says how today compares to yesterday
  useEffect(() => {
    if (view) document.documentElement.style.setProperty("--bg", backgroundFor(view.deltaF));
  }, [view]);

  const problem = error ?? shapeError;
  const d = view?.shownDelta ?? 0;
  const headline = problem ? "No signal" : !view ? "Loading" : d === 0 ? "Same as yesterday" : `${Math.abs(d)}° ${d > 0 ? "warmer" : "colder"}`;
  const subhead = problem
    ? `Couldn't load the weather (${problem}). Try again in a minute.`
    : view
      ? `${d === 0 ? "at" : "than yesterday at"} ${fmtHour(view.hourNow)} · ${describe(view.code)}`
      : "\u00A0"; // non-breaking space keeps the line's height while loading

  return (
    <main className="page">
      <header className="top">
        <p className="place">{place}</p>
        <div className="top__actions">
          <div className="units" role="group" aria-label="Temperature unit">
            {(["F", "C"] as const).map((u) => (
              <button key={u} aria-pressed={unit === u} onClick={() => setUnit(u)}>°{u}</button>
            ))}
          </div>
          {/* Re-asks for the location and reloads the weather */}
          <button className="btn btn--small" onClick={reload}>Update</button>
        </div>
      </header>

      <Headline text={headline} />
      <p className="subhead">{subhead}</p>

      {view && (
        <>
          <TodayYesterday view={view} />
          <HourStrip hours={view.next24} unit={unit} />
          <HourlyChart view={view} />
          <HourlyTable view={view} />
          <Forecast view={view} />
        </>
      )}

      <Credit />
    </main>
  );
}
