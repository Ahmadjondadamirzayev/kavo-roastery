import { useI18n } from '../i18n/I18nContext';

export function StorySection() {
  const { t } = useI18n();

  return (
    <section id="story" className="py-16 lg:py-24 bg-[#120E0C] border-t border-[#241D19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wide text-[#D4A373] mb-3">
            {t.story.kicker}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAF6F0] tracking-tight text-balance mb-4">
            {t.story.title}
          </h2>
          <p className="text-base text-[#B8ABA0] leading-relaxed">
            {t.story.body}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#2A221D]">
          {t.story.pillars.map((pillar) => (
            <div key={pillar.title} className="space-y-2">
              <h3 className="text-base font-semibold text-[#FAF6F0]">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#B8ABA0] leading-relaxed">
                {pillar.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
