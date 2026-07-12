import { Router } from 'express';
import { findOne, findAll, insert, updateOne, genId } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const VALID_STATUSES = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];

// POST /api/orders  (public – customer places an order)
router.post('/', (req, res) => {
  const { shopSlug, items, customerName, customerPhone, note } = req.body || {};

  const shop = findOne('shops', (s) => s.slug === shopSlug);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  if (!Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: 'Order must include at least one item.' });

  // Server-side price lookup – client-sent prices are ignored
  const lineItems = [];
  for (const item of items) {
    const product = findOne(
      'products',
      (p) => p.id === item.productId && p.shopId === shop.id
    );
    if (!product)
      return res.status(400).json({ error: `Product ${item.productId} not found.` });

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1)
      return res.status(400).json({ error: `Invalid quantity for ${product.name}.` });

    lineItems.push({
      productId: product.id,
      name: product.name,
      unitPrice: product.price,
      quantity,
      lineTotal: Math.round(product.price * quantity * 100) / 100
    });
  }

  const total =
    Math.round(lineItems.reduce((sum, li) => sum + li.lineTotal, 0) * 100) / 100;

  const order = {
    id: genId('order'),
    shopId: shop.id,
    items: lineItems,
    total,
    currency: shop.currency,
    customerName: customerName || '',
    customerPhone: customerPhone || '',
    note: note || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  insert('orders', order);
  res.status(201).json({ order, shopWhatsappNumber: shop.whatsappNumber });
});

// GET /api/orders  (protected – vendor sees their own orders)
router.get('/', requireAuth, (req, res) => {
  const shop = findOne('shops', (s) => s.userId === req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  let orders = findAll('orders', (o) => o.shopId === shop.id);

  if (req.query.status && VALID_STATUSES.includes(req.query.status)) {
    orders = orders.filter((o) => o.status === req.query.status);
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders });
});

// PATCH /api/orders/:id/status  (protected – vendor updates status)
router.patch('/:id/status', requireAuth, (req, res) => {
  const shop = findOne('shops', (s) => s.userId === req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status))
    return res.status(400).json({
      error: `Status must be one of: ${VALID_STATUSES.join(', ')}`
    });

  const order = findOne(
    'orders',
    (o) => o.id === req.params.id && o.shopId === shop.id
  );
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const updated = updateOne('orders', (o) => o.id === order.id, { status });
  res.json({ order: updated });
});

export default router;
