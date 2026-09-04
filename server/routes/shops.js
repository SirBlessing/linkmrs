import { Router } from 'express';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const EDITABLE = ['shopName', 'bio', 'location', 'currency', 'whatsappNumber', 'logo'];

// PATCH /api/shops/me  (vendor updates their own profile)
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const patch = {};
    for (const field of EDITABLE) {
      if (req.body && Object.prototype.hasOwnProperty.call(req.body, field)) {
        let value = req.body[field];
        if (field === 'whatsappNumber') value = String(value || '').replace(/[^0-9]/g, '');
        if (field === 'shopName' && !String(value || '').trim())
          return res.status(400).json({ error: 'Shop name cannot be empty.' });
        if (field === 'currency' && !String(value || '').trim()) value = '$';
        patch[field] = value;
      }
    }

    const updated = await Shop.findByIdAndUpdate(shop._id, patch, { new: true });
    res.json({ shop: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/shops/discover  (public — featured / popular / newest)
router.get('/discover', async (req, res) => {
  try {
    const allProducts = await Product.find({}, 'shopId');
    const shopIdsWithProducts = [...new Set(allProducts.map((p) => String(p.shopId)))];

    const shopsWithProducts = await Shop.find({
      _id: { $in: shopIdsWithProducts },
    }).lean();

    // Count non-cancelled orders per shop
    const orders = await Order.find({ status: { $ne: 'cancelled' } }, 'shopId');
    const orderCount = {};
    orders.forEach((o) => {
      const id = String(o.shopId);
      orderCount[id] = (orderCount[id] || 0) + 1;
    });

    // Count products per shop
    const productCount = {};
    allProducts.forEach((p) => {
      const id = String(p.shopId);
      productCount[id] = (productCount[id] || 0) + 1;
    });

    // Grab up to 3 product images per shop for preview
    const allProductsWithImages = await Product.find(
      { shopId: { $in: shopIdsWithProducts } },
      'shopId image'
    ).lean();
    const previewImages = {};
    allProductsWithImages.forEach((p) => {
      const id = String(p.shopId);
      if (!previewImages[id]) previewImages[id] = [];
      if (previewImages[id].length < 3) previewImages[id].push(p.image);
    });

    const enrich = (shop) => ({
      ...shop,
      id: shop._id,
      orderCount:    orderCount[String(shop._id)]  || 0,
      productCount:  productCount[String(shop._id)] || 0,
      previewImages: previewImages[String(shop._id)] || [],
    });

    const byOrders = [...shopsWithProducts].sort(
      (a, b) => (orderCount[String(b._id)] || 0) - (orderCount[String(a._id)] || 0)
    );
    const byNewest = [...shopsWithProducts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json({
      featured: byOrders.slice(0, 4).map(enrich),
      popular:  byOrders.slice(0, 8).map(enrich),
      newest:   byNewest.slice(0, 8).map(enrich),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/shops/:slug  (public storefront)
router.get('/:slug', async (req, res) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug }).lean();
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const products = await Product.find({ shopId: shop._id }).sort({ createdAt: -1 }).lean();

    // Remove internal userId from public response
    const { userId, ...publicShop } = shop;
    res.json({ shop: publicShop, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;