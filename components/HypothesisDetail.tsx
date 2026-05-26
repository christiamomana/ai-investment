"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceSignalBadge } from "@/components/PriceSignalBadge";
import { AIAnalysis } from "@/components/AIAnalysis";
import { ChatPanel } from "@/components/ChatPanel";
import { cn, formatPrice, formatPct, formatDate } from "@/lib/utils";
import type { HypothesisData } from "@/lib/hypotheses";
import type { PriceSignal } from "@/lib/signals";

const STATUS_LABELS: Record<string, string> = {
  open: "Abierta",
  partial_close: "Cierre parcial",
  closed: "Cerrada",
};
const STATUS_VARIANTS: Record<string, "open" | "partial" | "closed"> = {
  open: "open",
  partial_close: "partial",
  closed: "closed",
};

interface Props {
  hypothesis: HypothesisData;
  currentPrice: number | null;
  changePct: number | null;
  signal: PriceSignal;
  cachedAnalysis: string | null;
  analysisGeneratedAt: string | null;
}

type RightTab = "analysis" | "chat";

export function HypothesisDetail({
  hypothesis: h,
  currentPrice,
  changePct,
  signal,
  cachedAnalysis,
  analysisGeneratedAt,
}: Props) {
  const [rightTab, setRightTab] = useState<RightTab>("analysis");

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white px-4 py-3">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al listado
              </Button>
            </Link>
            <div className="h-4 w-px bg-zinc-200" />
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl text-zinc-900">{h.ticker}</span>
              <span className="text-zinc-500">{h.company}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400">{formatDate(h.studyDate)}</span>
            <Badge variant={STATUS_VARIANTS[h.status]}>{STATUS_LABELS[h.status]}</Badge>
            <PriceSignalBadge signal={signal} />
          </div>
        </div>
      </header>

      {/* Price metrics strip */}
      <div className="bg-white border-b border-zinc-100 px-4 py-2">
        <div className="max-w-[1400px] mx-auto flex items-center gap-8 text-sm">
          <div>
            <span className="text-zinc-400 text-xs">Precio actual</span>
            <div className="font-semibold text-zinc-900">{formatPrice(currentPrice)}</div>
          </div>
          {changePct !== null && (
            <div>
              <span className="text-zinc-400 text-xs">Cambio hoy</span>
              <div className={cn("font-medium", changePct >= 0 ? "text-emerald-600" : "text-red-500")}>
                {formatPct(changePct)}
              </div>
            </div>
          )}
          <div>
            <span className="text-zinc-400 text-xs">Precio al estudio</span>
            <div className="text-zinc-700">{formatPrice(h.priceAtStudy)}</div>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">Desde estudio</span>
            <div className={cn("font-medium", signal.pctFromStudy !== null && signal.pctFromStudy >= 0 ? "text-emerald-600" : "text-red-500")}>
              {formatPct(signal.pctFromStudy)}
            </div>
          </div>
          <div className="h-8 w-px bg-zinc-100" />
          <div>
            <span className="text-zinc-400 text-xs">Zona VALUE</span>
            <div className="text-zinc-700 text-xs">
              {h.zoneValueLow && h.zoneValueHigh ? `$${h.zoneValueLow}–$${h.zoneValueHigh}` : "—"}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">Deep Value</span>
            <div className="text-zinc-700 text-xs">
              {h.zoneDeepLow && h.zoneDeepHigh ? `$${h.zoneDeepLow}–$${h.zoneDeepHigh}` : "—"}
            </div>
          </div>
          <div>
            <span className="text-zinc-400 text-xs">Escenario base</span>
            <div className="font-medium text-zinc-900">{formatPrice(h.scenarioBase)}</div>
          </div>
          {signal.pctToBase !== null && (
            <div>
              <span className="text-zinc-400 text-xs">Upside al objetivo</span>
              <div className="font-medium text-emerald-600">{formatPct(signal.pctToBase)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Main content: 2-column layout */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 py-4 grid grid-cols-2 gap-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* Left: original study */}
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-700">Estudio original — Arena Alfa</h2>
            {h.htmlFile && (
              <a
                href={`/api/study/${h.htmlFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
              >
                <ExternalLink className="h-3 w-3" />
                Abrir
              </a>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {h.htmlFile ? (
              <iframe
                src={`/api/study/${h.htmlFile}`}
                className="w-full h-full border-0 rounded"
                title={`Estudio ${h.ticker}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <div className="text-3xl">📄</div>
                <p className="text-sm font-medium text-zinc-600">Archivo HTML no cargado</p>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Sube el archivo HTML del estudio de Arena Alfa a{" "}
                  <code className="bg-zinc-100 px-1 rounded">/studies/</code> y actualiza{" "}
                  <code className="bg-zinc-100 px-1 rounded">htmlFile</code> en{" "}
                  <code className="bg-zinc-100 px-1 rounded">lib/hypotheses.ts</code>.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Analysis + Chat tabs */}
        <div className="flex flex-col rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex border-b border-zinc-100">
            <button
              onClick={() => setRightTab("analysis")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                rightTab === "analysis"
                  ? "text-zinc-900 border-b-2 border-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Análisis AI
            </button>
            <button
              onClick={() => setRightTab("chat")}
              className={cn(
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                rightTab === "chat"
                  ? "text-zinc-900 border-b-2 border-zinc-900"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              Chat AI
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {rightTab === "analysis" ? (
              <AIAnalysis
                ticker={h.ticker}
                cachedAnalysis={cachedAnalysis}
                generatedAt={analysisGeneratedAt}
              />
            ) : (
              <ChatPanel ticker={h.ticker} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
