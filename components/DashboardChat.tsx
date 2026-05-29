"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HypothesisData } from "@/lib/hypotheses";
import type { PriceSignal } from "@/lib/signals";
import { FinancialTermText } from "@/components/FinancialTermText";
import { GlossaryToast, type GlossaryToastData } from "@/components/GlossaryToast";

type Row = HypothesisData & {
  currentPrice: number | null;
  changePct: number | null;
  lastSync: Date | null;
  signal: PriceSignal;
};

interface Props {
  rows: Row[];
}

const SUGGESTED_QUESTIONS = [
  "Si tengo $1,000 ¿cómo distribuiría la inversión entre las acciones en zona de oportunidad?",
  "¿Cuáles hipótesis tienen mayor upside potencial ahora?",
  "¿Qué acciones están en zona de entrada actualmente?",
  "Compara las hipótesis por sector y señal actual",
];

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
}

export function DashboardChat({ rows }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [glossaryToast, setGlossaryToast] = useState<GlossaryToastData | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleTermClick(term: string, definition: string) {
    clearTimeout(toastTimerRef.current);
    setGlossaryToast({ term, definition });
    toastTimerRef.current = setTimeout(() => setGlossaryToast(null), 6000);
  }

  const serializedRows = rows.map((r) => ({
    ticker: r.ticker,
    company: r.company,
    sector: r.sector,
    status: r.status,
    studyDate: r.studyDate,
    currentPrice: r.currentPrice,
    changePct: r.changePct,
    priceAtStudy: r.priceAtStudy,
    scenarioBase: r.scenarioBase,
    scenarioOpt: r.scenarioOpt,
    zoneValueLow: r.zoneValueLow,
    zoneValueHigh: r.zoneValueHigh,
    zoneDeepLow: r.zoneDeepLow,
    zoneDeepHigh: r.zoneDeepHigh,
    signal: {
      type: r.signal.type,
      label: r.signal.label,
      pctFromStudy: r.signal.pctFromStudy,
      pctToBase: r.signal.pctToBase,
    },
  }));

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat/dashboard",
      body: { rows: serializedRows },
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  }

  async function handleSuggested(question: string) {
    if (isLoading) return;
    await sendMessage({ text: question });
  }

  const openCount = rows.filter((r) => r.status !== "closed").length;
  const opportunityCount = rows.filter(
    (r) => r.signal.type === "max_opportunity" || r.signal.type === "entry_zone"
  ).length;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-zinc-900 text-white rounded-full px-4 py-3 shadow-lg hover:bg-zinc-700 transition-all",
          open && "hidden"
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">Consultar portafolio</span>
        {opportunityCount > 0 && (
          <span className="bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {opportunityCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <>
          {/* Backdrop (mobile) */}
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Chat panel */}
          <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[440px] h-[600px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50">
              <div>
                <div className="font-semibold text-zinc-900 text-sm">Asistente de portafolio</div>
                <div className="text-xs text-zinc-400">
                  {openCount} hipótesis abiertas · {opportunityCount} en oportunidad
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="relative flex-1 overflow-y-auto p-4 space-y-3">
              <GlossaryToast toast={glossaryToast} onClose={() => setGlossaryToast(null)} />
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="text-center pt-2">
                    <p className="text-sm text-zinc-600 font-medium">¿En qué te puedo ayudar?</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      Tengo contexto de todas las hipótesis con precios y señales actuales.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggested(q)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-600 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => {
                const text = getMessageText(m);
                if (!text) return null;
                return (
                  <div
                    key={m.id}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-zinc-900 text-white rounded-br-sm"
                          : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
                      )}
                    >
                      {m.role === "assistant" ? (
                        <FinancialTermText text={text} onTermClick={handleTermClick} />
                      ) : (
                        text
                      )}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-zinc-100 rounded-2xl rounded-bl-sm px-3 py-2">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-1.5 bg-amber-50 border-t border-amber-100">
              <p className="text-xs text-amber-600">
                Análisis educativo. No representa asesoría financiera.
              </p>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-zinc-100">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta sobre el portafolio..."
                className="flex-1 px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
                disabled={isLoading}
                autoFocus={open}
              />
              <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </>
      )}
    </>
  );
}
