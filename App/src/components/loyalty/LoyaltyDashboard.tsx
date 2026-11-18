import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Award, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Sliders,
  TrendingUp,
  X,
  CreditCard,
  Gift
} from 'lucide-react';

export const LoyaltyDashboard: React.FC = () => {
  const { ledger, settings, customers, openReceiptModal, orders } = usePOS();

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Automated Loyalty & Rewards Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rules engine, customer rewards tiers, and immutable transaction audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-dark-950 px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Immutable Audit Trail Active</span>
        </div>
      </div>

      {/* Rules & Metric Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Active Rules Card */}
        <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Active Loyalty Rules
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                1 pt = {currency}{settings.loyaltyPointValue}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-dark-950/70 p-3 rounded-xl border border-white/[0.06] shadow-inner">
                <span className="text-slate-400 font-medium">Earn Rate</span>
                <span className="font-bold text-white font-mono tabular-nums">
                  1 pt / {currency}{settings.loyaltyEarnRate} spent
                </span>
              </div>
              <div className="flex justify-between items-center bg-dark-950/70 p-3 rounded-xl border border-white/[0.06] shadow-inner">
                <span className="text-slate-400 font-medium">Point Value</span>
                <span className="font-bold text-amber-400 font-mono tabular-nums">
                  1 pt = {currency}{settings.loyaltyPointValue}
                </span>
              </div>
              <div className="flex justify-between items-center bg-dark-950/70 p-3 rounded-xl border border-white/[0.06] shadow-inner">
                <span className="text-slate-400 font-medium">Max Redemption per Bill</span>
                <span className="font-bold text-white font-mono tabular-nums">
                  Up to {settings.maxRedemptionPercent}%
                </span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1">
            <span>⚙️ Configure earn ratios anytime in Settings.</span>
          </p>
        </div>

        {/* Financial Points Liability Metrics */}
        <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                Points & Liability Audit
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real-time</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-dark-950/70 p-3 rounded-xl border border-white/[0.06] shadow-inner">
                <span className="text-[10px] text-slate-400 block font-medium">Total Issued</span>
                <div className="text-xl font-extrabold text-emerald-400 font-mono tabular-nums mt-0.5">
                  +{totalEarnedPoints.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Credited to accounts</span>
              </div>

              <div className="bg-dark-950/70 p-3 rounded-xl border border-white/[0.06] shadow-inner">
                <span className="text-[10px] text-slate-400 block font-medium">Total Redeemed</span>
                <div className="text-xl font-extrabold text-rose-400 font-mono tabular-nums mt-0.5">
                  -{totalRedeemedPoints.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">Discounts applied</span>
              </div>
            </div>

            <div className="mt-3 bg-dark-950/70 p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between shadow-inner">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Outstanding Liability</span>
                <span className="text-sm text-amber-400 font-mono tabular-nums font-bold">
                  {outstandingLiabilityPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Est. Financial Value</span>
                <span className="text-base font-extrabold text-white font-mono tabular-nums">
                  {currency}{(outstandingLiabilityPoints * settings.loyaltyPointValue).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tiers Breakdown */}
        <div className="bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block mb-3.5 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Tier Privileges & Thresholds
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm shadow-purple-500/50"></span>
                <span className="font-bold text-purple-300">Platinum Tier</span>
              </div>
              <span className="font-mono text-purple-200 text-[11px] font-semibold">1,000+ pts (VIP Status)</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50"></span>
                <span className="font-bold text-amber-300">Gold Tier</span>
              </div>
              <span className="font-mono text-amber-200 text-[11px] font-semibold">500 – 999 pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-400/10 border border-slate-400/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span className="font-bold text-slate-300">Silver Tier</span>
              </div>
              <span className="font-mono text-slate-300 text-[11px] font-semibold">200 – 499 pts</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                <span className="font-bold text-orange-300">Bronze Tier</span>
              </div>
              <span className="font-mono text-orange-300 text-[11px] font-semibold">0 – 199 pts (Welcome)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Ledger Audit Trail */}
      <div className="bg-dark-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-surface space-y-4 p-5">
        
        {/* Ledger Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Immutable Transaction Audit Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Chronological ledger tracking every point earned, redeemed, or adjusted in the system.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patron, phone, or order #..."
                className="bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-8.5 font-mono shadow-inner w-56 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex bg-dark-950 p-1 rounded-xl border border-white/[0.08] text-xs shadow-inner">
              {(['ALL', 'EARN', 'REDEEM', 'ADJUSTMENT'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    filterType === type 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-dark-950 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Order Link</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No ledger transactions matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono tabular-nums whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white text-xs block">{entry.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.customerPhone}</span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full inline-block ${
                        entry.type === 'EARN' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : entry.type === 'REDEEM' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {entry.type}
                      </span>
                    </td>

                    {/* Points */}
                    <td className={`py-3 px-4 font-mono font-bold text-xs tabular-nums whitespace-nowrap ${entry.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-4 text-white font-mono font-bold tabular-nums">
                      {entry.balanceAfter} pts
                    </td>

                    {/* Order Link */}
                    <td className="py-3 px-4">
                      {entry.orderNumber ? (
                        <button
                          type="button"
                          onClick={() => {
                            const ord = orders.find(o => o.orderNumber === entry.orderNumber || o.id === entry.orderId);
                            if (ord) openReceiptModal(ord);
                          }}
                          className="text-orange-400 hover:text-orange-300 underline font-mono font-semibold text-xs transition-colors"
                        >
                          {entry.orderNumber}
                        </button>
                      ) : (
                        <span className="text-slate-500 font-mono">-</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-slate-300 text-xs">
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
