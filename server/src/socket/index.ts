import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

interface JoinRoomPayload {
  roomId: string;
  userId: string;
  userName: string;
}

interface CodeChangePayload {
  roomId: string;
  code: string;
}

interface ChatMessagePayload {
  roomId: string;
  message: string;
  userName: string;
  userId: string;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // Join a room
    socket.on('join-room', async ({ roomId, userId, userName }: JoinRoomPayload) => {
      socket.join(roomId);
      console.log(`${userName} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('user-joined', { userId, userName, socketId: socket.id });

      // Send current room code to the new user
      try {
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (room) {
          socket.emit('load-code', { code: room.code, language: room.language });
        }
      } catch (err) {
        console.error('Error loading room:', err);
      }
    });

    // Code change — broadcast to everyone else in the room
    socket.on('code-change', ({ roomId, code }: CodeChangePayload) => {
      socket.to(roomId).emit('code-update', { code });
    });

    // Save code to database periodically
    socket.on('save-code', async ({ roomId, code }: CodeChangePayload) => {
      try {
        await prisma.room.update({
          where: { id: roomId },
          data: { code },
        });
      } catch (err) {
        console.error('Error saving code:', err);
      }
    });

    // Chat message
    socket.on('chat-message', ({ roomId, message, userName, userId }: ChatMessagePayload) => {
      io.to(roomId).emit('receive-message', {
        message,
        userName,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Leave room
    socket.on('leave-room', ({ roomId, userName }: { roomId: string; userName: string }) => {
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userName, socketId: socket.id });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};