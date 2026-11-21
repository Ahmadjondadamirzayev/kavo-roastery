import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  createOrder,
  createProduct,
  isValidCategory,
  listLoginLogs,
  listOrdersWithItems,
  listProducts,
  recordAuthSession,
  updateOrderStatus,
  updateProduct,
  type CreateOrderInputItem,
} from './src/db/repository.ts';
import {
  isAdminEmail,
  requireAdmin,
  requireAuth,
  type AuthRequest,
} from './src/middleware/auth.ts';
import {
  ORDER_STATUSES,
  type CoffeeSize,
  type MilkType,
  type OrderStatus,
  type RoastLevel,
  type SugarLevel,
} from './src/lib/pricing.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '1mb' }));

// SSE subscribers for real-time Admin Order Feed
const sseClients = new Set<Response>();

function broadcastOrderEvent(event: string, payload: unknown) {
  const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(frame);
    } catch {
      sseClients.delete(client);
    }
  }
}

// ============================================================================
// PUBLIC STOREFRONT API
// ============================================================================

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const items = await listProducts(false);
    res.json({ products: items });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(500).json({ error: 'Unable to load coffee menu' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body ?? {};
    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerPhone = typeof body.customerPhone === 'string' ? body.customerPhone.trim() : '';
    const deliveryType = body.deliveryType === 'table' || body.deliveryType === 'delivery' ? body.deliveryType : null;
    const tableOrAddress = typeof body.tableOrAddress === 'string' ? body.tableOrAddress.trim() : '';
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '';
    const language = body.language === 'ru' || body.language === 'uz' ? body.language : 'en';
    const items = Array.isArray(body.items) ? body.items : [];

    if (customerName.length < 2 || customerName.length > 120) {
      res.status(400).json({ error: 'INVALID_CUSTOMER_NAME' });
      return;
    }
    if (customerPhone.length < 6 || customerPhone.length > 40) {
      res.status(400).json({ error: 'INVALID_CUSTOMER_PHONE' });
      return;
    }
    if (!deliveryType) {
      res.status(400).json({ error: 'INVALID_DELIVERY_TYPE' });
      return;
    }
    if (tableOrAddress.length < 1 || tableOrAddress.length > 240) {
      res.status(400).json({ error: 'INVALID_LOCATION' });
      return;
    }
    if (items.length === 0 || items.length > 40) {
      res.status(400).json({ error: 'EMPTY_CART' });
      return;
    }

    const sanitizedItems: CreateOrderInputItem[] = items.map((entry: Record<string, unknown>) => ({
      productId: Number(entry.productId),
      size: entry.size as CoffeeSize,
      roastLevel: entry.roastLevel as RoastLevel,
      milkType: entry.milkType as MilkType,
      sugarLevel: entry.sugarLevel as SugarLevel,
      quantity: Number(entry.quantity),
    }));

    if (sanitizedItems.some((item: CreateOrderInputItem) => !Number.isInteger(item.productId) || item.productId <= 0)) {
      res.status(400).json({ error: 'INVALID_PRODUCT_ID' });
      return;
    }

    const createdOrder = await createOrder({
      customerName,
      customerPhone,
      deliveryType,
      tableOrAddress,
      notes,
      language,
      items: sanitizedItems,
    });

    broadcastOrderEvent('order:created', createdOrder);
    res.status(201).json({ order: createdOrder });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.startsWith('PRODUCT_NOT_FOUND:')) {
        res.status(404).json({ error: 'PRODUCT_NOT_FOUND' });
        return;
      }
      if (error.message.startsWith('PRODUCT_OUT_OF_STOCK:')) {
        res.status(409).json({ error: 'PRODUCT_OUT_OF_STOCK' });
        return;
      }
      if (error.message === 'INVALID_ITEM_OPTIONS') {
        res.status(400).json({ error: 'INVALID_ITEM_OPTIONS' });
        return;
      }
    }
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'ORDER_CREATION_FAILED' });
  }
});

// ============================================================================
// AUTHENTICATION & ADMIN RBAC ROUTES
// ============================================================================

app.post('/api/auth/session', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const decoded = req.user;
    if (!decoded || !decoded.email) {
      res.status(400).json({ error: 'Verified email required' });
      return;
    }

    const email = decoded.email.trim();
    const displayName = typeof decoded.name === 'string' ? decoded.name : email.split('@')[0];
    const admin = isAdminEmail(email) && decoded.email_verified !== false;
    const userAgent = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';

    const userRecord = await recordAuthSession({
      uid: decoded.uid,
      email,
      displayName,
      isAdmin: admin,
      userAgent,
    });

    res.json({
      user: userRecord,
      isAdmin: admin,
    });
  } catch (error) {
    console.error('Failed to establish session:', error);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

app.get('/api/admin/orders', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const data = await listOrdersWithItems();
    res.json({ orders: data });
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    res.status(500).json({ error: 'Unable to load orders' });
  }
});

app.get('/api/admin/orders/stream', requireAuth, requireAdmin, (req: AuthRequest, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.patch('/api/admin/orders/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId) || orderId <= 0) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const status = req.body?.status;
    if (typeof status !== 'string' || !ORDER_STATUSES.includes(status as OrderStatus)) {
      res.status(400).json({ error: 'Invalid order status' });
      return;
    }

    const updated = await updateOrderStatus(orderId, status as OrderStatus);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    broadcastOrderEvent('order:updated', updated);
    res.json({ order: updated });
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Unable to update order' });
  }
});

