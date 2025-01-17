import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { auth } from '../middlewares/auth';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for audio uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only audio files are allowed.'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get audio feed
router.get('/feed', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const audios = await prisma.audio.findMany({
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
        console.error('Error fetching audio feed:', error);
        res.status(500).json({ error: 'Error fetching audio feed' });
    }
});

// Upload audio
router.post('/', auth, upload.single('audio'), async (req, res) => {
    try {
        const { title, description, tags } = req.body;
        const audioFile = req.file;

        if (!audioFile) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        const audio = await prisma.audio.create({
            data: {
                title,
                description,
                filePath: audioFile.path,
                tags: tags || '[]',
                userId: req.user!.id
            },
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
            }
        });

        res.status(201).json(audio);
    } catch (error) {
        console.error('Error uploading audio:', error);
        res.status(500).json({ error: 'Error uploading audio' });
    }
});

// Get single audio
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const audio = await prisma.audio.findUnique({
            where: { id },
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
            }
        });

        if (!audio) {
            return res.status(404).json({ error: 'Audio not found' });
        }

        res.json(audio);
    } catch (error) {
        console.error('Error fetching audio:', error);
        res.status(500).json({ error: 'Error fetching audio' });
    }
});

// Get comments for an audio
router.get('/:audioId/comments', async (req, res) => {
    try {
        const { audioId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { audioId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Error fetching comments' });
    }
});

// Add a comment
router.post('/:audioId/comment', auth, async (req, res) => {
    try {
        const { audioId } = req.params;
        const { content } = req.body;

        if (!content?.trim()) {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                userId: req.user!.id,
                audioId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true
                    }
                }
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Error creating comment' });
    }
});

// Like/Unlike audio
router.post('/:audioId/like', auth, async (req, res) => {
    try {
        const { audioId } = req.params;
        const userId = req.user!.id;

        const existingLike = await prisma.like.findUnique({
            where: {
                userId_audioId: {
                    userId,
                    audioId
                }
            }
        });

        if (existingLike) {
            // Unlike
            await prisma.like.delete({
                where: {
                    userId_audioId: {
                        userId,
                        audioId
                    }
                }
            });

            res.json({ liked: false });
        } else {
            // Like
            await prisma.like.create({
                data: {
                    userId,
                    audioId
                }
            });

            res.json({ liked: true });
        }
    } catch (error) {
        console.error('Error processing like:', error);
        res.status(500).json({ error: 'Error processing like' });
    }
});

// Check if user has liked an audio
router.get('/:audioId/liked', auth, async (req, res) => {
    try {
        const { audioId } = req.params;
        const userId = req.user!.id;

        const like = await prisma.like.findUnique({
            where: {
                userId_audioId: {
                    userId,
                    audioId
                }
            }
        });

        res.json({ liked: !!like });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ error: 'Error checking like status' });
    }
});

// Get like count
router.get('/:audioId/likes', async (req, res) => {
    try {
        const { audioId } = req.params;

        const count = await prisma.like.count({
            where: { audioId }
        });

        res.json({ count });
    } catch (error) {
        console.error('Error getting like count:', error);
        res.status(500).json({ error: 'Error getting like count' });
    }
});

// Get comment count
router.get('/:audioId/comments/count', async (req, res) => {
    try {
        const { audioId } = req.params;

        const count = await prisma.comment.count({
            where: { audioId }
        });

        res.json({ count });
    } catch (error) {
        console.error('Error getting comment count:', error);
        res.status(500).json({ error: 'Error getting comment count' });
    }
});

export default router; 