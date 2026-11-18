import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { ProductModal } from './ProductModal';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Flame, 
  BookOpen, 
  X
} from 'lucide-react';
import { Product } from '../../types';

export const MenuManagement: React.FC = () => {
  const { products, deleteProduct, saveProduct, settings } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(query);
        const matchCat = p.category.toLowerCase().includes(query);
        const matchSku = p.sku ? p.sku.toLowerCase().includes(query) : false;
        if (!matchName && !matchCat && !matchSku) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setProductToEdit(p);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (p: Product) => {
    await saveProduct({ ...p, isActive: !p.isActive });
  };

  const handleToggleStock = async (p: Product) => {
    await saveProduct({ ...p, inStock: !p.inStock });
  };

  const handleDelete = async (p: Product) => {
    if (window.confirm(`Are you sure you want to remove "${p.name}" from the menu catalog?`)) {
      await deleteProduct(p.id);
    }
  };

  const currency = settings.currencySymbol || '₹';

  // Stats
  const totalItems = products.length;
  const activeItems = products.filter(p => p.isActive).length;
  const outOfStockItems = products.filter(p => !p.inStock).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-dark-950 space-y-4">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-dark-900 border border-white/[0.08] p-5 rounded-2xl shadow-surface">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Menu & Food Catalog</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, categorize, adjust selling prices, and control real-time stock availability.
          </p>
        </div>

        {/* Stats and Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-dark-950 px-4 py-2 rounded-xl border border-white/[0.08] text-xs shadow-inner">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Total Dishes</span>
              <strong className="text-white font-mono">{totalItems}</strong>
            </div>
            <div className="w-px h-6 bg-white/[0.08]"></div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Active on POS</span>
              <strong className="text-emerald-400 font-mono">{activeItems}</strong>
            </div>
            <div className="w-px h-6 bg-white/[0.08]"></div>
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold">Sold Out</span>
              <strong className="text-rose-400 font-mono">{outOfStockItems}</strong>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-glow-orange transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-dark-900 border border-white/[0.08] p-3 rounded-2xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, category, or SKU code..."
            className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9 font-mono shadow-inner"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white shadow-glow-orange/30' 
                  : 'bg-dark-850 hover:bg-dark-800 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-dark-900 border border-white/[0.08] rounded-2xl overflow-hidden shadow-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-dark-950/90 border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[11px] font-extrabold">
                <th className="py-3.5 px-4">Item Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Dietary</th>
                <th className="py-3.5 px-4 text-center">Stock Status</th>
                <th className="py-3.5 px-4 text-center">Active on POS</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Item Image & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-white/[0.08] shrink-0 bg-dark-950"
                        />
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{product.name}</span>
                            {product.isSpicy && (
                              <Flame className="w-3.5 h-3.5 text-rose-500 fill-current inline" />
                            )}
                          </div>
                          {product.sku && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              SKU: {product.sku}
                            </span>
                          )}
                          {product.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5 leading-snug">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="bg-dark-950 text-slate-300 px-3 py-1 rounded-full text-[11px] font-bold border border-white/[0.06]">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-mono font-extrabold text-orange-400 text-sm tabular-nums">
                      {currency}{product.price}
                    </td>

                    {/* Dietary FSSAI standard */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`fssai-indicator ${product.isVeg ? 'fssai-veg' : 'fssai-nonveg'}`}>
                          {product.isVeg ? (
                            <div className="fssai-veg-dot"></div>
                          ) : (
                            <div className="fssai-nonveg-triangle"></div>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-300 font-medium">
                          {product.isVeg ? 'Vegetarian' : 'Non-Veg'}
                        </span>
                      </div>
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product)}
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border transition-all ${
                          product.inStock 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Active on POS Toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`w-10 h-6 mx-auto flex items-center rounded-full p-1 transition-colors ${
                          product.isActive ? 'bg-orange-500 justify-end' : 'bg-dark-800 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Item"
                          className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          title="Delete Item"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-white/[0.06] rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
      />

    </div>
  );
};
