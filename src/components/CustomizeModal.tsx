import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Minus, Plus, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import {
  calculateCustomizedUnitPriceCents,
  COFFEE_SIZES,
  formatCurrency,
  MILK_TYPES,
  ROAST_LEVELS,
  SUGAR_LEVELS,
  type CoffeeSize,
  type MilkType,
  type RoastLevel,
  type SugarLevel,
} from '../lib/pricing';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types/coffee';
import { CoffeeImage } from './CoffeeImage';

interface CustomizeModalProps {
  product: Product | null;
  onClose: () => void;
}

export function CustomizeModal({ product, onClose }: CustomizeModalProps) {
  const { language, t } = useI18n();
  const { addItem } = useCart();
  const { showToast } = useToast();

  const [size, setSize] = useState<CoffeeSize>('M');
  const [roastLevel, setRoastLevel] = useState<RoastLevel>('medium');
  const [milkType, setMilkType] = useState<MilkType>('whole');
  const [sugarLevel, setSugarLevel] = useState<SugarLevel>('0');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product) return;
    setSize(product.category === 'beans' ? 'S' : 'M');
    setRoastLevel('medium');
    setMilkType(product.category === 'brew' || product.category === 'beans' ? 'none' : 'whole');
    setSugarLevel('0');
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [product, onClose]);

  if (!product) return null;

  const isBeans = product.category === 'beans';
  const suffix = language === 'ru' ? 'Ru' : language === 'uz' ? 'Uz' : 'En';
  const name = String(product[`name${suffix}` as keyof Product] ?? product.nameEn);
  const description = String(product[`description${suffix}` as keyof Product] ?? product.descriptionEn);
  const origin = String(product[`origin${suffix}` as keyof Product] ?? product.originEn);
  const tasting = String(product[`tastingNotes${suffix}` as keyof Product] ?? product.tastingNotesEn);

  const effectiveMilk: MilkType = isBeans ? 'none' : milkType;
  const unitPriceCents = calculateCustomizedUnitPriceCents(
    product.basePriceCents,
    product.category,
    size,
    effectiveMilk,
  );
  const totalPriceCents = unitPriceCents * quantity;

  const handleAdd = () => {
    if (!product.inStock) return;
    addItem({
      product,
      size,
      roastLevel,
      milkType: effectiveMilk,
      sugarLevel: isBeans ? '0' : sugarLevel,
      quantity,
    });
    showToast(t.toasts.addedToCart);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="customize-modal-title"
          className="bg-[#F8F7F4] border border-[#E5E0D8] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <div className="grid grid-cols-1 sm:grid-cols-12">
            {/* Visual Summary Side */}
            <div className="sm:col-span-5 bg-white border-b sm:border-b-0 sm:border-r border-[#E5E0D8] p-5 flex flex-col justify-between">
              <div>
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-[#EDE9E0] mb-4">
                  <CoffeeImage
                    src={product.imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-[#8B5A2B] font-medium mb-1">
                  {t.modal.originLabel}: {origin}
                </p>
                <h3
                  id="customize-modal-title"
                  className="font-display text-2xl font-semibold text-[#171614] leading-tight mb-2"
                >
                  {name}
                </h3>
                <p className="text-xs text-[#57534E] leading-relaxed mb-4">
                  {description}
                </p>
              </div>
              <div className="pt-3 border-t border-[#E5E0D8]">
                <p className="text-xs text-[#78716C] mb-1">{t.modal.tastingLabel}</p>
                <p className="text-xs font-medium text-[#171614]">{tasting}</p>
              </div>
            </div>

            {/* Configuration Side */}
            <div className="sm:col-span-7 p-6 flex flex-col justify-between gap-5">
              <div className="flex items-center justify-between">
                <span className="font-mono-tabular text-lg font-semibold text-[#171614]">
                  {formatCurrency(unitPriceCents)}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-[#57534E] hover:text-[#171614] rounded-md hover:bg-[#EDE9E0] transition-colors cursor-pointer"
                  aria-label={t.modal.close}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Size Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#171614] mb-2">
                    {isBeans ? t.modal.bagWeightLabel : t.modal.sizeLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {COFFEE_SIZES.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSize(opt)}
                        className={`text-left px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          size === opt
                            ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                            : 'bg-white text-[#171614] border-[#E5E0D8] hover:border-[#B6ADA0]'
                        }`}
                      >
                        {isBeans ? t.modal.bagSizes[opt] : t.modal.sizes[opt]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Roast Level */}
                <div>
                  <label className="block text-xs font-semibold text-[#171614] mb-2">
                    {t.modal.roastLabel}
                  </label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {ROAST_LEVELS.map((roast) => (
                      <button
                        key={roast}
                        type="button"
                        onClick={() => setRoastLevel(roast)}
                        className={`text-left px-3 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          roastLevel === roast
                            ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                            : 'bg-white text-[#171614] border-[#E5E0D8] hover:border-[#B6ADA0]'
                        }`}
                      >
                        {t.modal.roasts[roast]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milk Alternative (for brewed coffee & espresso) */}
                {!isBeans && (
                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-2">
                      {t.modal.milkLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {MILK_TYPES.map((milk) => (
                        <button
                          key={milk}
                          type="button"
                          onClick={() => setMilkType(milk)}
                          className={`text-left px-3 py-2 text-xs font-medium rounded-lg border transition-colors truncate cursor-pointer ${
                            milkType === milk
                              ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                              : 'bg-white text-[#171614] border-[#E5E0D8] hover:border-[#B6ADA0]'
                          }`}
                        >
                          {t.modal.milks[milk]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugar Level */}
                {!isBeans && (
                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-2">
                      {t.modal.sugarLabel}
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SUGAR_LEVELS.map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setSugarLevel(lvl)}
                          className={`text-left px-3 py-2 text-xs font-medium rounded-lg border transition-colors truncate cursor-pointer ${
                            sugarLevel === lvl
                              ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                              : 'bg-white text-[#171614] border-[#E5E0D8] hover:border-[#B6ADA0]'
                          }`}
                        >
                          {t.modal.sugarLevels[lvl]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity & Add Action */}
              <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between gap-3">
                <div className="flex items-center border border-[#E5E0D8] bg-white rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-[#57534E] hover:text-[#171614] cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono-tabular px-3 text-sm font-medium text-[#171614]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="p-2.5 text-[#57534E] hover:text-[#171614] cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleAdd}
                  className="flex-1 py-3 px-4 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span>{product.inStock ? t.modal.addToOrder : t.modal.unavailable}</span>
                  <span className="font-mono-tabular text-[#D4A373]">
                    {formatCurrency(totalPriceCents)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
