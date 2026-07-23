import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findOne, insert, genId } from '../utils/db.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { uniqueSlug } from '../utils/slug.js';

const router = Router();

function safeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

const DEFAULT_LOGO = (slug) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(slug)}`;

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { shopName, email, password, whatsappNumber } = req.body || {};

  if (!shopName?.trim())
    return res.status(400).json({ error: 'Shop name is required.' });
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    return res.status(400).json({ error: 'A valid email is required.' });
  if (!password || password.length < 6)
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const normalizedEmail = email.trim().toLowerCase();

  if (findOne('users', (u) => u.email === normalizedEmail))
    return res.status(409).json({ error: 'An account with this email already exists.' });

  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id: genId('user'),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date().toISOString()
  };
  insert('users', user);

  const slug = uniqueSlug(shopName);
  const shop = {
    id: genId('shop'),
    userId: user.id,
    slug,
    shopName: shopName.trim(),
    bio: 'Welcome to my shop!',
    location: '',
    currency: '$',
    whatsappNumber: (whatsappNumber || '').replace(/[^0-9]/g, ''),
    logo: DEFAULT_LOGO(slug),
    rating: 0,
    reviewCount: 0,
    createdAt: new Date().toISOString()
  };
  insert('shops', shop);

  const token = signToken({ sub: user.id });
  res.status(201).json({ token, user: safeUser(user), shop });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required.' });

  const normalizedEmail = email.trim().toLowerCase();
  const user = findOne('users', (u) => u.email === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.passwordHash))
    return res.status(401).json({ error: 'Incorrect email or password.' });

  const shop = findOne('shops', (s) => s.userId === user.id);
  const token = signToken({ sub: user.id });
  res.json({ token, user: safeUser(user), shop });
});

// GET /api/auth/me  (protected)
router.get('/me', requireAuth, (req, res) => {
  const user = findOne('users', (u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const shop = findOne('shops', (s) => s.userId === user.id);
  res.json({ user: safeUser(user), shop });
});

export default router;