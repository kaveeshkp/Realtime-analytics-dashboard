import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../services/api/client";
import { Skel } from "../../components/ui/Skeleton";
import { SearchBar } from "../../components/filters/SearchBar";
import type { MatchScore, Fixture } from "../../types/dashboard.types";

const LEAGUES = [
  { label: "All Sports", value: "ALL" },
  { label: "Cricket",    value: "CRICKET" },
  { label: "Rugby",      value: "RUGBY" },
  { label: "Football",   value: "FOOTBALL" },
  { label: "Basketball", value: "BASKETBALL" },
];

const CRICKET_FLAG_PATTERNS: Array<{ pattern: RegExp; flag: string }> = [
  { pattern: /india|\bind\b/i,                                                                                                flag: "🇮🇳" },
  { pattern: /pakistan|\bpak\b/i,                                                                                            flag: "🇵🇰" },
  { pattern: /sri lanka|\bsl\b/i,                                                                                            flag: "🇱🇰" },
  { pattern: /bangladesh|\bban\b/i,                                                                                          flag: "🇧🇩" },
  { pattern: /afghanistan|\bafg\b/i,                                                                                         flag: "🇦🇫" },
  { pattern: /england|\beng\b/i,                                                                                             flag: "🏴" },
  { pattern: /scotland|\bsco\b/i,                                                                                            flag: "🏴" },
  { pattern: /ireland|\bire\b/i,                                                                                             flag: "🇮🇪" },
  { pattern: /wales|\bwal\b/i,                                                                                               flag: "🏴" },
  { pattern: /new zealand|\bnz\b/i,                                                                                         flag: "🇳🇿" },
  { pattern: /south africa|\bsa\b/i,                                                                                        flag: "🇿🇦" },
  { pattern: /west indies|\bwi\b/i,                                                                                         flag: "🏴" },
  { pattern: /zimbabwe|\bzim\b/i,                                                                                           flag: "🇿🇼" },
  { pattern: /nepal|\bnep\b/i,                                                                                              flag: "🇳🇵" },
  { pattern: /netherlands|\bned\b/i,                                                                                        flag: "🇳🇱" },
  { pattern: /namibia|\bnam\b/i,                                                                                            flag: "🇳🇦" },
  { pattern: /oman|\bomn\b/i,                                                                                               flag: "🇴🇲" },
  { pattern: /canada|\bcan\b/i,                                                                                             flag: "🇨🇦" },
  { pattern: /usa|united states|\bus\b/i,                                                                                   flag: "🇺🇸" },
  { pattern: /australia|new south wales|queensland|victoria|tasmania|western australia|south australia/i,                   flag: "🇦🇺" },
];

