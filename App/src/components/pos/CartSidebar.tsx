import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomerLookupBanner } from './CustomerLookupBanner';
import { 
  Trash2, 
  Plus, 
  Minus, 
  UtensilsCrossed, 
  ShoppingBag, 
  Truck, 
  Sparkles, 
  MessageSquare, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { DiningType } from '../../types';

export const CartSidebar: React.FC = () => {
  const { 
    cart, 
    diningType, 
    setDiningType, 
    tableNumber, 
    setTableNumber, 
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

  const tables = ['Table 1', 'Table 2', 'Table 3', 'Table 4', 'Table 5', 'Table 6', 'Table 7', 'Table 8', 'Bar 1', 'Takeout Counter'];

  const handleOpenNote = (productId: string, currentNote = '') => {
    setEditingNoteId(productId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = (productId: string) => {
    updateItemNotes(productId, noteText.trim());
    setEditingNoteId(null);
    setNoteText('');
  };

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full shadow-xl overflow-hidden">
      
      {/* Top: Dining Type Switcher */}
      <div className="p-3 border-b border-slate-800 bg-slate-950/70">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setDiningType('DINE_IN')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              diningType === 'DINE_IN' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Dine-In</span>
          </button>

          <button
            type="button"
            onClick={() => setDiningType('TAKEAWAY')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              diningType === 'TAKEAWAY' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Takeaway</span>
          </button>

          <button
            type="button"
            onClick={() => setDiningType('DELIVERY')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              diningType === 'DELIVERY' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Delivery</span>
          </button>
        </div>

        {/* Table Selector if Dine-In */}
        {diningType === 'DINE_IN' && (
          <div className="mt-2 flex items-center justify-between text-xs px-1">
            <span className="text-slate-400">Select Table:</span>
            <select
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="bg-slate-800 text-white font-medium text-xs rounded-lg px-2 py-1 border border-slate-700 focus:outline-none focus:border-orange-500"
            >
              {tables.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Customer Lookup & Loyalty Section */}
      <div className="p-3 pb-0">
        <CustomerLookupBanner />
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-medium">Cart is currently empty</p>
            <p className="text-[11px] text-slate-600 text-center mt-1">
              Tap menu items on the left to start billing
            </p>
          </div>
        ) : (
          cart.map(item => (
            <div 
              key={item.product.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 flex flex-col gap-1.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${item.product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                    <span className="font-semibold text-xs text-white truncate">{item.product.name}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {currency}{item.product.price} × {item.quantity} = <span className="text-white font-bold">{currency}{item.product.price * item.quantity}</span>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold font-mono px-1.5 text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
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
                      placeholder="Special instructions (e.g. no mayo, extra sauce)..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-white focus:outline-none focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveNote(item.product.id)}
                      className="px-2 py-0.5 bg-orange-500 text-white rounded font-medium text-[10px]"
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

      {/* Bill Calculation Breakdown */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal:</span>
          <span className="font-mono text-slate-200">{currency}{subtotal.toFixed(2)}</span>
        </div>

        {pointsDiscountValue > 0 && (
          <div className="flex justify-between text-emerald-400 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Loyalty Discount ({pointsToRedeem} pts):
            </span>
            <span className="font-mono">-{currency}{pointsDiscountValue.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between text-slate-400">
          <span>{settings.taxName || 'GST'} ({settings.taxRate}%):</span>
          <span className="font-mono text-slate-200">{currency}{taxAmount.toFixed(2)}</span>
        </div>

        {selectedCustomer && potentialPointsEarned > 0 && (
          <div className="flex justify-between text-amber-400 text-[11px] font-medium pt-0.5">
            <span>Points Customer Will Earn:</span>
            <span className="font-mono font-bold">+{potentialPointsEarned} pts</span>
          </div>
        )}

        {/* Grand Total */}
        <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
          <div>
            <span className="font-extrabold text-sm text-white">Grand Total</span>
            <span className="text-[10px] text-slate-400 block">Incl. all taxes</span>
          </div>
          <span className="text-xl font-extrabold text-orange-400 font-mono tracking-tight">
            {currency}{grandTotal.toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-2">
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              if (window.confirm("Clear all items from the current cart?")) {
                clearCart();
              }
            }}
            className="col-span-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition-colors"
          >
            Clear
          </button>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
            className="col-span-3 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all hover:scale-101"
          >
            <span>Proceed to Pay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

