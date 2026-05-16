import Navbar from '@/components/Navbar';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomInput from '@/components/JoinRoomInput';
import { Users, Code2, Clock } from 'lucide-react';
import Link from 'next/link';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

async function getRooms() {
  try {
    const res = await fetch(`${SOCKET_URL}/api/rooms`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const rooms = await getRooms();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Active Rooms</h1>
            <p className="text-gray-400 mt-1">Join a room or create your own</p>
          </div>
          <CreateRoomModal />
        </div>

        <JoinRoomInput />

        <div className="mt-8">
          {rooms.length === 0 ? (
            <div className="text-center py-20">
              <Code2 className="h-16 w-16 text-gray-700 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-400">No rooms yet</h2>
              <p className="text-gray-600 mt-2">Create the first room and start coding!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room: {id: string; name: string; description?: string; language: string; roomCode?: string; createdAt: string; _count?: {users: number}}) => (
                <Link key={room.id} href={`/room/${room.id}`}>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-500 hover:bg-gray-800 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {room.name}
                      </h3>
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                        {room.language}
                      </span>
                    </div>
                    {room.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{room.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {room._count?.users || 0}/3
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(room.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {room.roomCode && (
                        <span className="text-xs font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded border border-gray-700">
                          {room.roomCode}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}