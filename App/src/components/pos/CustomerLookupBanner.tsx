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
  Sparkles
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
      name: newCustomerName.trim() || 'Customer',
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

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-2.5 mb-2.5">
      
      {/* If No Customer Linked */}
      {!selectedCustomer && !showNewCustomerForm && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 font-medium">
              <User className="w-3 h-3 text-zinc-400" />
              Customer Loyalty
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">10 digits</span>
          </div>

          <div className="relative">
            <input
              type="tel"
              value={phoneInput}
              onChange={handlePhoneChange}
              placeholder="Search phone number..."
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 pl-7 font-mono"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2 top-2" />
            {phoneInput.length === 10 && (
              <button
                type="button"
                onClick={() => searchCustomer(phoneInput)}
                className="absolute right-1 top-1 px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] font-medium transition-colors"
              >
                Lookup
              </button>
            )}
          </div>
        </div>
      )}

      {/* New Customer Inline Form */}
      {!selectedCustomer && showNewCustomerForm && (
        <form onSubmit={handleCreateCustomer} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-zinc-400" />
              New Customer ({phoneInput})
            </span>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            type="text"
            required
            autoFocus
            value={newCustomerName}
            onChange={(e) => setNewCustomerName(e.target.value)}
            placeholder="Full Name (e.g. Rahul Sharma)"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
          />

          <div className="flex gap-1.5">
            <button
              type="submit"
              className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold py-1 rounded-md transition-colors"
            >
              Save & Link
            </button>
            <button
              type="button"
              onClick={() => { setShowNewCustomerForm(false); setPhoneInput(''); }}
              className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-md hover:bg-zinc-700"
            >
              Skip
            </button>
          </div>
        </form>
      )}

      {/* Active Customer Details Banner */}
      {selectedCustomer && (
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-zinc-100">{selectedCustomer.name}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                  {selectedCustomer.tier}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {selectedCustomer.phone} • {selectedCustomer.totalVisits} visits • {currency}{selectedCustomer.lifetimeSpend}
              </div>
            </div>

            <button
              onClick={() => selectCustomer(null)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5"
              title="Remove customer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Points Pill */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/80 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Balance: <strong className="text-zinc-200 font-mono">{selectedCustomer.currentPoints} pts</strong> ({currency}{selectedCustomer.currentPoints * settings.loyaltyPointValue})</span>
            </div>

            {subtotal >= settings.minOrderToEarn && potentialPointsEarned > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono">
                +{potentialPointsEarned} pts
              </span>
            )}
          </div>

          {/* Points Redemption Slider / Buttons */}
          {selectedCustomer.currentPoints > 0 && maxRedeemablePoints > 0 && (
            <div className="pt-1.5 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-[11px] mb-1 text-zinc-400">
                <span className="flex items-center gap-1 font-medium text-zinc-300">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Redeem Points?
                </span>
                <span className="font-mono text-zinc-300">
                  {pointsToRedeem > 0 ? `-${currency}${pointsToRedeem * settings.loyaltyPointValue}` : 'None'}
                </span>
              </div>

              <div className="flex gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(0)}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors border ${
                    pointsToRedeem === 0 
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  0
                </button>
                {maxRedeemablePoints >= 50 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(50)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors border ${
                      pointsToRedeem === 50 
                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    50 (-{currency}50)
                  </button>
                )}
                {maxRedeemablePoints >= 100 && (
                  <button
                    type="button"
                    onClick={() => setPointsToRedeem(100)}
                    className={`text-[10px] px-2 py-0.5 rounded transition-colors border ${
                      pointsToRedeem === 100 
                        ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    100 (-{currency}100)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                  className={`text-[10px] px-2 py-0.5 rounded transition-colors border ${
                    pointsToRedeem === maxRedeemablePoints 
                      ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  Max ({maxRedeemablePoints})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
