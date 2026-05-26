"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Search, LayoutGrid, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceSignalBadge } from "@/components/PriceSignalBadge";
import { Button } from "@/components/ui/button";
import { cn, formatPrice, formatPct, formatDate } from "@/lib/utils";
import type { HypothesisData } from "@/lib/hypotheses";
import type { PriceSignal } from "@/lib/signals";

type Row = HypothesisData & {
  currentPrice: number | null;
  changePct: number | null;
  lastSync: Date | null;
  signal: PriceSignal;
};

type SortKey = "ticker" | "studyDate" | "currentPrice" | "pctFromStudy" | "scenarioBase" | "signal";
type SortDir = "asc" | "desc";

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
  rows: Row[];
}

export function HypothesisList({ rows }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [signalFilter, setSignalFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("studyDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const sectors = useMemo(
    () => ["all", ...Array.from(new Set(rows.map((r) => r.sector).filter(Boolean)))],
    [rows]
  );

  const filtered = useMemo(() => {
    return rows
      .filter((r) => {
        if (search) {
          const q = search.toLowerCase();
          if (!r.ticker.toLowerCase().includes(q) && !r.company.toLowerCase().includes(q)) return false;
        }
        if (statusFilter !== "all" && r.status !== statusFilter) return false;
        if (sectorFilter !== "all" && r.sector !== sectorFilter) return false;
        if (signalFilter !== "all") {
          const signalGroups: Record<string, string[]> = {
            opportunity: ["max_opportunity", "entry_zone"],
            in_range: ["in_range"],
            exceeded: ["near_target", "exceeded_target"],
          };
          if (!signalGroups[signalFilter]?.includes(r.signal.type)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let aVal: number | string = 0;
        let bVal: number | string = 0;

        switch (sortKey) {
          case "ticker":
            aVal = a.ticker;
            bVal = b.ticker;
            break;
          case "studyDate":
            aVal = a.studyDate;
            bVal = b.studyDate;
            break;
          case "currentPrice":
            aVal = a.currentPrice ?? -Infinity;
            bVal = b.currentPrice ?? -Infinity;
            break;
          case "pctFromStudy":
            aVal = a.signal.pctFromStudy ?? -Infinity;
            bVal = b.signal.pctFromStudy ?? -Infinity;
            break;
          case "scenarioBase":
            aVal = a.scenarioBase ?? -Infinity;
            bVal = b.scenarioBase ?? -Infinity;
            break;
          case "signal":
            aVal = a.signal.type;
            bVal = b.signal.type;
            break;
        }

        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [rows, search, statusFilter, sectorFilter, signalFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="h-3 w-3 text-zinc-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-zinc-600" />
    ) : (
      <ChevronDown className="h-3 w-3 text-zinc-600" />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar ticker o empresa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300 w-52"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="all">Estado: Todos</option>
          <option value="open">Abierta</option>
          <option value="partial_close">Cierre parcial</option>
          <option value="closed">Cerrada</option>
        </select>

        <select
          value={signalFilter}
          onChange={(e) => setSignalFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none"
        >
          <option value="all">Señal: Todas</option>
          <option value="opportunity">En oportunidad</option>
          <option value="in_range">En rango</option>
          <option value="exceeded">Superó objetivo</option>
        </select>

        <select
          value={sectorFilter}
          onChange={(e) => setSectorFilter(e.target.value)}
          className="px-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none"
        >
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "Sector: Todos" : s}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-1">
          <span className="text-xs text-zinc-400 mr-2">{filtered.length} hipótesis</span>
          <Button
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Table view */}
      {viewMode === "table" && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 bg-zinc-50">
                  <th
                    className="px-4 py-3 text-left font-medium text-zinc-500 cursor-pointer hover:text-zinc-800"
                    onClick={() => toggleSort("ticker")}
                  >
                    <span className="flex items-center gap-1">
                      Ticker <SortIcon k="ticker" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Sector</th>
                  <th
                    className="px-4 py-3 text-left font-medium text-zinc-500 cursor-pointer hover:text-zinc-800"
                    onClick={() => toggleSort("studyDate")}
                  >
                    <span className="flex items-center gap-1">
                      Estudio <SortIcon k="studyDate" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Precio estudio</th>
                  <th
                    className="px-4 py-3 text-right font-medium text-zinc-500 cursor-pointer hover:text-zinc-800"
                    onClick={() => toggleSort("currentPrice")}
                  >
                    <span className="flex items-center gap-1 justify-end">
                      Precio actual <SortIcon k="currentPrice" />
                    </span>
                  </th>
                  <th
                    className="px-4 py-3 text-right font-medium text-zinc-500 cursor-pointer hover:text-zinc-800"
                    onClick={() => toggleSort("pctFromStudy")}
                  >
                    <span className="flex items-center gap-1 justify-end">
                      Δ% <SortIcon k="pctFromStudy" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Zona VALUE</th>
                  <th
                    className="px-4 py-3 text-right font-medium text-zinc-500 cursor-pointer hover:text-zinc-800"
                    onClick={() => toggleSort("scenarioBase")}
                  >
                    <span className="flex items-center gap-1 justify-end">
                      Esc. Base <SortIcon k="scenarioBase" />
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Señal</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Estado</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((row) => (
                  <tr key={row.ticker} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-semibold text-zinc-900">{row.ticker}</div>
                        <div className="text-xs text-zinc-400">{row.company}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{row.sector}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(row.studyDate)}</td>
                    <td className="px-4 py-3 text-right text-zinc-700">
                      {formatPrice(row.priceAtStudy)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-900">
                      {row.currentPrice ? formatPrice(row.currentPrice) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.signal.pctFromStudy !== null ? (
                        <span
                          className={cn(
                            "font-medium",
                            row.signal.pctFromStudy >= 0 ? "text-emerald-600" : "text-red-500"
                          )}
                        >
                          {formatPct(row.signal.pctFromStudy)}
                        </span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-zinc-500">
                      {row.zoneValueLow && row.zoneValueHigh
                        ? `$${row.zoneValueLow}–$${row.zoneValueHigh}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-700">
                      {formatPrice(row.scenarioBase)}
                      {row.signal.pctToBase !== null && (
                        <div className="text-xs text-zinc-400">
                          {formatPct(row.signal.pctToBase)} upside
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <PriceSignalBadge signal={row.signal} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANTS[row.status]}>
                        {STATUS_LABELS[row.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/hypothesis/${row.ticker}`}
                        className="text-xs font-medium text-zinc-600 hover:text-zinc-900 underline underline-offset-2"
                      >
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cards view */}
      {viewMode === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((row) => (
            <Link
              key={row.ticker}
              href={`/hypothesis/${row.ticker}`}
              className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-zinc-900 text-lg">{row.ticker}</div>
                  <div className="text-xs text-zinc-400">{row.company}</div>
                </div>
                <PriceSignalBadge signal={row.signal} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>
                  <div className="text-xs text-zinc-400">Precio actual</div>
                  <div className="font-semibold text-zinc-900">
                    {row.currentPrice ? formatPrice(row.currentPrice) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Desde estudio</div>
                  <div
                    className={cn(
                      "font-medium",
                      row.signal.pctFromStudy !== null && row.signal.pctFromStudy >= 0
                        ? "text-emerald-600"
                        : "text-red-500"
                    )}
                  >
                    {formatPct(row.signal.pctFromStudy)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Zona VALUE</div>
                  <div className="text-zinc-700 text-xs">
                    {row.zoneValueLow && row.zoneValueHigh
                      ? `$${row.zoneValueLow}–$${row.zoneValueHigh}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-400">Esc. Base</div>
                  <div className="text-zinc-700">{formatPrice(row.scenarioBase)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={STATUS_VARIANTS[row.status]}>
                  {STATUS_LABELS[row.status]}
                </Badge>
                <span className="text-xs text-zinc-400">{formatDate(row.studyDate)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-400">
          No hay hipótesis que coincidan con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
