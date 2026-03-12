import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { fetchCryptoPrices } from '../services/coinGecko';
import { cache } from '../cache';
import { WsMessage, CryptoAsset } from '../types';

let wss: WebSocketServer;

function broadcast(msg: WsMessage): void {
  const payload = JSON.stringify(msg);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

async function pushPrices(): Promise<void> {
  try {
    // Reuse cached data when available to avoid redundant API calls
    let prices = cache.get<CryptoAsset[]>('crypto:prices');
    if (!prices) {
      prices = await fetchCryptoPrices();
      cache.set('crypto:prices', prices, 30);
    }

    broadcast({
      type:      'crypto_prices',
      data:      prices,
      timestamp: Date.now(),
    });
  } catch (err) {
    // Swallow errors — WebSocket broadcast failures shouldn't crash the server
    console.error(
      '[WS] Failed to fetch prices:',
      err instanceof Error ? err.message : err,
    );
  }
}

export function initWebSocket(server: http.Server): void {
  // noServer: true — we handle the upgrade manually so we can restrict to /ws
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') {
      wss.handleUpgrade(req, socket as import('stream').Duplex, head, ws => {
        wss.emit('connection', ws, req);
      });
    } else {
      // Reject any WebSocket upgrade that isn't targeting /ws
      socket.destroy();
    }
  });

  wss.on('connection', ws => {
    // 1. Immediately send connection confirmation
    const welcome: WsMessage = { type: 'connected', message: 'Live prices active' };
    ws.send(JSON.stringify(welcome));

    // 2. Push current prices right away so the client doesn't wait 30 s
    void pushPrices();

    ws.on('error', err => {
      console.error('[WS] Client error:', err.message);
    });
  });

  // Broadcast to all connected clients every 30 seconds
  setInterval(() => { void pushPrices(); }, 30_000);

  console.log('[WS] WebSocket server initialised on /ws');
}
