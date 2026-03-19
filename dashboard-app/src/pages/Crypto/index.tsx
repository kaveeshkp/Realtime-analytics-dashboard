import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { apiFetch } from "../../services/api/client";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Skel } from "../../components/ui/Skeleton";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { OptimizedImage } from "../../components/ui/OptimizedImage";
import { CryptoRow } from "./CryptoRow";
import { SearchBar } from "../../components/filters/SearchBar";
import { fmt, pctColor } from "../../utils/dashFormat";
import type { CryptoAsset, DataPoint } from "../../types/dashboard.types";

interface CryptoProps {
  watchlist: string[];
  setWatchlist: (fn: (w: string[]) => string[]) => void;
}

export default function Crypto({ watchlist, setWatchlist }: CryptoProps) {
  const [selectedId, setSelectedId] = useState("bitcoin");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: cryptos = [], isLoading, isError: ce, refetch: refetchCryptos } = useQuery<CryptoAsset[]>({
    queryKey: ["crypto", "prices"],
    queryFn: () => apiFetch("/api/crypto/prices"),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: history, isError: he } = useQuery<DataPoint[]>({
    queryKey: ["crypto", "history", selectedId, 30],
    queryFn: () => apiFetch(`/api/crypto/history?coin=${selectedId}&days=30`),
    staleTime: 300_000,
  });

  const filteredCryptos = useMemo(() => {
    if (!searchQuery.trim()) return cryptos;
    const q = searchQuery.toLowerCase().trim();
    return cryptos.filter(c =>
      c.symbol.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  }, [cryptos, searchQuery]);

  const visibleCryptos = useMemo(() => {
    if (searchQuery.trim()) return filteredCryptos;
    return cryptos.slice(0, 10);
  }, [cryptos, filteredCryptos, searchQuery]);

  const selectedCoin   = cryptos.find(c => c.id === selectedId);
  const selectedFallbackLogo = selectedCoin ? `https://cryptoicons.org/api/icon/${selectedCoin.symbol.toLowerCase()}/64` : '';
  const inWatchlist    = watchlist.includes(selectedCoin?.symbol ?? "");
  const totalMarketCap = cryptos.reduce((s, c) => s + c.marketCap, 0);
  const totalVolume    = cryptos.reduce((s, c) => s + c.volume, 0);
  const btcDom         = totalMarketCap > 0
    ? ((cryptos.find(c => c.id === "bitcoin")?.marketCap ?? 0) / totalMarketCap * 100).toFixed(1)
    : "—";

  // Keep a valid selection for the currently visible list.
  useEffect(() => {
    if (visibleCryptos.length > 0) {
      const stillVisible = visibleCryptos.find(c => c.id === selectedId);
      if (!stillVisible) {
        setSelectedId(visibleCryptos[0].id);
      }
    }
  }, [visibleCryptos, selectedId]);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Cryptocurrency</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>Top 10 by market cap · Search across all loaded coins</p>
      </div>

      {(ce || he) && (
        <ErrorBanner
          error={new Error('Failed to load crypto data')}
          message="Some crypto data failed to load. Retrying automatically..."
          onRetry={() => {
            if (ce) refetchCryptos();
          }}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        <KpiCard label="Total Market Cap" value={totalMarketCap ? fmt(totalMarketCap) : "—"} sub={`Top ${cryptos.length} coins`} color="#f59e0b" />
        <KpiCard label="24h Volume"        value={totalVolume ? fmt(totalVolume) : "—"}   sub="Across all pairs"  color="#3b82f6" />
        <KpiCard label="BTC Dominance"     value={`${btcDom}%`}                           sub="Of total cap"      color="#22d3a5" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search crypto..." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
        {/* Coin list table */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 110px 80px", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "#334155", fontFamily: "'DM Mono', monospace", letterSpacing: 1 }}>
            <span>#</span><span>NAME</span>
            <span style={{ textAlign: "right" as const }}>PRICE</span>
            <span style={{ textAlign: "right" as const }}>24H</span>
            <span style={{ textAlign: "right" as const }}>MARKET CAP</span>
            <span style={{ textAlign: "right" as const }}>7D</span>
          </div>
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "50px 1fr 120px 100px 110px 80px", padding: "14px 20px", gap: 8, borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                <Skel w={20} /><Skel w={110} /><Skel w={80} /><Skel w={60} /><Skel w={90} /><Skel w={80} h={32} />
              </div>
            ))
            : visibleCryptos.length === 0 && searchQuery
              ? (
                <div style={{ padding: "60px 20px", textAlign: "center" as const, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
                  No results found for "{searchQuery}"
                </div>
              )
              : visibleCryptos.map((c, i) => (
                <CryptoRow
                  key={c.id}
                  crypto={c}
                  index={i}
                  isSelected={selectedId === c.id}
                  onSelect={setSelectedId}
                />
              ))}
        </div>

        {/* Detail panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {selectedCoin && (
            <>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <OptimizedImage
                      src={selectedCoin.image || selectedFallbackLogo}
                      alt={selectedCoin.name}
                      width={36}
                      height={36}
                      fallbackSrc={selectedFallbackLogo || '◉'}
                    />
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, color: "#f59e0b", fontSize: 22 }}>{selectedCoin.symbol}</div>
                      <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{selectedCoin.name}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setWatchlist(w => inWatchlist ? w.filter(s => s !== selectedCoin.symbol) : [...w, selectedCoin.symbol])}
                    style={{ background: inWatchlist ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${inWatchlist ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.1)"}`, color: inWatchlist ? "#f59e0b" : "#64748b", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}
                  >
                    {inWatchlist ? "★ Watching" : "☆ Watch"}
                  </button>
                </div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: "#f0f4ff", fontWeight: 700 }}>
                  {selectedCoin.price > 1 ? fmt(selectedCoin.price) : `$${selectedCoin.price.toFixed(4)}`}
                </div>
                <div style={{ fontSize: 13, color: pctColor(selectedCoin.pct), marginTop: 4 }}>
                  {selectedCoin.pct >= 0 ? "▲" : "▼"} {Math.abs(selectedCoin.change).toFixed(selectedCoin.price < 1 ? 4 : 2)} today
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" hide />
                      <YAxis hide domain={["auto", "auto"]} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontFamily: "'DM Mono', monospace", fontSize: 11 }} itemStyle={{ color: "#f59e0b" }} formatter={(v: number) => [v > 1 ? `$${v.toLocaleString()}` : `$${v.toFixed(4)}`, ""]} />
                      <Area type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} fill="url(#cg)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <Skel w="100%" h={160} />}
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                {[
                  ["Market Cap", fmt(selectedCoin.marketCap)],
                  ["24h Volume", fmt(selectedCoin.volume)],
                  ["24h Change", `${selectedCoin.pct > 0 ? "+" : ""}${selectedCoin.pct.toFixed(2)}%`],
                  ["Rank", `#${cryptos.findIndex(c => c.id === selectedId) + 1}`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 12, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{l}</span>
                    <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
