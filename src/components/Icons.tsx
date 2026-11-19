/**
 * Weather icons drawn with straight lines and sharp corners to match the angular type.
 * They use currentColor (the ink), so they work on every background color.
 */

// 8 short sun rays, 45° apart: from radius 6.5 to 9 around the center (12, 12)
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]
  .map((a) => {
    const r = (a * Math.PI) / 180;
    const c = Math.cos(r), s = Math.sin(r);
    return `M${(12 + 6.5 * c).toFixed(1)} ${(12 + 6.5 * s).toFixed(1)}L${(12 + 9 * c).toFixed(1)} ${(12 + 9 * s).toFixed(1)}`;
  })
  .join("");

const Sun = () => (<><circle cx="12" cy="12" r="4" /><path d={RAYS} /></>);
const Moon = () => <path d="M14 3a9 9 0 1 0 7 13 7 7 0 0 1-7-13z" />;
const CloudLow = () => <polygon points="3,19 21,19 21,14 17,14 16,10 11,9 8,12 5,12 3,14" />;
const CloudHigh = () => <polygon points="3,14 21,14 21,10 17,10 16,6 11,5 8,8 5,8 3,10" />; // room underneath
const SmallSun = () => (<><circle cx="16" cy="7" r="3" /><path d="M16 1.5v1.5M21.5 7H20M19.9 3.1l-1 1M12.1 3.1l1 1" /></>);
const SmallMoon = () => <path d="M17 2a5 5 0 1 0 4 7.5A4 4 0 0 1 17 2z" />;
// Filled with the page color so it covers the sun/moon behind it
const PartlyCloud = () => <polygon points="2,20 17,20 17,16 14,16 13,13 9,12 6,15 4,15 2,16" fill="var(--bg)" />;

const SNOW = [71, 73, 75, 77, 85, 86];

function shapesFor(code: number, isDay: boolean) {
  if (code === 0) return isDay ? <Sun /> : <Moon />;
  if (code === 1 || code === 2) return (<>{isDay ? <SmallSun /> : <SmallMoon />}<PartlyCloud /></>);
  if (code === 3) return <CloudLow />;
  if (code === 45 || code === 48) return <path d="M3 8h18M5 12h14M3 16h18" />;
  if (SNOW.includes(code)) return (<><CloudHigh /><path d="M7 18l2 2M9 18l-2 2M12 19l2 2M14 19l-2 2M17 18l2 2M19 18l-2 2" /></>);
  if (code >= 95) return (<><CloudHigh /><polyline points="13,15 10,19 14,19 11,23" /></>);
  if (code >= 51) return (<><CloudHigh /><path d="M8 17l-2 4M13 17l-2 4M18 17l-2 4" /></>); // drizzle, rain, showers
  return <CloudLow />;
}

export function WeatherIcon({ code, isDay }: { code: number; isDay: boolean }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinejoin="miter" strokeLinecap="square">
      {shapesFor(code, isDay)}
    </svg>
  );
}

export const DropIcon = () => (
  <svg className="mini-icon" viewBox="0 0 12 12" aria-hidden="true">
    <polygon points="6,1 10,7 10,9 8,11 4,11 2,9 2,7" fill="currentColor" />
  </svg>
);

export const WindIcon = () => (
  <svg className="mini-icon" viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor"
    strokeWidth={1.4} strokeLinecap="square">
    <polyline points="1,3 8,3 10,1" /><polyline points="1,6 10,6 11,7" /><polyline points="1,9 6,9 8,11" />
  </svg>
);
