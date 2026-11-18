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
  Phone
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
    const existing = storageService.getCustomerByPhone(phone);
    if (existing) {
      selectCustomer(existing);
      setShowNewCustomerForm(false);
      setPhoneInput('');
    } else {
      setShowNewCustomerForm(true);
    }
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
      case 'Platinum': return 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-glow-amber/20';
      case 'Gold': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Silver': return 'bg-slate-400/15 text-slate-200 border-slate-400/30';
      default: return 'bg-orange-500/15 text-orange-300 border-orange-500/30';
    }
  };

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="bg-dark-900 border border-white/[0.08] rounded-2xl p-3 mb-2 shadow-inner">
      
      {/* If No Customer Linked */}
      {!selectedCustomer && !showNewCustomerForm && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-orange-400" />
              Customer Loyalty & Points
            </span>
            <span className="text-[10px] text-slate-500 font-mono">10 Digits</span>
          </div>

          <div className="relative">
            <input
              type="tel"
              value={phoneInput}
              onChange={handlePhoneChange}
              placeholder="Search or enter customer mobile..."
              className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-8.5 font-mono shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5" />
            {phoneInput.length === 10 && (
              <button
                type="button"
                onClick={() => searchCustomer(phoneInput)}
                className="absolute right-1.5 top-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg text-[10px] font-bold shadow"
              >
                Lookup
              </button>
            )}
          </div>
        </div>
      )}

      {/* New Customer Form */}
      {!selectedCustomer && showNewCustomerForm && (
        <form onSubmit={handleCreateCustomer} className="space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" />
              New Customer Sign-Up
            </span>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Mobile: <strong className="text-white font-mono">{phoneInput}</strong></span>
            {potentialPointsEarned > 0 && (
              <span className="text-emerald-400 font-bold font-mono">+{potentialPointsEarned} pts on this bill</span>
            )}
          </div>

          <input
            type="text"
            required
            autoFocus
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Full Name (e.g. Rahul Sharma)"
            className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold py-1.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Register & Link Account</span>
            </button>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="px-3 py-1.5 bg-dark-800 text-slate-300 text-xs rounded-xl hover:bg-dark-700"
            >
              Skip
            </button>
          </div>
        </form>
      )}

      {/* Linked VIP Customer Card */}
      {selectedCustomer && (
        <div className="space-y-2.5 animate-fade-in">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">{selectedCustomer.name}</span>
                <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${getTierColor(selectedCustomer.tier)}`}>
                  {selectedCustomer.tier} VIP
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {selectedCustomer.phone} • {selectedCustomer.totalVisits} visits • {currency}{selectedCustomer.lifetimeSpend} spent
              </div>
            </div>

            <button
              onClick={() => selectCustomer(null)}
              title="Remove customer from this bill"
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-dark-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Loyalty Points Balance Card */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-950 border border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Available Points</span>
                <span className="font-extrabold text-xs text-amber-400 font-mono tabular-nums">
                  {selectedCustomer.currentPoints} pts ({currency}{selectedCustomer.currentPoints * settings.loyaltyPointValue})
                </span>
              </div>
            </div>

            {subtotal >= settings.minOrderToEarn && potentialPointsEarned > 0 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                +{potentialPointsEarned} pts earned
              </span>
            )}
          </div>

          {/* Points Redemption Slider / Quick Chips */}
          {selectedCustomer.currentPoints > 0 && maxRedeemablePoints > 0 && (
            <div className="pt-1.5 border-t border-white/[0.06]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  Redeem Points for Discount?
                </span>
                <span className="text-[11px] font-mono font-bold text-orange-400">
                  {pointsToRedeem} pts = -{currency}{pointsToRedeem * settings.loyaltyPointValue}
                </span>
              </div>

              {/* Quick Action Chips */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(0)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    pointsToRedeem === 0 ? 'bg-orange-500 text-white shadow' : 'bg-dark-800 text-slate-400 hover:text-white'
                  }`}
                >
                  None
                </button>
                {maxRedeemablePoints >= 50 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(50)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsToRedeem === 50 ? 'bg-orange-500 text-white shadow' : 'bg-dark-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    50 pts (-{currency}50)
                  </button>
                )}
                {maxRedeemablePoints >= 100 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(100)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                      pointsToRedeem === 100 ? 'bg-orange-500 text-white shadow' : 'bg-dark-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    100 pts (-{currency}100)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-bold transition-all ${
                    pointsToRedeem === maxRedeemablePoints ? 'bg-orange-500 text-white shadow' : 'bg-dark-800 text-slate-400 hover:text-white'
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
