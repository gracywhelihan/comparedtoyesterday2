import { deg, fmtHour } from "../lib/format";
import { describe, type WeatherView } from "../lib/weather";

/** Detail bits joined with " · ", each kept on one line (no "H 64° L" / "40°" splits). */
function Details({ bits }: { bits: string[] }) {
  return (
    <p>
      {bits.map((bit, k) => (
        <span key={k}>
          {k > 0 && " · "}
          <span className="nowrap">{bit}</span>
        </span>
      ))}
    </p>
  );
}

export function TodayYesterday({ view }: { view: WeatherView }) {
  return (
    <section className="rows" aria-label="Today and yesterday">
      <div className="row">
        <div>
          <p className="row__title">Today</p>
          <Details
            bits={[
              describe(view.code),
              `H ${deg(view.today.high)} L ${deg(view.today.low)}`,
              `UV ${view.today.uv.toFixed(0)}`,
            ]}
          />
        </div>
        <p className="row__aside">
          {deg(view.nowTemp)}
          <span className="row__sub">Feels {deg(view.feels)}</span>
        </p>
      </div>
      <div className="row">
        <div>
          <p className="row__title">Yesterday</p>
          <Details
            bits={[
              `At ${fmtHour(view.hourNow)}: ${describe(view.thenCode)}`,
              `H ${deg(view.yesterdayDay.high)} L ${deg(view.yesterdayDay.low)}`,
            ]}
          />
        </div>
        <p className="row__aside">{deg(view.thenTemp)}</p>
      </div>
    </section>
  );
}
