/**
 * Hit and Blow backend: Express + Socket.io + optional Redis.
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import { registerSocketHandlers } from './socket/handlers.js';
import { createCpuGame, submitCpuGuess, getCpuMove } from './routes/cpu.js';

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());

const io = new Server(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN || '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

registerSocketHandlers(io);

// REST: CPU game
app.post('/api/cpu/create', createCpuGame);
app.post('/api/cpu/guess', submitCpuGuess);
app.get('/api/cpu/move/:gameId', getCpuMove);

app.get('/health', (_req, res) => res.json({ ok: true }));

const PORT = Number(process.env.PORT) || 4000;
httpServer.listen(PORT, () => {
  console.log(`Hit and Blow server on http://localhost:${PORT}`);
});
