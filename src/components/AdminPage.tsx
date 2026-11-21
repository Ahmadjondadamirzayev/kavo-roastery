import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Coffee,
  LogOut,
  Plus,
  Radio,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';
import {
  fetchAdminLoginLogs,
  fetchAdminOrders,
  fetchCatalogProducts,
  updateAdminOrderStatus,
} from '../lib/dataService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  COFFEE_CATEGORIES,
  formatPrice,
  ORDER_STATUSES,
  type CoffeeCategory,
  type OrderStatus,
} from '../lib/pricing';
import type { LoginLogRecord, OrderRecord, Product } from '../types/coffee';

interface AdminPageProps {
  onNavigate: (path: string) => void;
  onProductsChanged: () => void;
}

type AdminTab = 'orders' | 'catalog' | 'logs';

export function AdminPage({ onNavigate, onProductsChanged }: AdminPageProps) {
  const { language, t } = useI18n();
  const {
    authEmail,
    idToken,
    isAdmin,
    loading: authLoading,
    signingIn,
    authError,
    signInWithGoogle,
    logout,
    refreshToken,
  } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<LoginLogRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [loadingData, setLoadingData] = useState(false);
  const [streamConnected, setStreamConnected] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Add coffee form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameEn, setNewNameEn] = useState('');
  const [newNameRu, setNewNameRu] = useState('');
  const [newNameUz, setNewNameUz] = useState('');
  const [newDescriptionEn, setNewDescriptionEn] = useState('');
  const [newOriginEn, setNewOriginEn] = useState('');
  const [newTastingEn, setNewTastingEn] = useState('');
  const [newCategory, setNewCategory] = useState<CoffeeCategory>('hot');
  const [newPriceUsd, setNewPriceUsd] = useState('5.20');
  const [creatingProduct, setCreatingProduct] = useState(false);

  const timeGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.admin.greetings.morning;
    if (hour < 18) return t.admin.greetings.afternoon;
    return t.admin.greetings.evening;
  }, [t]);

  const fetchAdminData = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingData(true);
    try {
      const [ordersData, catalogData, logsData] = await Promise.all([
        fetchAdminOrders(idToken),
        fetchCatalogProducts(),
        fetchAdminLoginLogs(idToken),
      ]);
      setOrders(ordersData);
      setProducts(catalogData);
      setLogs(logsData);
    } catch (err) {
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [idToken, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, fetchAdminData]);

  // Real-time SSE connection for Express + Cloud SQL backend
  useEffect(() => {
    if (!isAdmin || !idToken || isSupabaseConfigured) {
      setStreamConnected(false);
      return;
    }

    const controller = new AbortController();
    let reconnectTimer: number | undefined;

    const connectStream = async () => {
      try {
        const response = await fetch('/api/admin/orders/stream', {
          headers: {
            Accept: 'text/event-stream',
            Authorization: `Bearer ${idToken}`,
          },
          signal: controller.signal,
        });

        if (response.status === 401) {
          await refreshToken();
          return;
        }
        if (!response.ok || !response.body) {
          throw new Error('SSE_CONNECT_FAILED');
        }

        setStreamConnected(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split('\n\n');
          buffer = blocks.pop() ?? '';

          for (const block of blocks) {
            if (!block.trim() || block.startsWith(':')) continue;
            const lines = block.split('\n');
            let eventName = 'message';
            let dataRaw = '';
            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventName = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                dataRaw += line.slice(5).trim();
              }
            }
            if (!dataRaw) continue;
            try {
              const payload = JSON.parse(dataRaw);
              if (eventName === 'order:created') {
                setOrders((prev) => {
                  if (prev.some((o) => o.id === payload.id)) return prev;
                  return [payload, ...prev];
                });
              } else if (eventName === 'order:updated') {
                setOrders((prev) =>
                  prev.map((o) => (o.id === payload.id ? payload : o)),
                );
              }
            } catch {
              // Ignore malformed SSE payload
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn('SSE stream interrupted, reconnecting:', err);
        setStreamConnected(false);
        reconnectTimer = window.setTimeout(connectStream, 4000);
      }
    };

    connectStream();

    return () => {
      controller.abort();
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      setStreamConnected(false);
    };
  }, [isAdmin, idToken, refreshToken]);

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const updated = await updateAdminOrderStatus(idToken, orderId, status);
      if (updated) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? updated : o)),
        );
        showToast(t.toasts.statusUpdated);
      }
    } catch {
      showToast(t.cart.validation.submitFailed, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleToggleStock = async (product: Product) => {
    if (!idToken) return;
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ inStock: !product.inStock }),
      });
      if (!response.ok) throw new Error('PRODUCT_UPDATE_FAILED');
      const data = await response.json();
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? data.product : p)),
      );
      onProductsChanged();
      showToast(t.toasts.productUpdated);
    } catch {
      showToast(t.menu.loadError, 'error');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken) return;
    const priceCents = Math.round(Number(newPriceUsd) * 100);
    if (!newNameEn.trim() || !newDescriptionEn.trim() || !Number.isFinite(priceCents) || priceCents < 100) {
      return;
    }
    setCreatingProduct(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          category: newCategory,
          nameEn: newNameEn.trim(),
          nameRu: newNameRu.trim() || newNameEn.trim(),
          nameUz: newNameUz.trim() || newNameEn.trim(),
          descriptionEn: newDescriptionEn.trim(),
          originEn: newOriginEn.trim() || 'Single Origin',
          tastingNotesEn: newTastingEn.trim() || 'Cacao · Caramel',
          basePriceCents: priceCents,
          inStock: true,
        }),
      });
      if (!response.ok) throw new Error('CREATE_FAILED');
      const data = await response.json();
      setProducts((prev) => [data.product, ...prev]);
      setNewNameEn('');
      setNewNameRu('');
      setNewNameUz('');
      setNewDescriptionEn('');
      setNewOriginEn('');
      setNewTastingEn('');
      setShowAddForm(false);
      onProductsChanged();
      showToast(t.toasts.productCreated);
    } catch {
      showToast(t.menu.loadError, 'error');
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    showToast(t.toasts.signedOut);
  };

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const kpis = useMemo(() => {
    const validOrders = orders.filter((o) => o.status !== 'cancelled');
    const revenueCents = validOrders.reduce((sum, o) => sum + o.totalCents, 0);
    const activeCount = orders.filter(
      (o) => o.status === 'pending' || o.status === 'brewing' || o.status === 'ready',
    ).length;
    const completedCount = orders.filter((o) => o.status === 'completed').length;
    return {
      revenueCents,
      activeCount,
      completedCount,
      logCount: logs.length,
    };
  }, [orders, logs]);

  const formatTimestamp = (iso: string) => {
    try {
      return new Intl.DateTimeFormat(
        language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US',
        {
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        },
      ).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  // 1. Auth Loading Gate
  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0B0908] flex items-center justify-center p-6">
        <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-8 max-w-md w-full text-center space-y-3">
          <Coffee className="w-8 h-8 text-[#D4A373] mx-auto" />
          <p className="text-sm font-medium text-[#FAF6F0]">{t.admin.verifyingAccess}</p>
        </div>
      </main>
    );
  }

  // 2. Unauthenticated Smart Greeting + Google OAuth Gate
  if (!authEmail) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0B0908] flex items-center justify-center p-6">
        <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-8 sm:p-10 max-w-lg w-full">
          <p className="text-xs font-medium text-[#D4A373] mb-2">{t.admin.consoleTitle}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#FAF6F0] text-balance mb-3">
            {timeGreeting}
          </h1>
          <p className="text-sm text-[#B8ABA0] leading-relaxed mb-8">
            {t.admin.loginPrompt}
          </p>

          {authError && (
            <div className="mb-5 p-3 bg-[#251212] border border-[#5C2424] rounded-lg text-xs text-[#FCA5A5]">
              {t.toasts.authError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              disabled={signingIn}
              onClick={signInWithGoogle}
              className="flex-1 inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-[#D4A373] text-[#0B0908] text-sm font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors disabled:opacity-60 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#0B0908"
                  d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.5 6.8 2.5 12S6.8 21.5 12 21.5c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.3H12z"
                />
              </svg>
              <span>{signingIn ? t.admin.signingIn : t.admin.signInGoogle}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-3 text-sm font-medium text-[#FAF6F0] border border-[#2A221D] rounded-lg hover:bg-[#241D19] transition-colors cursor-pointer"
            >
              {t.admin.backToStore}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authenticated Non-Admin Restriction Screen
  if (!isAdmin) {
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#0B0908] flex items-center justify-center p-6">
        <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-8 sm:p-10 max-w-lg w-full space-y-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-[#E09F5A] shrink-0 mt-0.5" />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#FAF6F0] mb-2">
                {t.admin.restrictedTitle}
              </h1>
              <p className="text-sm text-[#B8ABA0] leading-relaxed">
                {t.admin.restrictedBody}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#0B0908] border border-[#2A221D] rounded-lg text-xs text-[#B8ABA0] flex items-center justify-between gap-2">
            <span>{t.admin.signedInAs}</span>
            <span className="font-mono-tabular font-medium text-[#FAF6F0] truncate">
              {authEmail}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2.5 bg-[#D4A373] text-[#0B0908] text-xs font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors cursor-pointer"
            >
              {t.admin.switchAccount}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-4 py-2.5 border border-[#2A221D] text-xs font-medium text-[#FAF6F0] rounded-lg hover:bg-[#241D19] transition-colors cursor-pointer"
            >
              {t.admin.backToStore}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // 4. Verified Admin Dashboard
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#0B0908] py-8 text-[#FAF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Bar Contract for Console */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#241D19]">
          <div>
            <p className="text-xs text-[#9C8F84] mb-1">
              {t.admin.consoleTitle} · {authEmail}
            </p>
            <h1 className="font-display text-3xl font-semibold text-[#FAF6F0]">
              {timeGreeting}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#161210] border border-[#2A221D] rounded-lg text-xs font-medium text-[#FAF6F0]">
              <Radio
                className={`w-3.5 h-3.5 ${
                  streamConnected ? 'text-[#4ADE80]' : 'text-[#E09F5A]'
                }`}
              />
              <span>
                {streamConnected ? t.admin.orders.liveConnected : t.admin.orders.liveReconnecting}
              </span>
            </div>

            <button
              type="button"
              onClick={fetchAdminData}
              disabled={loadingData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#161210] border border-[#2A221D] rounded-lg text-xs font-medium text-[#FAF6F0] hover:border-[#D4A373] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin' : ''}`} />
              <span>{t.admin.orders.refresh}</span>
            </button>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4A373] text-[#0B0908] rounded-lg text-xs font-semibold hover:bg-[#E09F5A] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.admin.signOut}</span>
            </button>
          </div>
        </div>

        {/* KPI Summary Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-5">
            <p className="text-xs text-[#9C8F84] mb-2">{t.admin.kpis.revenue}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#E09F5A]">
              {formatPrice(kpis.revenueCents, language)}
            </p>
          </div>
          <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-5">
            <p className="text-xs text-[#9C8F84] mb-2">{t.admin.kpis.activeOrders}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#FAF6F0]">
              {kpis.activeCount}
            </p>
          </div>
          <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-5">
            <p className="text-xs text-[#9C8F84] mb-2">{t.admin.kpis.completedOrders}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#FAF6F0]">
              {kpis.completedCount}
            </p>
          </div>
          <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-5">
            <p className="text-xs text-[#9C8F84] mb-2">{t.admin.kpis.loginAttempts}</p>
            <p className="font-mono-tabular text-2xl font-semibold text-[#FAF6F0]">
              {kpis.logCount}
            </p>
          </div>
        </div>

        {/* Workspace Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#161210] border border-[#2A221D] rounded-lg w-fit max-w-full overflow-x-auto">
          {(
            [
              { key: 'orders', label: t.admin.tabs.orders },
              { key: 'catalog', label: t.admin.tabs.catalog },
              { key: 'logs', label: t.admin.tabs.logs },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#D4A373] text-[#0B0908] font-semibold'
                  : 'text-[#B8ABA0] hover:text-[#FAF6F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: LIVE ORDER FEED */}
        {activeTab === 'orders' && (
          <section className="space-y-4">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-[#D4A373] text-[#0B0908] border-[#D4A373] font-semibold'
                    : 'bg-[#161210] text-[#B8ABA0] border-[#2A221D] hover:text-[#FAF6F0]'
                }`}
              >
                {t.admin.orders.filterAll}
              </button>
              {ORDER_STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#D4A373] text-[#0B0908] border-[#D4A373] font-semibold'
                      : 'bg-[#161210] text-[#B8ABA0] border-[#2A221D] hover:text-[#FAF6F0]'
                  }`}
                >
                  {t.admin.orders.statuses[st]}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-12 text-center text-sm text-[#B8ABA0]">
                {t.admin.orders.empty}
              </div>
            ) : (
              <div className="bg-[#161210] border border-[#2A221D] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2A221D] bg-[#120E0C] text-xs font-medium text-[#9C8F84]">
                        <th className="py-3 px-4">{t.admin.orders.orderCol}</th>
                        <th className="py-3 px-4">{t.admin.orders.customerCol}</th>
                        <th className="py-3 px-4">{t.admin.orders.locationCol}</th>
                        <th className="py-3 px-4">{t.admin.orders.itemsCol}</th>
                        <th className="py-3 px-4 text-right">{t.admin.orders.totalCol}</th>
                        <th className="py-3 px-4">{t.admin.orders.timeCol}</th>
                        <th className="py-3 px-4">{t.admin.orders.statusCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241D19] text-sm">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-[#1B1613] align-top">
                          <td className="py-3.5 px-4 font-mono-tabular text-xs font-semibold text-[#D4A373] whitespace-nowrap">
                            {order.orderNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-medium text-[#FAF6F0]">{order.customerName}</p>
                            <p className="font-mono-tabular text-xs text-[#9C8F84]">
                              {order.customerPhone}
                            </p>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#B8ABA0]">
                            <p className="font-medium text-[#FAF6F0]">
                              {order.deliveryType === 'table'
                                ? t.admin.orders.tablePrefix
                                : t.admin.orders.deliveryPrefix}
                              : {order.tableOrAddress}
                            </p>
                            {order.notes && (
                              <p className="text-[#9C8F84] mt-1 max-w-xs">{order.notes}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#FAF6F0] space-y-1 min-w-[220px]">
                            {order.items.map((item) => (
                              <div key={item.id}>
                                <span className="font-medium">
                                  {item.quantity}× {item.productName}
                                </span>{' '}
                                <span className="text-[#9C8F84]">
                                  ({item.size} · {item.roastLevel} · {item.milkType} · {item.sugarLevel}%)
                                </span>
                              </div>
                            ))}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular text-xs font-semibold text-[#E09F5A] whitespace-nowrap">
                            {formatPrice(order.totalCents, language)}
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular text-xs text-[#9C8F84] whitespace-nowrap">
                            {formatTimestamp(order.createdAt)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <select
                              aria-label={`${t.admin.orders.statusCol} ${order.orderNumber}`}
                              value={order.status}
                              disabled={updatingOrderId === order.id}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              className={`px-2.5 py-1.5 text-xs font-medium rounded-md border bg-[#0B0908] focus:outline-none cursor-pointer ${
                                order.status === 'completed'
                                  ? 'border-[#22C55E] text-[#4ADE80]'
                                  : order.status === 'cancelled'
                                    ? 'border-[#EF4444] text-[#F87171]'
                                    : order.status === 'ready'
                                      ? 'border-[#D4A373] text-[#D4A373]'
                                      : 'border-[#2A221D] text-[#FAF6F0]'
                              }`}
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {t.admin.orders.statuses[st]}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 2: COFFEE CATALOG MANAGER */}
        {activeTab === 'catalog' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#FAF6F0]">
                {t.admin.tabs.catalog}
              </h2>
              {idToken && !isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={() => setShowAddForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#D4A373] text-[#0B0908] text-xs font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.admin.catalog.addButton}</span>
                </button>
              )}
            </div>

            {showAddForm && (
              <form
                onSubmit={handleCreateProduct}
                className="bg-[#161210] border border-[#2A221D] rounded-xl p-6 space-y-4"
              >
                <h3 className="text-sm font-semibold text-[#FAF6F0]">
                  {t.admin.catalog.addTitle}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.nameEn}
                    </label>
                    <input
                      type="text"
                      required
                      value={newNameEn}
                      onChange={(e) => setNewNameEn(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.nameRu}
                    </label>
                    <input
                      type="text"
                      value={newNameRu}
                      onChange={(e) => setNewNameRu(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.nameUz}
                    </label>
                    <input
                      type="text"
                      value={newNameUz}
                      onChange={(e) => setNewNameUz(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.category}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as CoffeeCategory)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    >
                      {COFFEE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {t.menu.categories[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.originEn}
                    </label>
                    <input
                      type="text"
                      value={newOriginEn}
                      onChange={(e) => setNewOriginEn(e.target.value)}
                      placeholder="Ethiopia Sidamo"
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.priceUsd} (USD)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="1"
                      required
                      value={newPriceUsd}
                      onChange={(e) => setNewPriceUsd(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0] font-mono-tabular"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.descriptionEn}
                    </label>
                    <input
                      type="text"
                      required
                      value={newDescriptionEn}
                      onChange={(e) => setNewDescriptionEn(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#B8ABA0] mb-1">
                      {t.admin.catalog.tastingNotesEn}
                    </label>
                    <input
                      type="text"
                      value={newTastingEn}
                      onChange={(e) => setNewTastingEn(e.target.value)}
                      placeholder="Bergamot · Dark Chocolate"
                      className="w-full px-3 py-2 bg-[#0B0908] border border-[#2A221D] rounded-lg text-sm text-[#FAF6F0]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={creatingProduct}
                    className="px-5 py-2.5 bg-[#D4A373] text-[#0B0908] text-xs font-semibold rounded-lg hover:bg-[#E09F5A] transition-colors cursor-pointer"
                  >
                    {creatingProduct ? t.admin.catalog.creating : t.admin.catalog.createProduct}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-[#161210] border border-[#2A221D] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#2A221D] bg-[#120E0C] text-xs font-medium text-[#9C8F84]">
                      <th className="py-3 px-4">{t.admin.catalog.nameEn}</th>
                      <th className="py-3 px-4">{t.admin.catalog.category}</th>
                      <th className="py-3 px-4">{t.admin.catalog.originEn}</th>
                      <th className="py-3 px-4 text-right">{t.admin.catalog.priceUsd}</th>
                      <th className="py-3 px-4 text-right">{t.admin.catalog.toggleStock}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#241D19] text-sm">
                    {products.map((p) => {
                      const suffix = language === 'ru' ? 'Ru' : language === 'uz' ? 'Uz' : 'En';
                      const localName = String(p[`name${suffix}` as keyof Product] ?? p.nameEn);
                      return (
                        <tr key={p.id} className="hover:bg-[#1B1613]">
                          <td className="py-3 px-4 font-medium text-[#FAF6F0]">{localName}</td>
                          <td className="py-3 px-4 text-xs text-[#B8ABA0]">
                            {t.menu.categories[p.category]}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#9C8F84]">{p.originEn}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular text-xs font-medium text-[#E09F5A]">
                            {formatPrice(p.basePriceCents, language)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleToggleStock(p)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                                p.inStock
                                  ? 'border-[#22C55E] text-[#4ADE80] bg-[#0B0908]'
                                  : 'border-[#2A221D] text-[#9C8F84] bg-[#0B0908]'
                              }`}
                            >
                              {p.inStock ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              <span>{p.inStock ? t.admin.catalog.inStock : t.admin.catalog.paused}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: LOGIN AUDIT LOGS */}
        {activeTab === 'logs' && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#FAF6F0]">
              {t.admin.logs.title}
            </h2>

            {logs.length === 0 ? (
              <div className="bg-[#161210] border border-[#2A221D] rounded-xl p-10 text-center text-sm text-[#B8ABA0]">
                {t.admin.logs.empty}
              </div>
            ) : (
              <div className="bg-[#161210] border border-[#2A221D] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#2A221D] bg-[#120E0C] text-xs font-medium text-[#9C8F84]">
                        <th className="py-3 px-4">{t.admin.logs.emailCol}</th>
                        <th className="py-3 px-4">{t.admin.logs.nameCol}</th>
                        <th className="py-3 px-4">{t.admin.logs.statusCol}</th>
                        <th className="py-3 px-4 text-right">{t.admin.logs.timeCol}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#241D19] text-sm">
                      {logs.map((entry) => (
                        <tr key={entry.id} className="hover:bg-[#1B1613]">
                          <td className="py-3 px-4 font-mono-tabular text-xs text-[#FAF6F0]">
                            {entry.email}
                          </td>
                          <td className="py-3 px-4 text-xs text-[#B8ABA0]">
                            {entry.displayName || '—'}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium">
                            {entry.status === 'granted' ? (
                              <span className="inline-flex items-center gap-1.5 text-[#4ADE80]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>{t.admin.logs.granted}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[#E09F5A]">
                                <XCircle className="w-3.5 h-3.5" />
                                <span>{t.admin.logs.denied}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono-tabular text-xs text-[#9C8F84] whitespace-nowrap">
                            {formatTimestamp(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
