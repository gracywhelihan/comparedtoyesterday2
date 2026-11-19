import { useCallback, useEffect, useRef, useState } from "react";
import { FALLBACK, getPosition, placeName } from "../lib/location";
import { fetchWeather, type OpenMeteoResponse } from "../lib/weather";

/**
 * Finds the visitor (falls back to New York), loads the weather, and
 * `reload()` does it again (the Update button).
 *
 * Returns the raw °F response; the page converts it to the chosen unit,
 * so switching °F/°C never needs a new request.
 */
export function useWeather() {
  const [place, setPlace] = useState("Finding you…");
  const [weather, setWeather] = useState<OpenMeteoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // If Update is pressed twice quickly, only the latest request may update the page
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const id = ++latest.current;
    const pos = await getPosition();
    if (id !== latest.current) return;
    const coords = pos ?? FALLBACK;
    setPlace(pos ? "Locating…" : FALLBACK.name);
    try {
      const [data, name] = await Promise.all([fetchWeather(coords), pos ? placeName(coords) : null]);
      if (id !== latest.current) return;
      if (pos) setPlace(name ?? `${coords.lat}, ${coords.lon}`);
      setError(null);
      setWeather(data);
    } catch (err) {
      if (id !== latest.current) return;
      setError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { place, weather, error, reload };
}
