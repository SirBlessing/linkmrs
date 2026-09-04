import { Router } from 'express';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics  (vendor only)
router.get('/', requireAuth, async (req, res) => {
  try {
    const shop = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const [orders, products] = await Promise.all([
      Order.find({ shopId: shop._id }),
      Product.find({ shopId: shop._id }),
    ]);

    const active       = orders.filter((o) => o.status !== 'cancelled');
    const totalSales   = Math.round(active.reduce((s, o) => s + o.total, 0) * 100) / 100;
    const totalOrders  = orders.length;
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const shippedCount = orders.filter((o) => o.status === 'shipped').length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;

    // Per-product totals
    const byProduct = {};
    for (const order of active) {
      for (const item of order.items) {
        const key = String(item.productId);
        if (!byProduct[key]) byProduct[key] = { name: item.name, quantity: 0, revenue: 0 };
        byProduct[key].quantity += item.quantity;
        byProduct[key].revenue  += item.lineTotal;
      }
    }
    const topProducts = Object.values(byProduct)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

    // Orders per day — last 7 days
    const today = new Date();
    const ordersByDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      ordersByDay.push({
        date:  key,
        count: orders.filter((o) => o.createdAt.toISOString().slice(0, 10) === key).length,
      });
    }

    res.json({
      totalSales,
      totalOrders,
      pendingCount,
      shippedCount,
      completedCount,
      productCount: products.length,
      topProducts,
      ordersByDay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

export default router;