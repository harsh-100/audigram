import express from 'express';
import multer from 'multer';
import path from 'path';
import { auth, optionalAuth } from '../middlewares/auth';
import { prisma } from '../server';

const router = express.Router();

// Configure multer for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP3 and WAV files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Upload audio
router.post('/', auth, upload.single('audio'), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audio = await prisma.audio.create({
      data: {
        title,
        description,
        filePath: file.path,
        tags: JSON.stringify(tags.split(',')),
        userId: req.user!.id
      }
    });

    res.status(201).json(audio);
  } catch (error) {
    res.status(500).json({ error: 'Error uploading audio' });
  }
});

// Get random audios for feed
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.id; // Will be undefined for non-authenticated users
    
    const audios = await prisma.audio.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        likes: userId ? {
          where: {
            userId: userId
          },
          select: {
            userId: true
          }
        } : false,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });

    res.json(audios);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching feed' });
  }
});

// Like/Unlike audio
router.post('/:id/like', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_audioId: {
          userId,
          audioId: id
        }
      }
    });

    if (existingLike) {
      await prisma.like.delete({
        where: {
          userId_audioId: {
            userId,
            audioId: id
          }
        }
      });
      res.json({ liked: false });
    } else {
      await prisma.like.create({
        data: {
          userId,
          audioId: id
        }
      });
      res.json({ liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error processing like' });
  }
});

// Add comment
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: req.user!.id,
        audioId: id
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
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Get audio comments
router.get('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;

    const comments = await prisma.comment.findMany({
      where: {
        audioId: id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

export default router; 