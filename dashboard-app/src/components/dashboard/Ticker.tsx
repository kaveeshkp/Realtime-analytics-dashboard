import { useEffect, useRef, useState } from "react";

export interface TickerItem {
  symbol: string;
  price: number;
  pct: number;
}

interface TickerProps {
  items: TickerItem[];
  speed?: number; // px per second
}

export function Ticker({ items, speed = 60 }: TickerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const animRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const totalWidth = track.scrollWidth / 2; // duplicated list

    const step = (ts: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = ts;
      const delta = ts - lastTimeRef.current;
      lastTimeRef.current = ts;

      setOffset((prev) => {
        const next = prev + (speed * delta) / 1000;
        return next >= totalWidth ? 0 : next;
      });

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [speed, items]);

  const pctColor = (v: number) => (v >= 0 ? "#22d3a5" : "#f87171");

  const rendered = [...items, ...items].map((item, i) => (
    <span
      key={i}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        marginRight: 32,
        whiteSpace: "nowrap",
        fontFamily: "'DM Mono', monospace",
        fontSize: 12,
      }}
    >
      <span style={{ color: "#f0f4ff", fontWeight: 600 }}>{item.symbol}</span>
      <span style={{ color: "#64748b" }}>
        ${item.price >= 1 ? item.price.toLocaleString() : item.price.toFixed(4)}
      </span>
      <span
        style={{
          color: pctColor(item.pct),
          background: item.pct >= 0 ? "rgba(34,211,165,0.1)" : "rgba(248,113,113,0.1)",
          borderRadius: 4,
          padding: "1px 5px",
          fontSize: 11,
        }}
      >
        {item.pct >= 0 ? "+" : ""}
        {item.pct.toFixed(2)}%
      </span>
    </span>
  ));

  return (
    <div
      style={{
        overflow: "hidden",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(8,12,20,0.95)",
        padding: "6px 0",
      }}
    >
      <div
        ref={trackRef}
        style={{
          display: "inline-flex",
          transform: `translateX(-${offset}px)`,
          willChange: "transform",
        }}
      >
        {rendered}
      </div>
    </div>
  );
}
