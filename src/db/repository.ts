import { desc, eq, inArray } from 'drizzle-orm';
import { db } from './index.ts';
import { loginLogs, orderItems, orders, products, users } from './schema.ts';
import {
  calculateCustomizedUnitPriceCents,
  COFFEE_CATEGORIES,
  COFFEE_SIZES,
  MILK_TYPES,
  ROAST_LEVELS,
  SUGAR_LEVELS,
  type CoffeeCategory,
  type CoffeeSize,
  type DeliveryType,
  type MilkType,
  type OrderStatus,
  type RoastLevel,
  type SugarLevel,
} from '../lib/pricing.ts';

export interface CreateOrderInputItem {
  productId: number;
  size: CoffeeSize;
  roastLevel: RoastLevel;
  milkType: MilkType;
  sugarLevel: SugarLevel;
  quantity: number;
}

export interface CreateOrderInput {
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  tableOrAddress: string;
  notes: string;
  language: 'en' | 'ru' | 'uz';
  items: CreateOrderInputItem[];
}

export interface CreateProductInput {
  slug: string;
  category: CoffeeCategory;
  nameEn: string;
  nameRu: string;
  nameUz: string;
  descriptionEn: string;
  descriptionRu: string;
  descriptionUz: string;
  originEn: string;
  originRu: string;
  originUz: string;
  tastingNotesEn: string;
  tastingNotesRu: string;
  tastingNotesUz: string;
  basePriceCents: number;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
}

export async function listProducts(onlyInStock = false) {
  try {
    if (onlyInStock) {
      return await db
        .select()
        .from(products)
        .where(eq(products.inStock, true))
        .orderBy(desc(products.featured), products.id);
    }
    return await db
      .select()
      .from(products)
      .orderBy(desc(products.featured), products.id);
  } catch (error) {
    console.error('Database query failed in listProducts:', error);
    throw new Error('Failed to load coffee menu.', { cause: error });
  }
}

export async function createProduct(input: CreateProductInput) {
  try {
    const [created] = await db
      .insert(products)
      .values({
        slug: input.slug,
        category: input.category,
        nameEn: input.nameEn,
        nameRu: input.nameRu,
        nameUz: input.nameUz,
        descriptionEn: input.descriptionEn,
        descriptionRu: input.descriptionRu,
        descriptionUz: input.descriptionUz,
        originEn: input.originEn,
        originRu: input.originRu,
        originUz: input.originUz,
        tastingNotesEn: input.tastingNotesEn,
        tastingNotesRu: input.tastingNotesRu,
        tastingNotesUz: input.tastingNotesUz,
        basePriceCents: input.basePriceCents,
        imageUrl: input.imageUrl,
        inStock: input.inStock,
        featured: input.featured,
      })
      .returning();
    return created;
  } catch (error) {
    console.error('Database query failed in createProduct:', error);
    throw new Error('Failed to create coffee item.', { cause: error });
  }
}

