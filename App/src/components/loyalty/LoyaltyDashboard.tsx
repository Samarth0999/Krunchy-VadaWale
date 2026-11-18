import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Award, 
  Search, 
  ShieldCheck, 
  FileText,
  Sliders,
  Sparkles,
  TrendingUp,
  Percent,
  Smartphone
} from 'lucide-react';

export const LoyaltyDashboard: React.FC = () => {
  const { ledger, settings, customers, openReceiptModal, orders, sendWhatsAppLoyaltyReminder } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EARN' | 'REDEEM' | 'ADJUSTMENT'>('ALL');

  const currency = settings.currencySymbol || '₹';

  // Metrics
  const totalEarnedPoints = useMemo(() => {
    return ledger.filter(l => l.points > 0).reduce((acc, l) => acc + l.points, 0);
  }, [ledger]);

  const totalRedeemedPoints = useMemo(() => {
    return ledger.filter(l => l.type === 'REDEEM').reduce((acc, l) => acc + Math.abs(l.points), 0);
  }, [ledger]);

  const outstandingLiabilityPoints = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.currentPoints, 0);
  }, [customers]);

  const customersWithPoints = useMemo(() => {
    return customers
      .filter(c => c.currentPoints > 0)
      .sort((a, b) => b.currentPoints - a.currentPoints);
  }, [customers]);

  const filteredLedger = useMemo(() => {
    return ledger.filter(entry => {
      if (filterType !== 'ALL' && entry.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchCustomer = entry.customerName.toLowerCase().includes(q);
        const matchPhone = entry.customerPhone.includes(q);
        const matchOrder = entry.orderNumber ? entry.orderNumber.toLowerCase().includes(q) : false;
        const matchDesc = entry.description.toLowerCase().includes(q);
        if (!matchCustomer && !matchPhone && !matchOrder && !matchDesc) return false;
      }
      return true;
    });
  }, [ledger, filterType, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Loyalty & Rewards Engine</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Rule configurations, reward liability analysis, and tamper-evident audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-300 font-medium">Audit Ledger Verified</span>
        </div>
      </div>

      {/* Rules & Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Active Rules Card */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Rules Engine</span>
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">Earn Rate</span>
                <span className="font-semibold text-zinc-200 font-mono">
                  1 pt per {currency}{settings.loyaltyEarnRate}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">Point Value</span>
                <span className="font-semibold text-zinc-200 font-mono">
                  1 pt = {currency}{settings.loyaltyPointValue}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-zinc-400">Max Bill Redemption</span>
                <span className="font-semibold text-zinc-200 font-mono">
                  {settings.maxRedemptionPercent}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 mt-3 pt-2.5 border-t border-zinc-800/60">
            Edit rates anytime in <span className="text-zinc-300">Settings</span>.
          </p>
        </div>

        {/* Financial Points Liability Metrics */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Points & Liability</span>
              <TrendingUp className="w-3.5 h-3.5 text-zinc-500" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400 block">Total Issued</span>
                <div className="text-lg font-semibold text-zinc-100 font-mono mt-0.5">
                  +{totalEarnedPoints.toLocaleString()}
                </div>
              </div>

              <div className="bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/60">
                <span className="text-[11px] text-zinc-400 block">Total Redeemed</span>
                <div className="text-lg font-semibold text-zinc-100 font-mono mt-0.5">
                  -{totalRedeemedPoints.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-2.5 bg-zinc-950/70 p-2.5 rounded-lg border border-zinc-800/60 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400 block">Outstanding Points</span>
                <span className="text-xs text-zinc-200 font-mono font-medium">
                  {outstandingLiabilityPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 block">Financial Liability</span>
                <span className="text-xs font-semibold text-zinc-100 font-mono">
                  {currency}{(outstandingLiabilityPoints * settings.loyaltyPointValue).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tiers Breakdown */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-3">
            Reward Tier Thresholds
          </span>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
              <span className="font-medium text-zinc-200">Platinum Tier</span>
              <span className="font-mono text-zinc-400 text-[11px]">1,000+ pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
              <span className="font-medium text-zinc-200">Gold Tier</span>
              <span className="font-mono text-zinc-400 text-[11px]">500 – 999 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
              <span className="font-medium text-zinc-200">Silver Tier</span>
              <span className="font-mono text-zinc-400 text-[11px]">200 – 499 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
              <span className="font-medium text-zinc-200">Bronze Tier</span>
              <span className="font-mono text-zinc-400 text-[11px]">0 – 199 pts</span>
            </div>
          </div>
        </div>

      </div>

      {/* WhatsApp Reminders for Customers with Outstanding Points */}
      {customersWithPoints.length > 0 && (
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Customer Loyalty Reminders (WhatsApp)
              </h3>
              <p className="text-xs text-zinc-500">
                Drive repeat visits by sending personalized WhatsApp reminders to customers with unspent loyalty points.
              </p>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
              {customersWithPoints.length} customers with balance
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {customersWithPoints.slice(0, 6).map(customer => {
              const val = customer.currentPoints * settings.loyaltyPointValue;
              return (
                <div 
                  key={customer.id} 
                  className="p-3 bg-zinc-950/70 border border-zinc-800/60 rounded-lg flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-medium text-xs text-zinc-200 truncate block">{customer.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono block">{customer.phone}</span>
                    <div className="text-[11px] font-mono text-emerald-400 font-semibold mt-0.5">
                      {customer.currentPoints} pts <span className="text-zinc-500 font-normal">({currency}{val})</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => sendWhatsAppLoyaltyReminder(customer)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-lg border border-emerald-500/20 transition-colors shrink-0"
                    title={`Send WhatsApp Reminder to ${customer.name}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Ledger Audit Trail */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
        
        {/* Ledger Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-zinc-400" />
              Transaction Ledger
            </h3>
            <p className="text-xs text-zinc-500">
              Chronological log of points earned, redeemed, or adjusted.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledger..."
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 pl-8 font-mono w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Segmented Filter */}
            <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
              {(['ALL', 'EARN', 'REDEEM', 'ADJUSTMENT'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    filterType === type 
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-lg border border-zinc-800/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px] font-medium">
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Type</th>
                <th className="py-2.5 px-3.5">Points</th>
                <th className="py-2.5 px-3.5">Balance</th>
                <th className="py-2.5 px-3.5">Order Link</th>
                <th className="py-2.5 px-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-sans">
                    No ledger transactions matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-zinc-850/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-2.5 px-3.5 text-zinc-400 text-[11px]">
                      {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-2.5 px-3.5 font-sans">
                      <span className="font-medium text-zinc-200 text-xs block">{entry.customerName}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{entry.customerPhone}</span>
                    </td>

                    {/* Type */}
                    <td className="py-2.5 px-3.5 font-sans">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        entry.type === 'EARN' 
                          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' 
                          : entry.type === 'REDEEM' 
                            ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' 
                            : 'border-zinc-700 text-zinc-300 bg-zinc-800/40'
                      }`}>
                        {entry.type}
                      </span>
                    </td>

                    {/* Points */}
                    <td className={`py-2.5 px-3.5 font-semibold text-xs ${entry.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>

                    {/* Balance After */}
                    <td className="py-2.5 px-3.5 text-zinc-200 font-medium">
                      {entry.balanceAfter} pts
                    </td>

                    {/* Order Link */}
                    <td className="py-2.5 px-3.5">
                      {entry.orderNumber ? (
                        <button
                          type="button"
                          onClick={() => {
                            const ord = orders.find(o => o.orderNumber === entry.orderNumber || o.id === entry.orderId);
                            if (ord) openReceiptModal(ord);
                          }}
                          className="text-zinc-300 hover:text-white underline font-mono text-xs"
                        >
                          {entry.orderNumber}
                        </button>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-2.5 px-3.5 font-sans text-zinc-400">
                      {entry.description}
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
