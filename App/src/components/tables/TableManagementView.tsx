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
  RotateCcw,
  Trash2
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
    deleteTable,
    currentStaff,
    setActiveTab, 
    settings 
  } = usePOS();

  const isAdmin = currentStaff?.role === 'Admin';

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

  const sections = useMemo(() => {
    const set = new Set<string>();
    tables.forEach(t => set.add(t.section));
    return ['All', ...Array.from(set)];
  }, [tables]);

  const filteredTables = useMemo(() => {
    return tables.filter(t => {
      if (selectedSection !== 'All' && t.section !== selectedSection) return false;
      if (selectedStatusFilter !== 'ALL' && t.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [tables, selectedSection, selectedStatusFilter]);

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

  const getElapsedMinutes = (seatedAt?: string | null) => {
    if (!seatedAt) return null;
    const diffMs = Date.now() - new Date(seatedAt).getTime();
    return Math.floor(diffMs / 60000);
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Free',
          badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
          dotClass: 'bg-emerald-500'
        };
      case 'OCCUPIED':
        return {
          label: 'Dining',
          badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
          dotClass: 'bg-amber-400'
        };
      case 'BILLED':
        return {
          label: 'Billed',
          badgeClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
          dotClass: 'bg-purple-400'
        };
      case 'RESERVED':
        return {
          label: 'Reserved',
          badgeClass: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
          dotClass: 'bg-sky-400'
        };
      case 'DIRTY':
        return {
          label: 'Needs Bussing',
          badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
          dotClass: 'bg-rose-400'
        };
      default:
        return {
          label: status,
          badgeClass: 'text-zinc-400 bg-zinc-800 border-zinc-700',
          dotClass: 'bg-zinc-400'
        };
    }
  };

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

  const handleDeleteTable = async (table: RestaurantTable) => {
    if (!isAdmin) return;
    if (window.confirm(`Delete table "${table.name}" (${table.section})?\n\nThis will remove it permanently from your floor layout.`)) {
      await deleteTable(table.id);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceTable || !transferTargetId) return;

    await transferActiveTable(transferTargetId);
    setTransferSourceTable(null);
    setTransferTargetId('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Tables & Floor Layout</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Active dining sessions, table status, and floor orders
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-3 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Occupied</span>
              <strong className="text-zinc-100 font-mono">{occupiedCount + billedCount} / {totalTables}</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Available</span>
              <strong className="text-emerald-400 font-mono">{availableCount}</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Running Floor Total</span>
              <strong className="text-zinc-100 font-mono">{currency}{totalRunningSales}</strong>
            </div>
          </div>

          <button
            onClick={() => setIsAddTableOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Filter and Section Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Sections */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedSection === sec 
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                  : 'bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none bg-zinc-900/50 p-0.5 rounded-lg border border-zinc-800/80 text-xs">
          {[
            { id: 'ALL', label: `All (${totalTables})` },
            { id: 'AVAILABLE', label: `Free (${availableCount})` },
            { id: 'OCCUPIED', label: `Dining (${occupiedCount})` },
            { id: 'BILLED', label: `Billed (${billedCount})` },
            { id: 'RESERVED', label: `Reserved (${reservedCount})` },
            { id: 'DIRTY', label: `Bussing (${dirtyCount})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedStatusFilter(f.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedStatusFilter === f.id ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {filteredTables.map(table => {
          const statusInfo = getStatusBadge(table.status);
          const elapsed = getElapsedMinutes(table.seatedAt);
          const tableSubtotal = table.activeCart?.reduce((acc, item) => acc + item.product.price * item.quantity, 0) || 0;
          const totalItemsCount = table.activeCart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

          return (
            <div
              key={table.id}
              className="bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-3.5 flex flex-col justify-between transition-colors select-none"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-100">{table.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-500 font-mono">
                      <span>{table.section}</span>
                      <span>•</span>
                      <span>{table.capacity} Seats</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusInfo.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`}></span>
                      <span>{statusInfo.label}</span>
                    </span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTable(table)}
                        title="Admin: Delete Table"
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Seating / Customer Details if Occupied or Billed */}
                {(table.status === 'OCCUPIED' || table.status === 'BILLED') && (
                  <div className="mt-3 p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-zinc-500" />
                        {table.guestCount || 2} guests
                      </span>
                      {elapsed !== null && (
                        <span className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                          <Clock className="w-3 h-3" />
                          {elapsed}m
                        </span>
                      )}
                    </div>

                    {table.customer && (
                      <div className="text-[11px] text-zinc-300 font-medium truncate pt-1 border-t border-zinc-800/80">
                        {table.customer.name}
                      </div>
                    )}

                    {table.activeCart && table.activeCart.length > 0 && (
                      <div className="pt-1 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-500 text-[10px]">{totalItemsCount} items</span>
                        <strong className="font-mono text-zinc-100">{currency}{tableSubtotal}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Reserved Note */}
                {table.status === 'RESERVED' && (
                  <div className="mt-2.5 p-2 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-[11px] text-sky-300">
                    {table.notes || 'Reserved party'}
                  </div>
                )}

                {/* Dirty Note */}
                {table.status === 'DIRTY' && (
                  <div className="mt-2.5 p-2 bg-zinc-950/60 rounded-lg border border-zinc-800/80 text-[11px] text-zinc-400">
                    Needs cleaning and sanitizing
                  </div>
                )}
              </div>

              {/* Card Bottom: Minimal Actions */}
              <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 space-y-1.5">
                
                {table.status === 'AVAILABLE' && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenTableInPOS(table)}
                      className="flex-1 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Start Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTableStatus(table.id, 'RESERVED')}
                      className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs border border-zinc-800"
                    >
                      Reserve
                    </button>
                  </div>
                )}

                {(table.status === 'OCCUPIED' || table.status === 'BILLED') && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenTableInPOS(table)}
                        className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 border border-zinc-700/60"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Open POS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTransferSourceTable(table);
                          const firstFree = tables.find(t => t.id !== table.id && t.status === 'AVAILABLE');
                          if (firstFree) setTransferTargetId(firstFree.id);
                        }}
                        className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs border border-zinc-800"
                        title="Shift Table"
                      >
                        <ArrowRightLeft className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateTableStatus(table.id, table.status === 'OCCUPIED' ? 'BILLED' : 'OCCUPIED')}
                        className="flex-1 py-1 rounded-md text-[10px] font-medium bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
                      >
                        {table.status === 'BILLED' ? 'Revert to Dining' : 'Mark Billed'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Release ${table.name}?`)) {
                            releaseTable(table.id);
                          }
                        }}
                        className="px-2 py-1 bg-zinc-900 hover:bg-rose-950/40 text-zinc-500 hover:text-rose-400 rounded-md text-[10px] border border-zinc-800"
                        title="Release"
                      >
                        Release
                      </button>
                    </div>
                  </div>
                )}

                {table.status === 'DIRTY' && (
                  <button
                    type="button"
                    onClick={() => updateTableStatus(table.id, 'AVAILABLE')}
                    className="w-full py-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cleaned & Free</span>
                  </button>
                )}

                {table.status === 'RESERVED' && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenTableInPOS(table)}
                      className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-xs rounded-lg"
                    >
                      Seat Guests
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTableStatus(table.id, 'AVAILABLE')}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-xs"
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

      {/* Modal: Add New Table */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-zinc-100">Add Dining Table</h3>
              <button onClick={() => setIsAddTableOpen(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNewTable} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Table Name</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Table 9, Terrace 2"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Floor Section</label>
                <input
                  type="text"
                  required
                  value={newTableSection}
                  onChange={(e) => setNewTableSection(e.target.value)}
                  placeholder="e.g. Main Dining, AC Lounge"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Seats Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTableOpen(false)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg"
                >
                  Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Shift / Transfer Table */}
      {transferSourceTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                <ArrowRightLeft className="w-3.5 h-3.5 text-zinc-400" />
                Shift Table Order
              </h3>
              <button onClick={() => setTransferSourceTable(null)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-zinc-950 rounded-lg border border-zinc-800">
                <span className="text-zinc-500 block text-[10px]">From:</span>
                <strong className="text-zinc-200">{transferSourceTable.name} ({transferSourceTable.section})</strong>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">To Free Table:</label>
                <select
                  value={transferTargetId}
                  onChange={(e) => setTransferTargetId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
                >
                  <option value="">Select table...</option>
                  {tables
                    .filter(t => t.id !== transferSourceTable.id && t.status === 'AVAILABLE')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.section} • {t.capacity} seats)
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTransferSourceTable(null)}
                  className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg hover:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferTargetId}
                  className="px-4 py-1.5 bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 font-semibold rounded-lg"
                >
                  Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
