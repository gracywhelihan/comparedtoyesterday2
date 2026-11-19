import { useState } from "react";
import type { Unit } from "../lib/format";

/** °F / °C, remembered on this device. First visit: °F in the US, °C everywhere else. */
export function useUnit() {
  const [unit, setUnitState] = useState<Unit>(() => {
    const saved = localStorage.getItem("unit");
    if (saved === "F" || saved === "C") return saved;
    return navigator.language.endsWith("-US") ? "F" : "C";
  });

  const setUnit = (next: Unit) => {
    localStorage.setItem("unit", next);
    setUnitState(next);
  };

  return [unit, setUnit] as const;
}
