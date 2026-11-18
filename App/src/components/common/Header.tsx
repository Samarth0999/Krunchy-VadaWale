import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  Maximize2, 
  Minimize2, 
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
      label: 'POS', 
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      badge: cartTotalQuantity > 0 ? cartTotalQuantity : undefined
    },
    { 
      id: 'tables', 
      label: 'Tables', 
      icon: <LayoutGrid className="w-3.5 h-3.5" />,
      badge: `${occupiedTablesCount}/${tables.length}`
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <ClipboardList className="w-3.5 h-3.5" />,
      badge: orders.length > 0 ? orders.length : undefined
    },
    { 
      id: 'menu', 
      label: 'Catalog', 
      icon: <BookOpen className="w-3.5 h-3.5" /> 
    },
    { 
      id: 'customers', 
      label: 'Customers', 
      icon: <Users className="w-3.5 h-3.5" /> 
    },
    { 
      id: 'loyalty', 
      label: 'Loyalty', 
      icon: <Award className="w-3.5 h-3.5" /> 
    },
    { 
      id: 'reports', 
      label: 'Analytics', 
      icon: <BarChart3 className="w-3.5 h-3.5" /> 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: <Settings className="w-3.5 h-3.5" /> 
    },
  ];

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md text-zinc-100 sticky top-0 z-40 select-none">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div 
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 group-hover:border-zinc-700 transition-colors">
            <Flame className="w-4 h-4 fill-orange-500/20" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-sm tracking-tight text-zinc-100">KRUNCHY</span>
            <span className="text-[10px] text-zinc-500 font-mono tracking-wider">POS</span>
          </div>
        </div>

        {/* Navigation Tabs - Minimal Segmented Control */}
        <nav className="hidden lg:flex items-center p-0.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  isActive 
                    ? 'bg-zinc-800 text-zinc-100 shadow-xs' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-zinc-900 text-zinc-300' : 'bg-zinc-800/80 text-zinc-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Status / Utility */}
        <div className="flex items-center gap-3">
          
          {/* Cloud Sync Status Indicator */}
          <div 
            title={isCloudConnected ? "Cloud Synced (Firestore)" : "Local Storage Mode"}
            className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-medium"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isCloudConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-[11px]">{isCloudConnected ? 'Cloud' : 'Offline'}</span>
          </div>

          <div className="hidden xl:block h-3 w-px bg-zinc-800"></div>

          {/* Clock & Cashier */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-zinc-400">
            <span className="font-mono text-zinc-300">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-[11px] truncate max-w-[120px]">
              {settings.cashierName || 'Counter 1'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (window.confirm("Reload demo menu, sample orders and customers?")) {
                  resetAndSeedDemoData();
                }
              }}
              title="Reset Demo Data"
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-md transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Navigation bar */}
      <div className="flex lg:hidden overflow-x-auto px-2 py-1 gap-1 bg-zinc-950 border-t border-zinc-800/80 scrollbar-none">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors ${
                isActive ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span className="text-[10px] px-1 bg-zinc-900 rounded font-mono text-zinc-300">{item.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
