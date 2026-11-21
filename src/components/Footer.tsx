import { useI18n } from '../i18n/I18nContext';

interface FooterProps {
  onNavigate: (path: string, sectionId?: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { t } = useI18n();

  return (
    <footer className="bg-[#1C1917] text-[#E7E2D8] border-t border-[#2E2926]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-[#2E2926]">
          <div>
            <p className="font-display text-2xl font-semibold text-[#F8F7F4] mb-2">
              {t.brand}
            </p>
            <p className="text-sm text-[#A8A29E] max-w-xs">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#A8A29E] mb-1">{t.footer.hoursLabel}</p>
            <p className="font-mono-tabular text-sm text-[#F8F7F4]">
              {t.footer.hoursValue}
            </p>
          </div>

          <div>
            <p className="text-xs text-[#A8A29E] mb-1">{t.footer.addressLabel}</p>
            <p className="text-sm text-[#F8F7F4]">{t.footer.addressValue}</p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#A8A29E]">
          <p>{t.footer.rights}</p>
          <div className="flex items-center gap-6">
            <a
              href="#menu"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/', 'menu');
              }}
              className="hover:text-[#F8F7F4] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.menu}
            </a>
            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
              }}
              className="hover:text-[#F8F7F4] transition-colors whitespace-nowrap shrink-0"
            >
              {t.nav.admin}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
