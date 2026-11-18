import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Users, 
  Clock, 
  UtensilsCrossed, 
  Plus, 
  ArrowRightLeft, 
  CheckCircle2, 
  ShoppingBag, 
  X, 
  LayoutGrid
} from 'lucide-react';
import { RestaurantTable, TableStatus } from '../../types';

export const TableManagementView: React.FC = () => {
  const { 
    tables, 
    selectTable, 
    updateTableStatus, 
    transferActiveTable, 
    releaseTable, 
    saveTable, 
    setActiveTab, 
    settings 
  } = usePOS();

  const [selectedSection, setSelectedSection] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableSection, setNewTableSection] = useState('Main Dining');
  const [newTableCapacity, setNewTableCapacity] = useState<number>(4);

  // Transfer modal state
  const [transferSourceTable, setTransferSourceTable] = useState<RestaurantTable | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');

  const currency = settings.currencySymbol || '₹';

  // Sections list
  const sections = useMemo(() => {
    const set = new Set<string>();
    tables.forEach(t => set.add(t.section));
    return ['All', ...Array.from(set)];
  }, [tables]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      if (selectedSection !== 'All' && t.section !== selectedSection) return false;
      if (selectedStatusFilter !== 'ALL' && t.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [tables, selectedSection, selectedStatusFilter]);

  // Overall statistics
  const totalTables = tables.length;
  const occupiedCount = tables.filter(t => t.status === 'OCCUPIED').length;
  const billedCount = tables.filter(t => t.status === 'BILLED').length;
  const availableCount = tables.filter(t => t.status === 'AVAILABLE').length;
  const reservedCount = tables.filter(t => t.status === 'RESERVED').length;
  const dirtyCount = tables.filter(t => t.status === 'DIRTY').length;

  const totalRunningSales = useMemo(() => {
    return tables.reduce((acc, t) => {
      const tableTotal = t.activeCart?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
      return acc + tableTotal;
    }, 0);
  }, [tables]);

  // Calculate elapsed seated time
  const getElapsedMinutes = (seatedAt?: string | null) => {
    if (!seatedAt) return null;
    const diffMs = Date.now() - new Date(seatedAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  // Status Badge Colors & Glow
  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Available',
          badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          borderClass: 'border-white/[0.07] hover:border-emerald-500/40 bg-dark-900',
          dotClass: 'bg-emerald-400'
        };
      case 'OCCUPIED':
        return {
          label: 'Occupied',
          badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          borderClass: 'border-amber-500/40 shadow-glow-amber/20 bg-dark-850',
          dotClass: 'bg-amber-400 animate-pulse'
        };
      case 'BILLED':
        return {
          label: 'Billed',
          badgeClass: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          borderClass: 'border-purple-500/40 shadow-purple-500/10 bg-dark-850',
          dotClass: 'bg-purple-400'
        };
      case 'RESERVED':
        return {
          label: 'Reserved',
          badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
          borderClass: 'border-sky-500/40 bg-dark-900',
          dotClass: 'bg-sky-400'
        };
      case 'DIRTY':
        return {
          label: 'Bussing',
          badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          borderClass: 'border-rose-500/40 bg-dark-900',
          dotClass: 'bg-rose-400'
        };
      default:
        return {
          label: status,
          badgeClass: 'bg-dark-800 text-slate-400 border-white/[0.06]',
          borderClass: 'border-white/[0.07]',
          dotClass: 'bg-slate-400'
        };
    }
  };

  // Handle clicking a table card
  const handleOpenTableInPOS = (table: RestaurantTable) => {
    selectTable(table.id);
    setActiveTab('pos');
  };

  const handleAddNewTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    const newTable: RestaurantTable = {
      id: `tbl_${Date.now()}`,
      name: newTableName.trim(),
      section: newTableSection.trim() || 'Main Dining',
      capacity: Number(newTableCapacity) || 4,
      status: 'AVAILABLE',
      activeCart: []
    };

    await saveTable(newTable);
    setIsAddTableOpen(false);
    setNewTableName('');
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceTable || !transferTargetId) return;

    await transferActiveTable(transferTargetId);
    setTransferSourceTable(null);
    setTransferTargetId('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-5">
      
      {/* Top Banner & Overview Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Table & Floor Operations</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visual floor layout, real-time dining timers, table transfers, and running order tabs.
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-4 bg-dark-950 px-4 py-2 rounded-xl border border-white/[0.08] text-xs shadow-inner">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Active Seated</span>
              <strong className="text-amber-400 font-mono text-sm">{occupiedCount + billedCount} / {totalTables}</strong>
            </div>
            <div className="w-px h-7 bg-white/[0.08]"></div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Available</span>
              <strong className="text-emerald-400 font-mono text-sm">{availableCount}</strong>
            </div>
            <div className="w-px h-7 bg-white/[0.08]"></div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Floor Running Total</span>
              <strong className="text-orange-400 font-mono text-sm">{currency}{totalRunningSales.toLocaleString()}</strong>
            </div>
          </div>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-glow-orange transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Filter and Section Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-dark-900 border border-white/[0.08] p-3 rounded-2xl shadow-sm">
        
        {/* Floor Sections */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Section:</span>
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSection === sec 
                  ? 'bg-orange-500 text-white shadow-glow-orange/30' 
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-300'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-dark-950 p-1 rounded-xl border border-white/[0.06] text-xs shadow-inner">
          {[
            { id: 'ALL', label: `All (${totalTables})` },
            { id: 'AVAILABLE', label: `🟢 Free (${availableCount})` },
            { id: 'OCCUPIED', label: `🟡 Dining (${occupiedCount})` },
            { id: 'BILLED', label: `🟣 Billed (${billedCount})` },
            { id: 'RESERVED', label: `🔵 Reserved (${reservedCount})` },
            { id: 'DIRTY', label: `🔴 Bussing (${dirtyCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedStatusFilter === f.id ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredTables.map(table => {
          const statusInfo = getStatusBadge(table.status);
          const elapsed = getElapsedMinutes(table.seatedAt);
          const tableSubtotal = table.activeCart?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
          const totalItemsCount = table.activeCart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

          return (
            <div
              key={table.id}
              className={`border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 select-none hover:shadow-surface ${statusInfo.borderClass}`}
            >
              {/* Card Top: Table Name & Capacity */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-white tracking-wide">{table.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">
                        {table.section}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        • {table.capacity} Seats
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusInfo.badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                    <span>{statusInfo.label}</span>
                  </span>
                </div>

                {/* Seating / Customer Details if Occupied or Billed */}
                {(table.status === 'OCCUPIED' || table.status === 'BILLED') && (
                  <div className="mt-3.5 p-3 bg-dark-950 rounded-xl border border-white/[0.06] space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-orange-400" />
                        Party: <strong className="text-white">{table.guestCount || 2}</strong>
                      </span>
                      {elapsed !== null && (
                        <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px] tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {elapsed}m seated
                        </span>
                      )}
                    </div>

                    {table.customer && (
                      <div className="text-xs text-slate-300 font-medium truncate pt-1 border-t border-white/[0.06]">
                        Patron: <strong className="text-white">{table.customer.name}</strong>
                      </div>
                    )}

                    {/* Running Cart Items Snapshot */}
                    {table.activeCart && table.activeCart.length > 0 && (
                      <div className="pt-1.5 border-t border-white/[0.06]">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">{totalItemsCount} items</span>
                          <span className="font-mono font-extrabold text-orange-400 text-sm tabular-nums">
                            {currency}{tableSubtotal}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {table.activeCart.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* If Reserved */}
                {table.status === 'RESERVED' && (
                  <div className="mt-3.5 p-3 bg-sky-950/40 rounded-xl border border-sky-800/40 text-xs text-sky-200">
                    <p className="font-semibold">{table.notes || 'Reserved for upcoming party'}</p>
                  </div>
                )}

                {/* If Dirty */}
                {table.status === 'DIRTY' && (
                  <div className="mt-3.5 p-3 bg-rose-950/40 rounded-xl border border-rose-800/40 text-xs text-rose-200">
                    <p className="font-semibold">Guests departed. Table needs clearing & bussing.</p>
                  </div>
                )}
              </div>

              {/* Card Bottom: Quick Actions */}
              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-2">
                
                {/* When Table is Available */}
                {table.status === 'AVAILABLE' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenTableInPOS(table)}
                      className="flex-1 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-glow-orange/30 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Start Dining</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTableStatus(table.id, 'RESERVED')}
                      className="px-3 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 rounded-xl text-xs font-bold border border-white/[0.06]"
                      title="Mark Reserved"
                    >
                      Reserve
                    </button>
                  </div>
                )}

                {/* When Table is Occupied or Billed */}
                {(table.status === 'OCCUPIED' || table.status === 'BILLED') && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenTableInPOS(table)}
                        className="flex-1 py-1.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Open & Add Items</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTransferSourceTable(table);
                          const firstFree = tables.find(t => t.id !== table.id && t.status === 'AVAILABLE');
                          if (firstFree) setTransferTargetId(firstFree.id);
                        }}
                        className="px-2.5 py-1.5 bg-dark-850 hover:bg-dark-800 text-slate-300 rounded-xl text-xs font-bold border border-white/[0.06]"
                        title="Shift / Transfer Table"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateTableStatus(table.id, table.status === 'OCCUPIED' ? 'BILLED' : 'OCCUPIED')}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                          table.status === 'BILLED' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                        }`}
                      >
                        {table.status === 'BILLED' ? 'Return to Dining' : 'Present Bill'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Release ${table.name} and clear its running order?`)) {
                            releaseTable(table.id);
                          }
                        }}
                        className="px-2.5 py-1 bg-dark-850 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg text-[11px] font-bold border border-white/[0.06]"
                        title="Release / Clear"
                      >
                        Release
                      </button>
                    </div>
                  </div>
                )}

                {/* When Table is Dirty */}
                {table.status === 'DIRTY' && (
                  <button
                    type="button"
                    onClick={() => updateTableStatus(table.id, 'AVAILABLE')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-glow-emerald/30 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cleaned & Free</span>
                  </button>
                )}

                {/* When Table is Reserved */}
                {table.status === 'RESERVED' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenTableInPOS(table)}
                      className="flex-1 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl transition-colors"
                    >
                      Seat Guests
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTableStatus(table.id, 'AVAILABLE')}
                      className="px-3 py-1.5 bg-dark-850 hover:bg-dark-800 text-slate-400 rounded-xl text-xs font-bold border border-white/[0.06]"
                    >
                      Cancel
                    </button>
                  </div>
                )}

              </div>

            </div>
          );
        })}
      </div>

      {/* Modal 1: Add New Table */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white">Add Dining Table</h3>
              <button onClick={() => setIsAddTableOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewTable} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Table Name / Number *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 9, Booth 3, Terrace 1"
                  className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Floor Section *</label>
                <input
                  type="text"
                  required
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value)}
                  placeholder="e.g. Main Dining, AC Lounge, Patio"
                  className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Seating Capacity (Guests)</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-4 py-2 bg-dark-850 text-slate-300 text-xs font-bold rounded-xl hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-glow-orange"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Shift / Transfer Table */}
      {transferSourceTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-orange-400" />
                Shift / Transfer Table Order
              </h3>
              <button onClick={() => setTransferSourceTable(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-6 space-y-4">
              <div className="p-3.5 bg-dark-950 rounded-2xl border border-white/[0.06] text-xs">
                <span className="text-slate-400 block font-medium">Current Table:</span>
                <strong className="text-white text-sm">{transferSourceTable.name} ({transferSourceTable.section})</strong>
                <span className="text-orange-400 font-mono block mt-1 font-bold">
                  Running Bill: {currency}{transferSourceTable.activeCart?.reduce((s, i) => s + i.product.price * i.quantity, 0) || 0}
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">Transfer to Destination Table:</label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select destination table...</option>
                  {tables
                    .filter(t => t.id !== transferSourceTable.id && t.status === 'AVAILABLE')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.section} • {t.capacity} seats) - Available
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setTransferSourceTable(null)}
                  className="px-4 py-2 bg-dark-850 text-slate-300 text-xs font-bold rounded-xl hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferTargetId}
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-glow-orange"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
