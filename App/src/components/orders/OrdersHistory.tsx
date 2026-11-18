import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  ClipboardList, 
  Search, 
  Printer, 
  X, 
  Calendar 
} from 'lucide-react';
import { Order } from '../../types';

export const OrdersHistory: React.FC = () => {
  const { orders, openReceiptModal, settings } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [diningFilter, setDiningFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const currency = settings.currencySymbol || '₹';

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (diningFilter !== 'ALL' && o.diningType !== diningFilter) return false;
      if (paymentFilter !== 'ALL') {
        const hasMode = o.payments.some(p => p.mode === paymentFilter);
        if (!hasMode) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchCust = o.customerName ? o.customerName.toLowerCase().includes(q) : false;
        const matchPhone = o.customerPhone ? o.customerPhone.includes(q) : false;
        if (!matchNumber && !matchCust && !matchPhone) return false;
      }
      return true;
    });
  }, [orders, diningFilter, paymentFilter, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-4">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Order Ledger & Thermal Receipts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Historical transaction ledger, reprint thermal bills, audit payment splits and dining modes.
          </p>
        </div>

        <div className="bg-dark-950 px-4 py-2 rounded-xl border border-white/[0.08] text-xs shadow-inner">
          <span className="text-slate-400 block text-[10px] font-semibold">Total Bills Generated</span>
          <strong className="text-white font-mono text-base">{orders.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-dark-900 border border-white/[0.08] p-3 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # (e.g. KRN-1001), patron name, or phone number..."
            className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9 font-mono shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dining Type Filter */}
        <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-white/[0.06] text-xs shadow-inner">
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'DINE_IN', label: 'Dine-In' },
            { id: 'TAKEAWAY', label: 'Takeaway' },
            { id: 'DELIVERY', label: 'Delivery' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDiningFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                diningFilter === f.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payment Mode Filter */}
        <div className="flex items-center gap-1 bg-dark-950 p-1 rounded-xl border border-white/[0.06] text-xs shadow-inner">
          {[
            { id: 'ALL', label: 'All Payments' },
            { id: 'CASH', label: 'Cash' },
            { id: 'UPI', label: 'UPI' },
            { id: 'CARD', label: 'Card' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPaymentFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                paymentFilter === f.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-dark-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-dark-950/90 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[11px] font-extrabold">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Dining Type</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05] font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {order.orderNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] tabular-nums">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4 font-sans">
                      <span className="font-bold text-white block truncate max-w-[150px]">
                        {order.customerName || 'Walk-in Guest'}
                      </span>
                      {order.customerPhone && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.customerPhone}
                        </span>
                      )}
                    </td>

                    {/* Dining Type */}
                    <td className="py-3.5 px-4 font-sans">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-dark-950 text-slate-300 border border-white/[0.08]">
                        {order.diningType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3.5 px-4 font-sans text-slate-300 max-w-xs truncate">
                      {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3.5 px-4 font-sans">
                      <div className="flex flex-col gap-0.5">
                        {order.payments.map((p, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-300">
                            {p.mode}: {currency}{p.amount}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-sm text-orange-400 tabular-nums">
                      {currency}{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Print Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openReceiptModal(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-850 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-600 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/[0.08] active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
