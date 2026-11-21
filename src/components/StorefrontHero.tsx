import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useI18n } from '../i18n/I18nContext';
import { COFFEE_MEDIA } from '../lib/coffeeImages';
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
    <section className="border-b border-[#241D19] bg-[#0B0908]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Editorial Column */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-between py-2"
          >
            <div>
              <p className="text-xs font-medium tracking-wide text-[#D4A373] mb-4">
                {t.hero.kicker}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.65rem] font-semibold leading-[1.04] tracking-tight text-[#FAF6F0] text-balance mb-6">
                {t.hero.title}
              </h1>
              <p className="text-base text-[#B8ABA0] leading-relaxed max-w-lg mb-8">
                {t.hero.subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onExploreMenu}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#D4A373] text-[#0B0908] text-sm font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{t.hero.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onReadStory}
                  className="px-5 py-3 text-sm font-medium text-[#FAF6F0] border border-[#2E251F] bg-[#161210] rounded-lg hover:border-[#D4A373] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {t.hero.ctaSecondary}
                </button>
              </div>
            </div>

            <p className="mt-10 pt-6 border-t border-[#241D19] text-xs text-[#9C8F84]">
              {t.hero.roasteryNote}
            </p>
          </motion.div>

          {/* Right Media Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative min-h-[320px] lg:min-h-[480px] rounded-xl overflow-hidden border border-[#2A221D] bg-[#161210]"
          >
            <CoffeeImage
              src={COFFEE_MEDIA.heroBar}
              alt={t.brand}
              className="w-full h-full lg:h-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0908]/60 via-transparent to-transparent" />
          </motion.div>
        </div>

        {/* Full-width 4-Column Extraction Specs Strip */}
        <div
          id="origins"
          className="mt-12 pt-8 border-t border-[#241D19] grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {metrics.map((metric) => (
            <div key={metric.label}>
              <p className="text-xs text-[#9C8F84] mb-1">{metric.label}</p>
              <p className="font-mono-tabular text-base sm:text-lg font-medium text-[#FAF6F0]">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
