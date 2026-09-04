import { Router } from 'express';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/orders  (public — customer places an order)
router.post('/', async (req, res) => {
  try {
    const { shopSlug, items, customerName, customerPhone, note } = req.body || {};

    const shop = await Shop.findOne({ slug: shopSlug });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: 'Order must include at least one item.' });

    // Server-side price lookup — client prices are ignored
    const lineItems = [];
    for (const item of items) {
      const product = await Product.findOne({ _id: item.productId, shopId: shop._id });
      if (!product)
        return res.status(400).json({ error: `Product not found: ${item.productId}` });

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return res.status(400).json({ error: `Invalid quantity for ${product.name}.` });

      lineItems.push({
        productId: product._id,
        name:      product.name,
        unitPrice: product.price,
        quantity,
        lineTotal: Math.round(product.price * quantity * 100) / 100,
      });
    }

    const total = Math.round(
      lineItems.reduce((sum, li) => sum + li.lineTotal, 0) * 100
    ) / 100;

    const order = await Order.create({
      shopId:        shop._id,
      items:         lineItems,
      total,
      currency:      shop.currency,
      customerName:  customerName || '',
      customerPhone: customerPhone || '',
      note:          note || '',
      status:        'pending',
    });

    res.status(201).json({ order, shopWhatsappNumber: shop.whatsappNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error placing order.' });
  }
});

// GET /api/orders  (vendor lists their orders)
router.get('/', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const filter = { shopId: shop._id };
    const VALID = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
    if (req.query.status && VALID.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/orders/:id/status  (vendor updates order status)
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const VALID = ['pending', 'confirmed', 'shipped', 'completed', 'cancelled'];
    const { status } = req.body || {};
    if (!VALID.includes(status))
      return res.status(400).json({ error: `Status must be one of: ${VALID.join(', ')}` });

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, shopId: shop._id },
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;