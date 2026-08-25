import type { Metadata } from 'next';
import AuthProvider from '@/components/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'CollabCode — Real-Time Collaborative Editor',
  description: 'Code together in real-time',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
