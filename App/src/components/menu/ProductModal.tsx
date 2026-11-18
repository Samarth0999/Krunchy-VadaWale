import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { X, Check, Flame } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit
}) => {
  const { saveProduct, settings } = usePOS();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Fried Chicken');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number>(199);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isVeg, setIsVeg] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [sku, setSku] = useState('');

  const defaultCategories = [
    'Fried Chicken',
    'Burgers',
    'Combos & Buckets',
    'Starters & Snacks',
    'Sides & Dips',
    'Beverages',
    'Desserts',
    'Custom'
  ];

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      if (defaultCategories.includes(productToEdit.category)) {
        setCategory(productToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(productToEdit.category);
      }
      setPrice(productToEdit.price);
      setDescription(productToEdit.description || '');
      setImage(productToEdit.image || '');
      setIsVeg(productToEdit.isVeg);
      setIsSpicy(productToEdit.isSpicy || false);
      setIsActive(productToEdit.isActive);
      setInStock(productToEdit.inStock);
      setSku(productToEdit.sku || '');
    } else {
      setName('');
      setCategory('Fried Chicken');
      setCustomCategory('');
      setPrice(199);
      setDescription('');
      setImage('https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80');
      setIsVeg(false);
      setIsSpicy(false);
      setIsActive(true);
      setInStock(true);
      setSku(`KRN-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    const product: Product = {
      id: productToEdit ? productToEdit.id : `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category: finalCategory,
      price: Number(price),
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      isVeg,
      isSpicy,
      isActive,
      inStock,
      sku: sku.trim() || undefined,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString()
    };

    await saveProduct(product);
    onClose();
  };

  const currency = settings.currencySymbol || '₹';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-dark-900 border border-white/[0.1] rounded-3xl w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 bg-dark-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white">
            {productToEdit ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/[0.06]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Item Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Krunchy Double Smash Cheeseburger"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                {defaultCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Selling Price ({currency}) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="199"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500 tabular-nums"
              />
            </div>

            {category === 'Custom' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Custom Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Rice Bowls"
                  className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            {/* SKU / Code */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Item Code / SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. KRN-BG-01"
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Image URL (Unsplash or direct image link)
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
                {image && (
                  <img
                    src={image}
                    alt="Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-white/[0.1] bg-dark-950 shrink-0"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Description / Ingredients
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Crispy fried fillet, smoky chipotle mayo, lettuce, brioche bun..."
                className="w-full bg-dark-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Dietary & Status Toggles */}
          <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* Veg / Non-Veg */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-950 border border-white/[0.06]">
              <span className="text-xs text-slate-300 font-bold">Pure Veg?</span>
              <button
                type="button"
                onClick={() => setIsVeg(!isVeg)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isVeg ? 'bg-emerald-600 justify-end' : 'bg-dark-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

            {/* Spicy */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-950 border border-white/[0.06]">
              <span className="text-xs text-slate-300 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-rose-500" />
                Spicy?
              </span>
              <button
                type="button"
                onClick={() => setIsSpicy(!isSpicy)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isSpicy ? 'bg-rose-600 justify-end' : 'bg-dark-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

            {/* In Stock */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-950 border border-white/[0.06]">
              <span className="text-xs text-slate-300 font-bold">In Stock</span>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  inStock ? 'bg-orange-500 justify-end' : 'bg-dark-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

            {/* Active on POS */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-dark-950 border border-white/[0.06]">
              <span className="text-xs text-slate-300 font-bold">Active</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                  isActive ? 'bg-orange-500 justify-end' : 'bg-dark-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-white shadow-md"></div>
              </button>
            </div>

          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-dark-850 hover:bg-dark-800 text-slate-300 text-xs font-bold rounded-xl border border-white/[0.06]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-glow-orange"
            >
              <Check className="w-4 h-4" />
              <span>{productToEdit ? 'Save Changes' : 'Add to Catalog'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
