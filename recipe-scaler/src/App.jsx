import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import SearchBar from './components/SearchBar';
import CategoryChips from './components/CategoryChips';
import RecipeCard from './components/RecipeCard';
import RecipeDetailView from './components/RecipeDetailView';
import AddRecipeModal from './components/AddRecipeModal';
import BottomNav from './components/BottomNav';
import { translations } from './data/translations';
import { defaultRecipes } from './data/defaultRecipes';
import {
  subscribeToRecipes,
  addRecipe,
  deleteRecipe,
} from './firebase/recipeService';
import { Smartphone, Monitor, Sparkles } from 'lucide-react';

export default function App() {
  // 1. Language state (en / mr)
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('chav_lang') || 'mr';
  });

  useEffect(() => {
    localStorage.setItem('chav_lang', lang);
  }, [lang]);

  const t = translations[lang];

  // 2. Recipes state
  const [recipes, setRecipes] = useState(defaultRecipes);

  // 3. Navigation tabs and Modals
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'favorites'
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 4. Search and Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // 5. Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('chav_favorites');
      return saved ? JSON.parse(saved) : ['vadapav-masala'];
    } catch {
      return ['vadapav-masala'];
    }
  });

  useEffect(() => {
    localStorage.setItem('chav_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 6. Mobile Frame Container Toggle
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // 7. Subscribe to recipes from Firestore
  const loadData = () => {
    const unsub = subscribeToRecipes((updatedRecipes) => {
      setRecipes(updatedRecipes);
    });
    return unsub;
  };

  useEffect(() => {
    const unsub = loadData();
    return () => unsub();
  }, []);

  // 8. Filtered Recipes computation
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (activeTab === 'favorites' && !favorites.includes(recipe.id)) {
        return false;
      }

      if (selectedCategory !== 'all' && recipe.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleEn = (recipe.title_en || '').toLowerCase();
        const titleMr = (recipe.title_mr || '').toLowerCase();
        const descEn = (recipe.description_en || '').toLowerCase();
        const descMr = (recipe.description_mr || '').toLowerCase();

        const matchTitle = titleEn.includes(q) || titleMr.includes(q);
        const matchDesc = descEn.includes(q) || descMr.includes(q);
        const matchIng = (recipe.ingredients || []).some(
          (ing) =>
            (ing.name_en || '').toLowerCase().includes(q) ||
            (ing.name_mr || '').toLowerCase().includes(q)
        );

        if (!matchTitle && !matchDesc && !matchIng) {
          return false;
        }
      }

      return true;
    });
  }, [recipes, activeTab, favorites, selectedCategory, searchQuery]);

  // Handlers
  const handleSaveRecipe = async (newRecipe) => {
    const res = await addRecipe(newRecipe);
    loadData();
    return res;
  };

  const handleDeleteRecipe = async (id) => {
    await deleteRecipe(id);
    loadData();
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-start sm:py-6 selection:bg-orange-500 selection:text-white">
      {/* Desktop Helper Bar */}
      <aside aria-label="Device view toggle" className="hidden sm:flex items-center justify-between w-full max-w-md mb-2 px-2 text-xs text-stone-500 font-medium">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>{lang === 'mr' ? 'मोबाईल अ‍ॅप डिझाईन' : 'Native Mobile App UI'}</span>
        </span>
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="flex items-center gap-1 text-stone-600 hover:text-orange-600 transition-colors bg-white px-2 py-0.5 rounded-md border border-stone-200"
          title={t.toggleViewMode}
        >
          {isMobileFrame ? (
            <>
              <Monitor className="w-3 h-3" />
              <span>{lang === 'mr' ? 'फुल स्क्रीन' : 'Wide View'}</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3 h-3" />
              <span>{lang === 'mr' ? 'मोबाईल फ्रेम' : 'Phone Frame'}</span>
            </>
          )}
        </button>
      </aside>

      {/* Main Mobile App Container */}
      <div
        className={`w-full bg-stone-50 min-h-screen sm:min-h-[844px] transition-all duration-300 flex flex-col relative overflow-hidden ${
          isMobileFrame
            ? 'max-w-[430px] sm:rounded-[44px] sm:shadow-2xl sm:border-[9px] sm:border-stone-900 sm:ring-1 sm:ring-black/10'
            : 'max-w-3xl sm:rounded-3xl sm:shadow-xl sm:border sm:border-stone-200'
        }`}
      >
        {/* Simulated Phone Speaker / Dynamic Island in Mobile Frame mode */}
        {isMobileFrame && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white select-none">
            <div className="w-24 h-4 bg-stone-950 rounded-full flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-stone-900 border border-stone-800" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80" />
            </div>
          </div>
        )}

        {/* Clean Top Navbar with Instant Bilingual Switcher */}
        <Navbar
          lang={lang}
          setLang={setLang}
        />

        {/* Screen Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {selectedRecipe ? (
            <RecipeDetailView
              recipe={selectedRecipe}
              lang={lang}
              onBack={() => setSelectedRecipe(null)}
              isFavorite={favorites.includes(selectedRecipe.id)}
              onToggleFavorite={toggleFavorite}
              onDeleteRecipe={handleDeleteRecipe}
            />
          ) : (
            <div className="p-4 space-y-4 pb-28">
              {/* Search Bar */}
              <SearchBar
                lang={lang}
                query={searchQuery}
                setQuery={setSearchQuery}
              />

              {/* Category Filter Chips */}
              <CategoryChips
                lang={lang}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />

              {/* Section Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-stone-900 text-sm tracking-tight">
                    {activeTab === 'favorites' ? t.favorites : t.recipes}
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200/80 text-stone-700 font-bold">
                    {filteredRecipes.length}
                  </span>
                </div>

                {activeTab === 'favorites' && (
                  <button
                    onClick={() => setActiveTab('all')}
                    className="text-xs text-orange-600 font-semibold"
                  >
                    {t.categories.all}
                  </button>
                )}
              </div>

              {/* Recipe Cards Grid */}
              {filteredRecipes.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      lang={lang}
                      onSelect={(rec) => setSelectedRecipe(rec)}
                      isFavorite={favorites.includes(recipe.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center px-4">
                  <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 text-2xl">
                    🍲
                  </div>
                  <h3 className="font-bold text-stone-800 text-sm mb-1">
                    {t.noRecipesFound}
                  </h3>
                  <p className="text-xs text-stone-500 max-w-xs mx-auto mb-4">
                    {lang === 'mr'
                      ? 'नवीन अस्सल पाककृती जोडण्यासाठी खालील + बटणावर टॅप करा.'
                      : 'Try adjusting your search or tap the + button below to add your own recipe.'}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setActiveTab('all');
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
                  >
                    {t.categories.all}
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Bottom Navigation Bar */}
        {!selectedRecipe && (
          <BottomNav
            lang={lang}
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            favoritesCount={favorites.length}
          />
        )}

        {/* Add Recipe Modal */}
        <AddRecipeModal
          lang={lang}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSaveRecipe={handleSaveRecipe}
        />
      </div>
    </div>
  );
}
