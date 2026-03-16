import { createServer } from 'http';
import app from './app';
import { env } from './config/env';
import { initWebSocket } from './websocket/wsServer';

const server = createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => {
  console.log(`Backend running  →  http://localhost:${env.PORT}`);
  console.log(`WebSocket live   →  ws://localhost:${env.PORT}/ws`);
});
