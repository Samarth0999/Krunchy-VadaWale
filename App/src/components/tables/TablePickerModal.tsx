import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { X, Users, UtensilsCrossed, Clock, Check } from 'lucide-react';
import { RestaurantTable, TableStatus } from '../../types';

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
      case 'AVAILABLE': return 'border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400';
      case 'OCCUPIED': return 'border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 text-amber-400';
      case 'BILLED': return 'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400';
      case 'RESERVED': return 'border-sky-500/40 bg-sky-500/5 text-sky-400';
      case 'DIRTY': return 'border-rose-500/40 bg-rose-500/5 text-rose-400';
      default: return 'border-slate-800 text-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-400" />
            <h3 className="font-bold text-sm text-white">Select Dining Table (Floor Map)</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSection === sec ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Grid of Tables */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${getStatusColor(t.status)} ${
                  isCurrent ? 'ring-2 ring-orange-500 scale-102 bg-orange-500/10' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{t.name}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40">
                      {t.status === 'AVAILABLE' ? 'Free' : t.status === 'OCCUPIED' ? 'Dining' : t.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{t.capacity} Seats • {t.section}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  {t.status === 'OCCUPIED' || t.status === 'BILLED' ? (
                    <>
                      <span className="text-slate-400">{t.activeCart?.length || 0} items</span>
                      <strong className="font-mono text-orange-400">{currency}{tableSubtotal}</strong>
                    </>
                  ) : (
                    <span className="text-slate-500 text-[10px]">Tap to seat</span>
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

