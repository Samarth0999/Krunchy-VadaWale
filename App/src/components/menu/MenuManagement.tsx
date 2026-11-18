import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { ProductModal } from './ProductModal';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Flame, 
  UtensilsCrossed, 
  Check, 
  X,
  Filter,
  CheckCircle2,
  AlertCircle
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
    if (window.confirm(`Are you sure you want to remove "${p.name}" from the menu?`)) {
      await deleteProduct(p.id);
    }
  };

  const currency = settings.currencySymbol || '₹';

  // Stats
  const totalItems = products.length;
  const activeItems = products.filter(p => p.isActive).length;
  const outOfStockItems = products.filter(p => !p.inStock).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 space-y-4">
      
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-orange-400" />
            <h2 className="text-xl font-extrabold text-white">Menu & Catalog Management</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Create, categorize, edit prices, and manage active stock items for the POS counter.
          </p>
        </div>

        {/* Stats and Add Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Total</span>
              <strong className="text-white font-mono">{totalItems}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Active</span>
              <strong className="text-emerald-400 font-mono">{activeItems}</strong>
            </div>
            <div className="w-px h-6 bg-slate-800"></div>
            <div>
              <span className="text-slate-400 block text-[10px]">Out of Stock</span>
              <strong className="text-rose-400 font-mono">{outOfStockItems}</strong>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Menu Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, category, or SKU..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <th className="py-3 px-4">Item Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Dietary</th>
                <th className="py-3 px-4 text-center">In Stock</th>
                <th className="py-3 px-4 text-center">Active on POS</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No items found matching the selected filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Item Image & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0 bg-slate-950"
                        />
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
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
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">
                              {product.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-700">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-bold text-orange-400 text-sm">
                      {currency}{product.price}
                    </td>

                    {/* Dietary */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded bg-white flex items-center justify-center p-0.5 border ${
                          product.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}>
                          {product.isVeg ? (
                            <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                          ) : (
                            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-rose-600"></div>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-300">
                          {product.isVeg ? 'Vegetarian' : 'Non-Veg'}
                        </span>
                      </div>
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          product.inStock 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Active on POS Toggle */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`w-10 h-6 mx-auto flex items-center rounded-full p-1 transition-colors ${
                          product.isActive ? 'bg-orange-500 justify-end' : 'bg-slate-700 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          title="Edit Item"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          title="Delete Item"
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
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

