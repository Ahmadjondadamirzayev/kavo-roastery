import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { formatCurrency, type DeliveryType } from '../lib/pricing';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { OrderRecord, Product } from '../types/coffee';

type DrawerView = 'bag' | 'checkout' | 'confirmed';

export function CartDrawer() {
  const { language, t } = useI18n();
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, clearCart, totalCents } = useCart();
  const { showToast } = useToast();

  const [view, setView] = useState<DrawerView>('bag');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('table');
  const [tableOrAddress, setTableOrAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (!isOpen && view === 'confirmed') {
      setView('bag');
      setConfirmedOrder(null);
    }
  }, [isOpen, view]);

  const getProductName = (product: Product) => {
    const suffix = language === 'ru' ? 'Ru' : language === 'uz' ? 'Uz' : 'En';
    return String(product[`name${suffix}` as keyof Product] ?? product.nameEn);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (customerName.trim().length < 2) {
      setFormError(t.cart.validation.nameRequired);
      return;
    }
    if (customerPhone.trim().length < 6) {
      setFormError(t.cart.validation.phoneRequired);
      return;
    }
    if (tableOrAddress.trim().length < 1) {
      setFormError(t.cart.validation.locationRequired);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          deliveryType,
          tableOrAddress: tableOrAddress.trim(),
          notes: notes.trim(),
          language,
          items: items.map((item) => ({
            productId: item.product.id,
            size: item.size,
            roastLevel: item.roastLevel,
            milkType: item.milkType,
            sugarLevel: item.sugarLevel,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ORDER_FAILED');
      }

      setConfirmedOrder(data.order);
      clearCart();
      setCustomerName('');
      setCustomerPhone('');
      setTableOrAddress('');
      setNotes('');
      setView('confirmed');
      showToast(t.toasts.orderPlaced);
    } catch {
      setFormError(t.cart.validation.submitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]">
          <div className="flex-1" onClick={() => setIsOpen(false)} />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={t.cart.title}
            className="w-full max-w-md bg-[#F8F7F4] border-l border-[#E5E0D8] h-full flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-[#E5E0D8] flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#171614]">
                {view === 'checkout'
                  ? t.cart.checkoutTitle
                  : view === 'confirmed'
                    ? t.cart.confirmationTitle
                    : t.cart.title}
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-[#57534E] hover:text-[#171614] rounded-md hover:bg-[#EDE9E0] transition-colors cursor-pointer"
                aria-label={t.modal.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {view === 'confirmed' && confirmedOrder ? (
                <div className="bg-white border border-[#E5E0D8] rounded-xl p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-base font-semibold text-[#171614]">
                        {t.cart.confirmationTitle}
                      </h3>
                      <p className="text-sm text-[#57534E] mt-1">
                        {t.cart.confirmationSubtitle}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-between">
                    <span className="text-xs text-[#78716C]">{t.cart.orderNumberLabel}</span>
                    <span className="font-mono-tabular text-sm font-semibold text-[#171614]">
                      {confirmedOrder.orderNumber}
                    </span>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#E5E0D8]">
                    {confirmedOrder.items.map((item) => (
                      <div key={item.id} className="flex items-baseline justify-between text-xs">
                        <span className="text-[#171614]">
                          {item.quantity}× {item.productName} ({item.size})
                        </span>
                        <span className="font-mono-tabular text-[#57534E]">
                          {formatCurrency(item.lineTotalCents)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-[#E5E0D8] flex items-center justify-between text-sm font-semibold">
                    <span>{t.cart.total}</span>
                    <span className="font-mono-tabular">{formatCurrency(confirmedOrder.totalCents)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedOrder(null);
                      setView('bag');
                      setIsOpen(false);
                    }}
                    className="w-full py-3 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors cursor-pointer"
                  >
                    {t.cart.newOrder}
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 py-12">
                  <ShoppingBag className="w-10 h-10 text-[#8B5A2B] mb-4" strokeWidth={1.4} />
                  <h3 className="font-display text-2xl font-semibold text-[#171614] mb-2">
                    {t.cart.emptyTitle}
                  </h3>
                  <p className="text-sm text-[#57534E] mb-6 max-w-xs">
                    {t.cart.emptyBody}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors cursor-pointer"
                  >
                    {t.cart.browseMenu}
                  </button>
                </div>
              ) : view === 'bag' ? (
                <div className="space-y-4">
                  {items.map((item) => {
                    const isBeans = item.product.category === 'beans';
                    const sizeDisplay = isBeans
                      ? t.modal.bagSizes[item.size]
                      : item.size;
                    return (
                      <div
                        key={item.key}
                        className="bg-white border border-[#E5E0D8] rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h3 className="text-sm font-semibold text-[#171614]">
                              {getProductName(item.product)}
                            </h3>
                            <p className="text-xs text-[#78716C] mt-1">
                              {sizeDisplay} · {t.modal.roasts[item.roastLevel]}
                              {!isBeans && ` · ${t.modal.milks[item.milkType]} · ${item.sugarLevel}%`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="p-1 text-[#78716C] hover:text-[#B91C1C] transition-colors cursor-pointer"
                            aria-label={t.cart.remove}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-[#F0ECE4]">
                          <div className="flex items-center border border-[#E5E0D8] rounded-md">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, -1)}
                              className="p-1.5 text-[#57534E] hover:text-[#171614] cursor-pointer"
                              aria-label="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono-tabular px-2.5 text-xs font-medium">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, 1)}
                              className="p-1.5 text-[#57534E] hover:text-[#171614] cursor-pointer"
                              aria-label="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono-tabular text-sm font-semibold text-[#171614]">
                            {formatCurrency(item.unitPriceCents * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleSubmitOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-1.5">
                      {t.cart.customerName}
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t.cart.customerNamePlaceholder}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#171614] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-1.5">
                      {t.cart.customerPhone}
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder={t.cart.customerPhonePlaceholder}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#171614] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-1.5">
                      {t.cart.serviceMode}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('table')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          deliveryType === 'table'
                            ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                            : 'bg-white text-[#171614] border-[#E5E0D8]'
                        }`}
                      >
                        {t.cart.modeTable}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`py-2.5 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                          deliveryType === 'delivery'
                            ? 'bg-[#1C1917] text-[#F8F7F4] border-[#1C1917]'
                            : 'bg-white text-[#171614] border-[#E5E0D8]'
                        }`}
                      >
                        {t.cart.modeDelivery}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-1.5">
                      {deliveryType === 'table' ? t.cart.tableNumber : t.cart.deliveryAddress}
                    </label>
                    <input
                      type="text"
                      value={tableOrAddress}
                      onChange={(e) => setTableOrAddress(e.target.value)}
                      placeholder={
                        deliveryType === 'table'
                          ? t.cart.tablePlaceholder
                          : t.cart.addressPlaceholder
                      }
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#171614] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#171614] mb-1.5">
                      {t.cart.notesLabel}
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t.cart.notesPlaceholder}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E5E0D8] rounded-lg text-sm text-[#171614] focus:outline-none focus:border-[#1C1917]"
                    />
                  </div>

                  {formError && (
                    <div className="p-3 bg-[#FFF5F5] border border-[#F2C6C6] rounded-lg text-xs text-[#9B1C1C]">
                      {formError}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer Totals & Actions */}
            {items.length > 0 && view !== 'confirmed' && (
              <div className="p-6 bg-white border-t border-[#E5E0D8] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#57534E]">{t.cart.total}</span>
                  <span className="font-mono-tabular text-lg font-semibold text-[#171614]">
                    {formatCurrency(totalCents)}
                  </span>
                </div>

                {view === 'bag' ? (
                  <button
                    type="button"
                    onClick={() => setView('checkout')}
                    className="w-full py-3 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors cursor-pointer"
                  >
                    {t.cart.proceedCheckout}
                  </button>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setView('bag')}
                      className="px-4 py-3 text-xs font-medium text-[#171614] border border-[#E5E0D8] rounded-lg hover:bg-[#EDE9E0] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t.cart.backToBag}
                    </button>
                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={submitting}
                      className="flex-1 py-3 bg-[#1C1917] text-[#F8F7F4] text-xs font-medium rounded-lg hover:bg-[#2E2926] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {submitting ? t.cart.submitting : t.cart.placeOrder}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
