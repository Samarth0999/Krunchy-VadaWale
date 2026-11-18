import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { storageService } from '../../services/storageService';
import { 
  User, 
  Search, 
  Award, 
  UserPlus, 
  X, 
  Check, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Customer } from '../../types';

export const CustomerLookupBanner: React.FC = () => {
  const { 
    selectedCustomer, 
    selectCustomer, 
    pointsToRedeem, 
    setPointsToRedeem, 
    maxRedeemablePoints, 
    potentialPointsEarned,
    settings,
    saveCustomer,
    subtotal
  } = usePOS();

  const [phoneInput, setPhoneInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneInput(val);

    if (val.length === 10) {
      searchCustomer(val);
    } else {
      setShowNewCustomerForm(false);
    }
  };

  const searchCustomer = (phone: string) => {
    setIsSearching(true);
    const existing = storageService.getCustomerByPhone(phone);
    if (existing) {
      selectCustomer(existing);
      setShowNewCustomerForm(false);
      setPhoneInput('');
    } else {
      setShowNewCustomerForm(true);
    }
    setIsSearching(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 10) return;
    
    const newCust: Customer = {
      id: `cust_${phoneInput}`,
      phone: phoneInput,
      name: newCustomerName.trim() || 'Valued Customer',
      email: newCustomerEmail.trim() || undefined,
      totalVisits: 0,
      lifetimeSpend: 0,
      currentPoints: 0,
      tier: 'Bronze',
      createdAt: new Date().toISOString(),
      lastVisit: new Date().toISOString(),
      favoriteItems: {}
    };

    const saved = await saveCustomer(newCust);
    selectCustomer(saved);
    setShowNewCustomerForm(false);
    setPhoneInput('');
    setNewCustomerName('');
    setNewCustomerEmail('');
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
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 mb-3">
      
      {/* If No Customer Linked */}
      {!selectedCustomer && !showNewCustomerForm && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Customer Loyalty Lookup
            </span>
            <span className="text-[10px] text-slate-500">Phone (10 digits)</span>
          </div>

          <div className="relative">
            <input
              type="tel"
              value={phoneInput}
              onChange={handlePhoneChange}
              placeholder="Enter customer mobile number..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-8 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            {phoneInput.length === 10 && (
              <button
                type="button"
                onClick={() => searchCustomer(phoneInput)}
                className="absolute right-1.5 top-1.5 px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded text-[11px] font-medium"
              >
                Lookup
              </button>
            )}
          </div>
        </div>
      )}

      {/* New Customer Prompt */}
      {!selectedCustomer && showNewCustomerForm && (
        <form onSubmit={handleCreateCustomer} className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              New Customer Sign-Up (+{potentialPointsEarned} pts on this order!)
            </span>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Mobile: <span className="text-white font-mono font-semibold">{phoneInput}</span>
          </div>

          <input
            type="text"
            required
            autoFocus
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Customer Name (e.g. Rahul Sharma)"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Register & Link</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700"
            >
              Skip
            </button>
          </div>
        </form>
      )}

      {/* Active Customer Details Banner */}
      {selectedCustomer && (
        <div className="space-y-2.5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{selectedCustomer.name}</span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getTierColor(selectedCustomer.tier)}`}>
                  {selectedCustomer.tier}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {selectedCustomer.phone} • {selectedCustomer.totalVisits} visits • ₹{selectedCustomer.lifetimeSpend} spent
              </div>
            </div>

            <button
              onClick={() => selectCustomer(null)}
              title="Remove customer from this order"
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loyalty Points Pill */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs text-slate-400">Current Balance: </span>
                <span className="font-bold text-xs text-amber-400 font-mono">
                  {selectedCustomer.currentPoints} pts (Worth ₹{selectedCustomer.currentPoints * settings.loyaltyPointValue})
                </span>
              </div>
            </div>

            {subtotal >= settings.minOrderToEarn && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                +{potentialPointsEarned} pts on this bill
              </span>
            )}
          </div>

          {/* Points Redemption Section */}
          {selectedCustomer.currentPoints > 0 && maxRedeemablePoints > 0 && (
            <div className="pt-1 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Redeem Points for Discount?
                </span>
                <span className="text-[11px] font-mono text-orange-400">
                  {pointsToRedeem} pts = -₹{pointsToRedeem * settings.loyaltyPointValue}
                </span>
              </div>

              {/* Quick Redeem Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(0)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pointsToRedeem === 0 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  None
                </button>
                {maxRedeemablePoints >= 50 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(50)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                      pointsToRedeem === 50 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    50 pts (-₹50)
                  </button>
                )}
                {maxRedeemablePoints >= 100 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(100)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                      pointsToRedeem === 100 ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    100 pts (-₹100)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                    pointsToRedeem === maxRedeemablePoints ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Max ({maxRedeemablePoints} pts)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

