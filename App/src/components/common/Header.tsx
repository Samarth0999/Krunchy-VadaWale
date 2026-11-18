import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ClipboardList, 
  LayoutGrid, 
  BookOpen, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Maximize2, 
  Minimize2, 
  CloudCheck, 
  CloudOff,
  Flame,
  RotateCcw,
  Sparkles,
  Search,
  Command,
  UtensilsCrossed,
  Sun,
  Moon
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types';
import { CommandPaletteModal } from './CommandPaletteModal';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    theme,
    toggleTheme,
    cartTotalQuantity, 
    settings, 
    isCloudConnected,
    orders,
    tables,
    occupiedTablesCount,
    resetAndSeedDemoData
  } = usePOS();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string; highlight?: boolean }[] = [
    { 
      id: 'pos', 
      label: 'Touch POS', 
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: cartTotalQuantity > 0 ? cartTotalQuantity : undefined
    },
    { 
      id: 'tables', 
      label: 'Floor & Tables', 
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: `${occupiedTablesCount}/${tables.length}`
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <ClipboardList className="w-4 h-4" />,
      badge: orders.length
    },
    { 
      id: 'showcase', 
      label: 'Digital Menu', 
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      highlight: true
    },
    { 
      id: 'menu', 
      label: 'Catalog', 
      icon: <BookOpen className="w-4 h-4" /> 
    },
    { 
      id: 'customers', 
      label: 'CRM', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'loyalty', 
      label: 'Loyalty', 
      icon: <Award className="w-4 h-4" /> 
    },
    { 
      id: 'reports', 
      label: 'Analytics', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  return (
    <>
      <header className="bg-dark-950/90 backdrop-blur-xl border-b border-white/[0.08] text-white sticky top-0 z-40 select-none shadow-surface">
        <div className="px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Station Info */}
          <div 
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-glow-orange group-hover:scale-105 transition-all duration-300">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-dark-950 rounded-full" title="Terminal Online"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-wider text-white">KRUNCHY</span>
                <span className="text-[9px] uppercase font-extrabold tracking-widest bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
                  POS v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[140px] sm:max-w-xs">
                {settings.name || 'Krunchy Foods'}
              </p>
            </div>
          </div>

          {/* Quick Command Bar Trigger */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-3.5 py-1.5 bg-dark-900 hover:bg-dark-850 border border-white/[0.08] rounded-xl text-slate-400 hover:text-white transition-all text-xs shadow-inner"
          >
            <Search className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-slate-400">Search anything...</span>
            <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dark-950 border border-white/[0.08] text-slate-400 ml-2">
              ⌘K
            </kbd>
          </button>

          {/* Center: Segmented Navigation Bar */}
          <nav className="hidden xl:flex items-center gap-1 bg-dark-900/90 p-1.5 rounded-xl border border-white/[0.06] shadow-inner">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange scale-[1.02]' 
                      : item.highlight
                        ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <span className={isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono leading-tight ${
                      isActive ? 'bg-black/40 text-white' : 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status & Quick Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Cloud Sync Status */}
            <div 
              title={isCloudConnected ? "Connected to Firebase Cloud Firestore" : "Running on Local Offline Storage"}
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all ${
                isCloudConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-glow-emerald/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>{isCloudConnected ? 'Cloud Active' : 'Offline Mode'}</span>
            </div>

            {/* Time & Counter Pill */}
            <div className="hidden lg:flex items-center gap-2.5 bg-dark-900/90 border border-white/[0.06] px-3 py-1 rounded-xl">
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-white tabular-nums">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[110px]">
                  {settings.cashierName || 'Cashier 1'}
                </div>
              </div>
            </div>

            {/* Theme Toggle Button (Light / Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Clean White Mode" : "Switch to Obsidian Dark Mode"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 active:scale-95 text-xs font-semibold bg-dark-900 hover:bg-dark-850 border-white/[0.08] hover:border-orange-500/40 text-slate-300 hover:text-white shadow-sm"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-amber-300 font-bold">White</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-orange-500" />
                  <span className="hidden sm:inline text-slate-700 dark:text-slate-300 font-bold">Dark</span>
                </>
              )}
            </button>

            {/* Quick Demo Seed */}
            <button
              onClick={() => {
                if (window.confirm("Reload demo menu, sample orders and customers?")) {
                  resetAndSeedDemoData();
                }
              }}
              title="Reset / Seed Demo Data"
              className="p-2 text-slate-400 hover:text-orange-400 hover:bg-white/[0.06] rounded-xl border border-transparent hover:border-white/[0.08] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Search Palette Icon button for mobile / tablet */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              title="Quick Search"
              className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-transparent hover:border-white/[0.08] transition-all"
            >
              <Search className="w-4 h-4 text-orange-400" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl border border-transparent hover:border-white/[0.08] transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile / Tablet Navigation bar */}
        <div className="flex xl:hidden overflow-x-auto px-2 py-2 gap-1.5 bg-dark-950 border-t border-white/[0.06] scrollbar-none">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'bg-orange-500 text-white shadow-glow-orange' : 'text-slate-400 hover:bg-white/[0.05]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="text-[10px] px-1 bg-black/40 rounded-full font-mono font-bold">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Global Command Palette Modal */}
      <CommandPaletteModal 
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </>
  );
};
