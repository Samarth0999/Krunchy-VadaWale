import React, { useState, useEffect } from 'react';
import { StaffProfile, StaffPermissions, StaffRole, getDefaultPermissions } from '../../types';
import { 
  X, 
  Shield, 
  Check, 
  Sparkles, 
  ShoppingBag, 
  LayoutGrid, 
  ClipboardList, 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Percent, 
  Tags, 
  PlusCircle, 
  Coins, 
  UserCog
} from 'lucide-react';

interface StaffPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffProfile | null;
  onSave: (staffId: string, permissions: StaffPermissions) => Promise<void>;
}

export const StaffPermissionsModal: React.FC<StaffPermissionsModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave
}) => {
  const [permissions, setPermissions] = useState<StaffPermissions>(() => 
    staff?.permissions || getDefaultPermissions(staff?.role || 'Cashier')
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (staff) {
      setPermissions(staff.permissions || getDefaultPermissions(staff.role));
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const handleToggle = (key: keyof StaffPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApplyPreset = (presetRole: StaffRole) => {
    setPermissions(getDefaultPermissions(presetRole));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(staff.id, permissions);
    setIsSaving(false);
    onClose();
  };

  const tabOptions: { key: keyof StaffPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'pos',
      label: 'POS Counter Billing',
      desc: 'Create new bills, add items to cart, split payments',
      icon: <ShoppingBag className="w-4 h-4 text-orange-400" />
    },
    {
      key: 'tables',
      label: 'Floor Tables Management',
      desc: 'Seat dine-in guests, manage live table orders & transfers',
      icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />
    },
    {
      key: 'orders',
      label: 'Orders History',
      desc: 'View past orders, inspect receipt details & reprint bills',
      icon: <ClipboardList className="w-4 h-4 text-blue-400" />
    },
    {
      key: 'menu',
      label: 'Menu Catalog',
      desc: 'View food and beverage item catalog',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />
    },
    {
      key: 'customers',
      label: 'Customer Directory (CRM)',
      desc: 'Look up customers, view visit history & lifetime spend',
      icon: <Users className="w-4 h-4 text-indigo-400" />
    },
    {
      key: 'loyalty',
      label: 'Loyalty Rewards Dashboard',
      desc: 'Inspect customer point balances, tiers & send reminders',
      icon: <Award className="w-4 h-4 text-yellow-400" />
    },
    {
      key: 'reports',
      label: 'Financial & EoD Reports',
      desc: 'Access Daily End-of-Day, Weekly & Monthly sales analytics',
      icon: <BarChart3 className="w-4 h-4 text-purple-400" />
    },
    {
      key: 'settings',
      label: 'System Settings',
      desc: 'Access restaurant identity, tax rates, UPI & hardware config',
      icon: <Settings className="w-4 h-4 text-zinc-400" />
    }
  ];

  const actionOptions: { key: keyof StaffPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'canApplyDiscount',
      label: 'Apply Manual Bill Discounts',
      desc: 'Permission to deduct custom rupee discount at checkout',
      icon: <Percent className="w-4 h-4 text-rose-400" />
    },
    {
      key: 'canManageCategories',
      label: 'Add & Delete Categories',
      desc: 'Create new menu categories or remove existing categories',
      icon: <Tags className="w-4 h-4 text-orange-400" />
    },
    {
      key: 'canEditProducts',
      label: 'Add, Edit & Delete Menu Items',
      desc: 'Create food items, edit prices, update images & delete items',
      icon: <PlusCircle className="w-4 h-4 text-cyan-400" />
    },
    {
      key: 'canAdjustLoyaltyPoints',
      label: 'Manual Loyalty Points Adjustments',
      desc: 'Manually add or deduct rewards points on customer accounts',
      icon: <Coins className="w-4 h-4 text-yellow-400" />
    },
    {
      key: 'canManageStaff',
      label: 'Manage Staff & Customize Permissions',
      desc: 'Authorize new Google staff emails and modify permission rules',
      icon: <UserCog className="w-4 h-4 text-emerald-400" />
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">{staff.name}</h3>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                  staff.role === 'Admin' 
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                    : staff.role === 'Manager'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {staff.role}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{staff.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Role Presets */}
        <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-950/40 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Apply Role Template</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleApplyPreset('Cashier')}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/80 transition-colors cursor-pointer"
            >
              Cashier Preset
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Manager')}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/80 transition-colors cursor-pointer"
            >
              Manager Preset
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Admin')}
              className="px-2.5 py-1 text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg border border-zinc-700/80 transition-colors cursor-pointer"
            >
              Admin (Full Access)
            </button>
          </div>
        </div>

        {/* Form Body with Permission Toggles */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* SECTION 1: Navigation Tabs Access */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                1. Navigation Tabs & Module Access
              </h4>
              <span className="text-[11px] text-zinc-500">
                Controls which screens are visible to this staff member
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {tabOptions.map((opt) => {
                const isEnabled = Boolean(permissions[opt.key]);

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleToggle(opt.key)}
                    className={`flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isEnabled 
                        ? 'bg-zinc-800/40 border-zinc-700/80 hover:border-zinc-600' 
                        : 'bg-zinc-950/40 border-zinc-850 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 pr-2">
                      <div className="p-1.5 rounded-lg bg-zinc-800/80 shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-200 block">{opt.label}</span>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{opt.desc}</p>
                      </div>
                    </div>

                    <div className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors shrink-0 mt-1 ${
                      isEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
                    }`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Granular Actions & Privileges */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                2. Operational & Financial Privileges
              </h4>
              <span className="text-[11px] text-zinc-500">
                Controls sensitive actions inside modules
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {actionOptions.map((opt) => {
                const isEnabled = Boolean(permissions[opt.key]);

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleToggle(opt.key)}
                    className={`flex items-start justify-between p-3 rounded-2xl border transition-all cursor-pointer select-none ${
                      isEnabled 
                        ? 'bg-zinc-800/40 border-zinc-700/80 hover:border-zinc-600' 
                        : 'bg-zinc-950/40 border-zinc-850 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 pr-2">
                      <div className="p-1.5 rounded-lg bg-zinc-800/80 shrink-0 mt-0.5">
                        {opt.icon}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-zinc-200 block">{opt.label}</span>
                        <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">{opt.desc}</p>
                      </div>
                    </div>

                    <div className={`w-8 h-4.5 rounded-full p-0.5 flex items-center transition-colors shrink-0 mt-1 ${
                      isEnabled ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
                    }`}>
                      <div className="w-3.5 h-3.5 rounded-full bg-white shadow-xs"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Save Actions */}
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/80 hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-xl transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Permissions'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
