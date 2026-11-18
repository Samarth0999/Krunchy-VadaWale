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
    { name: 'All', icon: <Sparkles className="w-4 h-4" /> },
    { name: 'Fried Chicken', icon: <Flame className="w-4 h-4" /> },
    { name: 'Burgers', icon: <Sandwich className="w-4 h-4" /> },
    { name: 'Combos & Buckets', icon: <Boxes className="w-4 h-4" /> },
    { name: 'Starters & Snacks', icon: <Utensils className="w-4 h-4" /> },
    { name: 'Sides & Dips', icon: <Layers className="w-4 h-4" /> },
    { name: 'Beverages', icon: <Coffee className="w-4 h-4" /> },
    { name: 'Desserts', icon: <IceCream className="w-4 h-4" /> }
  ];

  const getCategoryCount = (catName: string) => {
    if (catName === 'All') return products.filter(p => p.isActive).length;
    return products.filter(p => p.isActive && p.category.toLowerCase() === catName.toLowerCase()).length;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {categories.map(cat => {
        const isSelected = selectedCategory === cat.name;
        const count = getCategoryCount(cat.name);

        return (
          <button
            key={cat.name}
            type="button"
            onClick={() => onSelectCategory(cat.name)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all duration-200 active:scale-95 ${
              isSelected 
                ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-glow-orange ring-1 ring-orange-400/40' 
                : 'bg-dark-900 hover:bg-dark-850 text-slate-300 hover:text-white border border-white/[0.06] hover:border-white/[0.12]'
            }`}
          >
            <span className={isSelected ? 'text-white' : 'text-orange-400'}>{cat.icon}</span>
            <span>{cat.name}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
              isSelected ? 'bg-black/30 text-white' : 'bg-dark-950 text-slate-400 border border-white/[0.06]'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
