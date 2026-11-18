import React from 'react';
import { usePOS } from '../../context/POSContext';
import { 
  Flame, 
  Sandwich, 
  Utensils, 
  Layers, 
  Coffee, 
  IceCream, 
  Boxes, 
  Sparkles 
} from 'lucide-react';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  const { products } = usePOS();

  const categories = [
    { name: 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { name: 'Fried Chicken', icon: <Flame className="w-3.5 h-3.5" /> },
    { name: 'Burgers', icon: <Sandwich className="w-3.5 h-3.5" /> },
    { name: 'Combos & Buckets', icon: <Boxes className="w-3.5 h-3.5" /> },
    { name: 'Starters & Snacks', icon: <Utensils className="w-3.5 h-3.5" /> },
    { name: 'Sides & Dips', icon: <Layers className="w-3.5 h-3.5" /> },
    { name: 'Beverages', icon: <Coffee className="w-3.5 h-3.5" /> },
    { name: 'Desserts', icon: <IceCream className="w-3.5 h-3.5" /> }
  ];

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return products.filter(p => p.isActive).length;
    return products.filter(p => p.isActive && p.category.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
      {categories.map(cat => {
        const isSelected = selectedCategory === cat.name;
        const count = getCategoryCount(cat.name);

        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
              isSelected 
                ? 'bg-zinc-100 text-zinc-950 border-zinc-200 shadow-xs font-semibold' 
                : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-zinc-800/80'
            }`}
          >
            <span className={isSelected ? 'text-zinc-900' : 'text-zinc-400'}>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
              isSelected ? 'bg-zinc-200 text-zinc-900 font-bold' : 'bg-zinc-800 text-zinc-500'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