export async function updateProduct(
  id: number,
  updates: { inStock?: boolean; basePriceCents?: number; featured?: boolean },
) {
  try {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updated ?? null;
  } catch (error) {
    console.error('Database query failed in updateProduct:', error);
    throw new Error('Failed to update coffee item.', { cause: error });
  }
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const productIds = Array.from(new Set(input.items.map((item) => item.productId)));
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let totalCents = 0;
    const preparedItems = input.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`PRODUCT_NOT_FOUND:${item.productId}`);
      }
      if (!product.inStock) {
        throw new Error(`PRODUCT_OUT_OF_STOCK:${product.nameEn}`);
      }
      if (
        !COFFEE_SIZES.includes(item.size) ||
        !ROAST_LEVELS.includes(item.roastLevel) ||
        !MILK_TYPES.includes(item.milkType) ||
        !SUGAR_LEVELS.includes(item.sugarLevel) ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 50
      ) {
        throw new Error('INVALID_ITEM_OPTIONS');
      }

      const unitPriceCents = calculateCustomizedUnitPriceCents(
        product.basePriceCents,
        product.category,
        item.size,
        item.milkType,
      );
      const lineTotalCents = unitPriceCents * item.quantity;
      totalCents += lineTotalCents;

      const localizedName =
        input.language === 'ru'
          ? product.nameRu
          : input.language === 'uz'
            ? product.nameUz
            : product.nameEn;

      return {
        productId: product.id,
        productName: localizedName,
        size: item.size,
        roastLevel: item.roastLevel,
        milkType: item.milkType,
        sugarLevel: item.sugarLevel,
        quantity: item.quantity,
        unitPriceCents,
        lineTotalCents,
      };
    });

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KV-${Date.now().toString().slice(-4)}${randomCode}`;

    return await db.transaction(async (tx) => {
      const [createdOrder] = await tx
        .insert(orders)
        .values({
          orderNumber,
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          deliveryType: input.deliveryType,
          tableOrAddress: input.tableOrAddress,
          notes: input.notes,
          status: 'pending',
          totalCents,
          language: input.language,
        })
        .returning();

      const insertedItems = await tx
        .insert(orderItems)
        .values(
          preparedItems.map((item) => ({
            orderId: createdOrder.id,
            ...item,
          })),
        )
        .returning();

      return {
        ...createdOrder,
        items: insertedItems,
      };
    });
  } catch (error) {
    if (error instanceof Error && (error.message.startsWith('PRODUCT_') || error.message === 'INVALID_ITEM_OPTIONS')) {
      throw error;
    }
    console.error('Database query failed in createOrder:', error);
    throw new Error('Failed to submit coffee order.', { cause: error });
  }
}

export async function listOrdersWithItems() {
  try {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    if (allOrders.length === 0) {
      return [];
    }

    const orderIds = allOrders.map((o) => o.id);
    const allItems = await db
      .select()
      .from(orderItems)
      .where(inArray(orderItems.orderId, orderIds));

    const itemsByOrder = new Map<number, typeof allItems>();
    for (const item of allItems) {
      const list = itemsByOrder.get(item.orderId) ?? [];
      list.push(item);
      itemsByOrder.set(item.orderId, list);
    }

    return allOrders.map((order) => ({
      ...order,
      items: itemsByOrder.get(order.id) ?? [],
    }));
  } catch (error) {
    console.error('Database query failed in listOrdersWithItems:', error);
    throw new Error('Failed to fetch orders.', { cause: error });
  }
}

export async function updateOrderStatus(orderId: number, status: OrderStatus) {
  try {
    const [updated] = await db
      .update(orders)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId))
      .returning();

    if (!updated) return null;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, updated.id));

    return {
      ...updated,
      items,
    };
  } catch (error) {
    console.error('Database query failed in updateOrderStatus:', error);
    throw new Error('Failed to update order status.', { cause: error });
  }
}

export async function recordAuthSession(params: {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  userAgent: string;
}) {
  try {
    const role = params.isAdmin ? 'admin' : 'pending';
    const [user] = await db
      .insert(users)
      .values({
        uid: params.uid,
        email: params.email,
        displayName: params.displayName,
        role,
        lastLoginAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: params.email,
          displayName: params.displayName,
          role,
          lastLoginAt: new Date(),
        },
      })
      .returning();

    await db.insert(loginLogs).values({
      uid: params.uid,
      email: params.email,
      displayName: params.displayName,
      status: params.isAdmin ? 'granted' : 'denied',
      userAgent: params.userAgent.slice(0, 240),
    });

    return user;
  } catch (error) {
    console.error('Database query failed in recordAuthSession:', error);
    throw new Error('Failed to verify session.', { cause: error });
  }
}

export async function listLoginLogs() {
  try {
    return await db
      .select()
      .from(loginLogs)
      .orderBy(desc(loginLogs.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Database query failed in listLoginLogs:', error);
    throw new Error('Failed to load login logs.', { cause: error });
  }
}

export function isValidCategory(val: unknown): val is CoffeeCategory {
  return typeof val === 'string' && COFFEE_CATEGORIES.includes(val as CoffeeCategory);
}
