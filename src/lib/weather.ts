import { toUnit, type Unit } from "./format";
import type { Coords } from "./location";

/** WMO weather codes → words (the standard Open-Meteo uses). */
const WMO: Record<number, string> = {
  0: "Clear", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 48: "Icy fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle",
  56: "Freezing drizzle", 57: "Freezing drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain",
  66: "Freezing rain", 67: "Freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
  77: "Snow grains", 80: "Showers", 81: "Showers", 82: "Heavy showers",
  85: "Snow showers", 86: "Snow showers", 95: "Thunderstorm", 96: "Thunderstorm, hail", 99: "Thunderstorm, hail",
};
export const describe = (code: number): string => WMO[code] ?? "—";

/** The parts of Open-Meteo's response we ask for. All temperatures in °F, wind in mph. */
export interface OpenMeteoResponse {
  current: { time: string; temperature_2m: number; apparent_temperature: number; weather_code: number };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
    is_day: number[];
    wind_gusts_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    uv_index_max: number[];
  };
}

export async function fetchWeather({ lat, lon }: Coords): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,apparent_temperature,weather_code",
    hourly: "temperature_2m,weather_code,precipitation_probability,is_day,wind_gusts_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,uv_index_max",
    past_days: "1", // includes yesterday — the whole point
    forecast_days: "3",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
  });
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!r.ok) throw new Error(`Open-Meteo returned ${r.status}`);
  return r.json();
}

export interface HourCell {
  hour: number; // 0–23, local
  isNow: boolean;
  dayName: string | null; // "Thu" on the first hour of a new day
  code: number;
  isDay: boolean;
  temp: number;
  rainChance: number;
  gustMph: number;
}

/** Everything the page shows, already in the chosen unit. */
export interface WeatherView {
  hourNow: number;
  hourFraction: number; // e.g. 14.25 at 2:15 PM, for the chart's "now" line
  nowTemp: number;
  feels: number;
  code: number;
  thenTemp: number; // same hour yesterday
  thenCode: number;
  deltaF: number; // raw °F difference: drives the background color
  shownDelta: number; // difference of the rounded numbers on screen, so the words always match them
  today: { high: number; low: number; uv: number };
  yesterdayDay: { high: number; low: number };
  todayByHour: number[]; // 24 values, for the chart
  yesterdayByHour: number[];
  next24: HourCell[];
  next12: { hour: number; now: number; before: number }[]; // vs. the same hour 24h earlier
  forecast: { date: string; code: number; high: number; low: number }[];
}

export interface ShapeOptions {
  /** Preview the background: pretend today is this many °F warmer than yesterday. */
  demoDelta?: number | null;
  /** Preview the wind line: pretend every third hour has 32 mph gusts. */
  windyDemo?: boolean;
}

/**
 * Turn Open-Meteo's response into what the page needs.
 *
 * Hourly data starts at yesterday 00:00 (because past_days=1), so index
 * 0–23 = yesterday, 24–47 = today, and "the same hour yesterday" = index − 24.
 */
export function shapeWeather(d: OpenMeteoResponse, unit: Unit, opts: ShapeOptions = {}): WeatherView {
  const h = d.hourly;
  const u = (f: number) => toUnit(f, unit);
  const i = h.time.indexOf(d.current.time.slice(0, 13) + ":00");
  if (i < 24) throw new Error("Unexpected data from Open-Meteo");
  const hourNow = i - 24;
  const minutes = Number(d.current.time.slice(14, 16));

  const nowF = d.current.temperature_2m;
  const thenF = opts.demoDelta != null ? nowF - opts.demoDelta : h.temperature_2m[i - 24];
  const temps = h.temperature_2m.map(u);
  const gusts = opts.windyDemo ? h.wind_gusts_10m.map((g, k) => (k % 3 === 0 ? 32 : g)) : h.wind_gusts_10m;
  const nowTemp = u(nowF);
  const thenTemp = u(thenF);

  const next24: HourCell[] = Array.from({ length: 24 }, (_, k) => {
    const idx = i + k;
    const hour = (hourNow + k) % 24;
    return {
      hour,
      isNow: k === 0,
      dayName:
        k > 0 && hour === 0
          ? new Date(h.time[idx] + ":00").toLocaleDateString("en-US", { weekday: "short" })
          : null,
      code: k === 0 ? d.current.weather_code : h.weather_code[idx],
      isDay: h.is_day[idx] === 1,
      temp: k === 0 ? nowTemp : temps[idx],
      rainChance: h.precipitation_probability[idx] ?? 0,
      gustMph: gusts[idx] ?? 0,
    };
  });

  return {
    hourNow,
    hourFraction: hourNow + minutes / 60,
    nowTemp,
    feels: u(d.current.apparent_temperature),
    code: d.current.weather_code,
    thenTemp,
    thenCode: h.weather_code[i - 24],
    deltaF: nowF - thenF,
    shownDelta: Math.round(nowTemp) - Math.round(thenTemp),
    // daily: index 0 = yesterday, 1 = today, 2+ = coming up
    today: { high: u(d.daily.temperature_2m_max[1]), low: u(d.daily.temperature_2m_min[1]), uv: d.daily.uv_index_max[1] },
    yesterdayDay: { high: u(d.daily.temperature_2m_max[0]), low: u(d.daily.temperature_2m_min[0]) },
    todayByHour: temps.slice(24, 48),
    yesterdayByHour: temps.slice(0, 24),
    next24,
    next12: Array.from({ length: 12 }, (_, k) => ({
      hour: (hourNow + k + 1) % 24,
      now: temps[i + k + 1],
      before: temps[i + k + 1 - 24],
    })),
    forecast: [2, 3].map((k) => ({
      date: d.daily.time[k],
      code: d.daily.weather_code[k],
      high: u(d.daily.temperature_2m_max[k]),
      low: u(d.daily.temperature_2m_min[k]),
    })),
  };
}
