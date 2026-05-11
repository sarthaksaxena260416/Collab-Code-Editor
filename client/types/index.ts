export interface User {
  id: string;
  clerkId: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  language: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: RoomUser[];
  _count?: {
    users: number;
  };
}

export interface RoomUser {
  id: string;
  userId: string;
  roomId: string;
  joinedAt: string;
  user: User;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  userId: string;
  roomId: string;
  user: User;
}

export interface SocketUser {
  userId: string;
  userName: string;
  socketId: string;
  color: string;
}

export interface ChatMessage {
  message: string;
  userName: string;
  userId: string;
  timestamp: string;
}

export const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
];

export const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9',
];