function parseCricketSide(raw: string): { team: string; innings: string } {
  // Create a fresh regex per call — a module-scope /g regex retains lastIndex
  // between calls which produces inconsistent results when called repeatedly.
  const scoreRx = /\d{1,3}(?:\/\d{1,2})?(?:\s*&\s*\d{1,3}(?:\/\d{1,2})?)?/g;
  const clean = raw.replace(/\*/g, "").replace(/\s+/g, " ").trim();
  const innings = (clean.match(scoreRx) ?? []).join(" & ").trim();
  const team = clean
    .replace(scoreRx, "")
    .replace(/\s*&\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { team: team || raw, innings };
}

function cricketFlag(teamName: string): string {
  const hit = CRICKET_FLAG_PATTERNS.find(({ pattern }) => pattern.test(teamName));
  return hit?.flag ?? "🏏";
}

function statusStyle(s: string) {
  return ({
    LIVE: { bg: "rgba(239,68,68,0.15)",   color: "#ef4444", label: "● LIVE" },
    FT:   { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: "✓ FT"   },
    UP:   { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6", label: "○ UP"   },
  } as Record<string, { bg: string; color: string; label: string }>)[s] ?? { bg: "", color: "", label: s };
}

type Row = {
  league: string;
  home: string;
  away: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  time: string;
};

export default function Sports() {
  const [league, setLeague] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const isCricket = league === "CRICKET";

  const { data: live = [],     isLoading: ll, isError: le } = useQuery<MatchScore[]>({
    queryKey: ["sports", "live", league],
    queryFn:  () => apiFetch(`/api/sports/live?league=${league}`),
    refetchInterval: isCricket ? 15_000 : 30_000,
    staleTime: isCricket ? 12_000 : 25_000,
  });
  const { data: upcoming = [], isLoading: ul, isError: ue } = useQuery<Fixture[]>({
    queryKey: ["sports", "upcoming", league],
    queryFn:  () => apiFetch(`/api/sports/upcoming?league=${league}`),
    refetchInterval: 300_000, staleTime: 280_000,
  });
  const { data: cricketHistory = [], isLoading: hl, isError: he } = useQuery<MatchScore[]>({
    queryKey: ["sports", "history", "CRICKET", 60],
    queryFn: () => apiFetch("/api/sports/history?league=CRICKET&days=60"),
    enabled: isCricket,
    refetchInterval: 600_000,
    staleTime: 540_000,
  });

  const rows: Row[] = [
    ...live,
    ...upcoming.map(f => ({ ...f, homeScore: undefined, awayScore: undefined })),
  ];

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase().trim();
    return rows.filter(match => {
      if (match.league === "CRICKET") {
        const home = parseCricketSide(match.home).team.toLowerCase();
        const away = parseCricketSide(match.away).team.toLowerCase();
        return home.includes(q) || away.includes(q);
      }
      return match.home.toLowerCase().includes(q) ||
             match.away.toLowerCase().includes(q);
    });
  }, [rows, searchQuery]);

  const filteredCricketHistory = useMemo(() => {
    if (!searchQuery.trim()) return cricketHistory;
    const q = searchQuery.toLowerCase().trim();
    return cricketHistory.filter(match => {
      const home = match.home.toLowerCase();
      const away = match.away.toLowerCase();
      return home.includes(q) || away.includes(q);
    });
  }, [cricketHistory, searchQuery]);

  const subtitle = league === "CRICKET"
    ? "ICC live matches + last 2 months history"
    : "International matches · all sports · Live refresh every 30s";

  const cricketTickerRows = filteredRows.filter(r => r.league === "CRICKET").slice(0, 12);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "#f0f4ff", margin: 0 }}>Live Sports</h1>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {LEAGUES.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setLeague(value)}
              style={{ background: league === value ? "rgba(236,72,153,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${league === value ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)"}`, color: league === value ? "#ec4899" : "#64748b", borderRadius: 8, padding: "6px 16px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Mono', monospace" }}
            >
              {label}
            </button>
          ))}
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search teams..." />
        </div>
      </div>

      {league === "CRICKET" && cricketTickerRows.length > 0 && (
        <>
          <style>{`@keyframes cricketTickerMove { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
          <div style={{ marginBottom: 16, background: "linear-gradient(90deg, rgba(3,105,161,0.2), rgba(14,116,144,0.12))", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 12, padding: "8px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
            <div style={{ display: "inline-flex", gap: 18, alignItems: "center", padding: "0 14px", minWidth: "max-content", animation: "cricketTickerMove 42s linear infinite" }}>
              {[...cricketTickerRows, ...cricketTickerRows].map((g, idx) => {
                const h = parseCricketSide(g.home);
                const a = parseCricketSide(g.away);
                return (
                  <span key={`${g.home}-${g.away}-${idx}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "#e2e8f0" }}>
                    <span style={{ color: "#38bdf8" }}>{cricketFlag(h.team)} {h.team}</span>
                    {h.innings && <span style={{ marginLeft: 6, color: "#a5f3fc" }}>[{h.innings}]</span>}
                    <span style={{ color: "#64748b", margin: "0 8px" }}>vs</span>
                    <span style={{ color: "#38bdf8" }}>{cricketFlag(a.team)} {a.team}</span>
                    {a.innings && <span style={{ marginLeft: 6, color: "#a5f3fc" }}>[{a.innings}]</span>}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {(le || ue || he) && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 20px", marginBottom: 20, color: "#f87171", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
          Failed to load sports data. The backend may be unavailable — retrying automatically.
        </div>
      )}
      {ll || ul ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24 }}>
              <Skel h={120} />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#334155", fontSize: 14, fontFamily: "'DM Mono', monospace", textAlign: "center" as const, marginTop: 60 }}>
          No matches found for {league}
        </div>
      ) : filteredRows.length === 0 && searchQuery ? (
        <div style={{ padding: "60px 20px", textAlign: "center" as const, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
          No results found for "{searchQuery}"
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: league === "CRICKET" ? "1fr" : "repeat(2, 1fr)", gap: 16 }}>
          {filteredRows.map((g, i) => {
            const ss = statusStyle(g.status);
            if (g.league === "CRICKET") {
              const home = parseCricketSide(g.home);
              const away = parseCricketSide(g.away);
              return (
                <div key={i} style={{ background: "linear-gradient(135deg, rgba(14,36,50,0.55), rgba(16,24,39,0.7))", border: "1px solid rgba(56,189,248,0.25)", borderRadius: 14, padding: 22, boxShadow: "0 8px 24px rgba(14,165,233,0.12)", borderLeft: "4px solid #38bdf8" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", letterSpacing: 1 }}>{g.league}</span>
                    <span style={{ background: ss.bg, color: ss.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{ss.label}</span>
                  </div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#38bdf8", fontSize: 14 }}>
                        {cricketFlag(home.team)} {home.team}
                      </div>
                      {home.innings && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#f0f4ff", marginTop: 4 }}>{home.innings}</div>}
                    </div>
                    <div style={{ textAlign: "center" as const, color: "#334155", fontFamily: "'DM Mono', monospace", fontSize: 11, paddingTop: 4 }}>vs</div>
                    <div style={{ flex: 1, textAlign: "right" as const }}>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#38bdf8", fontSize: 14 }}>
                        {cricketFlag(away.team)} {away.team}
                      </div>
                      {away.innings && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, color: "#f0f4ff", marginTop: 4 }}>{away.innings}</div>}
                    </div>
                  </div>
                  {g.time && <div style={{ marginTop: 10, fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{g.time}</div>}
                </div>
              );
            }
            return (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", letterSpacing: 1 }}>{g.league}</span>
                  <span style={{ background: ss.bg, color: ss.color, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{ss.label}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.home}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.homeScore != null && g.awayScore != null && g.homeScore > g.awayScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>
                      {g.homeScore ?? "–"}
                    </div>
                  </div>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#334155" }}>VS</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#475569", marginTop: 4 }}>{g.time}</div>
                  </div>
                  <div style={{ textAlign: "center" as const }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, color: "#f0f4ff", fontSize: 16 }}>{g.away}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 800, color: g.homeScore != null && g.awayScore != null && g.awayScore > g.homeScore ? "#22d3a5" : "#f0f4ff", marginTop: 8, lineHeight: 1 }}>
                      {g.awayScore ?? "–"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCricket && (
        <div style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, color: "#f0f4ff", margin: 0 }}>ICC Cricket · Past 2 Months</h2>
          <p style={{ color: "#475569", fontSize: 12, marginTop: 5, fontFamily: "'DM Mono', monospace" }}>Recent ICC entries from the last 60 days</p>

          <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
            {hl
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14 }}>
                  <Skel h={18} />
                </div>
              ))
              : cricketHistory.length === 0
                ? (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, color: "#64748b", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                    No ICC cricket history found for the last 60 days.
                  </div>
                )
                : filteredCricketHistory.length === 0 && searchQuery
                  ? (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, color: "#64748b", fontFamily: "'DM Mono', monospace", fontSize: 12 }}>
                      No cricket history found for "{searchQuery}"
                    </div>
                  )
                  : filteredCricketHistory.map((m, i) => (
                  <div key={`${m.home}-${m.away}-${m.time}-${i}`} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ color: "#f0f4ff", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14 }}>
                      {cricketFlag(m.home)} {m.home} <span style={{ color: "#334155", fontFamily: "'DM Mono', monospace", fontWeight: 400 }}>vs</span> {cricketFlag(m.away)} {m.away}
                    </div>
                    <div style={{ textAlign: "right" as const }}>
                      <div style={{ background: "rgba(100,116,139,0.15)", color: "#94a3b8", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontFamily: "'DM Mono', monospace", display: "inline-block" }}>✓ FT</div>
                      <div style={{ marginTop: 4, color: "#64748b", fontSize: 11, fontFamily: "'DM Mono', monospace" }}>{m.time}</div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}
