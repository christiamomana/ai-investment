"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Send, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FinancialTermText } from "@/components/FinancialTermText";
import { GlossaryToast, type GlossaryToastData } from "@/components/GlossaryToast";

interface Props {
  ticker: string;
}

function getMessageText(msg: UIMessage): string {
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { type: "text"; text: string }).text)
    .join("");
}

export function ChatPanel({ ticker }: Props) {
  const [input, setInput] = useState("");
  const [glossaryToast, setGlossaryToast] = useState<GlossaryToastData | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleTermClick(term: string, definition: string) {
    clearTimeout(toastTimerRef.current);
    setGlossaryToast({ term, definition });
    toastTimerRef.current = setTimeout(() => setGlossaryToast(null), 6000);
  }

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { ticker },
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

  function exportConversation() {
    const text = messages
      .map((m) => `${m.role === "user" ? "Usuario" : "AI"}: ${getMessageText(m)}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${ticker}-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto p-4 space-y-3">
        <GlossaryToast toast={glossaryToast} onClose={() => setGlossaryToast(null)} />
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-zinc-400">
            <div className="text-3xl">💬</div>
            <p className="text-sm font-medium text-zinc-500">Chat sobre {ticker}</p>
            <p className="text-xs max-w-xs">
              Pregunta sobre la tesis, las zonas de valoración, los riesgos, o cualquier aspecto del estudio de Arena Alfa.
            </p>
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
          Este chat es educativo. No representa asesoría financiera.
        </p>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-3 border-t border-zinc-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Pregunta sobre ${ticker}...`}
          className="flex-1 px-3 py-2 text-sm text-zinc-900 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-300"
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
        {messages.length > 0 && (
          <Button type="button" variant="ghost" size="sm" onClick={exportConversation}>
            <Download className="h-3.5 w-3.5" />
          </Button>
        )}
      </form>
    </div>
  );
}
