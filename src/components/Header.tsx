import { ShoppingBag } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import type { Language } from '../i18n/translations';
import { useCart } from '../context/CartContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string, sectionId?: string) => void;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'uz', label: 'UZ' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
];

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const { language, setLanguage, t } = useI18n();
  const { itemCount, setIsOpen } = useCart();
  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 h-16 bg-[#F8F7F4]/95 backdrop-blur-sm border-b border-[#E5E0D8]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="font-display text-2xl font-semibold tracking-tight text-[#171614] whitespace-nowrap shrink-0"
        >
          {t.brand}
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          <a
            href="#menu"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/', 'menu');
            }}
            className="hover:text-[#171614] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.menu}
          </a>
          <a
            href="#origins"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/', 'origins');
            }}
            className="hover:text-[#171614] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.origins}
          </a>
          <a
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/', 'story');
            }}
            className="hover:text-[#171614] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            {t.nav.story}
          </a>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/admin');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 ${
              isAdminRoute ? 'text-[#171614] font-semibold underline' : 'hover:text-[#171614]'
            }`}
          >
            {t.nav.admin}
          </a>
        </nav>

        {/* Zone 3: Language Switcher + Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            role="group"
            aria-label="Language"
            className="flex items-center p-0.5 bg-[#EDE9E0] rounded-md border border-[#E5E0D8]"
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === lang.code
                    ? 'bg-white text-[#171614] shadow-xs'
                    : 'text-[#57534E] hover:text-[#171614]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {isAdminRoute ? (
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#F8F7F4] rounded-lg hover:bg-[#2E2926] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.nav.storefront}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#1C1917] text-[#F8F7F4] rounded-lg hover:bg-[#2E2926] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.nav.cart}</span>
              <span className="font-mono-tabular text-[#D4A373]">{itemCount}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
