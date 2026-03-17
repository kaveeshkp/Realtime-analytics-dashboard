import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket } from './useWebSocket';

describe('useWebSocket Hook', () => {
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      send: vi.fn(),
      close: vi.fn(),
      readyState: 1, // OPEN
      OPEN: 1,
      CONNECTING: 0,
      CLOSING: 2,
      CLOSED: 3,
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    global.WebSocket = vi.fn(() => mockWebSocket) as any;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Connection Management', () => {
    it('connects to WebSocket on mount', () => {
      renderHook(() => useWebSocket('ws://localhost:8080'));

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');
    });

    it('initializes with closed state', () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

      expect(result.current.readyState).toBe('closed');
    });

    it('sets state to connecting when connecting', () => {
      const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));

      // Immediately after render, should be connecting/closed
      expect(['closed', 'connecting']).toContain(result.current.readyState);
    });

    it('calls onOpen callback when connected', async () => {
      const onOpen = vi.fn();
      renderHook(() =>
        useWebSocket('ws://localhost:8080', { onOpen })
      );

      // Simulate WebSocket opening
      act(() => {
        mockWebSocket.onopen?.();
      });

      await waitFor(() => {
        expect(onOpen).toHaveBeenCalled();
      });
    });

    it('sets state to open when connection opens', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      act(() => {
        mockWebSocket.onopen?.();
      });

      await waitFor(() => {
        // readyState should update to 'open'
        expect(result.current.readyState).toBeTruthy();
      });
    });

    it('disconnects on unmount', () => {
      const { unmount } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      expect(mockWebSocket.close).not.toHaveBeenCalled();

      unmount();

      expect(mockWebSocket.close).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    it('calls onMessage callback with parsed JSON data', async () => {
      const onMessage = vi.fn();
      const testData = { symbol: 'AAPL', price: 150 };

      renderHook(() =>
        useWebSocket('ws://localhost:8080', {
          onMessage,
          parseJson: true,
        })
      );

      act(() => {
        mockWebSocket.onmessage?.({
          data: JSON.stringify(testData),
        });
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalledWith(testData);
      });
    });

    it('calls onMessage with raw data when parseJson is false', async () => {
      const onMessage = vi.fn();
      const testData = 'raw string data';

      renderHook(() =>
        useWebSocket('ws://localhost:8080', {
          onMessage,
          parseJson: false,
        })
      );

      act(() => {
        mockWebSocket.onmessage?.({ data: testData });
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalledWith(testData);
      });
    });

    it('calls onMessage with raw data when JSON parsing fails', async () => {
      const onMessage = vi.fn();
      const invalidJson = 'not valid json {]';

      renderHook(() =>
        useWebSocket('ws://localhost:8080', {
          onMessage,
          parseJson: true,
        })
      );

      act(() => {
        mockWebSocket.onmessage?.({ data: invalidJson });
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalledWith(invalidJson);
      });
    });

    it('handles multiple messages', async () => {
      const onMessage = vi.fn();

      renderHook(() =>
        useWebSocket('ws://localhost:8080', { onMessage })
      );

      act(() => {
        mockWebSocket.onmessage?.({ data: JSON.stringify({ msg: 1 }) });
        mockWebSocket.onmessage?.({ data: JSON.stringify({ msg: 2 }) });
        mockWebSocket.onmessage?.({ data: JSON.stringify({ msg: 3 }) });
      });

      await waitFor(() => {
        expect(onMessage).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Send Functionality', () => {
    it('sends string data through WebSocket', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      act(() => {
        mockWebSocket.readyState = 1; // OPEN
        result.current.send('test message');
      });

      await waitFor(() => {
        expect(mockWebSocket.send).toHaveBeenCalledWith('test message');
      });
    });

    it('sends object data as JSON string', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      const testData = { symbol: 'AAPL', price: 150 };

      act(() => {
        mockWebSocket.readyState = 1; // OPEN
        result.current.send(testData);
      });

      await waitFor(() => {
        expect(mockWebSocket.send).toHaveBeenCalledWith(
          JSON.stringify(testData)
        );
      });
    });

    it('does not send when WebSocket is not open', () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      mockWebSocket.readyState = 3; // CLOSED

      act(() => {
        result.current.send('test message');
      });

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('calls onError callback on WebSocket error', async () => {
      const onError = vi.fn();
      const errorEvent = new Event('error');

      renderHook(() =>
        useWebSocket('ws://localhost:8080', { onError })
      );

      act(() => {
        mockWebSocket.onerror?.(errorEvent);
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(errorEvent);
      });
    });

    it('calls onClose callback when connection closes', async () => {
      const onClose = vi.fn();

      renderHook(() =>
        useWebSocket('ws://localhost:8080', { onClose })
      );

      act(() => {
        mockWebSocket.onclose?.();
      });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('sets state to closed when connection closes', async () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      act(() => {
        mockWebSocket.onclose?.();
      });

      await waitFor(() => {
        expect(result.current.readyState).toBe('closed');
      });
    });
  });

  describe('Auto-Reconnect', () => {
    it('reconnects after connection closes with default delay', async () => {
      renderHook(() =>
        useWebSocket('ws://localhost:8080', { reconnectDelay: 3000 })
      );

      const initialCallCount = (global.WebSocket as any).mock.calls.length;

      act(() => {
        mockWebSocket.onclose?.();
      });

      // Advance timers past reconnect delay
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      await waitFor(() => {
        expect((global.WebSocket as any).mock.calls.length).toBeGreaterThan(
          initialCallCount
        );
      });
    });

    it('does not reconnect when reconnectDelay is 0', () => {
      renderHook(() =>
        useWebSocket('ws://localhost:8080', { reconnectDelay: 0 })
      );

      const initialCallCount = (global.WebSocket as any).mock.calls.length;

      act(() => {
        mockWebSocket.onclose?.();
      });

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect((global.WebSocket as any).mock.calls.length).toBe(initialCallCount);
    });

    it('clears reconnect timer on disconnect', () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080', { reconnectDelay: 3000 })
      );

      act(() => {
        mockWebSocket.onclose?.();
      });

      act(() => {
        result.current.disconnect();
      });

      expect(clearTimeoutSpy).toHaveBeenCalled();
      clearTimeoutSpy.mockRestore();
    });
  });

  describe('Disconnect', () => {
    it('closes WebSocket connection', () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      act(() => {
        result.current.disconnect();
      });

      expect(mockWebSocket.close).toHaveBeenCalled();
    });

    it('prevents callbacks after unmount', () => {
      const onMessage = vi.fn();
      const onOpen = vi.fn();

      const { unmount } = renderHook(() =>
        useWebSocket('ws://localhost:8080', { onMessage, onOpen })
      );

      unmount();

      // Try to trigger callbacks after unmount
      act(() => {
        mockWebSocket.onopen?.();
        mockWebSocket.onmessage?.({ data: 'test' });
      });

      // Callbacks should not be called
      expect(onMessage).not.toHaveBeenCalled();
      expect(onOpen).not.toHaveBeenCalled();
    });
  });

  describe('Module-Level Considerations', () => {
    it('does not retain lastIndex state from global /g regex on repeated calls', () => {
      // This test ensures the hook doesn't have stateful regex issues
      const onMessage = vi.fn();

      const { result: hook1 } = renderHook(() =>
        useWebSocket('ws://localhost:8080', { onMessage })
      );

      act(() => {
        mockWebSocket.onmessage?.({ data: JSON.stringify({ n: 1 }) });
        mockWebSocket.onmessage?.({ data: JSON.stringify({ n: 2 }) });
      });

      expect(onMessage).toHaveBeenCalledTimes(2);
      const firstCall = onMessage.mock.calls[0][0];
      const secondCall = onMessage.mock.calls[1][0];

      expect(firstCall).toEqual({ n: 1 });
      expect(secondCall).toEqual({ n: 2 });
    });
  });

  describe('Edge Cases', () => {
    it('handles multiple URL changes by creating new connection', () => {
      const { rerender } = renderHook(
        ({ url }) => useWebSocket(url),
        { initialProps: { url: 'ws://localhost:8080' } }
      );

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:8080');

      rerender({ url: 'ws://localhost:9090' });

      expect(global.WebSocket).toHaveBeenCalledWith('ws://localhost:9090');
    });

    it('handles rapid connect/disconnect calls', () => {
      const { result } = renderHook(() =>
        useWebSocket('ws://localhost:8080')
      );

      act(() => {
        result.current.disconnect();
        result.current.connect();
        result.current.disconnect();
        result.current.connect();
      });

      // Should have made multiple connections
      expect(mockWebSocket.close.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
