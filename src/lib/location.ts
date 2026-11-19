export interface Coords {
  lat: number;
  lon: number;
}

export const FALLBACK = { lat: 40.71, lon: -74.01, name: "New York City" };

/**
 * Ask the browser for the visitor's position. Resolves null if they say no,
 * it times out, or the browser can't. Rounded to 2 decimals (~1 km): plenty
 * for weather, and less precise than their exact position when we send it on.
 */
export function getPosition(): Promise<Coords | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: +p.coords.latitude.toFixed(2), lon: +p.coords.longitude.toFixed(2) }),
      () => resolve(null),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

/** City name for a position (BigDataCloud's free, keyless endpoint). Null if it fails. */
export async function placeName({ lat, lon }: Coords): Promise<string | null> {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const d = await r.json();
    return d.city || d.locality || d.principalSubdivision || null;
  } catch {
    return null;
  }
}
