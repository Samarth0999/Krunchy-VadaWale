import React, { useState, useEffect } from 'react';
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
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getStoredSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../../config/supabase';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAndSeedDemoData, isCloudConnected } = usePOS();
  
  const [formData, setFormData] = useState<RestaurantSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; message?: string }>({ loading: false });

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseAnonKey(config.anonKey);
  }, []);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleTestSupabase = async () => {
    setTestStatus({ loading: true });
    const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
    setTestStatus({
      loading: false,
      success: result.success,
      message: result.message
    });
  };

  const handleBackupJSON = () => {
    const data = {
      settings: formData,
      supabaseConfig: {
        url: supabaseUrl,
        configured: Boolean(supabaseUrl && supabaseAnonKey)
      },
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">System Settings</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Store identity, GST tax slabs, Supabase PostgreSQL credentials, loyalty rates, and thermal printers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-300 font-mono text-[11px]">
            {isCloudConnected ? 'Supabase Connected' : 'Local Storage Mode'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-5xl">

        {/* SECTION 1: Supabase (PostgreSQL) Cloud Backend */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">
                Supabase Backend (PostgreSQL)
              </h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
              Relational PostgreSQL + Realtime
            </span>
          </div>

          <p className="text-xs text-zinc-400">
            All food orders, itemized lines, customers, loyalty ledgers, and table statuses synchronize with your self-hosted or cloud Supabase PostgreSQL database.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">
                Supabase Public Anon Key
              </label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 font-mono focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testStatus.loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>{testStatus.loading ? 'Testing Connection...' : 'Test Connection'}</span>
              </button>

              {testStatus.message && (
                <div className={`flex items-center gap-1.5 text-xs ${testStatus.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>

            <span className="text-[10px] text-zinc-500 font-mono">
              Schema: public (7 tables + 3 reporting views)
            </span>
          </div>
        </div>
        
        {/* SECTION 2: Restaurant Identity */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/60">
            <Store className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">Restaurant Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Restaurant Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Receipt Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={formData.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
                placeholder="29AABCU9603R1ZM"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">FSSAI License #</label>
              <input
                type="text"
                value={formData.fssai}
                onChange={(e) => handleChange('fssai', e.target.value)}
                placeholder="11223344556677"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Cashier Terminal Name</label>
              <input
                type="text"
                value={formData.cashierName}
                onChange={(e) => handleChange('cashierName', e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Billing & Tax Settings */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/60">
            <Receipt className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">Taxes & UPI Payment</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={formData.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Tax Label on Receipt</label>
              <input
                type="text"
                value={formData.taxName}
                onChange={(e) => handleChange('taxName', e.target.value)}
                placeholder="GST (CGST 2.5% + SGST 2.5%)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                placeholder="₹"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Merchant UPI VPA ID</label>
              <input
                type="text"
                value={formData.upiVpa}
                onChange={(e) => handleChange('upiVpa', e.target.value)}
                placeholder="krunchy.pos@upi"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: Automated Loyalty Rules */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/60">
            <Award className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">Loyalty & Rewards Configuration</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Spend per 1 Pt (₹)</label>
              <input
                type="number"
                min={1}
                value={formData.loyaltyEarnRate}
                onChange={(e) => handleChange('loyaltyEarnRate', Number(e.target.value))}
                placeholder="10"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">₹10 spent = 1 point</span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Point Redemption Value (₹)</label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={formData.loyaltyPointValue}
                onChange={(e) => handleChange('loyaltyPointValue', Number(e.target.value))}
                placeholder="1"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">1 point = ₹1 discount</span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Max % Bill via Points</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.maxRedemptionPercent}
                onChange={(e) => handleChange('maxRedemptionPercent', Number(e.target.value))}
                placeholder="50"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Prevents 100% free bills</span>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Min Order to Earn (₹)</label>
              <input
                type="number"
                min={0}
                value={formData.minOrderToEarn}
                onChange={(e) => handleChange('minOrderToEarn', Number(e.target.value))}
                placeholder="50"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
              <span className="text-[10px] text-zinc-500 mt-1 block">Subtotal qualification</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: Thermal Printer Settings */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-800/60">
            <Printer className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-xs text-zinc-200 uppercase tracking-wider">Thermal Printer Hardware</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="text-[11px] text-zinc-400 font-medium block mb-1">Default Roll Width</label>
              <select
                value={formData.printerWidth}
                onChange={(e) => handleChange('printerWidth', e.target.value as '80mm' | '58mm')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                <option value="80mm">80mm (Standard Desktop Thermal Roll)</option>
                <option value="58mm">58mm (Handheld / Compact Roll)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/60">
              <div>
                <span className="font-medium text-zinc-200 block text-xs">Auto-Open Receipt after Checkout</span>
                <span className="text-[10px] text-zinc-500">Preview receipt dialog on bill completion</span>
              </div>
              <button
                type="button"
                onClick={() => handleChange('autoPrintReceipt', !formData.autoPrintReceipt)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  formData.autoPrintReceipt ? 'bg-orange-600 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-sm"></div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBackupJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Config</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reload demo menu, sample orders and customers?")) {
                  resetAndSeedDemoData();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
          >
            {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{isSaved ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
};
