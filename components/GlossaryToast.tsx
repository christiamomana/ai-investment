"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GlossaryToastData {
  term: string;
  definition: string;
}

interface Props {
  toast: GlossaryToastData | null;
  onClose: () => void;
}

export function GlossaryToast({ toast, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      className={cn(
        "absolute bottom-20 left-3 right-3 z-10 rounded-xl border border-zinc-200 bg-white shadow-lg p-3 transition-all duration-200",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-zinc-900 mb-0.5">📖 {toast.term}</p>
          <p className="text-xs text-zinc-600 leading-relaxed">{toast.definition}</p>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 text-zinc-400 hover:text-zinc-700 transition-colors mt-0.5"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
