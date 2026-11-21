import { DEFAULT_COFFEE_CATALOG } from '../data/defaultCatalog';
import { resolveCoffeeImage } from './coffeeImages';
import {
  calculateCustomizedUnitPriceCents,
  type CoffeeCategory,
  type CoffeeSize,
  type DeliveryType,
  type Language,
  type MilkType,
  type OrderStatus,
  type RoastLevel,
  type SugarLevel,
} from './pricing';
import { isSupabaseConfigured, supabase } from './supabase';
import type { LoginLogRecord, OrderRecord, Product } from '../types/coffee';

const LOCAL_ORDERS_KEY = 'kavo_fallback_orders';
const LOCAL_LOGS_KEY = 'kavo_fallback_login_logs';

function readLocalJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota restrictions
  }
}

function normalizeProduct(raw: Record<string, unknown>): Product {
  const slug = String(raw.slug ?? '');
  const category = String(raw.category ?? 'hot') as CoffeeCategory;
  const imageRaw = String(raw.imageUrl ?? raw.image_url ?? '');
  return {
    id: Number(raw.id),
    slug,
    category,
    nameEn: String(raw.nameEn ?? raw.name_en ?? ''),
    nameRu: String(raw.nameRu ?? raw.name_ru ?? raw.nameEn ?? raw.name_en ?? ''),
    nameUz: String(raw.nameUz ?? raw.name_uz ?? raw.nameEn ?? raw.name_en ?? ''),
    descriptionEn: String(raw.descriptionEn ?? raw.description_en ?? ''),
    descriptionRu: String(raw.descriptionRu ?? raw.description_ru ?? raw.descriptionEn ?? raw.description_en ?? ''),
    descriptionUz: String(raw.descriptionUz ?? raw.description_uz ?? raw.descriptionEn ?? raw.description_en ?? ''),
    originEn: String(raw.originEn ?? raw.origin_en ?? ''),
    originRu: String(raw.originRu ?? raw.origin_ru ?? raw.originEn ?? raw.origin_en ?? ''),
    originUz: String(raw.originUz ?? raw.origin_uz ?? raw.originEn ?? raw.origin_en ?? ''),
    tastingNotesEn: String(raw.tastingNotesEn ?? raw.tasting_notes_en ?? ''),
    tastingNotesRu: String(raw.tastingNotesRu ?? raw.tasting_notes_ru ?? raw.tastingNotesEn ?? raw.tasting_notes_en ?? ''),
    tastingNotesUz: String(raw.tastingNotesUz ?? raw.tasting_notes_uz ?? raw.tastingNotesEn ?? raw.tasting_notes_en ?? ''),
    basePriceCents: Number(raw.basePriceCents ?? raw.base_price_cents ?? 450),
    imageUrl: resolveCoffeeImage(imageRaw, slug, category),
    inStock: Boolean(raw.inStock ?? raw.in_stock ?? true),
    featured: Boolean(raw.featured ?? false),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

export async function fetchCatalogProducts(): Promise<Product[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) => normalizeProduct(row as Record<string, unknown>));
      }
    } catch (err) {
      console.warn('Supabase products fallback engaged:', err);
    }
  }

  try {
    const response = await fetch('/api/products');
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        return data.products.map((row: Record<string, unknown>) => normalizeProduct(row));
      }
    }
  } catch {
    // Static or offline mode falls back seamlessly to built-in specialty catalog
  }

  return DEFAULT_COFFEE_CATALOG;
}

export interface SubmitOrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  tableOrAddress: string;
  notes: string;
  language: Language;
  items: {
    product: Product;
    size: CoffeeSize;
    roastLevel: RoastLevel;
    milkType: MilkType;
    sugarLevel: SugarLevel;
    quantity: number;
  }[];
}

