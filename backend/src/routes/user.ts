import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Get user profile by username
router.get('/:username', async (req, res) => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                avatar: true,
                bio: true,
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
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Error fetching user data' });
    }
});

// Get user's audios
router.get('/:username/audios', async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

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
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        res.json(audios);
    } catch (error) {
        console.error('Error fetching user audios:', error);
        res.status(500).json({ error: 'Error fetching user audios' });
    }
});

// Follow/Unfollow user
router.post('/:username/follow', auth, async (req, res) => {
    try {
        const { username } = req.params;
        const followerId = req.user!.id;

        const userToFollow = await prisma.user.findUnique({
            where: { username }
        });

        if (!userToFollow) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (userToFollow.id === followerId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId: userToFollow.id
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId: userToFollow.id
                    }
                }
            });
            res.json({ following: false });
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId,
                    followingId: userToFollow.id
                }
            });
            res.json({ following: true });
        }
    } catch (error) {
        console.error('Error following/unfollowing user:', error);
        res.status(500).json({ error: 'Error following/unfollowing user' });
    }
});

export default router; 