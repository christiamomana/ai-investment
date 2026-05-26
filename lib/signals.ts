import type { HypothesisData } from "./hypotheses";

export type SignalType =
  | "max_opportunity"
  | "entry_zone"
  | "in_range"
  | "near_target"
  | "exceeded_target"
  | "closed"
  | "no_data";

export interface PriceSignal {
  type: SignalType;
  label: string;
  color: string;
  emoji: string;
  pctFromStudy: number | null;
  pctToBase: number | null;
  pctToValue: number | null;
}

export function computeSignal(
  h: HypothesisData,
  currentPrice: number | null
): PriceSignal {
  if (h.status === "closed") {
    return {
      type: "closed",
      label: "Cerrada",
      color: "gray",
      emoji: "⚫",
      pctFromStudy: null,
      pctToBase: null,
      pctToValue: null,
    };
  }

  if (!currentPrice) {
    return {
      type: "no_data",
      label: "Sin precio",
      color: "gray",
      emoji: "⚪",
      pctFromStudy: null,
      pctToBase: null,
      pctToValue: null,
    };
  }

  const pctFromStudy =
    h.priceAtStudy
      ? ((currentPrice - h.priceAtStudy) / h.priceAtStudy) * 100
      : null;

  const pctToBase =
    h.scenarioBase
      ? ((h.scenarioBase - currentPrice) / currentPrice) * 100
      : null;

  const pctToValue =
    h.zoneValueLow
      ? ((h.zoneValueLow - currentPrice) / currentPrice) * 100
      : null;

  let type: SignalType;
  let label: string;
  let color: string;
  let emoji: string;

  const deepHigh = h.zoneDeepHigh;
  const valueHigh = h.zoneValueHigh;
  const scenarioBase = h.scenarioBase;
  const scenarioOpt = h.scenarioOpt;

  if (deepHigh && currentPrice <= deepHigh) {
    type = "max_opportunity";
    label = "Oportunidad máxima";
    color = "green";
    emoji = "🟢";
  } else if (h.zoneDeepHigh && h.zoneValueLow && currentPrice > h.zoneDeepHigh && currentPrice <= h.zoneValueLow) {
    type = "entry_zone";
    label = "Zona de entrada";
    color = "blue";
    emoji = "🔵";
  } else if (valueHigh && scenarioBase && currentPrice > valueHigh && currentPrice < scenarioBase) {
    type = "in_range";
    label = "En rango hipótesis";
    color = "yellow";
    emoji = "🟡";
  } else if (scenarioBase && scenarioOpt && currentPrice >= scenarioBase && currentPrice < scenarioOpt) {
    type = "near_target";
    label = "Cerca del objetivo";
    color = "orange";
    emoji = "🟠";
  } else if (scenarioOpt && currentPrice >= scenarioOpt) {
    type = "exceeded_target";
    label = "Superó objetivo";
    color = "red";
    emoji = "🔴";
  } else if (scenarioBase && currentPrice >= scenarioBase) {
    type = "near_target";
    label = "Cerca del objetivo";
    color = "orange";
    emoji = "🟠";
  } else {
    // Price between value zone and deep value (or no zones defined)
    type = "entry_zone";
    label = "Zona de entrada";
    color = "blue";
    emoji = "🔵";
  }

  return { type, label, color, emoji, pctFromStudy, pctToBase, pctToValue };
}
