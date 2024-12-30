import express from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../server';

const router = express.Router();

// Get user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        _count: {
          select: {
            audios: true,
            followers: true,
            following: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { bio, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        bio,
        avatar
      },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error updating profile' });
  }
});

// Follow/Unfollow user
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    if (id === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: id
        }
      }
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: id
          }
        }
      });
      res.json({ following: false });
    } else {
      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: id
        }
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing follow request' });
  }
});

// Get user's audios
router.get('/:username/audios', async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const audios = await prisma.audio.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(audios);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user audios' });
  }
});

export default router; 