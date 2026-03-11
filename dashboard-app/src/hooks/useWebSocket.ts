import { useEffect, useRef, useState, useCallback } from "react";

type ReadyState = "connecting" | "open" | "closing" | "closed";

interface UseWebSocketOptions {
  /** Called on each incoming message */
  onMessage?: (data: unknown) => void;
  /** Called on connection open */
  onOpen?: () => void;
  /** Called on connection close */
  onClose?: () => void;
  /** Called on error */
  onError?: (err: Event) => void;
  /** Auto-reconnect delay in ms. Set to 0 to disable. */
  reconnectDelay?: number;
  /** Parse incoming messages as JSON automatically */
  parseJson?: boolean;
}

interface UseWebSocketReturn {
  readyState: ReadyState;
  send: (data: string | object) => void;
  disconnect: () => void;
  connect: () => void;
}

const RS_MAP: Record<number, ReadyState> = {
  0: "connecting",
  1: "open",
  2: "closing",
  3: "closed",
};

export function useWebSocket(
  url: string,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectDelay = 3000,
    parseJson = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const [readyState, setReadyState] = useState<ReadyState>("closed");

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setReadyState("connecting");

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setReadyState("open");
      onOpen?.();
    };

    ws.onmessage = (evt) => {
      if (!mountedRef.current) return;
      try {
        const data = parseJson ? JSON.parse(evt.data as string) : evt.data;
        onMessage?.(data);
      } catch {
        onMessage?.(evt.data);
      }
    };

    ws.onerror = (err) => {
      if (!mountedRef.current) return;
      onError?.(err);
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setReadyState("closed");
      onClose?.();
      if (reconnectDelay > 0) {
        reconnectTimer.current = setTimeout(connect, reconnectDelay);
      }
    };
  }, [url, onMessage, onOpen, onClose, onError, reconnectDelay, parseJson]);

  const disconnect = useCallback(() => {
    if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  const send = useCallback((data: string | object) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    wsRef.current.send(payload);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [connect, disconnect]);

  // Reflect live readyState changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (wsRef.current) {
        setReadyState(RS_MAP[wsRef.current.readyState] ?? "closed");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { readyState, send, disconnect, connect };
}
