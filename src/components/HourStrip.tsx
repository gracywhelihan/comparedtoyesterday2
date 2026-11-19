import { useEffect, useRef, useState } from "react";
import { deg, fmtHour, fmtWind, WINDY_MPH, type Unit } from "../lib/format";
import type { HourCell } from "../lib/weather";
import { DropIcon, WeatherIcon, WindIcon } from "./Icons";

// A non-breaking space keeps an empty line's height (a plain space would collapse to nothing)
const NBSP = "\u00A0";

/**
 * Next 24 hours, scrolling sideways.
 *
 * Rain and wind only appear when they matter (rain chance > 0, gusts ≥ 25 mph).
 * If no hour has any, that line is dropped entirely; otherwise quiet hours get an
 * empty line so the temperatures stay aligned across the row.
 */
export function HourStrip({ hours, unit }: { hours: HourCell[]; unit: Unit }) {
  const ref = useRef<HTMLOListElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  // Fade the right edge while there's more to scroll; drop the fade at the end
  const checkEnd = () => {
    const el = ref.current;
    if (el) setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  };
  useEffect(checkEnd, [hours]);

  const anyRain = hours.some((h) => h.rainChance > 0);
  const anyWind = hours.some((h) => h.gustMph >= WINDY_MPH);

  return (
    <section>
      <div className="section-head"><h2>Next 24 hours</h2></div>
      {/* tabIndex so keyboard users can focus it and scroll with the arrow keys */}
      <ol ref={ref} className={`strip${atEnd ? " strip--end" : ""}`} tabIndex={0}
        aria-label="Next 24 hours (scrolls sideways)" onScroll={checkEnd}>
        {hours.map((h) => (
          <li key={`${h.dayName}-${h.hour}-${h.isNow}`} className={`strip__hour${h.dayName ? " strip__hour--newday" : ""}`}>
            <span className="strip__day">{h.dayName ?? NBSP}</span>
            <span className="strip__time">{h.isNow ? "Now" : fmtHour(h.hour)}</span>
            <WeatherIcon code={h.code} isDay={h.isDay} />
            <span className="strip__temp">{deg(h.temp)}</span>
            {anyRain && (h.rainChance > 0 ? (
              <span className="strip__extra"><DropIcon />{h.rainChance}%<span className="sr-only"> chance of rain</span></span>
            ) : <span className="strip__extra" aria-hidden="true">{NBSP}</span>)}
            {anyWind && (h.gustMph >= WINDY_MPH ? (
              <span className="strip__extra"><WindIcon />{fmtWind(h.gustMph, unit)}<span className="sr-only"> wind gusts</span></span>
            ) : <span className="strip__extra" aria-hidden="true">{NBSP}</span>)}
          </li>
        ))}
      </ol>
    </section>
  );
}
