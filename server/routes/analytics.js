import { Router } from 'express';
import { findOne, findAll } from '../utils/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics  (protected)
router.get('/', requireAuth, (req, res) => {
  const shop = findOne('shops', (s) => s.userId === req.userId);
  if (!shop) return res.status(404).json({ error: 'Shop not found.' });

  const orders   = findAll('orders',   (o) => o.shopId === shop.id);
  const products = findAll('products', (p) => p.shopId === shop.id);

  const active    = orders.filter((o) => o.status !== 'cancelled');
  const totalSales = Math.round(active.reduce((sum, o) => sum + o.total, 0) * 100) / 100;
  const totalOrders   = orders.length;
  const pendingCount  = orders.filter((o) => o.status === 'pending').length;
  const shippedCount  = orders.filter((o) => o.status === 'shipped').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;

  // Per-product sales totals
  const byProduct = {};
  for (const order of active) {
    for (const item of order.items) {
      if (!byProduct[item.productId]) {
        byProduct[item.productId] = { name: item.name, quantity: 0, revenue: 0 };
      }
      byProduct[item.productId].quantity += item.quantity;
      byProduct[item.productId].revenue  += item.lineTotal;
    }
  }

  const topProducts = Object.values(byProduct)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }));

  // Orders per day – last 7 days (UTC buckets)
  const today = new Date();
  const ordersByDay = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    ordersByDay.push({
      date: key,
      count: orders.filter((o) => o.createdAt.slice(0, 10) === key).length
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
    ordersByDay
  });
});

export default router;