'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

export default function JoinRoomInput() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`http://localhost:4000/api/rooms/code/${code.toUpperCase()}`);
      const room = await res.json();
      if (room.id) {
        router.push(`/room/${room.id}`);
      } else {
        setError('Room not found. Check the code and try again.');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mt-4">
      <p className="text-sm text-gray-400 mb-3">Have a room code? Join directly:</p>
      <div className="flex gap-2">
        <Input
          placeholder="Enter 6-digit code e.g. ABC123"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={6}
          className="bg-gray-800 border-gray-600 text-white font-mono uppercase"
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <Button
          onClick={handleJoin}
          disabled={loading || code.length < 6}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <LogIn className="h-4 w-4 mr-2" />
          {loading ? 'Joining...' : 'Join'}
        </Button>
      </div>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}