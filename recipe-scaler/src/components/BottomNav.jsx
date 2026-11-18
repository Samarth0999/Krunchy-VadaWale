import React from 'react';
import { BookOpen, Plus, Heart } from 'lucide-react';
import { translations } from '../data/translations';

export default function BottomNav({
  lang,
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  favoritesCount,
}) {
  const t = translations[lang];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="max-w-md mx-auto px-4 pb-3 pt-1">
        <div className="bg-white/95 backdrop-blur-lg border border-stone-200/90 rounded-3xl shadow-xl p-1.5 flex items-center justify-around pointer-events-auto">
          {/* Tab 1: All Recipes */}
          <button
            onClick={() => setCurrentTab('all')}
            className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-2xl transition-all ${
              currentTab === 'all'
                ? 'text-orange-600 font-bold bg-orange-50'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-[11px] font-semibold">{t.recipes}</span>
          </button>

          {/* Center Floating Action Button: Add Recipe */}
          <button
            onClick={onOpenAddModal}
            className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
            aria-label="Add new recipe"
            title={t.addRecipe}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Tab 2: Favorites */}
          <button
            onClick={() => setCurrentTab('favorites')}
            className={`flex-1 py-1.5 flex flex-col items-center gap-0.5 rounded-2xl transition-all relative ${
              currentTab === 'favorites'
                ? 'text-rose-600 font-bold bg-rose-50'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-5 h-5" />
            <span className="text-[11px] font-semibold">{t.favorites}</span>
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-8 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
