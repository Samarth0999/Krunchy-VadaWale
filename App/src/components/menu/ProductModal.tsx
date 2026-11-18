import React, { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { X, Check } from 'lucide-react';

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
  const { saveProduct, categories, addCategory, settings } = usePOS();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState<number>(199);
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isSpicy, setIsSpicy] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [inStock, setInStock] = useState(true);
  const [sku, setSku] = useState('');

  const categoryOptions = React.useMemo(() => {
    const list = [...categories];
    if (!list.includes('Custom')) list.push('Custom');
    return list;
  }, [categories]);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      if (categories.includes(productToEdit.category)) {
        setCategory(productToEdit.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(productToEdit.category);
      }
      setPrice(productToEdit.price);
      setDescription(productToEdit.description || '');
      setImage(productToEdit.image || '');
      setIsSpicy(productToEdit.isSpicy || false);
      setIsActive(productToEdit.isActive);
      setInStock(productToEdit.inStock);
      setSku(productToEdit.sku || '');
    } else {
      setName('');
      setCategory(categories[0] || 'General');
      setCustomCategory('');
      setPrice(199);
      setDescription('');
      setImage('https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80');
      setIsSpicy(false);
      setIsActive(true);
      setInStock(true);
      setSku(`KRN-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalCategory = category;
    if (category === 'Custom') {
      finalCategory = customCategory.trim() || 'General';
      if (finalCategory && !categories.includes(finalCategory)) {
        await addCategory(finalCategory);
      }
    }

    const product: Product = {
      id: productToEdit ? productToEdit.id : `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      category: finalCategory,
      price: Number(price),
      description: description.trim(),
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
      isVeg: true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92dvh] shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-sm text-zinc-100">
            {productToEdit ? 'Edit Item' : 'New Menu Item'}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-zinc-400 block mb-1">Item Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Krunchy Double Smash Cheeseburger"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Custom' ? '+ Add New Category...' : cat}
                  </option>
                ))}
              </select>
            </div>

            {category === 'Custom' && (
              <div className="sm:col-span-2">
                <label className="text-orange-400 block mb-1 font-medium">New Category Name *</label>
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. Shakes, Pizzas, Wraps"
                  className="w-full bg-zinc-950 border border-orange-500/60 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>
            )}

            <div>
              <label className="text-zinc-400 block mb-1">Price ({currency}) *</label>
              <input
                type="number"
                required
                min={0}
                value={price || ''}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="199"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 font-mono text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-zinc-400 block mb-1">Image URL</label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-100 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
            
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                100% Veg
              </span>
              <span className="text-[10px] text-emerald-500 font-mono">Pure</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400">Spicy</span>
              <button
                type="button"
                onClick={() => setIsSpicy(!isSpicy)}
                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  isSpicy ? 'bg-rose-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-3 h-3 rounded-full bg-white"></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400">In Stock</span>
              <button
                type="button"
                onClick={() => setInStock(!inStock)}
                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  inStock ? 'bg-zinc-200 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${inStock ? 'bg-zinc-950' : 'bg-zinc-500'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400">Active</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`w-7 h-4 flex items-center rounded-full p-0.5 transition-colors ${
                  isActive ? 'bg-zinc-200 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-zinc-950' : 'bg-zinc-500'}`}></div>
              </button>
            </div>

          </div>

          {/* Submit Buttons */}
          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-lg shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{productToEdit ? 'Save Changes' : 'Add Item'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
