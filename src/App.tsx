import { useCallback, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { I18nProvider } from './i18n/I18nContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { StorefrontHero } from './components/StorefrontHero';
import { MenuSection } from './components/MenuSection';
import { StorySection } from './components/StorySection';
import { Footer } from './components/Footer';
import { CustomizeModal } from './components/CustomizeModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPage } from './components/AdminPage';
import type { Product } from './types/coffee';

function CoffeeShopApp() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('MENU_LOAD_FAILED');
      }
      const data = await response.json();
      setProducts(data.products ?? []);
    } catch {
      setProductsError('MENU_LOAD_FAILED');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleNavigate = useCallback((path: string, sectionId?: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#171614]">
      <Header currentPath={currentPath} onNavigate={handleNavigate} />

      {isAdminRoute ? (
        <AdminPage onNavigate={handleNavigate} onProductsChanged={loadProducts} />
      ) : (
        <main className="flex-1">
          <StorefrontHero
            onExploreMenu={() => handleNavigate('/', 'menu')}
            onReadStory={() => handleNavigate('/', 'story')}
          />
          <MenuSection
            products={products}
            loading={loadingProducts}
            error={productsError}
            onRetry={loadProducts}
            onSelectProduct={setSelectedProduct}
          />
          <StorySection />
        </main>
      )}

      {!isAdminRoute && <Footer onNavigate={handleNavigate} />}

      <CustomizeModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CoffeeShopApp />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