export async function submitCoffeeOrder(payload: SubmitOrderPayload): Promise<OrderRecord> {
  if (isSupabaseConfigured && supabase) {
    const orderNumber = `KV-${Date.now().toString().slice(-4)}${Math.floor(1000 + Math.random() * 9000)}`;
    const prepared = payload.items.map((item) => {
      const unitPriceCents = calculateCustomizedUnitPriceCents(
        item.product.basePriceCents,
        item.product.category,
        item.size,
        item.milkType,
      );
      const localizedName =
        payload.language === 'ru'
          ? item.product.nameRu
          : payload.language === 'uz'
            ? item.product.nameUz
            : item.product.nameEn;

      return {
        product_id: item.product.id,
        product_name: localizedName,
        size: item.size,
        roast_level: item.roastLevel,
        milk_type: item.milkType,
        sugar_level: item.sugarLevel,
        quantity: item.quantity,
        unit_price_cents: unitPriceCents,
        line_total_cents: unitPriceCents * item.quantity,
      };
    });

    const totalCents = prepared.reduce((sum, item) => sum + item.line_total_cents, 0);

    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        delivery_type: payload.deliveryType,
        table_or_address: payload.tableOrAddress,
        notes: payload.notes,
        status: 'pending',
        total_cents: totalCents,
        language: payload.language,
      })
      .select()
      .single();

    if (!orderErr && orderRow) {
      const { data: insertedItems } = await supabase
        .from('order_items')
        .insert(prepared.map((item) => ({ order_id: orderRow.id, ...item })))
        .select();

      return {
        id: orderRow.id,
        orderNumber: orderRow.order_number,
        customerName: orderRow.customer_name,
        customerPhone: orderRow.customer_phone,
        deliveryType: orderRow.delivery_type,
        tableOrAddress: orderRow.table_or_address,
        notes: orderRow.notes,
        status: orderRow.status,
        totalCents: orderRow.total_cents,
        language: orderRow.language,
        createdAt: orderRow.created_at,
        updatedAt: orderRow.updated_at,
        items: (insertedItems ?? []).map((it: Record<string, unknown>) => ({
          id: Number(it.id),
          orderId: Number(it.order_id),
          productId: Number(it.product_id),
          productName: String(it.product_name),
          size: it.size as CoffeeSize,
          roastLevel: it.roast_level as RoastLevel,
          milkType: it.milk_type as MilkType,
          sugarLevel: it.sugar_level as SugarLevel,
          quantity: Number(it.quantity),
          unitPriceCents: Number(it.unit_price_cents),
          lineTotalCents: Number(it.line_total_cents),
        })),
      };
    }
  }

  // Primary Express + Cloud SQL PostgreSQL endpoint
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: payload.customerName,
        customerPhone: payload.customerPhone,
        deliveryType: payload.deliveryType,
        tableOrAddress: payload.tableOrAddress,
        notes: payload.notes,
        language: payload.language,
        items: payload.items.map((item) => ({
          productId: item.product.id,
          size: item.size,
          roastLevel: item.roastLevel,
          milkType: item.milkType,
          sugarLevel: item.sugarLevel,
          quantity: item.quantity,
        })),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.order as OrderRecord;
    }
  } catch {
    // Fall back to local persistence only if backend is unreachable (e.g. static deployment)
  }

  // Static deployment fallback
  const now = new Date().toISOString();
  const orderId = Date.now();
  const orderNumber = `KV-${orderId.toString().slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
  const items = payload.items.map((item, idx) => {
    const unitPriceCents = calculateCustomizedUnitPriceCents(
      item.product.basePriceCents,
      item.product.category,
      item.size,
      item.milkType,
    );
    const localizedName =
      payload.language === 'ru'
        ? item.product.nameRu
        : payload.language === 'uz'
          ? item.product.nameUz
          : item.product.nameEn;

    return {
      id: orderId + idx + 1,
      orderId,
      productId: item.product.id,
      productName: localizedName,
      size: item.size,
      roastLevel: item.roastLevel,
      milkType: item.milkType,
      sugarLevel: item.sugarLevel,
      quantity: item.quantity,
      unitPriceCents,
      lineTotalCents: unitPriceCents * item.quantity,
    };
  });

  const fallbackOrder: OrderRecord = {
    id: orderId,
    orderNumber,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    deliveryType: payload.deliveryType,
    tableOrAddress: payload.tableOrAddress,
    notes: payload.notes,
    status: 'pending',
    totalCents: items.reduce((sum, i) => sum + i.lineTotalCents, 0),
    language: payload.language,
    createdAt: now,
    updatedAt: now,
    items,
  };

  const existing = readLocalJson<OrderRecord[]>(LOCAL_ORDERS_KEY, []);
  writeLocalJson(LOCAL_ORDERS_KEY, [fallbackOrder, ...existing]);
  return fallbackOrder;
}

export async function fetchAdminOrders(idToken: string | null): Promise<OrderRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data.map((row: Record<string, unknown>) => ({
        id: Number(row.id),
        orderNumber: String(row.order_number),
        customerName: String(row.customer_name),
        customerPhone: String(row.customer_phone),
        deliveryType: row.delivery_type as DeliveryType,
        tableOrAddress: String(row.table_or_address),
        notes: String(row.notes ?? ''),
        status: row.status as OrderStatus,
        totalCents: Number(row.total_cents),
        language: (row.language as Language) ?? 'en',
        createdAt: String(row.created_at),
        updatedAt: String(row.updated_at),
        items: Array.isArray(row.order_items)
          ? row.order_items.map((it: Record<string, unknown>) => ({
              id: Number(it.id),
              orderId: Number(it.order_id),
              productId: Number(it.product_id),
              productName: String(it.product_name),
              size: it.size as CoffeeSize,
              roastLevel: it.roast_level as RoastLevel,
              milkType: it.milk_type as MilkType,
              sugarLevel: it.sugar_level as SugarLevel,
              quantity: Number(it.quantity),
              unitPriceCents: Number(it.unit_price_cents),
              lineTotalCents: Number(it.line_total_cents),
            }))
          : [],
      }));
    }
  }

  if (idToken) {
    const res = await fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.orders ?? [];
    }
  }

  return readLocalJson<OrderRecord[]>(LOCAL_ORDERS_KEY, []);
}

export async function updateAdminOrderStatus(
  idToken: string | null,
  orderId: number,
  status: OrderStatus,
): Promise<OrderRecord | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select('*, order_items(*)')
      .single();

    if (!error && data) {
      return {
        id: data.id,
        orderNumber: data.order_number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        deliveryType: data.delivery_type,
        tableOrAddress: data.table_or_address,
        notes: data.notes,
        status: data.status,
        totalCents: data.total_cents,
        language: data.language,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        items: (data.order_items ?? []).map((it: Record<string, unknown>) => ({
          id: Number(it.id),
          orderId: Number(it.order_id),
          productId: Number(it.product_id),
          productName: String(it.product_name),
          size: it.size as CoffeeSize,
          roastLevel: it.roast_level as RoastLevel,
          milkType: it.milk_type as MilkType,
          sugarLevel: it.sugar_level as SugarLevel,
          quantity: Number(it.quantity),
          unitPriceCents: Number(it.unit_price_cents),
          lineTotalCents: Number(it.line_total_cents),
        })),
      };
    }
  }

  if (idToken) {
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  }

  const localOrders = readLocalJson<OrderRecord[]>(LOCAL_ORDERS_KEY, []);
  const updated = localOrders.map((o) =>
    o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o,
  );
  writeLocalJson(LOCAL_ORDERS_KEY, updated);
  return updated.find((o) => o.id === orderId) ?? null;
}

export async function fetchAdminLoginLogs(idToken: string | null): Promise<LoginLogRecord[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('login_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) {
      return data.map((row: Record<string, unknown>) => ({
        id: Number(row.id),
        uid: String(row.uid),
        email: String(row.email),
        displayName: String(row.display_name ?? ''),
        status: row.status as 'granted' | 'denied',
        userAgent: String(row.user_agent ?? ''),
        createdAt: String(row.created_at),
      }));
    }
  }

  if (idToken) {
    const res = await fetch('/api/admin/login-logs', {
      headers: { Authorization: `Bearer ${idToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs ?? [];
    }
  }

  return readLocalJson<LoginLogRecord[]>(LOCAL_LOGS_KEY, []);
}

export async function recordFallbackLoginLog(entry: Omit<LoginLogRecord, 'id' | 'createdAt'>) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('login_logs').insert({
        uid: entry.uid,
        email: entry.email,
        display_name: entry.displayName,
        status: entry.status,
        user_agent: entry.userAgent,
      });
      return;
    } catch {
      // Fallback below
    }
  }

  const existing = readLocalJson<LoginLogRecord[]>(LOCAL_LOGS_KEY, []);
  const next: LoginLogRecord = {
    id: Date.now(),
    ...entry,
    createdAt: new Date().toISOString(),
  };
  writeLocalJson(LOCAL_LOGS_KEY, [next, ...existing.slice(0, 99)]);
}
