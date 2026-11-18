import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Search, 
  ShoppingBag, 
  LayoutGrid, 
  ClipboardList, 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Sparkles, 
  X, 
  Plus, 
  Printer, 
  ArrowRight,
  Flame,
  UtensilsCrossed
} from 'lucide-react';
import { ActiveTab, Product } from '../../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    setActiveTab, 
    products, 
    tables, 
    customers, 
    orders, 
    addToCart, 
    selectTable, 
    openReceiptModal,
    settings 
  } = usePOS();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K or Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Handled by parent or toggled
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const currency = settings.currencySymbol || '₹';

  // Navigation Items
  const navActions = useMemo(() => [
    { id: 'pos' as ActiveTab, label: 'Touch POS & Quick Billing', icon: <ShoppingBag className="w-4 h-4 text-orange-400" />, category: 'Navigation' },
    { id: 'tables' as ActiveTab, label: 'Floor Plan & Table Management', icon: <LayoutGrid className="w-4 h-4 text-emerald-400" />, category: 'Navigation' },
    { id: 'orders' as ActiveTab, label: 'Order History & Thermal Receipts', icon: <ClipboardList className="w-4 h-4 text-sky-400" />, category: 'Navigation' },
    { id: 'menu' as ActiveTab, label: 'Food Menu Catalog Management', icon: <BookOpen className="w-4 h-4 text-amber-400" />, category: 'Navigation' },
    { id: 'customers' as ActiveTab, label: 'Customer Directory & VIP CRM', icon: <Users className="w-4 h-4 text-purple-400" />, category: 'Navigation' },
    { id: 'loyalty' as ActiveTab, label: 'Loyalty Points Audit Ledger', icon: <Award className="w-4 h-4 text-rose-400" />, category: 'Navigation' },
    { id: 'reports' as ActiveTab, label: 'Business Intelligence & EoD Reports', icon: <BarChart3 className="w-4 h-4 text-emerald-400" />, category: 'Navigation' },
    { id: 'showcase' as ActiveTab, label: 'Customer Digital Showcase Menu', icon: <Sparkles className="w-4 h-4 text-yellow-400" />, category: 'Navigation' },
    { id: 'settings' as ActiveTab, label: 'Hardware & Tax Settings', icon: <Settings className="w-4 h-4 text-slate-400" />, category: 'Navigation' },
  ], []);

  // Filtered Results
  const filteredNav = useMemo(() => {
    if (!query.trim()) return navActions;
    const q = query.toLowerCase().trim();
    return navActions.filter(a => a.label.toLowerCase().includes(q));
  }, [navActions, query]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter(p => p.isActive && (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))).slice(0, 5);
  }, [products, query]);

  const filteredTables = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return tables.filter(t => t.name.toLowerCase().includes(q) || t.section.toLowerCase().includes(q)).slice(0, 4);
  }, [tables, query]);

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return customers.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q)).slice(0, 3);
  }, [customers, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-dark-900 border border-white/[0.12] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] shadow-glow-orange/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-dark-950">
          <Search className="w-5 h-5 text-orange-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search dishes, tables, orders, patrons..."
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-dark-800 text-slate-400 border border-white/[0.08]">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-dark-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* Quick Dishes Results */}
          {filteredProducts.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Dishes (Click to Add to Cart)
              </span>
              <div className="space-y-1">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addToCart(product);
                      setActiveTab('pos');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`fssai-indicator ${product.isVeg ? 'fssai-veg' : 'fssai-nonveg'}`}>
                        {product.isVeg ? <div className="fssai-veg-dot"></div> : <div className="fssai-nonveg-triangle"></div>}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white group-hover:text-orange-400">{product.name}</span>
                        <span className="text-[10px] text-slate-400 block">{product.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 tabular-nums">{currency}{product.price}</span>
                      <span className="text-[10px] px-2 py-1 bg-orange-500 text-white rounded-lg font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Table Results */}
          {filteredTables.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Tables & Floor
              </span>
              <div className="space-y-1">
                {filteredTables.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      selectTable(t.id);
                      setActiveTab('pos');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center font-bold text-xs">
                        🪑
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white">{t.name}</span>
                        <span className="text-[10px] text-slate-400 block">{t.section} • {t.capacity} seats</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Customer Results */}
          {filteredCustomers.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
                Customers & Loyalty
              </span>
              <div className="space-y-1">
                {filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveTab('customers');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                        👤
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white">{c.name}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{c.phone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-purple-400">{c.currentPoints} pts</span>
                      <span className="text-[9px] text-slate-500 block">{c.tier} VIP</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Commands */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-1">
              Modules & Navigation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredNav.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    onClose();
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] text-left transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white">{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-dark-950 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigation: <kbd className="font-mono text-slate-400">↑↓</kbd></span>
            <span>Open: <kbd className="font-mono text-slate-400">Enter</kbd></span>
          </div>
          <span>KRUNCHY Fast POS</span>
        </div>

      </div>
    </div>
  );
};
