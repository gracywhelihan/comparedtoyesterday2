import { useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { deg, fmtHour, fmtShort, signed } from "../lib/format";
import type { WeatherView } from "../lib/weather";

/** Width of an element, kept up to date as the window resizes. */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}

/**
 * Today vs yesterday, hour by hour. Two 2px lines on one temperature axis:
 * today solid ink, yesterday lighter. A crosshair snaps to the nearest hour
 * (mouse, touch, or arrow keys) and shows both values and the difference.
 */
export function HourlyChart({ view }: { view: WeatherView }) {
  const [boxRef, W] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const today = view.todayByHour;
  const yesterday = view.yesterdayByHour;

  const H = Math.round(Math.min(320, Math.max(220, W * 0.5)));
  const m = { t: 20, r: 12, b: 28, l: 36 };

  // Y scale: round the range out to multiples of 5°
  const all = [...today, ...yesterday];
  const lo = Math.floor(Math.min(...all) / 5) * 5;
  let hi = Math.ceil(Math.max(...all) / 5) * 5;
  if (hi === lo) hi += 5;
  const step = hi - lo > 30 ? 10 : 5;
  const y = (v: number) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b);

  // Direct labels at the line ends only if they're ≥ 16px apart (nudging them apart
  // would detach them from their lines); only then reserve room on the right.
  const yT = y(today[23]);
  const yY = y(yesterday[23]);
  const endLabels = Math.abs(yT - yY) >= 16;
  if (endLabels) m.r = 92;
  const x = (hr: number) => m.l + (hr / 23) * (W - m.l - m.r);
  const points = (series: number[]) => series.map((v, hr) => `${x(hr).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  const gridValues: number[] = [];
  for (let v = lo; v <= hi; v += step) gridValues.push(v);
  const nowX = x(Math.min(23, view.hourFraction));

  const hourAt = (e: PointerEvent<SVGSVGElement>) => {
    const px = e.clientX - e.currentTarget.getBoundingClientRect().left;
    return Math.max(0, Math.min(23, Math.round(((px - m.l) / (W - m.l - m.r)) * 23)));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    const current = active ?? Math.min(23, view.hourNow);
    if (e.key === "ArrowRight") setActive(Math.min(23, current + 1));
    if (e.key === "ArrowLeft") setActive(Math.max(0, current - 1));
  };

  return (
    <section className="chart-section">
      <div className="section-head">
        <h2>Hour by hour</h2>
        <ul className="legend" aria-label="Legend">
          <li><span className="key key--today" />Today</li>
          <li><span className="key key--yesterday" />Yesterday</li>
        </ul>
      </div>
      <div className="chart" ref={boxRef}>
        {W > 0 && (
          <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} tabIndex={0} role="img"
            aria-label="Temperature by hour, today vs yesterday. Use the arrow keys to read values."
            onPointerMove={(e) => setActive(hourAt(e))}
            onPointerDown={(e) => setActive(hourAt(e))}
            onPointerLeave={() => setActive(null)}
            onFocus={() => setActive(Math.min(23, view.hourNow))}
            onBlur={() => setActive(null)}
            onKeyDown={onKey}>
            {gridValues.map((v) => (
              <g key={v}>
                <line className="grid" x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} />
                <text className="axis-label" x={m.l - 8} y={y(v) + 4} textAnchor="end">{v}°</text>
              </g>
            ))}
            {[0, 6, 12, 18, 23].map((hr) => (
              <text key={hr} className="axis-label" x={x(hr)} y={H - 8} textAnchor="middle">{fmtShort(hr)}</text>
            ))}
            <line className="now-line" x1={nowX} x2={nowX} y1={m.t - 4} y2={H - m.b} />
            <text className="axis-label" x={nowX} y={m.t - 8} textAnchor="middle">now</text>

            <polyline className="line line--yesterday" points={points(yesterday)} />
            <polyline className="line line--today" points={points(today)} />

            <circle className="end-dot" cx={x(23)} cy={yY} r={4} fill="var(--ink-soft)" />
            <circle className="end-dot" cx={x(23)} cy={yT} r={4} fill="var(--ink)" />
            {endLabels && (
              <>
                <text className="end-label" x={x(23) + 10} y={yT + 4}>Today</text>
                <text className="end-label" x={x(23) + 10} y={yY + 4} opacity={0.6}>Yesterday</text>
              </>
            )}

            {active !== null && (
              <g>
                <line className="crosshair" x1={x(active)} x2={x(active)} y1={m.t} y2={H - m.b} />
                <circle className="end-dot" cx={x(active)} cy={y(yesterday[active])} r={4} fill="var(--ink-soft)" />
                <circle className="end-dot" cx={x(active)} cy={y(today[active])} r={4} fill="var(--ink)" />
              </g>
            )}
          </svg>
        )}
        {active !== null && (
          // Sits right of the crosshair, or left of it on the right side of the chart
          <div className="tooltip" style={x(active) > W * 0.6
            ? { left: x(active) - 12, transform: "translateX(-100%)" }
            : { left: x(active) + 12 }}>
            <b>{fmtHour(active)}</b>
            Today {deg(today[active])}<br />
            Yesterday {deg(yesterday[active])}<br />
            {signed(Math.round(today[active]) - Math.round(yesterday[active]))}
          </div>
        )}
      </div>
    </section>
  );
}
