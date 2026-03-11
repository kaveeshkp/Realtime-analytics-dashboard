import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface OHLCBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickChartProps {
  data: OHLCBar[];
  width?: number;
  height?: number;
  upColor?: string;
  downColor?: string;
}

export function CandlestickChart({
  data,
  width = 600,
  height = 300,
  upColor = "#22d3a5",
  downColor = "#f87171",
}: CandlestickChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const margin = { top: 16, right: 16, bottom: 32, left: 56 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((_, i) => String(i)))
      .range([0, innerW])
      .padding(0.25);

    const yExtent = [
      d3.min(data, (d) => d.low) as number,
      d3.max(data, (d) => d.high) as number,
    ];
    const yPad = (yExtent[1] - yExtent[0]) * 0.05;
    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - yPad, yExtent[1] + yPad])
      .range([innerH, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        xScale.domain().filter((_, i) => i % Math.ceil(data.length / 6) === 0)
      )
      .tickFormat((d) => {
        const item = data[Number(d)];
        return item
          ? item.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "";
      });

    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(xAxis)
      .call((ax) => ax.select(".domain").remove())
      .call((ax) => ax.selectAll(".tick line").remove())
      .call((ax) =>
        ax
          .selectAll("text")
          .style("fill", "#334155")
          .style("font-size", "10px")
          .style("font-family", "'DM Mono', monospace")
      );

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat((d) => `$${Number(d).toLocaleString()}`))
      .call((ax) => ax.select(".domain").remove())
      .call((ax) =>
        ax
          .selectAll(".tick line")
          .attr("x2", innerW)
          .attr("stroke", "rgba(255,255,255,0.04)")
      )
      .call((ax) =>
        ax
          .selectAll("text")
          .style("fill", "#475569")
          .style("font-size", "10px")
          .style("font-family", "'DM Mono', monospace")
      );

    const candles = g
      .selectAll(".candle")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candle")
      .attr(
        "transform",
        (_, i) =>
          `translate(${(xScale(String(i)) ?? 0) + xScale.bandwidth() / 2},0)`
      );

    candles
      .append("line")
      .attr("y1", (d) => yScale(d.high))
      .attr("y2", (d) => yScale(d.low))
      .attr("stroke", (d) => (d.close >= d.open ? upColor : downColor))
      .attr("stroke-width", 1.5);

    candles
      .append("rect")
      .attr("x", -xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(Math.max(d.open, d.close)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) =>
        Math.max(1, Math.abs(yScale(d.open) - yScale(d.close)))
      )
      .attr("fill", (d) => (d.close >= d.open ? upColor : downColor))
      .attr("rx", 1);
  }, [data, width, height, upColor, downColor]);

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        style={{ display: "block", maxWidth: "100%" }}
      />
    </div>
  );
}

export function generateOHLC(basePrice: number, days = 30): OHLCBar[] {
  let price = basePrice;
  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const change = (Math.random() - 0.48) * price * 0.025;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    price = close;
    return { date, open, high, low, close, volume: Math.round(Math.random() * 1e7) };
  });
}
