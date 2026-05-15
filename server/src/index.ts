import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors({ origin: '*' }));
app.use(express.json());

const roomUsers: Record<string, { userId: string; userName: string; socketId: string }[]> = {};

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.get('/', (req, res) => {
  res.json({ status: 'Server is running ✅' });
});

app.get('/api/rooms', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

app.get('/api/rooms/code/:roomCode', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    const room = await prisma.room.findUnique({
      where: { roomCode: req.params.roomCode.toUpperCase() },
    });
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    const { name, description, language, clerkId, userName, userEmail, userAvatar } = req.body;
let user = await prisma.user.upsert({
  where: { clerkId },
  update: {
    name: userName || 'Anonymous',
    email: userEmail || `${clerkId}@temp.com`,
    avatar: userAvatar || '',
  },
  create: {
    clerkId,
    name: userName || 'Anonymous',
    email: userEmail || `${clerkId}@temp.com`,
    avatar: userAvatar || '',
  },
});

    let roomCode = generateRoomCode();
    let exists = await prisma.room.findUnique({ where: { roomCode } });
    while (exists) {
      roomCode = generateRoomCode();
      exists = await prisma.room.findUnique({ where: { roomCode } });
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        language: language || 'javascript',
        roomCode,
        maxUsers: 3,
        users: { create: { userId: user.id } },
      },
    });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

app.delete('/api/rooms/:roomId', async (req, res) => {
  try {
    const { prisma } = await import('./lib/prisma');
    await prisma.room.update({
      where: { id: req.params.roomId },
      data: { isActive: false },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('join-room', async ({ roomId, userId, userName }) => {
    const currentUsers = roomUsers[roomId] || [];
    if (currentUsers.length >= 3) {
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];
    roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
    roomUsers[roomId].push({ userId, userName, socketId: socket.id });

    console.log(`${userName} joined room ${roomId}`);

    try {
      const { prisma } = await import('./lib/prisma');
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (room) {
        socket.emit('load-code', { code: room.code, language: room.language });
      }
    } catch (err) {
      console.error(err);
    }

    io.to(roomId).emit('room-users', roomUsers[roomId]);
    socket.to(roomId).emit('user-joined', { userId, userName, socketId: socket.id });
  });

  socket.on('code-change', async ({ roomId, code }) => {
    socket.to(roomId).emit('code-update', { code });
    try {
      const { prisma } = await import('./lib/prisma');
      await prisma.room.update({
        where: { id: roomId },
        data: { code },
      });
    } catch (err) {
      console.error(err);
    }
  });
  socket.on('language-change', async ({ roomId, language }) => {
    socket.to(roomId).emit('language-update', { language });
    try {
      const { prisma } = await import('./lib/prisma');
      await prisma.room.update({
        where: { id: roomId },
        data: { language },
      });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('leave-room', ({ roomId, userName }) => {
    socket.leave(roomId);
    if (roomUsers[roomId]) {
      roomUsers[roomId] = roomUsers[roomId].filter(u => u.socketId !== socket.id);
      io.to(roomId).emit('room-users', roomUsers[roomId]);
    }
    socket.to(roomId).emit('user-left', { userName, socketId: socket.id });
  });

  socket.on('disconnect', () => {
    Object.keys(roomUsers).forEach(roomId => {
      const before = roomUsers[roomId]?.length;
      roomUsers[roomId] = roomUsers[roomId]?.filter(u => u.socketId !== socket.id) || [];
      if (roomUsers[roomId].length !== before) {
        io.to(roomId).emit('room-users', roomUsers[roomId]);
      }
    });
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});