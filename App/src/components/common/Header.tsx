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
  Sparkles
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
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

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { 
      id: 'pos', 
      label: 'POS & Billing', 
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: cartTotalQuantity > 0 ? cartTotalQuantity : undefined
    },
    { 
      id: 'tables', 
      label: 'Tables & Floor', 
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
      id: 'menu', 
      label: 'Menu Catalog', 
      icon: <BookOpen className="w-4 h-4" /> 
    },
    { 
      id: 'customers', 
      label: 'Customers & CRM', 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      id: 'loyalty', 
      label: 'Loyalty Ledger', 
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
    <header className="bg-dark-950/90 backdrop-blur-xl border-b border-white/[0.08] text-white sticky top-0 z-40 select-none shadow-surface">
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-3 cursor-pointer group"
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
            <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[170px] sm:max-w-xs">
              {settings.name || 'Krunchy Foods'}
            </p>
          </div>
        </div>

        {/* Center: Segmented Navigation Bar */}
        <nav className="hidden lg:flex items-center gap-1 bg-dark-900/90 p-1.5 rounded-xl border border-white/[0.06] shadow-inner">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange scale-[1.02]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
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
        <div className="flex items-center gap-3">
          
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
          <div className="hidden xl:flex items-center gap-2.5 bg-dark-900/90 border border-white/[0.06] px-3 py-1 rounded-xl">
            <div className="text-right">
              <div className="text-xs font-mono font-bold text-white tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                {settings.cashierName || 'Counter 1'}
              </div>
            </div>
          </div>

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

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto px-2 py-2 gap-1.5 bg-dark-950 border-t border-white/[0.06]">
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
  );
};
