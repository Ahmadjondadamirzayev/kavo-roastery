export type Language = 'en' | 'ru' | 'uz';

export type CoffeeCategory = 'hot' | 'iced' | 'brew' | 'beans';
export type CoffeeSize = 'S' | 'M' | 'L';
export type RoastLevel = 'light' | 'medium' | 'dark';
export type MilkType = 'none' | 'whole' | 'oat' | 'almond' | 'coconut';
export type SugarLevel = '0' | '25' | '50' | '100';
export type OrderStatus = 'pending' | 'brewing' | 'ready' | 'completed' | 'cancelled';
export type DeliveryType = 'table' | 'delivery';

export const COFFEE_CATEGORIES: readonly CoffeeCategory[] = ['hot', 'iced', 'brew', 'beans'];
export const COFFEE_SIZES: readonly CoffeeSize[] = ['S', 'M', 'L'];
export const ROAST_LEVELS: readonly RoastLevel[] = ['light', 'medium', 'dark'];
export const MILK_TYPES: readonly MilkType[] = ['none', 'whole', 'oat', 'almond', 'coconut'];
export const SUGAR_LEVELS: readonly SugarLevel[] = ['0', '25', '50', '100'];
export const ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'brewing',
  'ready',
  'completed',
  'cancelled',
];

export const SIZE_SURCHARGE_CENTS: Record<CoffeeSize, number> = {
  S: 0,
  M: 70,
  L: 140,
};

export const MILK_SURCHARGE_CENTS: Record<MilkType, number> = {
  none: 0,
  whole: 0,
  oat: 80,
  almond: 80,
  coconut: 90,
};

export function calculateCustomizedUnitPriceCents(
  basePriceCents: number,
  category: string,
  size: CoffeeSize,
  milkType: MilkType,
): number {
  if (category === 'beans') {
    const multiplier = size === 'S' ? 1 : size === 'M' ? 1.85 : 3.4;
    return Math.round(basePriceCents * multiplier);
  }
  return basePriceCents + SIZE_SURCHARGE_CENTS[size] + MILK_SURCHARGE_CENTS[milkType];
}

/**
 * Centralized currency conversion & formatting synchronized to active language:
 * - en: USD ($3.50)
 * - ru: RUB (280 ₽)
 * - uz: UZS (35 000 so'm)
 */
export function formatPrice(basePriceUSDOrCents: number, language: Language = 'en', isCents = true): string {
  const usd = isCents ? basePriceUSDOrCents / 100 : basePriceUSDOrCents;

  if (language === 'uz') {
    const uzs = Math.round((usd * 10000) / 500) * 500;
    const formatted = uzs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} so'm`;
  }

  if (language === 'ru') {
    const rub = Math.round(usd * 80);
    const formatted = rub.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formatted} ₽`;
  }

  return `$${usd.toFixed(2)}`;
}

export function formatCurrency(cents: number, language: Language = 'en'): string {
  return formatPrice(cents, language, true);
}
