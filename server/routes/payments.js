import { Router } from 'express';
import https from 'https';
import Shop from '../models/Shop.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PREMIUM_PRODUCT_LIMIT = 40;
const PLAN_DURATION_DAYS    = 30;

// Helper — call Paystack verify endpoint
function paystackVerify(reference) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      path:     `/transaction/verify/${encodeURIComponent(reference)}`,
      method:   'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// GET /api/payments/plans  (public — return plan details + pricing)
router.get('/plans', (_req, res) => {
  res.json({
    free: {
      name:         'Free',
      price:        0,
      currency:     '₦',
      productLimit: 10,
      features: [
        'Single Linkmrs storefront link',
        'Up to 10 products',
        'WhatsApp checkout',
        'Order management',
        'Basic analytics',
        'Listed on Discover',
      ],
    },
    premium: {
      name:         'Premium',
      price:        5000,       // ₦5,000 — change this to whatever you want
      currency:     '₦',
      productLimit: PREMIUM_PRODUCT_LIMIT,
      durationDays: PLAN_DURATION_DAYS,
      features: [
        'Everything in Free',
        'Up to 40 products',
        'Priority listing on Discover',
        'Premium badge on storefront',
        'Full analytics suite',
        'Priority support',
      ],
    },
  });
});

// POST /api/payments/verify  (protected — verify Paystack payment + upgrade shop)
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { reference } = req.body || {};
    if (!reference)
      return res.status(400).json({ error: 'Payment reference is required.' });

    // Verify with Paystack
    const paystackRes = await paystackVerify(reference);

    if (!paystackRes.status || paystackRes.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful. Please try again.' });
    }

    // Find the vendor's shop
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    // Calculate expiry — if already premium and not expired, extend from current expiry
    const now        = new Date();
    const currentExp = shop.planExpiresAt && new Date(shop.planExpiresAt) > now
      ? new Date(shop.planExpiresAt)
      : now;

    const planExpiresAt = new Date(currentExp);
    planExpiresAt.setDate(planExpiresAt.getDate() + PLAN_DURATION_DAYS);

    const updated = await Shop.findByIdAndUpdate(
      shop._id,
      {
        plan:         'premium',
        planExpiresAt,
        productLimit: PREMIUM_PRODUCT_LIMIT,
      },
      { new: true }
    );

    res.json({
      message: `Shop upgraded to Premium until ${planExpiresAt.toDateString()}.`,
      shop:    updated,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

// GET /api/payments/status  (protected — check current plan status)
router.get('/status', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const now       = new Date();
    const isPremium = shop.plan === 'premium' && shop.planExpiresAt && new Date(shop.planExpiresAt) > now;

    // Auto-downgrade if premium has expired
    if (shop.plan === 'premium' && !isPremium) {
      await Shop.findByIdAndUpdate(shop._id, {
        plan:        'free',
        productLimit: 10,
      });
    }

    res.json({
      plan:          isPremium ? 'premium' : 'free',
      productLimit:  isPremium ? PREMIUM_PRODUCT_LIMIT : 10,
      isPremium,
      planExpiresAt: shop.planExpiresAt,
      daysRemaining: isPremium
        ? Math.ceil((new Date(shop.planExpiresAt) - now) / (1000 * 60 * 60 * 24))
        : 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;