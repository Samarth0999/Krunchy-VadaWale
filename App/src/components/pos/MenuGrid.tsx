import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Flame, 
  X,
  Filter,
  SlidersHorizontal
} from 'lucide-react';
import { Product } from '../../types';

interface MenuGridProps {
  selectedCategory: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ selectedCategory }) => {
  const { products, cart, addToCart, updateQuantity, settings } = usePOS();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Must be active for POS
      if (!product.isActive) return false;

      // Category check
      if (selectedCategory !== 'All' && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Dietary filter
      if (dietaryFilter === 'VEG' && !product.isVeg) return false;
      if (dietaryFilter === 'NON_VEG' && product.isVeg) return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        const matchSku = product.sku ? product.sku.toLowerCase().includes(query) : false;
        if (!matchName && !matchCategory && !matchSku) return false;
      }

      return true;
    });
  }, [products, selectedCategory, dietaryFilter, searchQuery]);

  // Helper to find cart quantity for a product
  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="flex flex-col h-full">
      
      {/* Search & Dietary Filters Bar */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by food name, category, or code (e.g. Burger, Wings)..."
            className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/40 pl-9.5 transition-all shadow-inner"
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

        {/* Dietary Pills */}
        <div className="flex items-center bg-dark-900 border border-white/[0.08] p-1 rounded-xl shrink-0 shadow-inner">
          <button
            type="button"
            onClick={() => setDietaryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dietaryFilter === 'ALL' 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => setDietaryFilter('VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dietaryFilter === 'VEG' 
                ? 'bg-emerald-600 text-white shadow-glow-emerald/30' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow"></span>
            <span>Pure Veg</span>
          </button>

          <button
            type="button"
            onClick={() => setDietaryFilter('NON_VEG')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              dietaryFilter === 'NON_VEG' 
                ? 'bg-rose-600 text-white shadow' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block shadow"></span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Filter className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">No dishes found</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or dietary filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5 pb-2">
            {filteredProducts.map(product => {
              const qtyInCart = getCartQuantity(product.id);
              const isOutOfStock = !product.inStock;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`group relative bg-dark-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-200 select-none cursor-pointer active:scale-[0.98] ${
                    isOutOfStock 
                      ? 'opacity-60 border-white/[0.04] cursor-not-allowed' 
                      : qtyInCart > 0 
                        ? 'border-orange-500/80 shadow-glow-orange ring-1 ring-orange-500/50 bg-dark-850' 
                        : 'border-white/[0.07] hover:border-white/[0.15] hover:shadow-surface hover:-translate-y-0.5'
                  }`}
                >
                  {/* Image Container with Vignette Overlay */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-dark-950">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />

                    {/* Vignette & Contrast Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-black/40"></div>

                    {/* FSSAI Standard Veg / Non-Veg Icon */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <div className={`fssai-indicator ${product.isVeg ? 'fssai-veg' : 'fssai-nonveg'} shadow-md`}>
                        {product.isVeg ? (
                          <div className="fssai-veg-dot"></div>
                        ) : (
                          <div className="fssai-nonveg-triangle"></div>
                        )}
                      </div>
                    </div>

                    {/* Spicy Badge */}
                    {product.isSpicy && (
                      <div className="absolute top-2.5 right-2.5 z-10 bg-rose-600/90 text-white p-1 rounded-lg shadow-md backdrop-blur-xs flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-20">
                        <span className="text-[11px] font-extrabold text-rose-300 uppercase tracking-widest bg-rose-950/90 px-3 py-1 rounded-lg border border-rose-800 shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {/* Floating Frosted Price Tag */}
                    <div className="absolute bottom-2.5 left-2.5 z-10">
                      <div className="px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 shadow-md">
                        <span className="font-extrabold text-sm text-white font-mono tabular-nums">
                          {currency}{product.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-orange-400 transition-colors line-clamp-1 leading-snug">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold truncate max-w-[90px]">
                        {product.category}
                      </span>

                      {/* Add / Quantity Modifier Buttons */}
                      {!isOutOfStock && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center"
                        >
                          {qtyInCart > 0 ? (
                            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl p-0.5 shadow-glow-orange">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-lg transition-colors active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                              <span className="text-xs font-extrabold px-1 font-mono tabular-nums">{qtyInCart}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded-lg transition-colors active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="w-7 h-7 rounded-xl bg-dark-800 hover:bg-gradient-to-r hover:from-orange-500 hover:to-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-sm border border-white/[0.08] active:scale-90"
                            >
                              <Plus className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
