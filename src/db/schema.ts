import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default(''),
  role: text('role').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  category: text('category').notNull(), // 'hot' | 'iced' | 'brew' | 'beans'
  nameEn: text('name_en').notNull(),
  nameRu: text('name_ru').notNull(),
  nameUz: text('name_uz').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionRu: text('description_ru').notNull(),
  descriptionUz: text('description_uz').notNull(),
  originEn: text('origin_en').notNull(),
  originRu: text('origin_ru').notNull(),
  originUz: text('origin_uz').notNull(),
  tastingNotesEn: text('tasting_notes_en').notNull(),
  tastingNotesRu: text('tasting_notes_ru').notNull(),
  tastingNotesUz: text('tasting_notes_uz').notNull(),
  basePriceCents: integer('base_price_cents').notNull(),
  imageUrl: text('image_url').notNull(),
  inStock: boolean('in_stock').notNull().default(true),
  featured: boolean('featured').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  deliveryType: text('delivery_type').notNull(), // 'table' | 'delivery'
  tableOrAddress: text('table_or_address').notNull(),
  notes: text('notes').notNull().default(''),
  status: text('status').notNull().default('pending'), // 'pending' | 'brewing' | 'ready' | 'completed' | 'cancelled'
  totalCents: integer('total_cents').notNull(),
  language: text('language').notNull().default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productName: text('product_name').notNull(),
  size: text('size').notNull(),
  roastLevel: text('roast_level').notNull(),
  milkType: text('milk_type').notNull(),
  sugarLevel: text('sugar_level').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  lineTotalCents: integer('line_total_cents').notNull(),
});

export const loginLogs = pgTable('login_logs', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull().default(''),
  status: text('status').notNull(), // 'granted' | 'denied'
  userAgent: text('user_agent').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
