import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { RestaurantSettings, StaffRole } from '../../types';
import { 
  Settings, 
  Store, 
  Receipt, 
  Award, 
  Printer, 
  Download, 
  Check, 
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  Key
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    isCloudConnected,
    staffDirectory,
    addStaffMember,
    removeStaffMember
  } = usePOS();
  
  const [formData, setFormData] = useState<RestaurantSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  // New staff form state
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('Cashier');
  const [isAddingStaff, setIsAddingStaff] = useState(false);

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

  const handleAddNewStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail.trim()) return;

    setIsAddingStaff(true);
    const res = await addStaffMember(newStaffEmail, newStaffName, newStaffRole);
    setIsAddingStaff(false);

    if (res.success) {
      setNewStaffEmail('');
      setNewStaffName('');
      setNewStaffRole('Cashier');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">System Settings</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Store identity, GST tax slabs, merchant UPI, loyalty rates, and thermal printers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg text-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-zinc-300 font-mono text-[11px]">
            {isCloudConnected ? 'Cloud Active' : 'Local Storage Mode'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-5xl">

        {/* SECTION 1: Restaurant Identity */}
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

        {/* SECTION 2: Billing & Tax Settings */}
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

        {/* SECTION 3: Automated Loyalty Rules */}
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

        {/* SECTION 4: Thermal Printer Settings */}
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

        {/* SECTION 5: Staff Accounts & Google OAuth Access */}
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-500" />
              <div>
                <h3 className="font-semibold text-xs text-zinc-100">Authorized Staff Directory</h3>
                <p className="text-[10px] text-zinc-400">Pre-register staff Google accounts to grant POS access and assign roles</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-mono">
              <Key className="w-3 h-3" />
              <span>Google OAuth 2.0 Protected</span>
            </div>
          </div>

          {/* Add Staff Form */}
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
            <span className="text-[11px] font-semibold text-zinc-300 block uppercase tracking-wider">
              Authorize New Staff Member
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              <div className="sm:col-span-2">
                <input
                  type="email"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="staff.member@gmail.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Staff Name (e.g. Rahul)"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <button
                  type="button"
                  onClick={handleAddNewStaff}
                  disabled={isAddingStaff || !newStaffEmail.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Authorize</span>
                </button>
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">
              Only Google accounts added to this list will be allowed to log into the billing counter.
            </p>
          </div>

          {/* Authorized Staff Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 text-[10px] uppercase font-semibold">
                  <th className="py-2 px-3">Staff Member</th>
                  <th className="py-2 px-3">Google Email</th>
                  <th className="py-2 px-3">Assigned Role</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {staffDirectory.map((staff) => (
                  <tr key={staff.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-2.5 px-3 font-medium text-zinc-200">
                      {staff.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400 text-[11px]">
                      {staff.email}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        staff.role === 'Admin' 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                          : staff.role === 'Manager'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>{staff.authUserId ? 'Google Linked' : 'Authorized (Pending Sign-in)'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeStaffMember(staff.id)}
                        className="p-1 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                        title="Remove staff authorization"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
