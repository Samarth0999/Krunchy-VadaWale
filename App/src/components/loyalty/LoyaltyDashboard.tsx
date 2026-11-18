import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Award, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  FileText,
  Sliders
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-5">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Automated Loyalty & Rewards Engine</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rules engine, customer rewards tiers, and immutable transaction audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-medium">Immutable Audit Trail Active</span>
        </div>
      </div>

      {/* Rules & Tier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Active Rules Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Rules Engine</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Earn Rate:</span>
                <span className="font-bold text-white font-mono">
                  1 pt for every {currency}{settings.loyaltyEarnRate} spent
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Point Value:</span>
                <span className="font-bold text-amber-400 font-mono">
                  1 pt = {currency}{settings.loyaltyPointValue}
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400">Max Redemption per Bill:</span>
                <span className="font-bold text-white font-mono">
                  Up to {settings.maxRedemptionPercent}% of bill
                </span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 mt-3 pt-2 border-t border-slate-800">
            Rules can be customized anytime from the Settings page.
          </p>
        </div>

        {/* Financial Points Liability Metrics */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Points & Liability</span>
              <Award className="w-4 h-4 text-orange-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Issued</span>
                <div className="text-xl font-extrabold text-emerald-400 font-mono mt-0.5">
                  +{totalEarnedPoints}
                </div>
                <span className="text-[10px] text-slate-500">Credited to accounts</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Redeemed</span>
                <div className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">
                  -{totalRedeemedPoints}
                </div>
                <span className="text-[10px] text-slate-500">Converted into discounts</span>
              </div>
            </div>

            <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Outstanding Points Liability</span>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  {outstandingLiabilityPoints} pts
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Est. Financial Value</span>
                <span className="text-sm font-extrabold text-white font-mono">
                  {currency}{outstandingLiabilityPoints * settings.loyaltyPointValue}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Tiers Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 block mb-3">
            Loyalty Tier Thresholds
          </span>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span className="font-bold text-purple-300">Platinum Tier</span>
              </div>
              <span className="font-mono text-purple-200">1,000+ pts (VIP Status)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="font-bold text-amber-300">Gold Tier</span>
              </div>
              <span className="font-mono text-amber-200">500 - 999 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-400/10 border border-slate-400/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="font-bold text-slate-300">Silver Tier</span>
              </div>
              <span className="font-mono text-slate-300">200 - 499 pts</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                <span className="font-bold text-orange-300">Bronze Tier</span>
              </div>
              <span className="font-mono text-orange-300">0 - 199 pts (Welcome Tier)</span>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Ledger Audit Trail */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-3 p-4">
        
        {/* Ledger Header & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-orange-400" />
              Immutable Loyalty Transaction Ledger
            </h3>
            <p className="text-[11px] text-slate-400">
              Chronological log of every point earned, redeemed, or adjusted.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer, phone, order #..."
                className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-8 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Filter */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['ALL', 'EARN', 'REDEEM', 'ADJUSTMENT'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    filterType === type ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Order Link</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No ledger transactions matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredLedger.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(entry.createdAt).toLocaleDateString()} {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 font-sans">
                      <span className="font-bold text-white text-xs block">{entry.customerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.customerPhone}</span>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4 font-sans">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        entry.type === 'EARN' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : entry.type === 'REDEEM' 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {entry.type}
                      </span>
                    </td>

                    {/* Points */}
                    <td className={`py-3 px-4 font-bold text-sm ${entry.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>

                    {/* Balance After */}
                    <td className="py-3 px-4 text-white font-bold">
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
                          className="text-orange-400 hover:text-orange-300 underline font-semibold text-xs"
                        >
                          {entry.orderNumber}
                        </button>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 font-sans text-slate-300">
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

