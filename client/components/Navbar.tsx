'use client';

import { UserButton } from '@clerk/nextjs';
import { Code2 } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="border-b border-gray-800 bg-gray-950 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-blue-500" />
          <span className="text-white font-bold text-lg">CollabCode</span>
        </Link>
        <UserButton />
      </div>
    </nav>
  );
}