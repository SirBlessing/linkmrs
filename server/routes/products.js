import { Router } from 'express';
import { findOne, findAll, insert, updateOne, deleteOne, genId } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const MAX_PRODUCTS = 10;

function shopForUser(userId) {
  return findOne('shops', (s) => s.userId === userId);
}

function validate(body) {
  const errors = {};
  if (!body.name?.trim()) errors.name = 'Product name is required.';
  const price = Number(body.price);
  if (!body.price || Number.isNaN(price) || price <= 0)
    errors.price = 'Price must be greater than 0.';
  if (!body.description?.trim()) errors.description = 'Description is required.';
  return errors;
}

// All product routes require auth
router.use(requireAuth);

// GET /api/products
router.get('/', (req, res) => {
  const shop = shopForUser(req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const products = findAll('products', (p) => p.shopId === shop.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json({ products, count: products.length, limit: MAX_PRODUCTS });
});

// POST /api/products
router.post('/', (req, res) => {
  const shop = shopForUser(req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const existing = findAll('products', (p) => p.shopId === shop.id);
  if (existing.length >= MAX_PRODUCTS) {
    return res.status(403).json({
      error: `You've reached the ${MAX_PRODUCTS}-product limit on the Free plan.`
    });
  }

  const errors = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const product = {
    id: genId('prod'),
    shopId: shop.id,
    name: req.body.name.trim(),
    price: Number(req.body.price),
    description: req.body.description.trim(),
    image:
      req.body.image ||
      `https://api.dicebear.com/7.x/shapes/svg?seed=${genId('img')}`,
    createdAt: new Date().toISOString()
  };

  insert('products', product);
  res.status(201).json({ product });
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  const shop = shopForUser(req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const existing = findOne(
    'products',
    (p) => p.id === req.params.id && p.shopId === shop.id
  );
  if (!existing) return res.status(404).json({ error: 'Product not found.' });

  const errors = validate(req.body || {});
  if (Object.keys(errors).length) return res.status(400).json({ errors });

  const updated = updateOne('products', (p) => p.id === existing.id, {
    name: req.body.name.trim(),
    price: Number(req.body.price),
    description: req.body.description.trim(),
    image: req.body.image || existing.image
  });

  res.json({ product: updated });
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  const shop = shopForUser(req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const deleted = deleteOne(
    'products',
    (p) => p.id === req.params.id && p.shopId === shop.id
  );
  if (!deleted) return res.status(404).json({ error: 'Product not found.' });

  res.status(204).end();
});

export default router;