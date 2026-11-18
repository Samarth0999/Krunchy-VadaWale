import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Sparkles, 
  Search, 
  Flame, 
  Clock, 
  Plus, 
  Check, 
  ShoppingBag, 
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  Heart
} from 'lucide-react';
import { Product } from '../../types';

export const CustomerShowcaseView: React.FC = () => {
  const { products, addToCart, cart, setActiveTab, settings, tables, occupiedTablesCount } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({});

  const currency = settings.currencySymbol || '₹';

  const categories = useMemo(() => {
    const cats = ['All'];
    products.forEach(p => {
      if (p.isActive && !cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product.isActive) return false;
      if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;
      if (dietaryFilter === 'VEG' && !product.isVeg) return false;
      if (dietaryFilter === 'NON_VEG' && product.isVeg) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return product.name.toLowerCase().includes(q) || (product.description && product.description.toLowerCase().includes(q));
      }
      return true;
    });
  }, [products, selectedCategory, dietaryFilter, searchQuery]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getCartQuantity = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-dark-950 text-white selection:bg-orange-500/30">
      
      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-gradient-to-b from-dark-900 via-dark-950 to-dark-950 py-10 px-4 sm:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-10 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Hero Copy */}
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Fresh, Piping Hot & 100% Authentic Quality</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">{settings.name || 'KRUNCHY'}</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                {settings.tagline || 'Original crispy Vada Pav, loaded combos, fried delicacies, and refreshing drinks.'} Handcrafted fresh on every order.
              </p>

              {/* Floor Status & Fast Ordering Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-white/[0.08]">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300">
                    Tables Open: <strong className="text-emerald-400 font-mono">{tables.length - occupiedTablesCount}</strong> of {tables.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-white/[0.08]">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">Avg. Prep Time: <strong className="text-white">6 – 9 mins</strong></span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-900 border border-white/[0.08]">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300">Earn 1 pt / ₹10 on every bill</span>
                </div>
              </div>
            </div>

            {/* Live Cart Quick CTA */}
            {totalCartCount > 0 && (
              <div className="w-full md:w-auto flex md:flex-col items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r md:bg-gradient-to-b from-orange-500/20 to-amber-500/10 border border-orange-500/30 backdrop-blur-md shadow-glow-orange">
                <div className="text-left md:text-center">
                  <span className="text-xs text-orange-300 font-bold block uppercase tracking-wider">Your Active Order</span>
                  <div className="text-xl font-extrabold text-white font-mono">{totalCartCount} items</div>
                </div>
                <button
                  onClick={() => setActiveTab('pos')}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
                >
                  <span>Go to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Modern Filter & Search Controls Bar */}
      <div className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-8 py-3.5 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our delicious catalog..."
              className="w-full bg-dark-900 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 pl-9.5 shadow-inner transition-colors"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          </div>

          {/* Dietary Filters */}
          <div className="flex items-center gap-2">
            <div className="flex bg-dark-900 border border-white/[0.08] p-1 rounded-xl shadow-inner text-xs">
              <button
                type="button"
                onClick={() => setDietaryFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dietaryFilter === 'ALL' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Dishes
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('VEG')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dietaryFilter === 'VEG' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Pure Veg</span>
              </button>
              <button
                type="button"
                onClick={() => setDietaryFilter('NON_VEG')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  dietaryFilter === 'NON_VEG' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                <span>Non-Veg</span>
              </button>
            </div>
          </div>

        </div>

        {/* Category Pills Strip */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto pt-3 pb-1 scrollbar-none">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isSelected 
                    ? 'bg-orange-500 text-white shadow-glow-orange scale-[1.02]' 
                    : 'bg-dark-900/80 hover:bg-dark-850 text-slate-300 hover:text-white border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Dishes Showcase Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {selectedCategory === 'All' ? 'Full Food & Beverage Menu' : selectedCategory}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredProducts.length} delicious culinary items
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
            <p className="text-base font-bold text-slate-300">No dishes match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the dietary tag or search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => {
              const qtyInCart = getCartQuantity(product.id);
              const isLiked = likedItems[product.id];

              return (
                <div
                  key={product.id}
                  className="group bg-dark-900/90 border border-white/[0.08] hover:border-orange-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/10"
                >
                  {/* Photo Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-dark-950">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-black/30"></div>

                    {/* FSSAI Veg / Non-Veg Indicator */}
                    <div className="absolute top-3 left-3 z-10">
                      <div className={`fssai-indicator ${product.isVeg ? 'fssai-veg' : 'fssai-nonveg'} shadow-md`}>
                        {product.isVeg ? (
                          <div className="fssai-veg-dot"></div>
                        ) : (
                          <div className="fssai-nonveg-triangle"></div>
                        )}
                      </div>
                    </div>

                    {/* Like / Wishlist Heart */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(product.id, e)}
                      className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                        isLiked 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                          : 'bg-black/40 text-slate-300 hover:text-white border border-white/10'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    {/* Spicy Badge */}
                    {product.isSpicy && (
                      <div className="absolute bottom-3 left-3 z-10 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md backdrop-blur-xs">
                        <Flame className="w-3 h-3 fill-current" />
                        <span>Crispy & Spicy</span>
                      </div>
                    )}

                    {/* Category Pill */}
                    <div className="absolute bottom-3 right-3 z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-slate-300 px-2 py-0.5 rounded-lg border border-white/10">
                        {product.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-extrabold text-sm text-white group-hover:text-orange-400 transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {product.description || 'Authentic traditional recipe prepared with fresh ingredients and signature spices.'}
                      </p>
                    </div>

                    {/* Bottom Pricing & Action Bar */}
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-medium">Price</span>
                        <span className="text-base font-extrabold text-white font-mono tabular-nums">
                          {currency}{product.price}
                        </span>
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                          qtyInCart > 0 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-glow-orange' 
                            : 'bg-dark-800 hover:bg-orange-500 text-slate-200 hover:text-white border border-white/[0.08]'
                        }`}
                      >
                        {qtyInCart > 0 ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Added ({qtyInCart})</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Add Item</span>
                          </>
                        )}
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar if Cart Has Items */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
          <div className="bg-dark-900/95 backdrop-blur-xl border border-orange-500/40 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between shadow-glow-orange">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-300 font-bold block">{totalCartCount} items selected</span>
                <span className="text-[10px] text-orange-400">Ready for instant billing</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('pos')}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
            >
              <span>View Order / Pay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

