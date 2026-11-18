import React from 'react';
import { Clock, Users, ChefHat, Sparkles, Heart } from 'lucide-react';
import { translations } from '../data/translations';
import { toMarathiDigits } from '../utils/scaler';

export default function RecipeCard({
  recipe,
  lang,
  onSelect,
  isFavorite,
  onToggleFavorite,
}) {
  const t = translations[lang];

  // Bilingual fields
  const title = lang === 'mr' ? (recipe.title_mr || recipe.title_en) : recipe.title_en;
  const secondaryTitle = lang === 'mr' ? recipe.title_en : recipe.title_mr;
  const description = lang === 'mr' ? (recipe.description_mr || recipe.description_en) : recipe.description_en;

  const prepTime = lang === 'mr' ? toMarathiDigits(recipe.prep_time) : recipe.prep_time;
  const cookTime = lang === 'mr' ? toMarathiDigits(recipe.cook_time) : recipe.cook_time;
  const baseServings = lang === 'mr' ? toMarathiDigits(recipe.base_servings) : recipe.base_servings;

  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    hard: 'bg-rose-100 text-rose-700 border-rose-200',
  }[recipe.difficulty || 'easy'];

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer flex flex-col active:scale-[0.985]"
    >
      {/* Recipe Image with Overlays */}
      <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 text-4xl">
            🍲
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-700 hover:text-rose-500 transition-colors shadow-sm"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-4 h-4 ${
              isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-700'
            }`}
          />
        </button>

        {/* Difficulty & Base Servings Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className={`px-2.5 py-0.5 rounded-full font-bold border text-[11px] backdrop-blur-md ${difficultyColor}`}>
            {t.difficulties[recipe.difficulty] || t.difficulties.easy}
          </span>
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-white font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
            <Users className="w-3 h-3 text-orange-400" />
            <span>{baseServings} {t.servings}</span>
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-1 mb-1">
            <h3 className="font-bold text-stone-900 text-base leading-tight group-hover:text-orange-600 transition-colors">
              {title}
            </h3>
          </div>
          {secondaryTitle && (
            <p className="text-xs text-orange-700/80 font-medium mb-2">
              {secondaryTitle}
            </p>
          )}
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{prepTime} + {cookTime} {t.difficulties.mins || 'm'}</span>
            </span>
            <span className="text-stone-300">•</span>
            <span>
              {lang === 'mr' ? toMarathiDigits(recipe.ingredients?.length || 0) : (recipe.ingredients?.length || 0)} {t.totalIngredients}
            </span>
          </div>

          <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">
            {lang === 'mr' ? 'प्रमाण बदला →' : 'Scale →'}
          </span>
        </div>
      </div>
    </div>
  );
}
