"use client";

import { useState } from "react";
import { RefreshCw, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  lastSync: Date | null;
}

export function DashboardHeader({ lastSync }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const res = await fetch("/api/sync", { method: "POST" });
      const data = await res.json();
      setSyncMsg(`Sincronizados ${data.synced} tickers${data.errors > 0 ? ` (${data.errors} errores)` : ""}`);
      // Refresh page data
      window.location.reload();
    } catch {
      setSyncMsg("Error al sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <header className="border-b border-zinc-200 bg-white px-4 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-zinc-800" />
            <h1 className="text-lg font-semibold text-zinc-900">Arena Alfa</h1>
          </div>
          <span className="text-sm text-zinc-400">Dashboard de hipótesis</span>
        </div>

        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-xs text-zinc-400">
              Actualizado:{" "}
              {lastSync.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {syncMsg && <span className="text-xs text-zinc-500">{syncMsg}</span>}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Actualizar precios"}
          </Button>
        </div>
      </div>
    </header>
  );
}
