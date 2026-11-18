import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, UtensilsCrossed } from 'lucide-react';
import { TableStatus } from '../../types';

interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTable: (tableId: string) => void;
}

export const TablePickerModal: React.FC<TablePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTable
}) => {
  const { tables, activeTableId, settings } = usePOS();
  const [selectedSection, setSelectedSection] = useState('All');

  const currency = settings.currencySymbol || '₹';

  const sections = useMemo(() => {
    const set = new Set<string>();
    tables.forEach(t => set.add(t.section));
    return ['All', ...Array.from(set)];
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      if (selectedSection !== 'All' && t.section !== selectedSection) return false;
      return true;
    });
  }, [tables, selectedSection]);

  if (!isOpen) return null;

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10';
      case 'OCCUPIED': return 'border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10';
      case 'BILLED': return 'border-purple-500/30 bg-purple-500/5 text-purple-400';
      case 'RESERVED': return 'border-sky-500/30 bg-sky-500/5 text-sky-400';
      case 'DIRTY': return 'border-rose-500/30 bg-rose-500/5 text-rose-400';
      default: return 'border-zinc-800 text-zinc-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh] shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-500" />
            <h3 className="font-semibold text-sm text-zinc-100">Select Table</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-5 py-2 bg-zinc-950/60 border-b border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedSection === sec 
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-200' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Grid of Tables */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filteredTables.map(t => {
            const isCurrent = activeTableId === t.id || activeTableId === t.name;
            const tableSubtotal = t.activeCart?.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTable(t.id);
                  onClose();
                }}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-colors ${getStatusColor(t.status)} ${
                  isCurrent ? 'ring-2 ring-zinc-400 bg-zinc-800/80' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-zinc-100">{t.name}</span>
                    <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-black/40">
                      {t.status === 'AVAILABLE' ? 'Free' : t.status === 'OCCUPIED' ? 'Dining' : t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{t.capacity} Seats • {t.section}</span>
                </div>

                <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                  {t.status === 'OCCUPIED' || t.status === 'BILLED' ? (
                    <>
                      <span className="text-zinc-500 text-[10px]">{t.activeCart?.length || 0} items</span>
                      <strong className="font-mono text-zinc-200">{currency}{tableSubtotal}</strong>
                    </>
                  ) : (
                    <span className="text-zinc-600 text-[10px]">Free</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
