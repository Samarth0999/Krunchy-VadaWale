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
      case 'AVAILABLE': return 'border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400';
      case 'OCCUPIED': return 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400';
      case 'BILLED': return 'border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400';
      case 'RESERVED': return 'border-sky-500/40 bg-sky-500/10 text-sky-400';
      case 'DIRTY': return 'border-rose-500/40 bg-rose-500/10 text-rose-400';
      default: return 'border-white/[0.08] text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Select Dining Table</h3>
              <p className="text-[11px] text-slate-400">Tap table to seat party or open active bill</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-6 py-2.5 bg-dark-950 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto scrollbar-none">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === sec ? 'bg-orange-500 text-white shadow-glow-orange/30' : 'bg-dark-850 text-slate-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Grid of Tables */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
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
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all duration-200 active:scale-95 ${getStatusColor(t.status)} ${
                  isCurrent ? 'ring-2 ring-orange-500 shadow-glow-orange scale-102 bg-orange-500/15' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{t.name}</span>
                    <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                      {t.status === 'AVAILABLE' ? 'Free' : t.status === 'OCCUPIED' ? 'Dining' : t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1 font-medium">{t.capacity} Seats • {t.section}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px]">
                  {t.status === 'OCCUPIED' || t.status === 'BILLED' ? (
                    <>
                      <span className="text-slate-400">{t.activeCart?.length || 0} items</span>
                      <strong className="font-mono text-orange-400 tabular-nums">{currency}{tableSubtotal}</strong>
                    </>
                  ) : (
                    <span className="text-slate-500 text-[10px] font-semibold">Tap to select</span>
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
