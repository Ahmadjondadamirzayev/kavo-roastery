import type {
  CoffeeCategory,
  CoffeeSize,
  DeliveryType,
  MilkType,
  OrderStatus,
  RoastLevel,
  SugarLevel,
} from '../lib/pricing';

export interface Product {
  id: number;
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
  createdAt: string;
}

export interface CartItem {
  key: string;
  product: Product;
  size: CoffeeSize;
  roastLevel: RoastLevel;
  milkType: MilkType;
  sugarLevel: SugarLevel;
  quantity: number;
  unitPriceCents: number;
}

export interface OrderItemRecord {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  size: CoffeeSize;
  roastLevel: RoastLevel;
  milkType: MilkType;
  sugarLevel: SugarLevel;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderRecord {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  tableOrAddress: string;
  notes: string;
  status: OrderStatus;
  totalCents: number;
  language: 'en' | 'ru' | 'uz';
  createdAt: string;
  updatedAt: string;
  items: OrderItemRecord[];
}

export interface LoginLogRecord {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  status: 'granted' | 'denied';
  userAgent: string;
  createdAt: string;
}

export interface AuthSessionUser {
  id: number;
  uid: string;
  email: string;
  displayName: string;
  role: string;
}