app.get('/api/admin/products', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const items = await listProducts(false);
    res.json({ products: items });
  } catch (error) {
    console.error('Failed to fetch admin products:', error);
    res.status(500).json({ error: 'Unable to load products' });
  }
});

app.post('/api/admin/products', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const b = req.body ?? {};
    const category = b.category;
    if (!isValidCategory(category)) {
      res.status(400).json({ error: 'Invalid category' });
      return;
    }

    const nameEn = typeof b.nameEn === 'string' ? b.nameEn.trim() : '';
    const nameRu = typeof b.nameRu === 'string' && b.nameRu.trim() ? b.nameRu.trim() : nameEn;
    const nameUz = typeof b.nameUz === 'string' && b.nameUz.trim() ? b.nameUz.trim() : nameEn;
    const descriptionEn = typeof b.descriptionEn === 'string' ? b.descriptionEn.trim() : '';
    const descriptionRu = typeof b.descriptionRu === 'string' && b.descriptionRu.trim() ? b.descriptionRu.trim() : descriptionEn;
    const descriptionUz = typeof b.descriptionUz === 'string' && b.descriptionUz.trim() ? b.descriptionUz.trim() : descriptionEn;
    const originEn = typeof b.originEn === 'string' ? b.originEn.trim() : 'Single Origin';
    const originRu = typeof b.originRu === 'string' && b.originRu.trim() ? b.originRu.trim() : originEn;
    const originUz = typeof b.originUz === 'string' && b.originUz.trim() ? b.originUz.trim() : originEn;
    const tastingNotesEn = typeof b.tastingNotesEn === 'string' ? b.tastingNotesEn.trim() : 'Cocoa · Roasted Nut';
    const tastingNotesRu = typeof b.tastingNotesRu === 'string' && b.tastingNotesRu.trim() ? b.tastingNotesRu.trim() : tastingNotesEn;
    const tastingNotesUz = typeof b.tastingNotesUz === 'string' && b.tastingNotesUz.trim() ? b.tastingNotesUz.trim() : tastingNotesEn;
    const basePriceCents = Number(b.basePriceCents);

    if (!nameEn || !descriptionEn || !Number.isInteger(basePriceCents) || basePriceCents < 100 || basePriceCents > 50000) {
      res.status(400).json({ error: 'Invalid product fields' });
      return;
    }

    const categoryDefaultImage: Record<string, string> = {
      hot: '/src/assets/images/coffee_hot_espresso_1795267521191.jpg',
      iced: '/src/assets/images/coffee_iced_coldbrew_1795267521843.jpg',
      brew: '/src/assets/images/coffee_v60_pourover_1795267521137.jpg',
      beans: '/src/assets/images/coffee_specialty_beans_1795267522312.jpg',
    };

    const slugBase = nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${slugBase || 'coffee'}-${Date.now().toString().slice(-4)}`;

    const created = await createProduct({
      slug,
      category,
      nameEn,
      nameRu,
      nameUz,
      descriptionEn,
      descriptionRu,
      descriptionUz,
      originEn,
      originRu,
      originUz,
      tastingNotesEn,
      tastingNotesRu,
      tastingNotesUz,
      basePriceCents,
      imageUrl: categoryDefaultImage[category],
      inStock: Boolean(b.inStock ?? true),
      featured: Boolean(b.featured ?? false),
    });

    res.status(201).json({ product: created });
  } catch (error) {
    console.error('Failed to create product:', error);
    res.status(500).json({ error: 'Unable to add coffee item' });
  }
});

app.patch('/api/admin/products/:id', requireAuth, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    if (!Number.isInteger(productId) || productId <= 0) {
      res.status(400).json({ error: 'Invalid product ID' });
      return;
    }

    const updates: { inStock?: boolean; basePriceCents?: number; featured?: boolean } = {};
    if (typeof req.body?.inStock === 'boolean') {
      updates.inStock = req.body.inStock;
    }
    if (typeof req.body?.featured === 'boolean') {
      updates.featured = req.body.featured;
    }
    if (req.body?.basePriceCents !== undefined) {
      const price = Number(req.body.basePriceCents);
      if (!Number.isInteger(price) || price < 100 || price > 50000) {
        res.status(400).json({ error: 'Invalid price' });
        return;
      }
      updates.basePriceCents = price;
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No valid updates provided' });
      return;
    }

    const updated = await updateProduct(productId, updates);
    if (!updated) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ product: updated });
  } catch (error) {
    console.error('Failed to update product:', error);
    res.status(500).json({ error: 'Unable to update product' });
  }
});

app.get('/api/admin/login-logs', requireAuth, requireAdmin, async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await listLoginLogs();
    res.json({ logs });
  } catch (error) {
    console.error('Failed to fetch login logs:', error);
    res.status(500).json({ error: 'Unable to load login logs' });
  }
});

// ============================================================================
// VITE DEV MIDDLEWARE / STATIC PRODUCTION SERVER
// ============================================================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build artifacts not found.');
      }
    });
  }

  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Kavo Roastery server running on http://0.0.0.0:${port}`);
  });
}

startServer();
