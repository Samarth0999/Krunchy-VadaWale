import React, { useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import {
  Flame,
  Sandwich,
  Utensils,
  Layers,
  Coffee,
  IceCream,
  Boxes,
  Sparkles,
  Tag
} from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const { products, categories } = usePOS();

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n === 'all') return <Sparkles className="w-3.5 h-3.5" />;
    if (n.includes('chicken') || n.includes('fry') || n.includes('fried') || n.includes('hot')) return <Flame className="w-3.5 h-3.5" />;
    if (n.includes('burger') || n.includes('vada') || n.includes('pav') || n.includes('sandwich')) return <Sandwich className="w-3.5 h-3.5" />;
    if (n.includes('combo') || n.includes('bucket') || n.includes('box') || n.includes('meal')) return <Boxes className="w-3.5 h-3.5" />;
    if (n.includes('snack') || n.includes('starter') || n.includes('fries')) return <Utensils className="w-3.5 h-3.5" />;
    if (n.includes('dip') || n.includes('side') || n.includes('sauce')) return <Layers className="w-3.5 h-3.5" />;
    if (n.includes('beverage') || n.includes('drink') || n.includes('shake') || n.includes('cooler') || n.includes('coffee') || n.includes('tea')) return <Coffee className="w-3.5 h-3.5" />;
    if (n.includes('dessert') || n.includes('ice') || n.includes('cream') || n.includes('sweet')) return <IceCream className="w-3.5 h-3.5" />;
    return <Tag className="w-3.5 h-3.5" />;
  };

  const allCategories = useMemo(() => {
    return ['All', ...categories];
  }, [categories]);

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return products.filter(p => p.isActive).length;
    return products.filter(p => p.isActive && p.category.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      {allCategories.map(cat => {
        const isSelected = selectedCategory === cat;
        const count = getCategoryCount(cat);

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${isSelected
              ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-xs font-semibold'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
              }`}
          >
            <span className={isSelected ? 'text-zinc-900' : 'text-zinc-400'}>{getCategoryIcon(cat)}</span>
            <span>{cat}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isSelected ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-zinc-500'
              }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
