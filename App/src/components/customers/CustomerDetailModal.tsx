import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { Customer, Order } from '../../types';
import { 
  X, 
  Award, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Minus, 
  RotateCcw, 
  Receipt, 
  Heart,
  ArrowRight
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
  
  // Points Adjustment state
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [adjustType, setAdjustType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [adjustReason, setAdjustReason] = useState<string>('Customer courtesy bonus');

  if (!isOpen || !customer) return null;

  const currency = settings.currencySymbol || '₹';

  // Find customer's past orders
  const customerOrders = orders.filter(
    o => o.customerId === customer.id || o.customerPhone === customer.phone
  );

  // Find customer's loyalty ledger
  const customerLedger = ledger.filter(
    l => l.customerId === customer.id || l.customerPhone === customer.phone
  );

  // Compute favorite items
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
      case 'Platinum': return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Gold': return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Silver': return 'bg-slate-400/20 text-slate-200 border-slate-400/40';
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Header Banner */}
        <div className="p-6 bg-slate-800/90 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-orange-500/20">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-xl text-white">{customer.name}</h3>
                <span className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getTierColor(customer.tier)}`}>
                  {customer.tier} Tier
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {customer.phone} {customer.email ? `• ${customer.email}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleStartOrder}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>New Order for Customer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 bg-slate-950 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTabLocal('overview')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'overview' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Overview & Favorites
          </button>
          <button
            onClick={() => setActiveTabLocal('orders')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Purchase History</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full">{customerOrders.length}</span>
          </button>
          <button
            onClick={() => setActiveTabLocal('loyalty')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'loyalty' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Loyalty Ledger</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-300 rounded-full">{customerLedger.length}</span>
          </button>
          <button
            onClick={() => setActiveTabLocal('adjust')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'adjust' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Adjust Points
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Current Points</span>
                  <div className="text-2xl font-extrabold text-amber-400 font-mono mt-1">
                    {customer.currentPoints}
                  </div>
                  <span className="text-[10px] text-slate-500">Worth {currency}{customer.currentPoints * settings.loyaltyPointValue}</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Lifetime Spend</span>
                  <div className="text-2xl font-extrabold text-white font-mono mt-1">
                    {currency}{customer.lifetimeSpend.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500">Total revenue generated</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Total Visits</span>
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                    {customer.totalVisits}
                  </div>
                  <span className="text-[10px] text-slate-500">Bills completed</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Avg Order Value</span>
                  <div className="text-2xl font-extrabold text-sky-400 font-mono mt-1">
                    {currency}{customer.totalVisits > 0 ? Math.round(customer.lifetimeSpend / customer.totalVisits) : 0}
                  </div>
                  <span className="text-[10px] text-slate-500">Per dining visit</span>
                </div>
              </div>

              {/* Favorite Items Section */}
              <div>
                <h4 className="font-bold text-sm text-white mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-current" />
                  Customer's Favorite Items
                </h4>

                {favoriteItemsList.length === 0 ? (
                  <p className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    No order items recorded yet. Favorites will appear once orders are billed.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {favoriteItemsList.slice(0, 6).map((fav, idx) => (
                      <div 
                        key={idx}
                        className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3"
                      >
                        <img
                          src={fav.product?.image}
                          alt={fav.product?.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-xs text-white truncate">{fav.product?.name}</h5>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {currency}{fav.product?.price}
                          </span>
                          <span className="text-[10px] font-bold text-orange-400 block mt-0.5">
                            Ordered {fav.quantity} times
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-3 animate-fade-in">
              {customerOrders.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No orders found for this customer.
                </div>
              ) : (
                customerOrders.map(order => (
                  <div 
                    key={order.id}
                    className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-sm">{order.orderNumber}</span>
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                          {order.diningType}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 mt-1 line-clamp-1">
                        {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-bold font-mono text-sm text-orange-400">
                          {currency}{order.totalAmount}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          +{order.pointsEarned} pts earned
                        </span>
                      </div>

                      <button
                        onClick={() => openReceiptModal(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: LOYALTY LEDGER */}
          {activeTab === 'loyalty' && (
            <div className="space-y-3 animate-fade-in">
              {customerLedger.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No loyalty points transactions recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                        <th className="py-2.5 px-3">Date & Time</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Points</th>
                        <th className="py-2.5 px-3">Balance After</th>
                        <th className="py-2.5 px-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {customerLedger.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 text-slate-400">
                            {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              entry.type === 'EARN' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : entry.type === 'REDEEM' 
                                  ? 'bg-rose-500/20 text-rose-400' 
                                  : 'bg-amber-500/20 text-amber-400'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className={`py-2.5 px-3 font-bold ${entry.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                          </td>
                          <td className="py-2.5 px-3 text-white">
                            {entry.balanceAfter} pts
                          </td>
                          <td className="py-2.5 px-3 text-slate-300 font-sans">
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
            <form onSubmit={handleAdjustPointsSubmit} className="max-w-md mx-auto space-y-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 animate-fade-in">
              <h4 className="font-bold text-sm text-white">Manual Loyalty Points Adjustment</h4>
              <p className="text-xs text-slate-400">
                Grant promotional bonus points or adjust points for customer support inquiries.
              </p>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Adjustment Action</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADD')}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      adjustType === 'ADD' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    + Add Bonus Points
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('DEDUCT')}
                    className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                      adjustType === 'DEDUCT' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    - Deduct Points
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Points Quantity</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pointsDelta}
                  onChange={(e) => setPointsDelta(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reason / Note for Ledger</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Birthday gift points, compensation bonus"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Apply Adjustment to Customer Account
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

