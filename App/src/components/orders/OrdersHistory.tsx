import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  ClipboardList, 
  Search, 
  Printer, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  X, 
  UtensilsCrossed, 
  ShoppingBag, 
  Truck 
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-4">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Order History & Receipts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse past customer orders, reprint thermal bills, and audit payment settlements.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 block text-[10px]">Total Recorded Orders</span>
          <strong className="text-white font-mono text-base">{orders.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # (e.g. KRN-1001), customer name, or phone..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9 font-mono"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dining Type Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'DINE_IN', label: 'Dine-In' },
            { id: 'TAKEAWAY', label: 'Takeaway' },
            { id: 'DELIVERY', label: 'Delivery' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDiningFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                diningFilter === f.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payment Mode Filter */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'CASH', label: 'Cash' },
            { id: 'UPI', label: 'UPI' },
            { id: 'CARD', label: 'Card' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPaymentFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                paymentFilter === f.id ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Dining Type</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Order Number */}
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      {order.orderNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-sans">
                      <span className="font-semibold text-white block truncate max-w-[140px]">
                        {order.customerName || 'Walk-in Guest'}
                      </span>
                      {order.customerPhone && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          {order.customerPhone}
                        </span>
                      )}
                    </td>

                    {/* Dining Type */}
                    <td className="py-3 px-4 font-sans">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {order.diningType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate">
                      {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-4 font-sans">
                      <div className="flex flex-col gap-0.5">
                        {order.payments.map((p, idx) => (
                          <span key={idx} className="text-[10px] font-bold text-slate-300">
                            {p.mode}: {currency}{p.amount}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 font-bold text-sm text-orange-400">
                      {currency}{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Print Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => openReceiptModal(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
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

