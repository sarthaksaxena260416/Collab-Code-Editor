import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
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

router.post('/', async (req, res) => {
  try {
    const { name, description, language, clerkId, userName, userEmail, userAvatar } = req.body;

    let user = await prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId,
          name: userName || 'Anonymous',
          email: userEmail || `${clerkId}@temp.com`,
          avatar: userAvatar || '',
        },
      });
    }

    const room = await prisma.room.create({
      data: {
        name,
        description,
        language: language || 'javascript',
        users: { create: { userId: user.id } },
      },
    });
    res.json(room);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

export default router;