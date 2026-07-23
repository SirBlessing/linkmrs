import { Router } from 'express';
import { findOne, findAll, updateOne } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const EDITABLE = ['shopName', 'bio', 'location', 'currency', 'whatsappNumber', 'logo'];

// PATCH /api/shops/me  (protected – vendor updates their own profile)
router.patch('/me', requireAuth, (req, res) => {
  const shop = findOne('shops', (s) => s.userId === req.userId);
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

  const updated = updateOne('shops', (s) => s.id === shop.id, patch);
  res.json({ shop: updated });
});

// GET /api/shops/discover  (public – featured / popular / new shops for the Discover page)
router.get('/discover', (req, res) => {
  const allShops = findAll('shops');
  const allProducts = findAll('products');
  const allOrders = findAll('orders');

  // Only surface shops that have at least one product
  const shopsWithProducts = allShops.filter(
    (s) => allProducts.some((p) => p.shopId === s.id)
  );

  // Order count per shop (excluding cancelled)
  const orderCountByShop = {};
  allOrders
    .filter((o) => o.status !== 'cancelled')
    .forEach((o) => {
      orderCountByShop[o.shopId] = (orderCountByShop[o.shopId] || 0) + 1;
    });

  // Attach a sample of up to 3 product images for the card preview
  const enrich = (shop) => {
    const { userId, ...publicShop } = shop;
    const products = allProducts.filter((p) => p.shopId === shop.id);
    return {
      ...publicShop,
      orderCount: orderCountByShop[shop.id] || 0,
      productCount: products.length,
      previewImages: products.slice(0, 3).map((p) => p.image)
    };
  };

  const popular = [...shopsWithProducts]
    .sort((a, b) => (orderCountByShop[b.id] || 0) - (orderCountByShop[a.id] || 0))
    .slice(0, 8)
    .map(enrich);

  const newest = [...shopsWithProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(enrich);

  // Featured = top 4 by order count (could be curated manually in production)
  const featured = popular.slice(0, 4);

  res.json({ featured, popular, newest });
});

// GET /api/shops/:slug  (public – individual storefront)
router.get('/:slug', (req, res) => {
  const shop = findOne('shops', (s) => s.slug === req.params.slug);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const products = findAll('products', (p) => p.shopId === shop.id);

  const { userId, ...publicShop } = shop;
  res.json({ shop: publicShop, products });
});

export default router;