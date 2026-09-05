import { Router } from 'express';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

function validate(body) {
  const errors = {};
  if (!body.name?.trim())                                     errors.name        = 'Product name is required.';
  if (!body.price || isNaN(+body.price) || +body.price <= 0) errors.price       = 'Price must be greater than 0.';
  if (!body.description?.trim())                              errors.description = 'Description is required.';
  return errors;
}

router.use(requireAuth);

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 });

    // Check if premium has expired and downgrade if needed
    const now = new Date();
    const isPremium = shop.plan === 'premium' && shop.planExpiresAt && new Date(shop.planExpiresAt) > now;
    const limit = isPremium ? shop.productLimit : 10;

    res.json({ products, count: products.length, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    // Respect plan product limit
    const now       = new Date();
    const isPremium = shop.plan === 'premium' && shop.planExpiresAt && new Date(shop.planExpiresAt) > now;
    const limit     = isPremium ? (shop.productLimit || 40) : 10;

    const count = await Product.countDocuments({ shopId: shop._id });
    if (count >= limit) {
      const upgradeMsg = isPremium
        ? `You've reached the ${limit}-product limit.`
        : `You've reached the 10-product Free plan limit. Upgrade to Premium for up to 40 products.`;
      return res.status(403).json({ error: upgradeMsg, showUpgrade: !isPremium });
    }

    const errors = validate(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const product = await Product.create({
      shopId:      shop._id,
      name:        req.body.name.trim(),
      price:       Number(req.body.price),
      description: req.body.description.trim(),
      image:       req.body.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${Date.now()}`,
    });

    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const existing = await Product.findOne({ _id: req.params.id, shopId: shop._id });
    if (!existing) return res.status(404).json({ error: 'Product not found.' });

    const errors = validate(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ errors });

    const product = await Product.findByIdAndUpdate(
      existing._id,
      {
        name:        req.body.name.trim(),
        price:       Number(req.body.price),
        description: req.body.description.trim(),
        image:       req.body.image || existing.image,
      },
      { new: true }
    );

    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const deleted = await Product.findOneAndDelete({ _id: req.params.id, shopId: shop._id });
    if (!deleted) return res.status(404).json({ error: 'Product not found.' });

    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;