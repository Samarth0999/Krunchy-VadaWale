import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { CustomerDetailModal } from './CustomerDetailModal';
import { 
  Users, 
  Search, 
  UserPlus, 
  ShoppingBag, 
  X 
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
      name: newName.trim() || 'Customer',
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
      case 'Platinum': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'Gold': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Silver': return 'text-zinc-300 bg-zinc-800 border-zinc-700/60';
      default: return 'text-zinc-400 bg-zinc-800/80 border-zinc-800';
    }
  };

  const currency = settings.currencySymbol || '₹';

  const totalCustomers = customers.length;
  const totalPointsLiability = customers.reduce((acc, c) => acc + c.currentPoints, 0);
  const totalLTV = customers.reduce((acc, c) => acc + c.lifetimeSpend, 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Customer Database & CRM</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Customer lifetime metrics, visits, point balances, and purchase history
          </p>
        </div>

        {/* Stats & Add */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-3 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Profiles</span>
              <strong className="text-zinc-100 font-mono">{totalCustomers}</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Points Liability</span>
              <strong className="text-zinc-300 font-mono">{totalPointsLiability} pts</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Average LTV</span>
              <strong className="text-zinc-100 font-mono">{currency}{avgLTV}</strong>
            </div>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, or email..."
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

        {/* Tier / Category Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/80 text-xs">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PLATINUM', label: 'Platinum' },
            { id: 'GOLD', label: 'Gold' },
            { id: 'SILVER', label: 'Silver' },
            { id: 'BRONZE', label: 'Bronze' },
            { id: 'HIGH_SPEND', label: 'High Spenders' },
            { id: 'FREQUENT', label: 'Frequent' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterTier(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                filterTier === f.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Customers Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-[11px] font-medium">
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Phone</th>
                <th className="py-2.5 px-3.5">Tier</th>
                <th className="py-2.5 px-3.5">Points</th>
                <th className="py-2.5 px-3.5">Visits</th>
                <th className="py-2.5 px-3.5">Lifetime Spend</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-sans">
                    No customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr 
                    key={customer.id} 
                    onClick={() => handleOpenCustomer(customer)}
                    className="hover:bg-zinc-900/60 transition-colors cursor-pointer"
                  >
                    {/* Name */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 text-zinc-300 font-medium flex items-center justify-center shrink-0 text-xs">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-zinc-100 block">{customer.name}</span>
                          {customer.email && (
                            <span className="text-[10px] text-zinc-500 block">{customer.email}</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-2.5 px-3.5 font-mono text-zinc-400">
                      {customer.phone}
                    </td>

                    {/* Tier */}
                    <td className="py-2.5 px-3.5">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border font-mono ${getTierBadge(customer.tier)}`}>
                        {customer.tier}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-2.5 px-3.5 font-mono font-medium text-zinc-200">
                      {customer.currentPoints} pts
                    </td>

                    {/* Total Visits */}
                    <td className="py-2.5 px-3.5 font-mono text-zinc-400">
                      {customer.totalVisits}
                    </td>

                    {/* Lifetime Spend */}
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-zinc-100">
                      {currency}{customer.lifetimeSpend.toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        type="button"
                        onClick={(e) => handleStartOrderForCustomer(e, customer)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs transition-colors border border-zinc-700/60"
                      >
                        <ShoppingBag className="w-3 h-3" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-zinc-100">New Customer Profile</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Mobile Phone (10 Digits) *</label>
                <input
                  type="tel"
                  required
                  autoFocus
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg shadow-xs"
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
