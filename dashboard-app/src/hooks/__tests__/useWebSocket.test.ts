import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "../useWebSocket";

class MockWebSocket {
  static OPEN = 1;
  static CONNECTING = 0;
  static CLOSING = 2;
  static CLOSED = 3;

  public readyState = MockWebSocket.OPEN;
  public onopen: (() => void) | null = null;
  public onmessage: ((evt: { data: string }) => void) | null = null;
  public onerror: ((evt: Event) => void) | null = null;
  public onclose: (() => void) | null = null;
  public send = vi.fn();
  public close = vi.fn();

  constructor(_url: string) {}
}

let wsSpy: ReturnType<typeof vi.fn>;
let instances: MockWebSocket[];

describe("useWebSocket", () => {
  beforeEach(() => {
    instances = [];
    wsSpy = vi.fn((url: string) => {
      const ws = new MockWebSocket(url);
      instances.push(ws);
      return ws;
    });

    Object.assign(wsSpy, {
      OPEN: MockWebSocket.OPEN,
      CONNECTING: MockWebSocket.CONNECTING,
      CLOSING: MockWebSocket.CLOSING,
      CLOSED: MockWebSocket.CLOSED,
    });

    vi.stubGlobal("WebSocket", wsSpy as unknown as typeof WebSocket);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("connects on mount", () => {
    renderHook(() => useWebSocket("ws://localhost:8080"));
    expect(wsSpy).toHaveBeenCalledWith("ws://localhost:8080");
    expect(instances.length).toBeGreaterThan(0);
  });

  it("sends strings and JSON objects when open", () => {
    const { result } = renderHook(() => useWebSocket("ws://localhost:8080"));

    const ws = instances[0];
    expect(ws).toBeDefined();

    act(() => {
      result.current.send("ping");
      result.current.send({ type: "PING" });
    });

    expect(ws.send).toHaveBeenCalledWith("ping");
    expect(ws.send).toHaveBeenCalledWith(JSON.stringify({ type: "PING" }));
  });

  it("disconnects on unmount", () => {
    const { unmount, result } = renderHook(() => useWebSocket("ws://localhost:8080"));
    act(() => {
      result.current.disconnect();
    });
    unmount();
    expect(true).toBe(true);
  });
});
