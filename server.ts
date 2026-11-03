import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface CharacterAppearance {
  shirtColor: string;
  pantsColor?: string;
  skinColor?: string;
  hairColor?: string;
  hairStyle?: string;
  outfit?: string;
  accessory?: string;
  faceStyle?: string;
}

export type CharacterEmote = 'none' | 'wave' | 'dance' | 'salute' | 'cheer' | 'clap' | 'sit';

export interface PlayerData {
  id: string;
  nickname: string;
  color: string;
  appearance?: CharacterAppearance;
  emote?: CharacterEmote;
  position: { x: number; y: number; z: number };
  rotationY: number;
  isMoving: boolean;
  isJumping: boolean;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  nickname: string;
  color: string;
  text: string;
  timestamp: number;
}

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  // Enable CORS for all incoming requests (Vercel frontend domain, local, etc.)
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  const players = new Map<string, PlayerData>();
  const chatHistory: ChatMessage[] = [];
  const MAX_CHAT_HISTORY = 50;

  // Add welcome system chat message
  chatHistory.push({
    id: 'sys-welcome',
    playerId: 'system',
    nickname: 'MetaWorld System',
    color: '#38bdf8',
    text: '메타월드 자연(Nature) 월드에 오신 것을 환영합니다! 다른 플레이어와 자유롭게 대화해보세요.',
    timestamp: Date.now(),
  });

  io.on('connection', (socket) => {
    // When a player joins with nickname and custom color & appearance
    socket.on('player:join', (data: { nickname?: string; color?: string; appearance?: CharacterAppearance }) => {
      const nickname = (data?.nickname || 'Traveler').slice(0, 16);
      const color = data?.appearance?.shirtColor || data?.color || '#3b82f6';

      // Spawn in a spacious open ring around the campfire (radius ~4.8 - 6.8 units)
      const angle = Math.random() * Math.PI * 2;
      const dist = 4.8 + Math.random() * 2.0;
      const initialPos = {
        x: Math.sin(angle) * dist,
        y: 0,
        z: Math.cos(angle) * dist,
      };

      const newPlayer: PlayerData = {
        id: socket.id,
        nickname,
        color,
        appearance: data?.appearance,
        emote: 'none',
        position: initialPos,
        rotationY: angle + Math.PI, // face towards campfire center
        isMoving: false,
        isJumping: false,
      };

      players.set(socket.id, newPlayer);

      // Send current world state to joining player
      socket.emit('init:world', {
        selfId: socket.id,
        players: Array.from(players.values()),
        chatHistory,
      });

      // Broadcast join to all other connected clients
      socket.broadcast.emit('player:joined', newPlayer);

      // Broadcast system announcement
      const joinMsg: ChatMessage = {
        id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        playerId: 'system',
        nickname: '시스템',
        color: '#10b981',
        text: `[${nickname}] 님이 월드에 입장하셨습니다.`,
        timestamp: Date.now(),
      };
      chatHistory.push(joinMsg);
      if (chatHistory.length > MAX_CHAT_HISTORY) chatHistory.shift();
      io.emit('chat:message', joinMsg);
    });

    // Appearance change event
    socket.on('player:appearance', (data: { appearance: CharacterAppearance }) => {
      const player = players.get(socket.id);
      if (!player) return;
      player.appearance = data?.appearance;
      if (data?.appearance?.shirtColor) {
        player.color = data.appearance.shirtColor;
      }
      io.emit('player:appearance_updated', {
        id: socket.id,
        appearance: player.appearance,
        color: player.color,
      });
    });

    // Emote animation event
    socket.on('player:emote', (data: { emote: CharacterEmote }) => {
      const player = players.get(socket.id);
      if (!player) return;
      player.emote = data?.emote || 'none';
      io.emit('player:emoted', {
        id: socket.id,
        emote: player.emote,
      });
    });

    // High frequency movement updates
    socket.on('player:move', (data: {
      position: { x: number; y: number; z: number };
      rotationY: number;
      isMoving: boolean;
      isJumping: boolean;
      emote?: CharacterEmote;
    }) => {
      const player = players.get(socket.id);
      if (!player) return;

      player.position = data.position;
      player.rotationY = data.rotationY;
      player.isMoving = !!data.isMoving;
      player.isJumping = !!data.isJumping;
      if (data.emote !== undefined) {
        player.emote = data.emote;
      }

      // Broadcast new position to others
      socket.broadcast.emit('player:moved', {
        id: socket.id,
        position: player.position,
        rotationY: player.rotationY,
        isMoving: player.isMoving,
        isJumping: player.isJumping,
        emote: player.emote,
      });
    });

    // Chat message event
    socket.on('chat:send', (data: { text: string }) => {
      const player = players.get(socket.id);
      if (!player) return;

      const cleanText = (data?.text || '').trim().slice(0, 150);
      if (!cleanText) return;

      const chatMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        playerId: socket.id,
        nickname: player.nickname,
        color: player.color,
        text: cleanText,
        timestamp: Date.now(),
      };

      chatHistory.push(chatMsg);
      if (chatHistory.length > MAX_CHAT_HISTORY) {
        chatHistory.shift();
      }

      io.emit('chat:message', chatMsg);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      const player = players.get(socket.id);
      if (player) {
        players.delete(socket.id);
        io.emit('player:left', { id: socket.id });

        const leaveMsg: ChatMessage = {
          id: `sys-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          playerId: 'system',
          nickname: '시스템',
          color: '#ef4444',
          text: `[${player.nickname}] 님이 퇴장하셨습니다.`,
          timestamp: Date.now(),
        };
        chatHistory.push(leaveMsg);
        if (chatHistory.length > MAX_CHAT_HISTORY) chatHistory.shift();
        io.emit('chat:message', leaveMsg);
      }
    });
  });

  // Health check endpoints for Render, Railway, and monitoring
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'Meta World Game Server',
      activePlayers: players.size,
      time: new Date().toISOString(),
    });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distPath) && fs.existsSync(path.resolve(distPath, 'index.html'));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (hasDist) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    // Standalone backend mode on Render/Railway
    app.get('/', (_req, res) => {
      res.json({
        service: 'Meta World Realtime Game Server',
        status: 'running',
        activePlayers: players.size,
        message: 'Socket.IO endpoint ready. Connect via WebSocket or polling.',
      });
    });
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`[MetaWorld] Server running on port ${port} (mode: ${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[MetaWorld] Fatal server initialization error:', err);
  process.exit(1);
});
