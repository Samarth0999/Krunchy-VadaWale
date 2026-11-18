import React from 'react';
import { 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Award, 
  BarChart3, 
  Settings, 
  LayoutGrid,
  BookOpen
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ActiveTab } from '../../types';

export const MobileBottomNav: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    cartTotalQuantity, 
    orders,
    tables,
    occupiedTablesCount,
    currentStaff
  } = usePOS();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number | string }[] = [
    { 
      id: 'pos', 
      label: 'POS', 
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: cartTotalQuantity > 0 ? cartTotalQuantity : undefined
    },
    { 
      id: 'tables', 
      label: 'Tables', 
      icon: <LayoutGrid className="w-4 h-4" />,
      badge: occupiedTablesCount > 0 ? `${occupiedTablesCount}/${tables.length}` : undefined
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: <ClipboardList className="w-4 h-4" />,
      badge: orders.length > 0 ? orders.length : undefined
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

  const allowedNavItems = React.useMemo(() => {
    if (!currentStaff?.permissions) return navItems;
    return navItems.filter(item => Boolean(currentStaff.permissions[item.id]));
  }, [navItems, currentStaff]);

  return (
    <nav className="lg:hidden shrink-0 z-40 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-1 py-1 flex items-center justify-start sm:justify-center gap-1 overflow-x-auto scrollbar-none pb-[max(0.4rem,env(safe-area-inset-bottom))] select-none">
      {allowedNavItems.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 min-w-[54px] rounded-xl transition-all shrink-0 active:scale-95 ${
              isActive 
                ? 'bg-zinc-800 text-orange-400 font-semibold shadow-xs' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            <div className="relative">
              {item.icon}
              {item.badge !== undefined && (
                <span className="absolute -top-1.5 -right-2 bg-orange-500 text-zinc-950 text-[9px] font-bold font-mono px-1 rounded-full leading-tight">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
