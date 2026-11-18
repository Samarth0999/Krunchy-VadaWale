import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Search, 
  Plus, 
  Minus, 
  Flame, 
  X,
  Filter
} from 'lucide-react';

interface MenuGridProps {
  selectedCategory: string;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ selectedCategory }) => {
  const { products, cart, addToCart, updateQuantity, settings } = usePOS();
  
  const [searchQuery, setSearchQuery] = useState('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product.isActive) return false;

      if (selectedCategory !== 'All' && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = product.name.toLowerCase().includes(query);
        const matchCategory = product.category.toLowerCase().includes(query);
        const matchSku = product.sku ? product.sku.toLowerCase().includes(query) : false;
        if (!matchName && !matchCategory && !matchSku) return false;
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="flex flex-col h-full">
      
      {/* Search & Pure Veg Indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog... (e.g. Burger, Vada Pav, Fries)"
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 pl-8 transition-colors"
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

        {/* Pure Veg Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shrink-0 select-none">
          <div className="w-2.5 h-2.5 rounded-xs border border-emerald-500 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap">100% Pure Veg</span>
        </div>
      </div>

      {/* Grid of Minimal Product Cards */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Filter className="w-8 h-8 mb-2 opacity-40 text-zinc-600" />
            <p className="text-xs font-medium">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5">
            {filteredProducts.map(product => {
              const qtyInCart = getCartQuantity(product.id);
              const isOutOfStock = !product.inStock;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`group relative bg-zinc-900/40 hover:bg-zinc-900 border rounded-xl overflow-hidden flex flex-col justify-between transition-all select-none cursor-pointer ${
                    isOutOfStock 
                      ? 'opacity-50 border-zinc-900 cursor-not-allowed' 
                      : qtyInCart > 0 
                        ? 'border-orange-500/60 bg-zinc-900/80 shadow-xs' 
                        : 'border-zinc-800/70 hover:border-zinc-700/80'
                  }`}
                >
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                    />

                    {/* Pure Veg Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1">
                      <div className="w-3.5 h-3.5 rounded-sm bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center border border-emerald-600/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      </div>
                      {product.isSpicy && (
                        <div className="w-3.5 h-3.5 rounded-sm bg-zinc-950/80 backdrop-blur-xs flex items-center justify-center text-rose-400">
                          <Flame className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-xs text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                        {product.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5 block">
                        {product.category}
                      </span>
                    </div>

                    {/* Price and Cart Stepper */}
                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                      <span className="font-semibold text-xs text-zinc-200 font-mono">
                        {currency}{product.price}
                      </span>

                      {!isOutOfStock && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="flex items-center"
                        >
                          {qtyInCart > 0 ? (
                            <div className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 rounded-md p-0.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart - 1)}
                                className="w-5 h-5 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-mono font-semibold px-1 text-zinc-100">{qtyInCart}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, qtyInCart + 1)}
                                className="w-5 h-5 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(product)}
                              className="w-6 h-6 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors border border-zinc-700/60"
                            >
                              <Plus className="w-3.5 h-3.5" />
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
