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
    if (window.confirm(`Remove "${p.name}" from catalog?`)) {
      await deleteProduct(p.id);
    }
  };

  const currency = settings.currencySymbol || '₹';

  const totalItems = products.length;
  const activeItems = products.filter(p => p.isActive).length;
  const outOfStockItems = products.filter(p => !p.inStock).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-950 space-y-4">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-zinc-100 tracking-tight">Menu Catalog</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage food & beverage items, categories, pricing, and active stock
          </p>
        </div>

        {/* Stats and Add Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-3 bg-zinc-900/60 px-3 py-1.5 rounded-lg border border-zinc-800/80 text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Total</span>
              <strong className="text-zinc-100 font-mono">{totalItems}</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Active</span>
              <strong className="text-emerald-400 font-mono">{activeItems}</strong>
            </div>
            <div className="w-px h-5 bg-zinc-800"></div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Sold Out</span>
              <strong className="text-zinc-400 font-mono">{outOfStockItems}</strong>
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog items..."
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 pl-8"
          />
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat 
                  ? 'bg-zinc-100 text-zinc-950 border-zinc-200 font-semibold' 
                  : 'bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Catalog Table */}
      <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 text-[11px] font-medium">
                <th className="py-2.5 px-3.5">Item</th>
                <th className="py-2.5 px-3.5">Category</th>
                <th className="py-2.5 px-3.5">Price</th>
                <th className="py-2.5 px-3.5">Dietary</th>
                <th className="py-2.5 px-3.5 text-center">Stock</th>
                <th className="py-2.5 px-3.5 text-center">Active</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500">
                    No catalog items found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Item Image & Name */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-800 shrink-0 bg-zinc-950"
                        />
                        <div>
                          <div className="font-medium text-zinc-100 flex items-center gap-1.5">
                            <span>{product.name}</span>
                            {product.isSpicy && (
                              <Flame className="w-3 h-3 text-rose-500 inline" />
                            )}
                          </div>
                          {product.sku && (
                            <span className="text-[10px] text-zinc-500 font-mono block">
                              {product.sku}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-2.5 px-3.5">
                      <span className="text-zinc-400 text-[11px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-2.5 px-3.5 font-mono font-semibold text-zinc-100 text-xs">
                      {currency}{product.price}
                    </td>

                    {/* Dietary */}
                    <td className="py-2.5 px-3.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
                        product.isVeg 
                          ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      }`}>
                        {product.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>

                    {/* In Stock Toggle */}
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(product)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                          product.inStock 
                            ? 'bg-zinc-800 text-zinc-200 border-zinc-700/60' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                        }`}
                      >
                        {product.inStock ? 'In Stock' : 'Sold Out'}
                      </button>
                    </td>

                    {/* Active Toggle */}
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(product)}
                        className={`w-7 h-4 mx-auto flex items-center rounded-full p-0.5 transition-colors ${
                          product.isActive ? 'bg-zinc-200 justify-end' : 'bg-zinc-800 justify-start'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-zinc-950' : 'bg-zinc-500'}`}></div>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(product)}
                          className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(product)}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
