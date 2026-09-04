import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Shop from '../models/Shop.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { uniqueSlug } from '../utils/slug.js';

const router = Router();

function safeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

const defaultLogo = (slug) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(slug)}`;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { shopName, email, password, whatsappNumber } = req.body || {};

    if (!shopName?.trim())
      return res.status(400).json({ error: 'Shop name is required.' });
    if (!email || !/^\S+@\S+\.\S+$/.test(email))
      return res.status(400).json({ error: 'A valid email is required.' });
    if (!password || password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await User.create({ email: email.trim().toLowerCase(), passwordHash });

    const slug = await uniqueSlug(shopName);
    const shop = await Shop.create({
      userId:         user._id,
      slug,
      shopName:       shopName.trim(),
      bio:            'Welcome to my shop!',
      location:       '',
      currency:       '$',
      whatsappNumber: (whatsappNumber || '').replace(/[^0-9]/g, ''),
      logo:           defaultLogo(slug),
    });

    const token = signToken({ sub: user._id });
    res.status(201).json({ token, user: safeUser(user), shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash))
      return res.status(401).json({ error: 'Incorrect email or password.' });

    const shop = await Shop.findOne({ userId: user._id });
    const token = signToken({ sub: user._id });
    res.json({ token, user: safeUser(user), shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const shop = await Shop.findOne({ userId: user._id });
    res.json({ user: safeUser(user), shop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;