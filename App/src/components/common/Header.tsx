import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ClipboardList, 
  UtensilsCrossed, 
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
  LayoutGrid,
  BookOpen
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
      label: 'Loyalty & Ledger', 
      icon: <Award className="w-4 h-4" /> 
    },
    { 
      id: 'reports', 
      label: 'Analytics & Reports', 
      icon: <BarChart3 className="w-4 h-4" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-4 h-4" /> 
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 select-none">
      <div className="px-4 py-2 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider text-white">KRUNCHY</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">
                POS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-xs">{settings.tagline || 'Restaurant & Loyalty'}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-600/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                    isActive ? 'bg-black/30 text-white' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status / Quick Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* Cloud Sync Status */}
          <div 
            title={isCloudConnected ? "Connected to Firebase Cloud Firestore" : "Running on Local Offline Storage"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              isCloudConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}
          >
            {isCloudConnected ? <CloudCheck className="w-3.5 h-3.5" /> : <CloudOff className="w-3.5 h-3.5" />}
            <span>{isCloudConnected ? 'Cloud Sync' : 'Local Offline'}</span>
          </div>

          {/* Time & Counter */}
          <div className="hidden xl:flex flex-col text-right">
            <span className="text-xs font-mono font-semibold text-slate-200">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className="text-[10px] text-slate-400">
              {settings.cashierName || 'Counter 1'}
            </span>
          </div>

          {/* Quick Demo Seed */}
          <button
            onClick={() => {
              if (window.confirm("Reload demo menu, sample orders and customers?")) {
                resetAndSeedDemoData();
              }
            }}
            title="Reset / Seed Demo Data"
            className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto px-2 py-1.5 gap-1 bg-slate-950/80 border-t border-slate-800">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                isActive ? 'bg-orange-500 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[10px] px-1 bg-black/40 rounded-full font-bold">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
