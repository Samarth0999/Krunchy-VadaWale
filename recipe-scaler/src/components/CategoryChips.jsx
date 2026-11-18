import React from 'react';
import { translations } from '../data/translations';

const CATEGORY_ICONS = {
  all: "🍽️",
  breakfast: "🥣",
  beverages: "☕",
  mains: "🍛",
  snacks: "🥟",
  sweets: "🍯",
};

export default function CategoryChips({ lang, selectedCategory, onSelectCategory }) {
  const t = translations[lang];

  const categories = [
    { key: 'all', label: t.categories.all },
    { key: 'breakfast', label: t.categories.breakfast },
    { key: 'beverages', label: t.categories.beverages },
    { key: 'mains', label: t.categories.mains },
    { key: 'snacks', label: t.categories.snacks },
    { key: 'sweets', label: t.categories.sweets },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar -mx-4 px-4">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all active:scale-95 ${
              isSelected
                ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/25 ring-2 ring-orange-500/30'
                : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-50 hover:border-stone-300'
            }`}
          >
            <span className="text-sm">{CATEGORY_ICONS[cat.key] || '🍲'}</span>
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
