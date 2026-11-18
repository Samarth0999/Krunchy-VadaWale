import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Customer } from '../../types';
import { 
  X, 
  ShoppingBag, 
  Receipt, 
  Heart
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  isOpen,
  onClose
}) => {
  const { 
    orders, 
    products, 
    ledger, 
    settings, 
    adjustCustomerPoints, 
    selectCustomer, 
    setActiveTab, 
    openReceiptModal 
  } = usePOS();

  const [activeTab, setActiveTabLocal] = useState<'overview' | 'orders' | 'loyalty' | 'adjust'>('overview');
  
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState<string>('Courtesy bonus');

  if (!isOpen || !customer) return null;

  const currency = settings.currencySymbol || '₹';

  const customerOrders = orders.filter(
    o => o.customerId === customer.id || o.customerPhone === customer.phone
  );

  const customerLedger = ledger.filter(
    l => l.customerId === customer.id || l.customerPhone === customer.phone
  );

  const favoriteItemsList = Object.entries(customer.favoriteItems || {})
    .map(([prodId, qty]) => {
      const prod = products.find(p => p.id === prodId);
      return {
        product: prod,
        quantity: qty
      };
    })
    .filter(item => item.product !== undefined)
    .sort((a, b) => b.quantity - a.quantity);

  const handleStartOrder = () => {
    selectCustomer(customer);
    setActiveTab('pos');
    onClose();
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDelta = adjustType === 'ADD' ? Math.abs(pointsDelta) : -Math.abs(pointsDelta);
    await adjustCustomerPoints(customer.id, finalDelta, adjustReason.trim());
    setActiveTabLocal('overview');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Gold': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Silver': return 'text-zinc-300 bg-zinc-800 border-zinc-700/60';
      default: return 'text-zinc-400 bg-zinc-800/80 border-zinc-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-100 font-semibold text-base">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-zinc-100">{customer.name}</h3>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded border font-mono ${getTierColor(customer.tier)}`}>
                  {customer.tier}
                </span>
              </div>
              <div className="text-xs text-zinc-400 font-mono mt-0.5">
                {customer.phone} {customer.email ? `• ${customer.email}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>New Order</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-5 pt-2 bg-zinc-950/60 border-b border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTabLocal('overview')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-zinc-200 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTabLocal('orders')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'orders' ? 'border-zinc-200 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Orders ({customerOrders.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('loyalty')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'loyalty' ? 'border-zinc-200 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Ledger ({customerLedger.length})
          </button>
          <button
            onClick={() => setActiveTabLocal('adjust')}
            className={`pb-2 px-2.5 font-medium border-b-2 transition-colors ${
              activeTab === 'adjust' ? 'border-zinc-200 text-zinc-100' : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Adjust Points
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Points Balance</span>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {customer.currentPoints}
                  </div>
                  <span className="text-[10px] text-zinc-500">{currency}{customer.currentPoints * settings.loyaltyPointValue}</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Lifetime Spend</span>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {currency}{customer.lifetimeSpend.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-500">Gross revenue</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Total Visits</span>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {customer.totalVisits}
                  </div>
                  <span className="text-[10px] text-zinc-500">Orders completed</span>
                </div>

                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block">Avg Ticket</span>
                  <div className="text-xl font-bold text-zinc-100 font-mono mt-0.5">
                    {currency}{customer.totalVisits > 0 ? Math.round(customer.lifetimeSpend / customer.totalVisits) : 0}
                  </div>
                  <span className="text-[10px] text-zinc-500">Per visit</span>
                </div>
              </div>

              {/* Favorites */}
              <div>
                <h4 className="font-semibold text-xs text-zinc-300 mb-2 flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-zinc-400" />
                  Most Ordered Items
                </h4>

                {favoriteItemsList.length === 0 ? (
                  <p className="text-xs text-zinc-500 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    No orders recorded yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {favoriteItemsList.slice(0, 6).map((fav, idx) => (
                      <div 
                        key={idx}
                        className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center gap-2.5"
                      >
                        <img
                          src={fav.product?.image}
                          alt={fav.product?.name}
                          className="w-9 h-9 rounded object-cover shrink-0 bg-zinc-900"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-medium text-xs text-zinc-200 truncate">{fav.product?.name}</h5>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            Ordered {fav.quantity}x
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-2 animate-fade-in">
              {customerOrders.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No orders found.
                </div>
              ) : (
                customerOrders.map(order => (
                  <div 
                    key={order.id}
                    className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-100">{order.orderNumber}</span>
                        <span className="text-[10px] text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <strong className="font-mono text-zinc-100">{currency}{order.totalAmount}</strong>
                        <span className="text-[10px] text-zinc-500 block font-mono">+{order.pointsEarned} pts</span>
                      </div>

                      <button
                        onClick={() => openReceiptModal(order)}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-800 text-xs"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LOYALTY LEDGER */}
          {activeTab === 'loyalty' && (
            <div className="space-y-2 animate-fade-in">
              {customerLedger.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  No loyalty transactions recorded.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[11px]">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3">Points</th>
                        <th className="py-2 px-3">Balance</th>
                        <th className="py-2 px-3">Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                      {customerLedger.map(entry => (
                        <tr key={entry.id} className="hover:bg-zinc-950/50">
                          <td className="py-2 px-3 text-zinc-400 text-[11px]">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-3 font-sans">
                            <span className="text-[10px] font-medium text-zinc-300">
                              {entry.type}
                            </span>
                          </td>
                          <td className={`py-2 px-3 font-medium ${entry.points > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {entry.points > 0 ? `+${entry.points}` : entry.points}
                          </td>
                          <td className="py-2 px-3 text-zinc-200">
                            {entry.balanceAfter}
                          </td>
                          <td className="py-2 px-3 text-zinc-400 font-sans">
                            {entry.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADJUST POINTS */}
          {activeTab === 'adjust' && (
            <form onSubmit={handleAdjustPointsSubmit} className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs">
              <h4 className="font-medium text-zinc-200">Manual Points Adjustment</h4>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('ADD')}
                  className={`py-1.5 rounded-lg font-medium transition-colors border ${
                    adjustType === 'ADD' ? 'bg-zinc-100 text-zinc-950 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  + Add Points
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEDUCT')}
                  className={`py-1.5 rounded-lg font-medium transition-colors border ${
                    adjustType === 'DEDUCT' ? 'bg-zinc-100 text-zinc-950 border-zinc-200' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                >
                  - Deduct Points
                </button>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Points Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Audit Reason</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Birthday bonus, service apology"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg transition-colors shadow-xs"
              >
                Apply Adjustment
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
