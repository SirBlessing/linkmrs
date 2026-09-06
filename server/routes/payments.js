import { Router } from 'express';
import https from 'https';
import Shop from '../models/Shop.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const PREMIUM_PRICE         = 2000;  // ₦2,000
const PREMIUM_PRODUCT_LIMIT = 40;
const PLAN_DURATION_DAYS    = 30;

function paystackVerify(reference) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      path:     `/transaction/verify/${encodeURIComponent(reference)}`,
      method:   'GET',
      headers:  { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
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

// GET /api/payments/plans  (public)
router.get('/plans', (_req, res) => {
  res.json({
    free: {
      name: 'Free', price: 0, currency: '₦',
      productLimit: 5,
      features: [
        'Up to 5 products',
        'Single Linkmrs storefront link',
        'WhatsApp checkout',
        'Order management',
        'Basic analytics',
      ],
    },
    premium: {
      name: 'Premium', price: PREMIUM_PRICE, currency: '₦',
      productLimit: PREMIUM_PRODUCT_LIMIT,
      durationDays: PLAN_DURATION_DAYS,
      features: [
        'Up to 40 products',
        'Everything in Free',
        'Priority listing on Discover',
        'Premium badge on storefront',
        'Full analytics',
        'Priority support',
      ],
    },
  });
});

// POST /api/payments/verify  (protected)
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { reference } = req.body || {};
    if (!reference) return res.status(400).json({ error: 'Payment reference is required.' });

    const paystackRes = await paystackVerify(reference);
    if (!paystackRes.status || paystackRes.data?.status !== 'success') {
      return res.status(400).json({ error: 'Payment not successful. Please try again.' });
    }

    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const now        = new Date();
    const currentExp = shop.planExpiresAt && new Date(shop.planExpiresAt) > now
      ? new Date(shop.planExpiresAt) : now;

    const planExpiresAt = new Date(currentExp);
    planExpiresAt.setDate(planExpiresAt.getDate() + PLAN_DURATION_DAYS);

    const updated = await Shop.findByIdAndUpdate(
      shop._id,
      { plan: 'premium', planExpiresAt, productLimit: PREMIUM_PRODUCT_LIMIT },
      { new: true }
    );

    res.json({
      message: `Shop upgraded to Premium until ${planExpiresAt.toDateString()}.`,
      shop: updated,
    });
  } catch (err) {
    console.error('Payment verify error:', err);
    res.status(500).json({ error: 'Server error verifying payment.' });
  }
});

// GET /api/payments/status  (protected)
router.get('/status', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const now       = new Date();
    const isPremium = shop.plan === 'premium' &&
                      shop.planExpiresAt &&
                      new Date(shop.planExpiresAt) > now;

    if (shop.plan === 'premium' && !isPremium) {
      await Shop.findByIdAndUpdate(shop._id, { plan: 'free', productLimit: 5 });
    }

    res.json({
      plan:          isPremium ? 'premium' : 'free',
      productLimit:  isPremium ? PREMIUM_PRODUCT_LIMIT : 5,
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