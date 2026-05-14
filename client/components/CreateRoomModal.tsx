'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { LANGUAGES } from '@/types';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function CreateRoomModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${SOCKET_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          language,
          clerkId: `guest_${Math.random().toString(36).substring(2, 9)}`,
          userName: 'Guest',
          userEmail: `guest_${Date.now()}@temp.com`,
          userAvatar: '',
        }),
      });
      const room = await res.json();
      if (room.id) {
        setOpen(false);
        router.push(`/room/${room.id}`);
      } else {
        console.error('Room creation failed:', room);
      }
    } catch (err) {
      console.error('Failed to create room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new room</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Room name *</label>
            <Input
              placeholder="e.g. Interview Practice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description (optional)</label>
            <Input
              placeholder="What is this room for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {LANGUAGES.map((lang) => (
                  <SelectItem
                    key={lang.value}
                    value={lang.value}
                    className="text-white hover:bg-gray-700"
                  >
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !name.trim()}
            className="bg-blue-600 hover:bg-blue-700 w-full"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}