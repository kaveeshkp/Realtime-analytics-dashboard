import { useEffect, useRef } from "react";
import * as d3 from "d3";

export interface HeatmapCell {
  symbol: string;
  value: number;   // e.g. % change
  label?: string;
}

interface HeatmapProps {
  data: HeatmapCell[];
  width?: number;
  height?: number;
  maxAbsValue?: number;
}

export function Heatmap({
  data,
  width = 560,
  height = 300,
  maxAbsValue = 5,
}: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const cols = Math.ceil(Math.sqrt(data.length * (width / height)));
    const rows = Math.ceil(data.length / cols);
    const cellW = width / cols;
    const cellH = height / rows;
    const pad = 3;

    const colorScale = d3
      .scaleLinear<string>()
      .domain([-maxAbsValue, 0, maxAbsValue])
      .range(["#f87171", "#1e293b", "#22d3a5"])
      .clamp(true);

    const cells = svg
      .selectAll(".cell")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "cell")
      .attr("transform", (_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return `translate(${col * cellW},${row * cellH})`;
      });

    cells
      .append("rect")
      .attr("x", pad)
      .attr("y", pad)
      .attr("width", cellW - pad * 2)
      .attr("height", cellH - pad * 2)
      .attr("rx", 6)
      .attr("fill", (d) => colorScale(d.value))
      .attr("opacity", 0.9);

    cells
      .append("text")
      .attr("x", cellW / 2)
      .attr("y", cellH / 2 - 6)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("fill", "#f0f4ff")
      .style("font-size", `${Math.min(14, cellW / 4)}px`)
      .style("font-weight", "700")
      .style("font-family", "'DM Mono', monospace")
      .text((d) => d.symbol);

    cells
      .append("text")
      .attr("x", cellW / 2)
      .attr("y", cellH / 2 + 12)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .style("fill", "rgba(240,244,255,0.7)")
      .style("font-size", `${Math.min(11, cellW / 5)}px`)
      .style("font-family", "'DM Mono', monospace")
      .text((d) => `${d.value >= 0 ? "+" : ""}${d.value.toFixed(2)}%`);
  }, [data, width, height, maxAbsValue]);

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
