import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Tag, 
  Flame, 
  Sandwich, 
  Boxes, 
  Utensils, 
  Layers, 
  Coffee, 
  IceCream,
  AlertCircle
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, deleteCategory, products, currentStaff } = usePOS();
  const isAdmin = currentStaff?.role === 'Admin';
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteCat, setConfirmDeleteCat] = useState<string | null>(null);

  if (!isOpen) return null;

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('crispy') || n.includes('bites') || n.includes('paneer') || n.includes('hot')) return <Flame className="w-4 h-4 text-orange-400" />;
    if (n.includes('burger') || n.includes('vada') || n.includes('pav') || n.includes('sandwich')) return <Sandwich className="w-4 h-4 text-amber-400" />;
    if (n.includes('combo') || n.includes('bucket') || n.includes('box') || n.includes('meal')) return <Boxes className="w-4 h-4 text-yellow-400" />;
    if (n.includes('snack') || n.includes('starter') || n.includes('fries')) return <Utensils className="w-4 h-4 text-emerald-400" />;
    if (n.includes('dip') || n.includes('side') || n.includes('sauce')) return <Layers className="w-4 h-4 text-blue-400" />;
    if (n.includes('beverage') || n.includes('drink') || n.includes('shake') || n.includes('cooler') || n.includes('coffee') || n.includes('tea')) return <Coffee className="w-4 h-4 text-cyan-400" />;
    if (n.includes('dessert') || n.includes('ice') || n.includes('cream') || n.includes('sweet')) return <IceCream className="w-4 h-4 text-pink-400" />;
    return <Tag className="w-4 h-4 text-zinc-400" />;
  };

  const getProductCount = (categoryName: string) => {
    return products.filter(p => p.category.toLowerCase() === categoryName.toLowerCase()).length;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    const success = await addCategory(trimmed);
    setIsSubmitting(false);

    if (success) {
      setNewCategoryName('');
    }
  };

  const handleDeleteClick = (categoryName: string) => {
    if (!isAdmin) {
      alert('Only Admin accounts can delete menu categories.');
      return;
    }
    const count = getProductCount(categoryName);
    if (count > 0) {
      setConfirmDeleteCat(categoryName);
    } else {
      deleteCategory(categoryName);
    }
  };

  const handleConfirmDeleteWithReassign = async (categoryName: string) => {
    await deleteCategory(categoryName, 'General');
    setConfirmDeleteCat(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
              <Tag className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Manage Menu Categories</h3>
              <p className="text-[11px] text-zinc-400">Add custom categories or delete unused ones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Add Category Form */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-950/40">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Create New Category
          </label>
          <form onSubmit={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Shakes, Wraps, Pizzas, Rolls..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !newCategoryName.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Existing Categories List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-2.5 min-h-[160px]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
            <span>Existing Categories ({categories.length})</span>
            <span>Items Assigned</span>
          </div>

          {categories.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">
              No categories configured. Add your first category above.
            </div>
          ) : (
            categories.map((cat) => {
              const count = getProductCount(cat);
              const isConfirming = confirmDeleteCat === cat;

              return (
                <div
                  key={cat}
                  className="flex flex-col p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-zinc-800 rounded-lg">
                        {getCategoryIcon(cat)}
                      </div>
                      <span className="text-xs font-semibold text-zinc-200">{cat}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                        {count} {count === 1 ? 'item' : 'items'}
                      </span>

                      {isAdmin ? (
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(cat)}
                          title={`Delete ${cat}`}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500 italic">Admin only</span>
                      )}
                    </div>
                  </div>

                  {/* Warning banner when deleting category with active items */}
                  {isConfirming && (
                    <div className="mt-2.5 pt-2.5 border-t border-zinc-800 flex flex-col gap-2 bg-red-500/5 p-2.5 rounded-lg border border-red-500/20">
                      <div className="flex items-start gap-2 text-red-400 text-[11px]">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          <strong>{count} item(s)</strong> are in this category. Deleting will reassign them to <strong>'General'</strong>.
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCat(null)}
                          className="px-2.5 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteWithReassign(cat)}
                          className="px-2.5 py-1 text-[11px] font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-xs"
                        >
                          Reassign & Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

