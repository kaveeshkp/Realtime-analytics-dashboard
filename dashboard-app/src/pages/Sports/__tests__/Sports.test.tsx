import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import Sports from "../index";
import { renderWithProviders } from "../../../test/fixtures";

vi.mock("../../../services/api/client", () => ({
  apiFetch: vi.fn((path: string) => {
    if (path.includes("/api/sports/live?league=CRICKET")) {
      return Promise.resolve([
        {
          league: "CRICKET",
          home: "India 280/6",
          away: "Australia 250/8",
          homeScore: 280,
          awayScore: 250,
          status: "LIVE",
          time: "45.0 ov",
          date: "2026-03-27",
        },
      ]);
    }

    if (path.includes("/api/sports/live")) {
      return Promise.resolve([
        {
          league: "RUGBY",
          home: "All Blacks",
          away: "Springboks",
          homeScore: 20,
          awayScore: 18,
          status: "LIVE",
          time: "62'",
          date: "2026-03-27",
        },
      ]);
    }

    if (path.includes("/api/sports/history")) {
      return Promise.resolve([
        {
          league: "CRICKET",
          home: "England",
          away: "Pakistan",
          homeScore: 300,
          awayScore: 280,
          status: "FT",
          time: "Yesterday",
          date: "2026-03-20",
        },
      ]);
    }

    if (path.includes("/api/sports/upcoming")) {
      return Promise.resolve([]);
    }

    return Promise.resolve([]);
  }),
}));

describe("Sports page", () => {
  it("renders title and filter buttons", async () => {
    renderWithProviders(<Sports />);

    await waitFor(() => {
      expect(screen.getByText("Live Sports")).toBeInTheDocument();
      expect(screen.getByText("All Sports")).toBeInTheDocument();
      expect(screen.getByText("Cricket")).toBeInTheDocument();
    });
  });

  it("switches to cricket mode", async () => {
    renderWithProviders(<Sports />);

    fireEvent.click(await screen.findByText("Cricket"));

    await waitFor(() => {
      expect(screen.getByText(/ICC live matches \+ last 1 month history/)).toBeInTheDocument();
    });
  });

  it("renders cricket ticker data", async () => {
    renderWithProviders(<Sports />);

    fireEvent.click(await screen.findByText("Cricket"));

    await waitFor(() => {
      expect(screen.getAllByText(/India/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Australia/i).length).toBeGreaterThan(0);
    });
  });

  it("supports searching teams", async () => {
    renderWithProviders(<Sports />);

    const input = await screen.findByPlaceholderText("Search teams...");
    fireEvent.change(input, { target: { value: "nomatchvalue" } });

    await waitFor(() => {
      expect(screen.getByText(/No results found for/)).toBeInTheDocument();
    });
  });
});
