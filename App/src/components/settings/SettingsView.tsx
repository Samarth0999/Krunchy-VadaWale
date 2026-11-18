import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { RestaurantSettings } from '../../types';
import { 
  Settings, 
  Store, 
  Receipt, 
  Award, 
  Printer, 
  RotateCcw, 
  Download, 
  Check, 
  CloudCheck,
  ShieldCheck,
  Sliders,
  Sparkles
} from 'lucide-react';
import { firebaseConfig } from '../../config/firebase';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAndSeedDemoData, isCloudConnected } = usePOS();
  
  const [formData, setFormData] = useState<RestaurantSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleBackupJSON = () => {
    const data = {
      settings: formData,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krunchy_pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">System Configuration & Hardware</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure restaurant identity, GST tax slabs, UPI merchant VPA, loyalty earn rates, and thermal printers.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-dark-950 px-3.5 py-2 rounded-xl border border-white/[0.08] text-xs shadow-inner">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <CloudCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-mono">Firebase: {firebaseConfig.projectId}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: Restaurant Identity */}
        <div className="bg-dark-900 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-surface">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Store className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Restaurant Identity & Receipt Header</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Restaurant Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-medium block mb-1">Full Address (Printed on Thermal Receipt)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">GSTIN Registration #</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                placeholder="27AAEFK1234F1Z5"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors uppercase"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">FSSAI License #</label>
              <input
                type="text"
                value={formData.fssai}
                onChange={(e) => handleChange('fssai', e.target.value)}
                placeholder="11521018000345"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Active Cashier / Terminal Name</label>
              <input
                type="text"
                value={formData.cashierName}
                onChange={(e) => handleChange('cashierName', e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Billing & Tax Settings */}
        <div className="bg-dark-900 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-surface">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Receipt className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Taxes, Currency & Payment Gateway</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Tax Label on Receipt</label>
              <input
                type="text"
                value={formData.taxName}
                onChange={(e) => handleChange('taxName', e.target.value)}
                placeholder="GST (CGST 2.5% + SGST 2.5%)"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="₹"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Merchant UPI VPA ID (For Dynamic QR)</label>
              <input
                type="text"
                value={formData.upiVpa}
                onChange={(e) => handleChange('upiVpa', e.target.value)}
                placeholder="krunchy@icici"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Automated Loyalty Rules */}
        <div className="bg-dark-900 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-surface">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Award className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Automated Loyalty & Rewards Rules Engine</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Earn 1 Point for every (₹) spent</label>
              <input
                type="number"
                min={1}
                value={formData.loyaltyEarnRate}
                onChange={(e) => handleChange('loyaltyEarnRate', Number(e.target.value))}
                placeholder="10"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">e.g. ₹10 spent = 1 Point (10% rebate)</span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">1 Point Redemption Value (₹)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={formData.loyaltyPointValue}
                onChange={(e) => handleChange('loyaltyPointValue', Number(e.target.value))}
                placeholder="1"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">e.g. 1 Point = ₹1 discount credit</span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Max % of Bill Payable via Points</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.maxRedemptionPercent}
                onChange={(e) => handleChange('maxRedemptionPercent', Number(e.target.value))}
                placeholder="50"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Limits max point discount per bill</span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Min Order to Earn Points (₹)</label>
              <input
                type="number"
                min={0}
                value={formData.minOrderToEarn}
                onChange={(e) => handleChange('minOrderToEarn', Number(e.target.value))}
                placeholder="50"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 font-mono text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Minimum ticket qualification threshold</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Thermal Receipt Printer */}
        <div className="bg-dark-900 border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-surface">
          <div className="flex items-center gap-2 pb-3 border-b border-white/[0.06]">
            <Printer className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Thermal Receipt Printer Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Default Roll Width</label>
              <select
                value={formData.printerWidth}
                onChange={(e) => handleChange('printerWidth', e.target.value as '80mm' | '58mm')}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-orange-500 shadow-inner transition-colors"
              >
                <option value="80mm">80mm (Standard Desktop Thermal Roll - Recommended)</option>
                <option value="58mm">58mm (Compact / Handheld Thermal Roll)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-dark-950/70 border border-white/[0.06] shadow-inner">
              <div>
                <span className="font-medium text-white block">Auto-Open Receipt after Checkout</span>
                <span className="text-[10px] text-slate-400">Instantly triggers receipt preview dialog upon payment</span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('autoPrintReceipt', !formData.autoPrintReceipt)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-all ${
                  formData.autoPrintReceipt ? 'bg-orange-500 justify-end' : 'bg-dark-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Action / Save Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-dark-900 border border-white/[0.08] rounded-2xl shadow-surface">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleBackupJSON}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold rounded-xl border border-white/[0.08] transition-colors shadow-sm"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Export JSON Backup</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reload demo menu, sample orders and customers?")) {
                  resetAndSeedDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-200 text-xs font-semibold rounded-xl border border-white/[0.08] transition-colors shadow-sm"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>Reload Demo Data</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-7 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-glow-orange transition-all active:scale-[0.98]"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved Successfully!' : 'Save System Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
