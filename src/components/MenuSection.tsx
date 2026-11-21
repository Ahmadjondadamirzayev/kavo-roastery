import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { formatCurrency, type CoffeeCategory } from '../lib/pricing';
import type { Product } from '../types/coffee';
import { CoffeeImage } from './CoffeeImage';

interface MenuSectionProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onSelectProduct: (product: Product) => void;
}

type FilterCategory = 'all' | CoffeeCategory;

export function MenuSection({
  products,
  loading,
  error,
  onRetry,
  onSelectProduct,
}: MenuSectionProps) {
  const { language, t } = useI18n();
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { key: FilterCategory; label: string }[] = [
    { key: 'all', label: t.menu.categories.all },
    { key: 'hot', label: t.menu.categories.hot },
    { key: 'iced', label: t.menu.categories.iced },
    { key: 'brew', label: t.menu.categories.brew },
    { key: 'beans', label: t.menu.categories.beans },
  ];

  const getLocalizedField = (
    product: Product,
    field: 'name' | 'description' | 'origin' | 'tastingNotes',
  ) => {
    const suffix = language === 'ru' ? 'Ru' : language === 'uz' ? 'Uz' : 'En';
    const key = `${field}${suffix}` as keyof Product;
    return String(product[key] ?? '');
  };

  const getCategoryLabel = (category: CoffeeCategory) => t.menu.categories[category];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.nameEn,
        item.nameRu,
        item.nameUz,
        item.originEn,
        item.originRu,
        item.originUz,
        item.tastingNotesEn,
        item.tastingNotesRu,
        item.tastingNotesUz,
        item.descriptionEn,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <section id="menu" className="py-16 lg:py-20 bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#171614] tracking-tight mb-2">
              {t.menu.sectionTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#57534E]">
              {t.menu.sectionSubtitle}
            </p>
          </div>

          {/* Search Field */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.menu.searchPlaceholder}
              aria-label={t.menu.searchPlaceholder}
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#171614] placeholder:text-[#78716C] focus:outline-none focus:border-[#1C1917]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-[#171614] cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Segmented Filter Bar */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EDE9E0] rounded-lg border border-[#E5E0D8] overflow-x-auto mb-10 w-fit max-w-full">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-white text-[#171614] shadow-xs'
                  : 'text-[#57534E] hover:text-[#171614]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5E0D8] rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-[#EDE9E0]" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-2/5 bg-[#EDE9E0] rounded" />
                  <div className="h-5 w-3/4 bg-[#EDE9E0] rounded" />
                  <div className="h-4 w-full bg-[#EDE9E0] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-10 text-center">
            <p className="text-sm text-[#57534E] mb-4">{t.menu.loadError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="px-5 py-2.5 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors cursor-pointer"
            >
              {t.menu.retry}
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border border-[#E5E0D8] rounded-xl p-12 text-center">
            <p className="text-sm text-[#57534E] mb-4">{t.menu.emptySearch}</p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors cursor-pointer"
            >
              {t.menu.clearFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredProducts.map((product) => {
              const name = getLocalizedField(product, 'name');
              const description = getLocalizedField(product, 'description');
              const origin = getLocalizedField(product, 'origin');
              const tastingNotes = getLocalizedField(product, 'tastingNotes');

              return (
                <motion.article
                  key={product.id}
                  layout
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                  className="group bg-white border border-[#E5E0D8] rounded-xl overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="aspect-[4/3] bg-[#EDE9E0] overflow-hidden">
                      <CoffeeImage
                        src={product.imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="p-5">
                      {/* Clean unboxed metadata (Zero-pill discipline) */}
                      <div className="flex items-center justify-between gap-2 text-xs text-[#78716C] mb-1.5">
                        <span className="truncate">
                          {getCategoryLabel(product.category)} · {origin}
                        </span>
                        {product.featured && (
                          <span className="text-[#8B5A2B] font-medium shrink-0">
                            {t.menu.featured}
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold text-[#171614] leading-snug">
                          {name}
                        </h3>
                        <span className="font-mono-tabular text-[15px] font-medium text-[#171614] shrink-0">
                          {formatCurrency(product.basePriceCents)}
                        </span>
                      </div>

                      <p className="text-sm text-[#57534E] leading-relaxed line-clamp-2 mb-3">
                        {description}
                      </p>

                      <p className="text-xs text-[#78716C] truncate">
                        {tastingNotes}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    <button
                      type="button"
                      disabled={!product.inStock}
                      onClick={() => onSelectProduct(product)}
                      className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                        product.inStock
                          ? 'bg-[#1C1917] text-[#F8F7F4] hover:bg-[#2E2926] cursor-pointer'
                          : 'bg-[#EDE9E0] text-[#78716C] cursor-not-allowed'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{product.inStock ? t.menu.customize : t.menu.outOfStock}</span>
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
