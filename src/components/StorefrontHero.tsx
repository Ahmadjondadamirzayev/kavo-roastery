import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { CoffeeImage } from './CoffeeImage';

interface StorefrontHeroProps {
  onExploreMenu: () => void;
  onReadStory: () => void;
}

export function StorefrontHero({ onExploreMenu, onReadStory }: StorefrontHeroProps) {
  const { t } = useI18n();

  const metrics = [
    { label: t.hero.metrics.lotsLabel, value: t.hero.metrics.lotsValue },
    { label: t.hero.metrics.roastLabel, value: t.hero.metrics.roastValue },
    { label: t.hero.metrics.extractionLabel, value: t.hero.metrics.extractionValue },
    { label: t.hero.metrics.waterLabel, value: t.hero.metrics.waterValue },
  ];

  return (
    <section className="border-b border-[#E5E0D8] bg-[#F8F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs font-medium tracking-wide text-[#8B5A2B] mb-4">
                {t.hero.kicker}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.05] tracking-tight text-[#171614] text-balance mb-6">
                {t.hero.title}
              </h1>
              <p className="text-base text-[#57534E] leading-relaxed max-w-lg mb-8">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreMenu}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C1917] text-[#F8F7F4] text-sm font-medium rounded-lg hover:bg-[#2E2926] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onReadStory}
                  className="px-5 py-3 text-sm font-medium text-[#171614] border border-[#D8D1C5] rounded-lg hover:bg-[#EDE9E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.hero.ctaSecondary}
                </button>
              </div>
            </div>

            <p className="mt-10 pt-6 border-t border-[#E5E0D8] text-xs text-[#78716C]">
              {t.hero.roasteryNote}
            </p>
          </motion.div>

          {/* Right Media Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 min-h-[300px] lg:min-h-[460px] rounded-xl overflow-hidden border border-[#E5E0D8] bg-[#EDE9E0]"
          >
            <CoffeeImage
              src="/src/assets/images/hero_coffee_roastery_1795267522937.jpg"
              alt={t.brand}
              className="w-full h-full lg:h-full object-cover"
            />
          </motion.div>
        </div>

        {/* Full-width 4-Column Extraction Specs Strip */}
        <div
          id="origins"
          className="mt-10 pt-8 border-t border-[#E5E0D8] grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-[#78716C] mb-1">{metric.label}</p>
              <p className="font-mono-tabular text-base sm:text-lg font-medium text-[#171614]">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
