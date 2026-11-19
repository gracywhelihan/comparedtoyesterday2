import { deg, fmtHour, signed } from "../lib/format";
import { describe, type WeatherView } from "../lib/weather";

/**
 * Next 12 hours vs. the same hour 24h earlier. Hidden for now (Gracy preferred the
 * page without it); remove `hidden` to bring it back. It doubles as the chart's
 * table view, so a "View as table" toggle under the chart is the natural next step.
 */
export function HourlyTable({ view }: { view: WeatherView }) {
  return (
    <section hidden>
      <div className="section-head"><h2>Next 12 hours</h2></div>
      <table className="hours">
        <thead><tr><th>Time</th><th>Today</th><th>24h ago</th><th>Diff</th></tr></thead>
        <tbody>
          {view.next12.map((h) => (
            <tr key={h.hour}>
              <td>{fmtHour(h.hour)}</td>
              <td>{deg(h.now)}</td>
              <td>{deg(h.before)}</td>
              <td>{signed(Math.round(h.now) - Math.round(h.before))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export function Forecast({ view }: { view: WeatherView }) {
  return (
    <section>
      <div className="section-head"><h2>Coming up</h2></div>
      {view.forecast.map((day) => (
        <div className="day" key={day.date}>
          <span>
            <span className="day__name">
              {new Date(day.date + "T12:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <br />
            {describe(day.code)}
          </span>
          <span className="nowrap">H {deg(day.high)} L {deg(day.low)}</span>
        </div>
      ))}
    </section>
  );
}

export function Credit() {
  return (
    <footer className="credit">
      <p>Weather data by <a href="https://open-meteo.com/">Open-Meteo</a></p>
      <p>Created by <a href="https://gracywhelihan.com/">Gracy Whelihan</a></p>
    </footer>
  );
}
