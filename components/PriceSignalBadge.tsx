"use client";

import { cn } from "@/lib/utils";
import type { PriceSignal } from "@/lib/signals";

const colorClasses: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-800 border-emerald-200",
  blue: "bg-blue-100 text-blue-800 border-blue-200",
  yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
  orange: "bg-orange-100 text-orange-800 border-orange-200",
  red: "bg-red-100 text-red-800 border-red-200",
  gray: "bg-zinc-100 text-zinc-500 border-zinc-200",
};

interface Props {
  signal: PriceSignal;
  showDetails?: boolean;
}

export function PriceSignalBadge({ signal, showDetails }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
          colorClasses[signal.color]
        )}
      >
        {signal.emoji} {signal.label}
      </span>

      {showDetails && (
        <div className="flex flex-col gap-0.5 text-xs text-zinc-500">
          {signal.pctFromStudy !== null && (
            <span>
              Desde estudio:{" "}
              <span className={signal.pctFromStudy >= 0 ? "text-emerald-600" : "text-red-600"}>
                {signal.pctFromStudy >= 0 ? "+" : ""}
                {signal.pctFromStudy.toFixed(1)}%
              </span>
            </span>
          )}
          {signal.pctToBase !== null && (
            <span>Al objetivo base: {signal.pctToBase.toFixed(1)}%</span>
          )}
        </div>
      )}
    </div>
  );
}
