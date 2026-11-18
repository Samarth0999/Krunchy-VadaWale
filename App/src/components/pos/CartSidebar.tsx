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

  const seatedMins = activeTable?.seatedAt 
    ? Math.floor((Date.now() - new Date(activeTable.seatedAt).getTime()) / 60000)
    : null;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl flex flex-col h-full overflow-hidden">
      
      {/* Top: Dining Mode Switcher */}
      <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/40 space-y-2">
        <div className="grid grid-cols-3 gap-1 p-0.5 bg-zinc-950 border border-zinc-800/80 rounded-lg">
          <button
            type="button"
            onClick={() => setDiningType('DINE_IN')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              diningType === 'DINE_IN' 
                ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200'
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
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              diningType === 'TAKEAWAY' 
                ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                : 'text-slate-400 hover:text-zinc-200'
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
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              diningType === 'DELIVERY' 
                ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Minimal Table Selector Bar if Dine-In */}
        {diningType === 'DINE_IN' && (
          <div className="bg-zinc-950/70 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-zinc-400 text-[11px]">Table:</span>
              <span className="font-semibold text-zinc-100 truncate">{tableNumber || 'None'}</span>
              {activeTable && (
                <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono ${
                  activeTable.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                }`}>
                  {activeTable.status}
                </span>
              )}
              {seatedMins !== null && (
                <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                  ({seatedMins}m)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsTablePickerOpen(true)}
                className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] rounded transition-colors"
              >
                Change
              </button>
              {activeTableId && (
                <button
                  type="button"
                  onClick={() => releaseTable(activeTableId)}
                  title="Clear Table"
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Lookup & Loyalty */}
      <div className="p-3 pb-0">
        <CustomerLookupBanner />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
            <ShoppingBag className="w-8 h-8 mb-2 opacity-30 text-zinc-600" />
            <p className="text-xs">Order is empty</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">Select menu items to begin</p>
          </div>
        ) : (
          cart.map(item => (
            <div 
              key={item.product.id}
              className="bg-zinc-950/50 border border-zinc-800/60 rounded-lg p-2 flex flex-col gap-1 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="font-medium text-xs text-zinc-100 truncate">{item.product.name}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                    {currency}{item.product.price} × {item.quantity} = <span className="text-zinc-200 font-semibold">{currency}{item.product.price * item.quantity}</span>
                  </div>
                </div>

                {/* Minimal Quantity Controls */}
                <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-4 h-4 flex items-center justify-center text-zinc-400 hover:text-white rounded"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-mono font-medium px-1 text-zinc-200">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-4 h-4 flex items-center justify-center text-zinc-400 hover:text-white rounded"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Note input/display */}
              <div className="flex items-center justify-between text-[10px]">
                {editingNoteId === item.product.id ? (
                  <div className="flex items-center gap-1 w-full mt-0.5">
                    <input
                      type="text"
                      autoFocus
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Special instructions..."
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-zinc-200 focus:outline-none focus:border-zinc-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item.product.id)}
                      className="px-1.5 py-0.5 bg-zinc-200 text-zinc-900 rounded font-medium"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNoteId(null)}
                      className="px-1 text-zinc-500 hover:text-zinc-300"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleOpenNote(item.product.id, item.notes)}
                      className="text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>{item.notes ? `"${item.notes}"` : '+ note'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bill Calculation Breakdown */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 space-y-1 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span className="font-mono text-zinc-200">{currency}{subtotal.toFixed(2)}</span>
        </div>

        {pointsDiscountValue > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Points Discount ({pointsToRedeem} pts)</span>
            <span className="font-mono">-{currency}{pointsDiscountValue.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-zinc-400">
          <span>{settings.taxName || 'GST'} ({settings.taxRate}%)</span>
          <span className="font-mono text-zinc-200">{currency}{taxAmount.toFixed(2)}</span>
        </div>

        {selectedCustomer && potentialPointsEarned > 0 && (
          <div className="flex justify-between text-zinc-400 text-[11px]">
            <span>Earns</span>
            <span className="font-mono text-amber-400">+{potentialPointsEarned} pts</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-2 border-t border-zinc-800 flex items-baseline justify-between">
          <span className="font-medium text-xs text-zinc-300">Total</span>
          <span className="text-xl font-bold text-zinc-100 font-mono tracking-tight">
            {currency}{grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Minimalist Action Buttons */}
        <div className="space-y-1.5 pt-2">
          
          {diningType === 'DINE_IN' && cart.length > 0 && (
            <button
              type="button"
              onClick={handleSaveRunningOrder}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Table Order ({tableNumber})</span>
            </button>
          )}

          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => {
                if (window.confirm("Clear cart?")) {
                  clearCart();
                }
              }}
              className="col-span-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-400 hover:text-zinc-200 font-medium py-2 rounded-lg text-xs transition-colors border border-zinc-800/80"
            >
              Clear
            </button>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutModalOpen(true)}
              className="col-span-3 bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-semibold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Pay {currency}{grandTotal.toFixed(2)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
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
