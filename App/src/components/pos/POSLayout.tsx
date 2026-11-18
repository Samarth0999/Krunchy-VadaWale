import React, { useState } from 'react';
import { CategorySelector } from './CategorySelector';
import { MenuGrid } from './MenuGrid';
import { CartSidebar } from './CartSidebar';
import { CheckoutModal } from './CheckoutModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { usePOS } from '../../context/POSContext';
import { ShoppingBag, ArrowRight, X } from 'lucide-react';

export const POSLayout: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const { cartTotalQuantity, grandTotal, diningType, tableNumber, settings, setIsCheckoutModalOpen } = usePOS();
  const currency = settings.currencySymbol || '₹';

  // Windows Desktop / POS Terminal Quick Shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      // '/' or F2 focuses search
      if (!isInput && (e.key === '/' || e.key === 'F2')) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search catalog"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }

      // F4 or Ctrl+Enter triggers quick payment
      if ((e.key === 'F4' || (e.ctrlKey && e.key === 'Enter')) && cartTotalQuantity > 0) {
        e.preventDefault();
        setIsCheckoutModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartTotalQuantity, setIsCheckoutModalOpen]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-2 sm:gap-3.5 p-2 sm:p-3.5 min-h-0 overflow-hidden bg-zinc-950 relative">
      
      {/* Menu Catalog & Selection (Full width on mobile, Left column on desktop) */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <CategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <div className="flex-1 min-h-0 mt-1.5 sm:mt-2">
          <MenuGrid selectedCategory={selectedCategory} />
        </div>
      </div>

      {/* Desktop Right Column: Persistent Live Cart & Billing Engine */}
      <div className="hidden lg:flex w-full lg:w-[380px] xl:w-[420px] 2xl:w-[450px] shrink-0 flex-col min-h-0">
        <CartSidebar />
      </div>

      {/* Mobile Floating Cart Summary Action Pill (shown when cart has items) */}
      {cartTotalQuantity > 0 && !isMobileCartOpen && (
        <div className="lg:hidden shrink-0 pt-1.5 pb-0.5 animate-in slide-in-from-bottom duration-200">
          <button
            type="button"
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-zinc-950 font-bold py-2.5 px-3.5 rounded-xl shadow-lg flex items-center justify-between transition-transform active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-zinc-950 text-white text-xs px-2 py-0.5 rounded-full font-mono shrink-0">
                {cartTotalQuantity}
              </span>
              <span className="text-xs font-semibold text-zinc-950 truncate">
                {diningType === 'DINE_IN' ? `Table ${tableNumber || '?'}` : diningType}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs shrink-0">
              <span className="font-mono font-extrabold">{currency}{grandTotal.toFixed(2)}</span>
              <span className="bg-zinc-950/20 px-2 py-0.5 rounded-lg flex items-center gap-1 font-semibold">
                <span>View Cart</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Mobile Slide-Up Cart Sheet Drawer */}
      {isMobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-150">
          <div className="bg-zinc-950 border-t border-zinc-800 rounded-t-2xl max-h-[88dvh] h-[88dvh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold text-xs text-zinc-100">Live Order Cart ({cartTotalQuantity} items)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileCartOpen(false)}
                className="p-1 px-2.5 text-xs bg-zinc-800 text-zinc-300 rounded-lg font-medium hover:bg-zinc-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>Back to Menu</span>
              </button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <CartSidebar />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CheckoutModal />
      <ReceiptModal />
    </div>
  );
};
