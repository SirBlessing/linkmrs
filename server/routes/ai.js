import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Shop from '../models/Shop.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const genAI  = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callAI(systemPrompt, history, userMessage, res = null) {
  const model = genAI.getGenerativeModel({
    model:             'gemini-2.0-flash',
    systemInstruction: systemPrompt,
  });

  // Gemini requires history to start with user and strictly alternate
  const safeHistory = history
    .filter((h) => h.role === 'user' || h.role === 'assistant')
    .reduce((acc, msg) => {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
      if (acc.length === 0 && geminiRole === 'model') return acc;
      if (acc.length > 0 && acc[acc.length - 1].role === geminiRole) return acc;
      acc.push({ role: geminiRole, parts: [{ text: msg.content }] });
      return acc;
    }, []);

  const chat = model.startChat({ history: safeHistory });

  // Streaming mode — words appear immediately as they are generated
  if (res) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const result = await chat.sendMessageStream(userMessage);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
    return;
  }

  // Non-streaming fallback (used by build-shop)
  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}

// ── POST /api/ai/coach  (vendor business coach — protected) ──
router.post('/coach', requireAuth, async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });

    const shop     = await Shop.findOne({ userId: req.userId });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const products = await Product.find({ shopId: shop._id });
    const orders   = await Order.find({ shopId: shop._id }).sort({ createdAt: -1 }).limit(10);

    const totalSales      = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const pendingOrders   = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    const productTotals = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productTotals[item.name]) productTotals[item.name] = { quantity: 0, revenue: 0 };
        productTotals[item.name].quantity += item.quantity;
        productTotals[item.name].revenue  += item.lineTotal;
      });
    });
    const topProducts = Object.entries(productTotals)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5);

    const systemPrompt = `You are an AI business coach for ${shop.shopName}, a micro-vendor shop on Linkmrs.
You have access to their real business data. Be specific, practical, and concise.
Respond in plain English. If the vendor writes in Nigerian Pidgin, reply in Pidgin.
Never make up numbers — only use the data below. Keep answers short and actionable.

SHOP: ${shop.shopName} | Plan: ${shop.plan} | Currency: ${shop.currency} | Location: ${shop.location || 'Not set'}

PRODUCTS (${products.length} total):
${products.map(p => `- ${p.name}: ${shop.currency}${p.price} — ${p.description}`).join('\n') || 'No products yet'}

SALES SUMMARY:
- Revenue: ${shop.currency}${totalSales.toFixed(2)} | Orders: ${orders.length} | Pending: ${pendingOrders} | Completed: ${completedOrders}

TOP PRODUCTS:
${topProducts.map(([name, d]) => `- ${name}: ${d.quantity} sold, ${shop.currency}${d.revenue.toFixed(2)}`).join('\n') || 'No sales yet'}

RECENT ORDERS:
${orders.slice(0, 5).map(o => `- ${o.customerName || 'Anonymous'}: ${shop.currency}${o.total} (${o.status}) — ${new Date(o.createdAt).toDateString()}`).join('\n') || 'No orders yet'}`;

    await callAI(systemPrompt, history, message.trim(), res);
  } catch (err) {
    console.error('AI coach error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI is unavailable right now. Try again shortly.' });
    }
  }
});

// ── POST /api/ai/customer  (customer assistant — public) ─────
router.post('/customer', async (req, res) => {
  try {
    const { shopSlug, message, history = [] } = req.body || {};
    if (!shopSlug || !message?.trim())
      return res.status(400).json({ error: 'shopSlug and message are required.' });

    const shop     = await Shop.findOne({ slug: shopSlug });
    if (!shop) return res.status(404).json({ error: 'Shop not found.' });

    const products = await Product.find({ shopId: shop._id });

    const systemPrompt = `You are a friendly AI shopping assistant for ${shop.shopName} on Linkmrs.
Help customers find products, suggest combinations, and answer questions.
Understand both English and Nigerian Pidgin — respond in whatever language the customer uses.
Be warm, brief, and helpful. Only recommend products from the list below.
When a customer is ready to order, summarise their items and tell them to tap the WhatsApp button.

SHOP: ${shop.shopName}
${shop.bio ? `ABOUT: ${shop.bio}` : ''}
${shop.location ? `LOCATION: ${shop.location}` : ''}
CURRENCY: ${shop.currency}

PRODUCTS:
${products.map(p => `- ${p.name}: ${shop.currency}${p.price} — ${p.description}`).join('\n') || 'No products yet.'}

RULES:
- Never suggest products not in the list above
- If something is not available, say so and suggest the closest alternative
- If a budget is mentioned, only suggest items within that budget
- Keep replies short — max 4 sentences unless listing products
- End order summaries with: "Tap the WhatsApp button to send your order."`;

    await callAI(systemPrompt, history, message.trim(), res);
  } catch (err) {
    console.error('AI customer error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI is unavailable right now.' });
    }
  }
});

// ── POST /api/ai/build-shop  (storefront builder — protected) 
router.post('/build-shop', requireAuth, async (req, res) => {
  try {
    const { description } = req.body || {};
    if (!description?.trim())
      return res.status(400).json({ error: 'Business description is required.' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are helping a Nigerian micro-vendor set up their online shop on Linkmrs.
Based on their description, generate a shop profile and up to 5 products.
Prices must be realistic for the Nigerian market in Naira (numbers only, no symbol).

Return ONLY valid JSON — no markdown, no explanation:
{
  "shopBio": "A short warm professional 1-2 sentence shop description",
  "products": [
    {
      "name": "Product name",
      "price": 5000,
      "description": "Short 1-sentence product description"
    }
  ]
}

VENDOR DESCRIPTION:
${description.trim()}`;

    const result = await model.generateContent(prompt);
    const text   = result.response.text().trim().replace(/```json|```/g, '').trim();
    const json   = JSON.parse(text);
    res.json(json);
  } catch (err) {
    console.error('AI build-shop error:', err);
    res.status(500).json({ error: 'AI could not generate your shop. Try again.' });
  }
});

export default router;