import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { Navbar } from "../Navbar";
import { renderWithProviders } from "../../../test/fixtures";

describe("Navbar Component", () => {
  const mockNavItems = [
    { id: "home", label: "Home", icon: "home" },
    { id: "stocks", label: "Stocks", icon: "stocks" },
    { id: "crypto", label: "Crypto", icon: "crypto" },
    { id: "sports", label: "Sports", icon: "sports" },
  ];

  const mockTicker = [
    { symbol: "AAPL", pct: 2.5 },
    { symbol: "GOOGL", pct: -1.2 },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders logo and nav labels", () => {
    renderWithProviders(
      <Navbar page="home" onNavigate={vi.fn()} navItems={mockNavItems} dark={true} />,
    );

    expect(screen.getByText("DASHFLOW")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Stocks")).toBeInTheDocument();
    expect(screen.getByText("Crypto")).toBeInTheDocument();
    expect(screen.getByText("Sports")).toBeInTheDocument();
  });

  it("highlights selected page and navigates on click", () => {
    const onNavigate = vi.fn();
    renderWithProviders(
      <Navbar page="stocks" onNavigate={onNavigate} navItems={mockNavItems} dark={true} />,
    );

    const stocksButton = screen.getByText("Stocks");
    const cryptoButton = screen.getByText("Crypto");

    expect(stocksButton).toHaveStyle("color: #22d3a5");
    expect(cryptoButton).toHaveStyle("color: #94a3b8");

    fireEvent.click(cryptoButton);
    expect(onNavigate).toHaveBeenCalledWith("crypto");
  });

  it("renders ticker content", () => {
    renderWithProviders(
      <Navbar
        page="home"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        ticker={mockTicker}
        dark={true}
      />,
    );

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("+2.50%")).toBeInTheDocument();
  });

  it("shows watchlist button only when callback is provided", () => {
    const { rerender } = renderWithProviders(
      <Navbar page="home" onNavigate={vi.fn()} navItems={mockNavItems} dark={true} />,
    );

    expect(screen.queryByTitle("Watchlist")).not.toBeInTheDocument();

    const onOpenWatchlist = vi.fn();
    rerender(
      <Navbar
        page="home"
        onNavigate={vi.fn()}
        navItems={mockNavItems}
        dark={true}
        onOpenWatchlist={onOpenWatchlist}
      />,
    );

    const watchlistButton = screen.getByTitle("Watchlist");
    fireEvent.click(watchlistButton);
    expect(onOpenWatchlist).toHaveBeenCalled();
  });
});
