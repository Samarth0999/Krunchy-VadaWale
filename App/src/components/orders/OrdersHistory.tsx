import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  ClipboardList, 
  Search, 
  Printer, 
  X 
} from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Order History & Receipts</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Audit completed sales, payment modes, and reprint thermal receipts
          </p>
        </div>

        <div className="bg-zinc-900/60 px-3.5 py-1.5 rounded-lg border border-zinc-800/80 text-xs">
          <span className="text-zinc-500 block text-[10px]">Total Recorded</span>
          <strong className="text-zinc-100 font-mono text-sm">{orders.length} orders</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer name, or phone..."
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 pl-8 font-mono"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dining Type Filter */}
        <div className="flex items-center gap-1 bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/80 text-xs">
          {[
            { id: 'ALL', label: 'All Types' },
            { id: 'DINE_IN', label: 'Dine-In' },
            { id: 'TAKEAWAY', label: 'Takeaway' },
            { id: 'DELIVERY', label: 'Delivery' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setDiningFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                diningFilter === f.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Payment Mode Filter */}
        <div className="flex items-center gap-1 bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/80 text-xs">
          {[
            { id: 'ALL', label: 'All Modes' },
            { id: 'CASH', label: 'Cash' },
            { id: 'UPI', label: 'UPI' },
            { id: 'CARD', label: 'Card' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setPaymentFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                paymentFilter === f.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table & Mobile Cards */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-[11px] font-medium">
                <th className="py-2.5 px-3.5">Order #</th>
                <th className="py-2.5 px-3.5">Date & Time</th>
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Items</th>
                <th className="py-2.5 px-3.5">Payment</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-zinc-500 font-sans">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Order Number */}
                    <td className="py-2.5 px-3.5 font-bold text-zinc-100">
                      {order.orderNumber}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3.5 text-zinc-400 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3.5 font-sans">
                      <span className="font-medium text-zinc-200 block truncate max-w-[130px]">
                        {order.customerName || 'Walk-in'}
                      </span>
                      {order.customerPhone && (
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {order.customerPhone}
                        </span>
                      )}
                    </td>

                    {/* Dining Type */}
                    <td className="py-2.5 px-3.5 font-sans">
                      <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                        {order.diningType} {order.tableNumber ? `(${order.tableNumber})` : ''}
                      </span>
                    </td>

                    {/* Items */}
                    <td className="py-2.5 px-3.5 font-sans text-zinc-400 max-w-xs truncate">
                      {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-2.5 px-3.5 font-sans">
                      <div className="flex flex-col gap-0.5">
                        {order.payments.map((p, idx) => (
                          <span key={idx} className="text-[10px] text-zinc-300 font-mono">
                            {p.mode}: {currency}{p.amount}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-2.5 px-3.5 font-bold text-zinc-100">
                      {currency}{order.totalAmount.toFixed(2)}
                    </td>

                    {/* Print Action */}
                    <td className="py-2.5 px-3.5 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => openReceiptModal(order)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors border border-zinc-700/60"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-zinc-800/80">
          {filteredOrders.length === 0 ? (
            <div className="py-10 text-center text-zinc-500 text-xs font-sans">
              No orders found.
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="p-3.5 space-y-2 hover:bg-zinc-900/40 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-zinc-100 font-mono">{order.orderNumber}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                        {order.diningType}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">
                      {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-zinc-100 block">
                      {currency}{order.totalAmount.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      {order.payments.map(p => p.mode).join(' + ')}
                    </span>
                  </div>
                </div>

                {/* Customer & Item details */}
                <div className="text-xs text-zinc-400">
                  <div className="text-zinc-300 font-medium truncate">
                    {order.customerName || 'Walk-in'} {order.customerPhone ? `(${order.customerPhone})` : ''}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                    {order.items.map(i => `${i.name} × ${i.quantity}`).join(', ')}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => openReceiptModal(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors border border-zinc-700/60"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View / Print Receipt</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
