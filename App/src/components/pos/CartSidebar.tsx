import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomerLookupBanner } from './CustomerLookupBanner';
import { TablePickerModal } from '../tables/TablePickerModal';
import { 
  Trash2, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  ShoppingBag, 
  Truck, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Clock,
  Save,
  RotateCcw
} from 'lucide-react';

export const CartSidebar: React.FC = () => {
  const { 
    cart, 
    diningType, 
    setDiningType, 
    tableNumber, 
    activeTableId,
    activeTable,
    selectTable,
    saveActiveTableOrder,
    releaseTable,
    updateQuantity, 
    removeFromCart, 
    updateItemNotes,
    clearCart, 
    subtotal, 
    pointsDiscountValue,
    pointsToRedeem,
    taxAmount, 
    grandTotal, 
    potentialPointsEarned,
    settings,
    setIsCheckoutModalOpen,
    selectedCustomer
  } = usePOS();

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [guestCountInput, setGuestCountInput] = useState<number>(2);

  const handleOpenNote = (productId: string, currentNote = '') => {
    setEditingNoteId(productId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = (productId: string) => {
    updateItemNotes(productId, noteText.trim());
    setEditingNoteId(null);
    setNoteText('');
  };

  const handleSaveRunningOrder = async () => {
    if (!activeTableId) {
      setIsTablePickerOpen(true);
      return;
    }
    await saveActiveTableOrder(guestCountInput);
  };

  const currency = settings.currencySymbol || '₹';

  // Compute seated minutes
  const seatedMins = activeTable?.seatedAt 
    ? Math.floor((Date.now() - new Date(activeTable.seatedAt).getTime()) / 60000)
    : null;

  return (
    <div className="bg-dark-900 border border-white/[0.08] rounded-2xl flex flex-col h-full shadow-surface overflow-hidden">
      
      {/* Top: Dining Mode Switcher */}
      <div className="p-3.5 border-b border-white/[0.08] bg-dark-950/70 space-y-2.5">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-dark-900 rounded-xl border border-white/[0.06] shadow-inner">
          <button
            type="button"
            onClick={() => setDiningType('DINE_IN')}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
              diningType === 'DINE_IN' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine-In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDiningType('TAKEAWAY');
              selectTable(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
              diningType === 'TAKEAWAY' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDiningType('DELIVERY');
              selectTable(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all ${
              diningType === 'DELIVERY' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Table Selector Banner if Dine-In */}
        {diningType === 'DINE_IN' && (
          <div className="bg-dark-900 p-2.5 rounded-xl border border-white/[0.08] flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-sm shrink-0 border border-orange-500/20">
                🪑
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs text-white truncate">{tableNumber || 'No Table'}</span>
                  {activeTable && (
                    <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                      activeTable.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {activeTable.status}
                    </span>
                  )}
                </div>
                {seatedMins !== null && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-400" />
                    Seated {seatedMins}m ago
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setIsTablePickerOpen(true)}
                className="px-2.5 py-1 bg-dark-850 hover:bg-dark-800 text-slate-200 text-[11px] font-bold rounded-lg border border-white/[0.08] transition-colors"
              >
                Change Table
              </button>
              {activeTableId && (
                <button
                  type="button"
                  onClick={() => releaseTable(activeTableId)}
                  title="Clear / Release Table"
                  className="p-1 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-dark-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Lookup & Loyalty Section */}
      <div className="p-3.5 pb-0">
        <CustomerLookupBanner />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-1 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-bold text-slate-400">Order is currently empty</p>
            <p className="text-[11px] text-slate-600 text-center mt-1">
              Select dishes from the catalog to build bill
            </p>
          </div>
        ) : (
          cart.map(item => (
            <div 
              key={item.product.id}
              className="bg-dark-950/70 border border-white/[0.06] rounded-xl p-2.5 flex flex-col gap-1.5 shadow-sm hover:border-white/[0.1] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="font-bold text-xs text-white truncate">{item.product.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono tabular-nums mt-0.5">
                    {currency}{item.product.price} × {item.quantity} = <span className="text-white font-bold">{currency}{item.product.price * item.quantity}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-dark-900 border border-white/[0.08] rounded-xl p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <span className="text-xs font-extrabold font-mono tabular-nums px-1.5 text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                  >
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {/* Item Note or Add Note Trigger */}
              <div className="flex items-center justify-between text-[11px]">
                {editingNoteId === item.product.id ? (
                  <div className="flex items-center gap-1 w-full mt-1">
                    <input
                      type="text"
                      autoFocus
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Special instructions (e.g. no mayo, extra spicy)..."
                      className="flex-1 bg-dark-900 border border-white/[0.1] rounded-lg px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item.product.id)}
                      className="px-2 py-0.5 bg-orange-500 text-white rounded font-bold text-[10px]"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="px-1 text-slate-400 hover:text-white text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenNote(item.product.id, item.notes)}
                      className="text-slate-400 hover:text-orange-400 flex items-center gap-1 text-[10px] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>{item.notes ? `Note: "${item.notes}"` : '+ Add note'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Calculations Breakdown */}
      <div className="p-3.5 border-t border-white/[0.08] bg-dark-950/80 space-y-1.5 text-xs shadow-inner">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal:</span>
          <span className="font-mono tabular-nums text-slate-200">{currency}{subtotal.toFixed(2)}</span>
        </div>

        {pointsDiscountValue > 0 && (
          <div className="flex justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Loyalty Discount ({pointsToRedeem} pts):
            </span>
            <span className="font-mono tabular-nums">-{currency}{pointsDiscountValue.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>{settings.taxName || 'GST'} ({settings.taxRate}%):</span>
          <span className="font-mono tabular-nums text-slate-200">{currency}{taxAmount.toFixed(2)}</span>
        </div>

        {selectedCustomer && potentialPointsEarned > 0 && (
          <div className="flex justify-between text-amber-400 text-[11px] font-semibold pt-0.5">
            <span>Points Customer Will Earn:</span>
            <span className="font-mono font-bold">+{potentialPointsEarned} pts</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-2 border-t border-white/[0.08] flex items-baseline justify-between">
          <div>
            <span className="font-extrabold text-sm text-white">Grand Total</span>
            <span className="text-[10px] text-slate-500 block">All taxes included</span>
          </div>
          <span className="text-2xl font-extrabold text-orange-400 font-mono tracking-tight tabular-nums drop-shadow-sm">
            {currency}{grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          
          {/* Quick Save Table Order button if Dine-In */}
          {diningType === 'DINE_IN' && cart.length > 0 && (
            <button
              type="button"
              onClick={handleSaveRunningOrder}
              className="w-full bg-dark-850 hover:bg-dark-800 text-amber-400 border border-amber-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Table Order / KOT ({tableNumber})</span>
            </button>
          )}

          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                if (window.confirm("Clear all items from the current cart?")) {
                  clearCart();
                }
              }}
              className="col-span-1 bg-dark-850 hover:bg-dark-800 disabled:opacity-40 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors border border-white/[0.06]"
            >
              Clear
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="col-span-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
            >
              <span>Proceed to Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Table Picker Floor Modal */}
      <TablePickerModal
        isOpen={isTablePickerOpen}
        onClose={() => setIsTablePickerOpen(false)}
        onSelectTable={(id) => selectTable(id)}
      />

    </div>
  );
};
