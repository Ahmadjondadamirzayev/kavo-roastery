import { useI18n } from '../i18n/I18nContext';

export function StorySection() {
  const { t } = useI18n();

  return (
    <section id="story" className="py-16 lg:py-20 bg-[#F2EFE9] border-t border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wide text-[#8B5A2B] mb-3">
            {t.story.kicker}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#171614] tracking-tight text-balance mb-4">
            {t.story.title}
          </h2>
          <p className="text-base text-[#57534E] leading-relaxed">
            {t.story.body}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#DFD8CC]">
          {t.story.pillars.map((pillar) => (
            <div key={pillar.title} className="space-y-2">
              <h3 className="text-base font-semibold text-[#171614]">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
