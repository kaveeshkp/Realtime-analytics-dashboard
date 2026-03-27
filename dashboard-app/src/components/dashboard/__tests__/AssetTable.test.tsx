import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { AssetTable } from "../AssetTable";
import { renderWithProviders } from "../../../test/fixtures";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const rows = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 150.25,
    change: 2.2,
    pct: 1.2,
    volume: "50M",
    cap: "2.5T",
    sparkline: [
      { t: 1, v: 100 },
      { t: 2, v: 101 },
      { t: 3, v: 102 },
    ],
  },
  {
    symbol: "MSFT",
    name: "Microsoft",
    price: 300.4,
    change: -1.3,
    pct: -0.4,
    volume: "40M",
    cap: "2.2T",
    sparkline: [
      { t: 1, v: 200 },
      { t: 2, v: 198 },
      { t: 3, v: 199 },
    ],
  },
];

describe("AssetTable", () => {
  it("renders headers and rows", () => {
    renderWithProviders(<AssetTable rows={rows} />);

    expect(screen.getByText("Symbol")).toBeInTheDocument();
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
  });

  it("calls onSelect when clicking a row", () => {
    const onSelect = vi.fn();
    renderWithProviders(<AssetTable rows={rows} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("AAPL"));
    expect(onSelect).toHaveBeenCalledWith("AAPL");
  });

  it("supports sorting interactions", () => {
    renderWithProviders(<AssetTable rows={rows} />);
    fireEvent.click(screen.getByText("Price"));
    fireEvent.click(screen.getByText("Change"));
    expect(screen.getByText("AAPL")).toBeInTheDocument();
  });
});
