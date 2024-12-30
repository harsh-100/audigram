import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: login },
          { username: login }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error logging in' });
  }
});

export default router; 