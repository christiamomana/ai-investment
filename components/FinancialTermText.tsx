"use client";

import { useMemo } from "react";
import { GLOSSARY, getGlossaryTerms } from "@/lib/glossary";

interface Props {
  text: string;
  onTermClick: (term: string, definition: string) => void;
  className?: string;
}

export function FinancialTermText({ text, onTermClick, className }: Props) {
  const parts = useMemo(() => {
    const terms = getGlossaryTerms();
    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = new RegExp(`(${escaped.join("|")})`, "g");
    return text.split(pattern);
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        GLOSSARY[part] ? (
          <button
            key={i}
            onClick={() => onTermClick(part, GLOSSARY[part])}
            className="underline decoration-dotted underline-offset-2 decoration-zinc-400 cursor-help hover:decoration-zinc-600 transition-colors"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
