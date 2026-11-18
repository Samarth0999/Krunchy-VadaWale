import React, { useState } from 'react';
import { X, Plus, Trash2, Sparkles, ChefHat, CloudUpload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations } from '../data/translations';

export default function AddRecipeModal({
  lang,
  isOpen,
  onClose,
  onSaveRecipe,
}) {
  const t = translations[lang];

  const initialForm = {
    title_en: '',
    title_mr: '',
    description_en: '',
    description_mr: '',
    category: 'breakfast',
    base_servings: 2,
    prep_time: 10,
    cook_time: 15,
    difficulty: 'easy',
    chef_tip_en: '',
    chef_tip_mr: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    ingredients: [
      { id: '1', name_en: '', name_mr: '', base_qty: 1, unit_en: 'cup', unit_mr: 'कप' },
      { id: '2', name_en: '', name_mr: '', base_qty: 0.5, unit_en: 'tsp', unit_mr: 'लहान चमचा' },
    ],
    steps_en: [''],
    steps_mr: [''],
  };

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        {
          id: Date.now().toString(),
          name_en: '',
          name_mr: '',
          base_qty: 1,
          unit_en: 'tbsp',
          unit_mr: 'मोठे चमचे',
        },
      ],
    }));
  };

  const handleRemoveIngredient = (idx) => {
    if (formData.ingredients.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const handleIngredientChange = (idx, field, val) => {
    setFormData((prev) => {
      const copy = [...prev.ingredients];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, ingredients: copy };
    });
  };

  const handleAddStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps_en: [...prev.steps_en, ''],
      steps_mr: [...prev.steps_mr, ''],
    }));
  };

  const handleRemoveStep = (idx) => {
    if (formData.steps_en.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      steps_en: prev.steps_en.filter((_, i) => i !== idx),
      steps_mr: prev.steps_mr.filter((_, i) => i !== idx),
    }));
  };

  const handleStepChange = (idx, langType, val) => {
    setFormData((prev) => {
      const copy = langType === 'en' ? [...prev.steps_en] : [...prev.steps_mr];
      copy[idx] = val;
      return langType === 'en' ? { ...prev, steps_en: copy } : { ...prev, steps_mr: copy };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.title_en.trim() && !formData.title_mr.trim()) {
      setError(lang === 'mr' ? 'कृपया पाककृतीचे नाव भरा.' : 'Please enter at least one recipe title.');
      return;
    }

    const validIngredients = formData.ingredients.filter(
      (ing) => (ing.name_en.trim() || ing.name_mr.trim()) && ing.base_qty > 0
    );

    if (validIngredients.length === 0) {
      setError(
        lang === 'mr'
          ? 'कृपया किमान एक साहित्य योग्य प्रमाणासह भरा.'
          : 'Please add at least one valid ingredient with quantity.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanRecipe = {
        ...formData,
        base_servings: Number(formData.base_servings) || 2,
        prep_time: Number(formData.prep_time) || 10,
        cook_time: Number(formData.cook_time) || 15,
        ingredients: validIngredients.map((ing) => ({
          ...ing,
          base_qty: parseFloat(ing.base_qty) || 1,
        })),
        steps_en: formData.steps_en.filter((s) => s.trim().length > 0),
        steps_mr: formData.steps_mr.filter((s) => s.trim().length > 0),
      };

      await onSaveRecipe(cleanRecipe);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
      setFormData(initialForm);
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[92vh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 text-base">
                {t.newRecipeTitle}
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                {lang === 'mr' ? 'क्लाउड फायरबेसवर त्वरित जतन होईल' : 'Directly saves to Cloud Firestore'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.recipeNameEn} *
              </label>
              <input
                type="text"
                required
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                placeholder="e.g. Sabudana Vada"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.recipeNameMr} *
              </label>
              <input
                type="text"
                required
                value={formData.title_mr}
                onChange={(e) => setFormData({ ...formData, title_mr: e.target.value })}
                placeholder="उदा. साबुदाणा वडा"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all text-xs"
              />
            </div>
          </div>

          {/* Category, Servings, Times */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.categoryLabel}
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:border-orange-500 text-xs"
              >
                <option value="breakfast">{t.categories.breakfast}</option>
                <option value="beverages">{t.categories.beverages}</option>
                <option value="mains">{t.categories.mains}</option>
                <option value="snacks">{t.categories.snacks}</option>
                <option value="sweets">{t.categories.sweets}</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.baseServingsLabel}
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={formData.base_servings}
                onChange={(e) => setFormData({ ...formData, base_servings: e.target.value })}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.prepTimeLabel}
              </label>
              <input
                type="number"
                min="1"
                value={formData.prep_time}
                onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">
                {t.cookTimeLabel}
              </label>
              <input
                type="number"
                min="1"
                value={formData.cook_time}
                onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                className="w-full px-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Bilingual Descriptions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.descEn}</label>
              <textarea
                rows={2}
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                placeholder="Crispy outside, soft inside tea-time snack..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.descMr}</label>
              <textarea
                rows={2}
                value={formData.description_mr}
                onChange={(e) => setFormData({ ...formData, description_mr: e.target.value })}
                placeholder="कुरकुरीत आणि मऊ साबुदाणा वडा..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Dynamic Ingredients Builder */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-stone-900 text-sm">
                {t.ingredientsSection}
              </h3>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="text-orange-600 hover:text-orange-700 font-bold text-xs"
              >
                {t.addIngredientBtn}
              </button>
            </div>

            <div className="space-y-2">
              {formData.ingredients.map((ing, idx) => (
                <div
                  key={ing.id || idx}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/90 grid grid-cols-12 gap-1.5 items-center"
                >
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Name (EN)"
                      value={ing.name_en}
                      onChange={(e) => handleIngredientChange(idx, 'name_en', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="नाव (मराठी)"
                      value={ing.name_mr}
                      onChange={(e) => handleIngredientChange(idx, 'name_mr', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.05"
                      placeholder="Qty"
                      value={ing.base_qty}
                      onChange={(e) => handleIngredientChange(idx, 'base_qty', e.target.value)}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-center"
                    />
                  </div>
                  <div className="col-span-3 flex gap-1">
                    <input
                      type="text"
                      placeholder="Unit (EN/MR)"
                      value={ing.unit_en}
                      onChange={(e) => {
                        handleIngredientChange(idx, 'unit_en', e.target.value);
                        if (!ing.unit_mr) handleIngredientChange(idx, 'unit_mr', e.target.value);
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      disabled={formData.ingredients.length <= 1}
                      className="text-stone-400 hover:text-rose-500 disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5 mx-auto" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Steps Builder */}
          <div className="pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-stone-900 text-sm">
                {t.stepsSection}
              </h3>
              <button
                type="button"
                onClick={handleAddStep}
                className="text-orange-600 hover:text-orange-700 font-bold text-xs"
              >
                {t.addStepBtn}
              </button>
            </div>

            <div className="space-y-2">
              {formData.steps_en.map((stepEn, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/90 space-y-1.5">
                  <div className="flex items-center justify-between text-stone-500 font-bold text-[10px]">
                    <span>{t.step} {idx + 1}</span>
                    {formData.steps_en.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="text-stone-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder={`Step ${idx + 1} in English...`}
                    value={stepEn}
                    onChange={(e) => handleStepChange(idx, 'en', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder={`टप्पा ${idx + 1} मराठीमध्ये...`}
                    value={formData.steps_mr[idx] || ''}
                    onChange={(e) => handleStepChange(idx, 'mr', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Chef Tips */}
          <div className="pt-2 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.chefTipEn}</label>
              <input
                type="text"
                value={formData.chef_tip_en}
                onChange={(e) => setFormData({ ...formData, chef_tip_en: e.target.value })}
                placeholder="Secret tip for perfect texture..."
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.chefTipMr}</label>
              <input
                type="text"
                value={formData.chef_tip_mr}
                onChange={(e) => setFormData({ ...formData, chef_tip_mr: e.target.value })}
                placeholder="उत्तम चवीसाठी सुगरण टीप..."
                className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold hover:bg-stone-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t.savingRecipe}</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>{t.saveRecipeBtn}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
