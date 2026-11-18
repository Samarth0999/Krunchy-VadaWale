import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Flame, 
  Check, 
  X,
  Filter
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

  return (
    <div className="flex flex-col h-full">
      
      {/* Search & Quick Dietary Filters */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items by name, code... (e.g. Burger, Wings, Fries)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9"
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

        {/* Dietary Pills */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setDietaryFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              dietaryFilter === 'ALL' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setDietaryFilter('VEG')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              dietaryFilter === 'VEG' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            <span>Veg</span>
          </button>
          <button
            type="button"
            onClick={() => setDietaryFilter('NON_VEG')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              dietaryFilter === 'NON_VEG' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400 inline-block"></span>
            <span>Non-Veg</span>
          </button>
        </div>
      </div>

      {/* Grid of Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Filter className="w-10 h-10 mb-2 opacity-50 text-slate-600" />
            <p className="text-sm font-medium">No menu items found</p>
            <p className="text-xs text-slate-600 mt-1">Try adjusting your search query or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {filteredProducts.map(product => {
              const qtyInCart = getCartQuantity(product.id);
              const isOutOfStock = !product.inStock;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`group relative bg-slate-900 border rounded-2xl overflow-hidden flex flex-col justify-between transition-all select-none cursor-pointer ${
                    isOutOfStock 
                      ? 'opacity-60 border-slate-800 cursor-not-allowed' 
                      : qtyInCart > 0 
                        ? 'border-orange-500/70 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500/40 bg-slate-900/95' 
                        : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30"></div>

                    {/* Veg / Non-Veg Icon */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className={`w-5 h-5 rounded bg-white flex items-center justify-center p-0.5 border ${
                        product.isVeg ? 'border-emerald-600' : 'border-rose-600'
                      }`}>
                        {product.isVeg ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                        ) : (
                          <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-rose-600"></div>
                        )}
                      </div>
                    </div>

                    {/* Spicy Badge */}
                    {product.isSpicy && (
                      <div className="absolute top-2 right-2 z-10 bg-rose-500/90 text-white p-1 rounded-full shadow">
                        <Flame className="w-3 h-3 fill-current" />
                      </div>
                    )}

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-20">
                        <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider bg-rose-950/80 px-2 py-1 rounded border border-rose-800">
                          Out of Stock
                        </span>
                      </div>
                    )}

                    {/* Price Tag Overlay on image */}
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="font-extrabold text-sm text-white drop-shadow-md font-mono">
                        {settings.currencySymbol || '₹'}{product.price}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold truncate max-w-[90px]">
                        {product.category}
                      </span>

                      {/* Add / Quantity Buttons */}
                      {!isOutOfStock && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center"
                        >
                          {qtyInCart > 0 ? (
                            <div className="flex items-center gap-1.5 bg-orange-500 text-white rounded-lg p-0.5 shadow">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold px-1 font-mono">{qtyInCart}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-black/20 rounded transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-orange-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4" />
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

