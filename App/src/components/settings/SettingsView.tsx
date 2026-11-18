import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { RestaurantSettings } from '../../types';
import { 
  Settings, 
  Store, 
  Receipt, 
  Award, 
  QrCode, 
  Printer, 
  RotateCcw, 
  Download, 
  Check, 
  CloudCheck,
  ShieldCheck
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Platform Settings & Hardware</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure restaurant identity, GST tax slabs, UPI merchant VPA, loyalty earn rates, and thermal printers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <CloudCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-mono">Project: {firebaseConfig.projectId}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: Restaurant Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-medium block mb-1">Full Address (Printed on Receipt)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                placeholder="29AABCU9603R1ZM"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">FSSAI License #</label>
              <input
                type="text"
                value={formData.fssai}
                onChange={(e) => handleChange('fssai', e.target.value)}
                placeholder="11223344556677"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Active Cashier / Terminal Name</label>
              <input
                type="text"
                value={formData.cashierName}
                onChange={(e) => handleChange('cashierName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Billing & Tax Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Receipt className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Taxes, Currency & Payment</h3>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Tax Label on Receipt</label>
              <input
                type="text"
                value={formData.taxName}
                onChange={(e) => handleChange('taxName', e.target.value)}
                placeholder="GST (CGST 2.5% + SGST 2.5%)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="₹"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Merchant UPI VPA ID (For QR Code)</label>
              <input
                type="text"
                value={formData.upiVpa}
                onChange={(e) => handleChange('upiVpa', e.target.value)}
                placeholder="krunchy.pos@upi"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Automated Loyalty Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Award className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Automated Loyalty & Rewards Rules Engine</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Earn 1 Point for every Spend of (₹)</label>
              <input
                type="number"
                min={1}
                value={formData.loyaltyEarnRate}
                onChange={(e) => handleChange('loyaltyEarnRate', Number(e.target.value))}
                placeholder="10"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. ₹10 spent = 1 Point (10% return)</span>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">e.g. 1 Point = ₹1 discount</span>
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
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Prevents 100% free bills if desired</span>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Minimum Order to Earn Points (₹)</label>
              <input
                type="number"
                min={0}
                value={formData.minOrderToEarn}
                onChange={(e) => handleChange('minOrderToEarn', Number(e.target.value))}
                placeholder="50"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Subtotal qualification threshold</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Thermal Printer Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Printer className="w-4 h-4 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Thermal Receipt Printer Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Default Roll Width</label>
              <select
                value={formData.printerWidth}
                onChange={(e) => handleChange('printerWidth', e.target.value as '80mm' | '58mm')}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500"
              >
                <option value="80mm">80mm (Standard Desktop Thermal Roll - Recommended)</option>
                <option value="58mm">58mm (Compact / Handheld Thermal Roll)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div>
                <span className="font-medium text-white block">Auto-Open Receipt after Checkout</span>
                <span className="text-[10px] text-slate-400">Instantly triggers receipt preview dialog</span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('autoPrintReceipt', !formData.autoPrintReceipt)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.autoPrintReceipt ? 'bg-orange-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackupJSON}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Settings JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reload demo menu, sample orders and customers?")) {
                  resetAndSeedDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Demo Data</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 transition-all"
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Check className="w-4 h-4" />}
            <span>{isSaved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};

