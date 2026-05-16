'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Editor from '@/components/Editor';
import { io, Socket } from 'socket.io-client';
import { Copy, LogOut, Trash2, Users, Home } from 'lucide-react';

interface RoomUser {
  userId: string;
  userName: string;
  socketId: string;
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  const [code, setCode] = useState('// Start coding here...');
  const [language, setLanguage] = useState('javascript');
  const [connected, setConnected] = useState(false);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomFull, setRoomFull] = useState(false);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const userNameRef = useRef('Anonymous');

  useEffect(() => {
    if (!roomId) return;

    fetch(`${SOCKET_URL}/api/rooms`)
      .then(r => r.json())
      .then(rooms => {
        const room = rooms.find((r: (r: {id: string; name: string; roomCode?: string; language: string})) => r.id === roomId);
        if (room) {
          setRoomCode(room.roomCode);
          setRoomName(room.name);
        }
      });

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-room', {
        roomId,
        userId: socket.id,
        userName: userNameRef.current,
      });
    });

    socket.on('room-full', () => {
      setRoomFull(true);
      setConnected(false);
    });

    socket.on('load-code', ({ code: c, language: l }) => {
      setCode(c || '// Start coding here...');
      setLanguage(l || 'javascript');
    });

    socket.on('code-update', ({ code: c }) => {
      setCode(c);
    });

    socket.on('language-update', ({ language: l }) => {
      setLanguage(l);
    });

    socket.on('room-users', (users: RoomUser[]) => {
      setRoomUsers(users);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.emit('leave-room', { roomId, userName: userNameRef.current });
      socket.disconnect();
    };
  }, [roomId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (socketRef.current?.connected) {
      socketRef.current.emit('code-change', { roomId, code: newCode });
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (socketRef.current?.connected) {
      socketRef.current.emit('language-change', { roomId, language: newLang });
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this room? Everyone will be disconnected.')) return;
    await fetch(`${SOCKET_URL}/api/rooms/${roomId}`, { method: 'DELETE' });
    router.push('/');
  };

  const handleLeave = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userName: userNameRef.current });
    }
    router.push('/');
  };

  if (roomFull) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center bg-gray-900 border border-gray-800 rounded-2xl p-10">
          <p className="text-2xl font-bold text-white mb-2">Room is Full!</p>
          <p className="text-gray-400 mb-6">This room already has 3 users.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-950 flex flex-col">
      {/* Navbar */}
      <div className="border-b border-gray-800 bg-gray-950 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLeave}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <span className="text-gray-700">|</span>
          <span className="text-white font-semibold text-sm">{roomName || 'CollabCode'}</span>

          {/* Language selector */}
          <select
            value={language}
            onChange={handleLanguageChange}
            className="bg-gray-800 border border-gray-700 text-blue-400 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value} className="bg-gray-800">
                {lang.label}
              </option>
            ))}
          </select>

          <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {connected ? '● Live' : '● Connecting...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-400 text-xs">{roomUsers.length}/3</span>
            <div className="flex -space-x-1.5">
              {roomUsers.map((u, i) => (
                <div
                  key={i}
                  title={u.userName}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-gray-950"
                  style={{ background: ['#3B82F6', '#10B981', '#F59E0B'][i] }}
                >
                  {u.userName[0].toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <span className="text-gray-700">|</span>

          {roomCode && (
            <button
              onClick={copyRoomCode}
              className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-mono px-2.5 py-1 rounded-lg border border-gray-700 transition-colors"
            >
              <Copy className="h-3 w-3" />
              {copied ? '✓ Copied!' : `Code: ${roomCode}`}
            </button>
          )}

          <button
            onClick={copyRoomLink}
            className="text-gray-400 hover:text-white text-xs px-2.5 py-1 rounded-lg border border-gray-700 hover:bg-gray-800 transition-colors"
          >
            Copy Link
          </button>

          <span className="text-gray-700">|</span>

          <button
            onClick={handleLeave}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-xs transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Leave
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-red-400 hover:text-red-300 text-xs transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Share banner */}
      {roomCode && (
        <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-1.5 flex items-center justify-between">
          <p className="text-blue-400 text-xs">
            Share code <span className="font-mono font-bold">{roomCode}</span> or invite link to collaborate
          </p>
          <button
            onClick={copyRoomLink}
            className="text-blue-400 hover:text-blue-300 text-xs underline"
          >
            Copy invite link
          </button>
        </div>
      )}

      {/* Editor */}
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