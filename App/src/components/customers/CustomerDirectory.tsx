import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomerDetailModal } from './CustomerDetailModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Award, 
  TrendingUp, 
  ShoppingBag, 
  X, 
  Check, 
  Calendar,
  Sparkles
} from 'lucide-react';
import { Customer } from '../../types';

export const CustomerDirectory: React.FC = () => {
  const { customers, saveCustomer, selectCustomer, setActiveTab, settings } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('ALL');
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Customer State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (filterTier === 'PLATINUM' && c.tier !== 'Platinum') return false;
      if (filterTier === 'GOLD' && c.tier !== 'Gold') return false;
      if (filterTier === 'SILVER' && c.tier !== 'Silver') return false;
      if (filterTier === 'BRONZE' && c.tier !== 'Bronze') return false;
      if (filterTier === 'HIGH_SPEND' && c.lifetimeSpend < 2000) return false;
      if (filterTier === 'FREQUENT' && c.totalVisits < 5) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = c.name.toLowerCase().includes(q);
        const matchPhone = c.phone.includes(q);
        const matchEmail = c.email ? c.email.toLowerCase().includes(q) : false;
        if (!matchName && !matchPhone && !matchEmail) return false;
      }
      return true;
    });
  }, [customers, filterTier, searchQuery]);

  const handleOpenCustomer = (c: Customer) => {
    setSelectedCustomerForModal(c);
    setIsDetailModalOpen(true);
  };

  const handleStartOrderForCustomer = (e: React.MouseEvent, c: Customer) => {
    e.stopPropagation();
    selectCustomer(c);
    setActiveTab('pos');
  };

  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone || newPhone.length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    const newCustomer: Customer = {
      id: `cust_${newPhone}`,
      phone: newPhone,
      name: newName.trim() || 'Valued Customer',
      email: newEmail.trim() || undefined,
      totalVisits: 0,
      lifetimeSpend: 0,
      currentPoints: 0,
      tier: 'Bronze',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      favoriteItems: {}
    };

    await saveCustomer(newCustomer);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Gold': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'Silver': return 'bg-slate-400/20 text-slate-200 border-slate-400/30';
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
    }
  };

  const currency = settings.currencySymbol || '₹';

  // Overall CRM metrics
  const totalCustomers = customers.length;
  const totalPointsLiability = customers.reduce((acc, c) => acc + c.currentPoints, 0);
  const totalLTV = customers.reduce((acc, c) => acc + c.lifetimeSpend, 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-4">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Customer & CRM Database</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Track customer visits, lifetime spend, loyalty balances, and dining preferences.
          </p>
        </div>

        {/* Stats & Add */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Profiles</span>
              <strong className="text-white font-mono">{totalCustomers}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Points Liability</span>
              <strong className="text-amber-400 font-mono">{totalPointsLiability} pts ({currency}{totalPointsLiability * settings.loyaltyPointValue})</strong>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Avg LTV</span>
              <strong className="text-emerald-400 font-mono">{currency}{avgLTV}</strong>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone number, or email..."
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

        {/* Tier / Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PLATINUM', label: 'Platinum' },
            { id: 'GOLD', label: 'Gold' },
            { id: 'SILVER', label: 'Silver' },
            { id: 'BRONZE', label: 'Bronze' },
            { id: 'HIGH_SPEND', label: 'High Spenders (>₹2k)' },
            { id: 'FREQUENT', label: 'Frequent (>5 visits)' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterTier(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                filterTier === f.id 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Phone Number</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">Current Points</th>
                <th className="py-3 px-4">Total Visits</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No customers found matching the search or filter.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => handleOpenCustomer(customer)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    {/* Name & Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold flex items-center justify-center shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white text-xs block">{customer.name}</span>
                          {customer.email && (
                            <span className="text-[10px] text-slate-400 block">{customer.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {customer.phone}
                    </td>

                    {/* Tier */}
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getTierBadge(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 text-sm">
                      {customer.currentPoints} pts
                      <span className="text-[10px] text-slate-500 block font-normal">
                        ({currency}{customer.currentPoints * settings.loyaltyPointValue})
                      </span>
                    </td>

                    {/* Total Visits */}
                    <td className="py-3 px-4 font-mono text-slate-200">
                      {customer.totalVisits}
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400 text-sm">
                      {currency}{customer.lifetimeSpend.toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleStartOrderForCustomer(e, customer)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-orange-500 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={selectedCustomerForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Create Customer Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Add Customer Profile</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

