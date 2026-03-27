import { Suspense, lazy, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "./services/api/client";
import { Navbar } from "./components/layout/Navbar";
import { AppSidebar } from "./components/layout/AppSidebar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorToast } from "./components/ui/ErrorToast";
import { STOCK_SYMBOLS, WATCHLIST_DEFAULT } from "./constants/stocks";
import type { StockQuote, CryptoAsset } from "./types/dashboard.types";

const Home = lazy(() => import("./pages/Home"));
const Crypto = lazy(() => import("./pages/Crypto"));
const Sports = lazy(() => import("./pages/Sports"));
const CSEMarket = lazy(() => import("./pages/CSE"));
const Portfolio = lazy(() => import("./pages/Portfolio"));

const NAV_ITEMS = [
  { id: "home",      label: "Overview",  icon: "home" },
  { id: "crypto",    label: "Crypto",    icon: "crypto" },
  { id: "sports",    label: "Sports",    icon: "sports" },
  { id: "cse",       label: "Stocks 🇱🇰", icon: "stocks" },
  { id: "portfolio", label: "Portfolio", icon: "portfolio" },
];

export default function App() {
  const [page,        setPage]        = useState("home");
  const dark = true;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watchlist,   setWatchlist]   = useState<string[]>(WATCHLIST_DEFAULT);

  const { data: stocks  = [], isLoading: stocksLoading, error: stocksError, refetch: refetchStocks } = useQuery<StockQuote[]>({
    queryKey: ["stocks", "batch"],
    queryFn:  () => apiFetch(`/api/stocks/batch?symbols=${STOCK_SYMBOLS}`),
    refetchInterval: 30_000, staleTime: 25_000,
  });
  const { data: cryptos = [], isLoading: cryptosLoading, error: cryptosError, refetch: refetchCryptos } = useQuery<CryptoAsset[]>({
    queryKey: ["crypto", "prices"],
    queryFn:  () => apiFetch("/api/crypto/prices"),
    refetchInterval: 30_000, staleTime: 25_000,
  });

  const ticker = [
    ...stocks.slice(0, 3).map(s => ({ symbol: s.symbol, pct: s.pct })),
    ...cryptos.slice(0, 3).map(c => ({ symbol: c.symbol, pct: c.pct })),
  ];

  return (
    <ErrorBoundary>
      <div style={{ minHeight: "100vh", background: dark ? "#080c14" : "#f0f4ff", color: dark ? "#f0f4ff" : "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { width: 4px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
          button { transition: all 0.15s ease; }
          button:hover { opacity: 0.85; }
          input::placeholder { color: #334155; }
        `}</style>

        <ErrorToast />

        <Navbar
          page={page}
          onNavigate={setPage}
          navItems={NAV_ITEMS}
          ticker={ticker}
          dark={dark}
          onOpenWatchlist={() => setSidebarOpen(true)}
        />

        <button
          onClick={() => setSidebarOpen(true)}
          style={{ position: "fixed", bottom: 28, right: 28, zIndex: 30, background: "linear-gradient(135deg,#22d3a5,#3b82f6)", border: "none", borderRadius: "50%", width: 52, height: 52, cursor: "pointer", fontSize: 20, color: "#080c14", boxShadow: "0 4px 20px rgba(34,211,165,0.35)", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ☆
        </button>

        <AppSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          watchlist={watchlist}
          setWatchlist={setWatchlist}
          stocks={stocks}
          cryptos={cryptos}
          dark={dark}
        />

        <main style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px" }}>
          <Suspense fallback={<div style={{ color: "#64748b", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>Loading view...</div>}>
            {page === "home"      && <Home dark={dark} setPage={setPage} watchlist={watchlist} stocks={stocks} cryptos={cryptos} stocksLoading={stocksLoading} cryptosLoading={cryptosLoading} stocksError={stocksError} cryptosError={cryptosError} onRefreshStocks={refetchStocks} onRefreshCryptos={refetchCryptos} />}
            {page === "crypto"    && <Crypto dark={dark} watchlist={watchlist} setWatchlist={setWatchlist} />}
            {page === "sports"    && <Sports />}
            {page === "cse"       && <CSEMarket />}
            {page === "portfolio" && <Portfolio stocks={stocks} cryptos={cryptos} />}
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}
