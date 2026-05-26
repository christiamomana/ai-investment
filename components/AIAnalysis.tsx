"use client";

import { useState, useEffect } from "react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisContent {
  summary?: string;
  thesisStatus?: string;
  signal?: string;
  risks?: string[];
  catalysts?: string[];
  priceContext?: string;
  suggestedQuestions?: string[];
}

const SIGNAL_CLASSES: Record<string, string> = {
  "Oportunidad": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "En rango": "bg-blue-100 text-blue-800 border-blue-200",
  "Fuera de rango": "bg-orange-100 text-orange-800 border-orange-200",
  "Revisar tesis": "bg-red-100 text-red-800 border-red-200",
};

interface Props {
  ticker: string;
  cachedAnalysis: string | null;
  generatedAt: string | null;
}

export function AIAnalysis({ ticker, cachedAnalysis, generatedAt }: Props) {
  const [analysis, setAnalysis] = useState<AnalysisContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<string | null>(generatedAt);

  useEffect(() => {
    if (cachedAnalysis) {
      try {
        // Strip markdown code fences if present
        const clean = cachedAnalysis.replace(/^```json\n?/, "").replace(/\n?```$/, "");
        setAnalysis(JSON.parse(clean));
      } catch {
        // If not JSON, show as raw text
        setAnalysis({ summary: cachedAnalysis });
      }
    } else {
      generateAnalysis(false);
    }
  }, []);

  async function generateAnalysis(forceRefresh = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, forceRefresh }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando análisis");
      const clean = data.content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      setAnalysis(JSON.parse(clean));
      setLastGenerated(new Date().toISOString());
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400">
        <RefreshCw className="h-5 w-5 animate-spin" />
        <p className="text-sm">Generando análisis con AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-zinc-400 p-6">
        <AlertCircle className="h-5 w-5 text-red-400" />
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="outline" size="sm" onClick={() => generateAnalysis(true)}>
          Reintentar
        </Button>
      </div>
    );
  }

  if (!analysis) return null;

  const signalClass = analysis.signal ? SIGNAL_CLASSES[analysis.signal] ?? SIGNAL_CLASSES["En rango"] : "";

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Header with refresh */}
        <div className="flex items-center justify-between">
          {analysis.signal && (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${signalClass}`}>
              {analysis.signal}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {lastGenerated && (
              <span className="text-xs text-zinc-400">
                {new Date(lastGenerated).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => generateAnalysis(true)}>
              <RefreshCw className="h-3 w-3" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Summary */}
        {analysis.summary && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Resumen ejecutivo
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{analysis.summary}</p>
          </section>
        )}

        {/* Thesis status */}
        {analysis.thesisStatus && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Estado de la tesis
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{analysis.thesisStatus}</p>
          </section>
        )}

        {/* Price context */}
        {analysis.priceContext && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Contexto de precio
            </h3>
            <p className="text-sm text-zinc-700 leading-relaxed">{analysis.priceContext}</p>
          </section>
        )}

        {/* Risks + Catalysts in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          {analysis.risks && analysis.risks.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                Riesgos clave
              </h3>
              <ul className="space-y-1">
                {analysis.risks.map((r, i) => (
                  <li key={i} className="text-xs text-zinc-600 flex gap-1.5">
                    <span className="text-red-400 mt-0.5">▸</span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {analysis.catalysts && analysis.catalysts.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
                Catalizadores
              </h3>
              <ul className="space-y-1">
                {analysis.catalysts.map((c, i) => (
                  <li key={i} className="text-xs text-zinc-600 flex gap-1.5">
                    <span className="text-emerald-500 mt-0.5">▸</span>
                    {c}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Suggested questions */}
        {analysis.suggestedQuestions && analysis.suggestedQuestions.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
              Preguntas sugeridas para el chat
            </h3>
            <ul className="space-y-1.5">
              {analysis.suggestedQuestions.map((q, i) => (
                <li key={i} className="text-xs text-blue-600 bg-blue-50 rounded px-2.5 py-1.5 cursor-pointer hover:bg-blue-100">
                  {q}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-xs text-zinc-400 border-t border-zinc-100 pt-3">
          Este análisis es educativo y no representa asesoría financiera.
        </p>
      </div>
    </div>
  );
}
