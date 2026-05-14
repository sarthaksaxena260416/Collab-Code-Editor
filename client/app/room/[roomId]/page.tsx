'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Editor from '@/components/Editor';
import { io, Socket } from 'socket.io-client';

export default function RoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!roomId) return;

    console.log('✅ roomId found:', roomId);

    const socket = io('http://localhost:4000');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join-room', {
        roomId,
        userId: socket.id,
        userName: `User_${Math.floor(Math.random() * 1000)}`,
      });
    });

    socket.on('load-code', ({ code: c, language: l }) => {
      setCode(c || '// Start coding here...');
      setLanguage(l || 'javascript');
    });

    socket.on('code-update', ({ code: c }) => {
      console.log('🔄 Code update received!');
      setCode(c);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socketRef.current?.connected) {
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
  };

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      <div className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <span className="text-white font-semibold">CollabCode</span>
        <span className="text-gray-500">|</span>
        <span className="text-gray-400 text-sm">Room: {roomId?.slice(0, 8)}...</span>
        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
          {language}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {connected ? '● Live' : '● Connecting...'}
        </span>
      </div>
      <div className="flex-1">
        <Editor
          code={code}
          language={language}
          onChange={handleCodeChange}
        />
      </div>
    </div>
  );
}