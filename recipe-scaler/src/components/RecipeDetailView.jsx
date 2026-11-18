import React, { useState, useId } from 'react';
import {
  ArrowLeft,
  Users,
  Plus,
  Minus,
  RotateCcw,
  CheckCircle2,
  Circle,
  Copy,
  Share2,
  Heart,
  Clock,
  Sparkles,
  Flame,
  Check,
  Percent,
  Trash2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations } from '../data/translations';
import {
  calculateScaledQty,
  formatQuantity,
  getScaleMultiplier,
  toMarathiDigits,
} from '../utils/scaler';

export default function RecipeDetailView({
  recipe,
  lang,
  onBack,
  isFavorite,
  onToggleFavorite,
  onDeleteRecipe,
}) {
  const t = translations[lang];

  // Base servings from recipe (fallback to 2 if missing)
  const baseServings = Number(recipe.base_servings) || 2;

  // Target serving state (defaults to base servings)
  const [targetServings, setTargetServings] = useState(baseServings);
  const [customInput, setCustomInput] = useState('');
  const [isEditingCustom, setIsEditingCustom] = useState(false);

  // Toggle fraction display vs decimals
  const [useFractions, setUseFractions] = useState(true);

  // Ingredient checklist state (ingredient id -> boolean)
  const [checkedItems, setCheckedItems] = useState({});

  // Copy notification state
  const [copied, setCopied] = useState(false);

  // Quick preset options
  const presets = [1, 2, 4, 6, 8];

  // Primary and secondary bilingual titles
  const title = lang === 'mr' ? (recipe.title_mr || recipe.title_en) : recipe.title_en;
  const secondaryTitle = lang === 'mr' ? recipe.title_en : recipe.title_mr;
  const description = lang === 'mr' ? (recipe.description_mr || recipe.description_en) : recipe.description_en;
  const chefTip = lang === 'mr' ? (recipe.chef_tip_mr || recipe.chef_tip_en) : recipe.chef_tip_en;
  const steps = lang === 'mr' ? (recipe.steps_mr || recipe.steps_en || []) : (recipe.steps_en || recipe.steps_mr || []);

  // Multiplier string e.g. "1.5x"
  const multiplier = getScaleMultiplier(baseServings, targetServings);
  const isScaled = targetServings !== baseServings;

  // Handlers for Servings
  const handlePresetClick = (val) => {
    setTargetServings(val);
    setCustomInput('');
    setIsEditingCustom(false);
  };

  const handleStepChange = (delta) => {
    const next = Math.max(0.5, Math.round((targetServings + delta) * 10) / 10);
    setTargetServings(next);
    setCustomInput('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const parsed = parseFloat(customInput);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetServings(parsed);
      setIsEditingCustom(false);
    }
  };

  const handleReset = () => {
    setTargetServings(baseServings);
    setCustomInput('');
    setIsEditingCustom(false);
  };

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const clearAllChecks = () => {
    setCheckedItems({});
  };

  // Copy formatted scaled ingredients to clipboard
  const handleCopyIngredients = () => {
    const lines = [
      `🍲 ${title} (${targetServings} ${t.servings} | Scale: ${multiplier})`,
      `----------------------------------------`,
      ...recipe.ingredients.map((ing) => {
        const scaled = calculateScaledQty(ing.base_qty, baseServings, targetServings);
        const qtyStr = formatQuantity(scaled, useFractions, lang);
        const unit = lang === 'mr' ? (ing.unit_mr || ing.unit_en) : (ing.unit_en || ing.unit_mr);
        const name = lang === 'mr' ? (ing.name_mr || ing.name_en) : (ing.name_en || ing.name_mr);
        return `• ${name}: ${qtyStr} ${unit}`;
      }),
      `----------------------------------------`,
      `Scaled with Chav Recipe Scaler`
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Share recipe
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${title} - Recipe Scaler`,
        text: `${title} (${targetServings} servings):\n${description}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopyIngredients();
    }
  };

  return (
    <div className="min-h-full pb-28 animate-in fade-in duration-200">
      {/* Top Floating App Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-stone-200 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 font-semibold text-sm px-2.5 py-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          aria-label="Go back to recipes list"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden xs:inline">{t.recipes}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Delete recipe if custom */}
          {recipe.id && !recipe.id.startsWith('kanda-') && !recipe.id.startsWith('masala-') && (
            <button
              onClick={() => {
                if (window.confirm(t.deleteConfirm)) {
                  onDeleteRecipe(recipe.id);
                  onBack();
                }
              }}
              className="p-2 text-stone-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
              title={t.delete}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Share */}
          <button
            onClick={handleShare}
            className="p-2 text-stone-600 hover:text-orange-600 rounded-full hover:bg-orange-50 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(recipe.id)}
            className="p-2 text-stone-600 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors"
            title={t.favorites}
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-stone-600'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="relative h-60 w-full bg-stone-900 overflow-hidden">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-600 to-orange-500 text-6xl">
            🍲
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* Hero Title and Badges */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-orange-500 text-white uppercase tracking-wider">
              {t.categories[recipe.category] || recipe.category}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white">
              {t.difficulties[recipe.difficulty] || t.difficulties.easy}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white leading-tight">
            {title}
          </h1>
          {secondaryTitle && (
            <p className="text-sm text-amber-200/90 font-medium">
              {secondaryTitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Description & Times */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs">
          <p className="text-xs text-stone-700 leading-relaxed mb-3">
            {description}
          </p>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center">
            <div className="bg-stone-50 rounded-xl p-2">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">{t.prepTime}</span>
              <span className="text-xs font-bold text-stone-800">
                {lang === 'mr' ? toMarathiDigits(recipe.prep_time) : recipe.prep_time} {t.difficulties.mins || 'm'}
              </span>
            </div>
            <div className="bg-stone-50 rounded-xl p-2">
              <span className="text-[10px] text-stone-500 uppercase font-bold block">{t.cookTime}</span>
              <span className="text-xs font-bold text-stone-800">
                {lang === 'mr' ? toMarathiDigits(recipe.cook_time) : recipe.cook_time} {t.difficulties.mins || 'm'}
              </span>
            </div>
            <div className="bg-orange-50/80 rounded-xl p-2 border border-orange-200/60">
              <span className="text-[10px] text-orange-700 uppercase font-bold block">{t.baseServings}</span>
              <span className="text-xs font-black text-orange-700">
                {lang === 'mr' ? toMarathiDigits(baseServings) : baseServings} {t.servings}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SERVINGS MULTIPLIER CONTROLLER (Key Requirement #2)                        */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-4.5 text-white shadow-lg shadow-orange-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-tight text-white">
                  {t.servingsMultiplier}
                </h3>
                <p className="text-[11px] text-orange-100 font-medium">
                  {lang === 'mr'
                    ? `मूळ प्रमाण: ${toMarathiDigits(baseServings)} व्यक्ती`
                    : `Base recipe: ${baseServings} servings`}
                </p>
              </div>
            </div>

            {/* Scale badge & Reset */}
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 backdrop-blur-md text-[11px] font-black tracking-wide text-white border border-white/20">
                {multiplier}
              </span>
              {isScaled && (
                <button
                  onClick={handleReset}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                  title={t.resetServings}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Stepper Display */}
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-2 flex items-center justify-between mb-3 border border-white/20">
            <button
              onClick={() => handleStepChange(-0.5)}
              className="w-11 h-11 rounded-xl bg-white text-orange-600 hover:bg-orange-50 active:scale-90 flex items-center justify-center font-black shadow-sm transition-all"
              aria-label="Decrease servings by 0.5"
            >
              <Minus className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Serving Count / Custom Toggle */}
            <div className="text-center px-2 flex-1">
              {!isEditingCustom ? (
                <button
                  onClick={() => {
                    setIsEditingCustom(true);
                    setCustomInput(targetServings.toString());
                  }}
                  className="group flex flex-col items-center justify-center mx-auto"
                  title="Tap to type custom serving"
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tight text-white group-hover:scale-105 transition-transform">
                      {lang === 'mr' ? toMarathiDigits(targetServings) : targetServings}
                    </span>
                    <span className="text-xs font-bold text-orange-100 uppercase">
                      {t.servings}
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-200 underline underline-offset-2">
                    {lang === 'mr' ? 'सानुकूल टाका' : 'Tap for custom'}
                  </span>
                </button>
              ) : (
                <form onSubmit={handleCustomSubmit} className="flex items-center justify-center gap-1">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    autoFocus
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="w-20 px-2 py-1 bg-white text-stone-900 rounded-lg text-center font-bold text-base focus:outline-none"
                    placeholder="1.5"
                  />
                  <button
                    type="submit"
                    className="bg-white text-orange-600 font-bold px-2 py-1 rounded-lg text-xs"
                  >
                    OK
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={() => handleStepChange(0.5)}
              className="w-11 h-11 rounded-xl bg-white text-orange-600 hover:bg-orange-50 active:scale-90 flex items-center justify-center font-black shadow-sm transition-all"
              aria-label="Increase servings by 0.5"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>
          </div>

          {/* Quick Preset Serving Buttons (1, 2, 4, 6, 8) */}
          <div className="flex items-center justify-between gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-orange-100 uppercase tracking-wider">
              {t.quickServings}:
            </span>
            <div className="flex items-center gap-1.5 flex-1 justify-end">
              {presets.map((val) => {
                const isActive = targetServings === val;
                return (
                  <button
                    key={val}
                    onClick={() => handlePresetClick(val)}
                    className={`min-w-8 h-8 rounded-lg text-xs font-black transition-all active:scale-90 ${
                      isActive
                        ? 'bg-white text-orange-600 shadow-md ring-2 ring-white/60 scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {lang === 'mr' ? toMarathiDigits(val) : val}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INGREDIENTS LIST SECTION                                                  */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-stone-900 text-base">
                {t.ingredients}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                {lang === 'mr' ? toMarathiDigits(recipe.ingredients?.length || 0) : (recipe.ingredients?.length || 0)}
              </span>
            </div>

            {/* Fraction vs Decimal Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUseFractions(!useFractions)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 active:scale-95 transition-all shadow-2xs"
                title="Toggle fraction or decimal formatting"
              >
                {useFractions ? t.showDecimals : t.showFractions}
              </button>
              {Object.keys(checkedItems).some((k) => checkedItems[k]) && (
                <button
                  onClick={clearAllChecks}
                  className="text-[11px] font-semibold text-stone-500 hover:text-stone-800"
                >
                  {t.clearChecked}
                </button>
              )}
            </div>
          </div>

          {/* Ingredients Checklist */}
          <div className="bg-white rounded-2xl border border-stone-200/90 divide-y divide-stone-100 overflow-hidden shadow-xs">
            {recipe.ingredients.map((ing) => {
              const isChecked = Boolean(checkedItems[ing.id]);
              const scaledQty = calculateScaledQty(ing.base_qty, baseServings, targetServings);
              const formattedQty = formatQuantity(scaledQty, useFractions, lang);
              const unit = lang === 'mr' ? (ing.unit_mr || ing.unit_en) : (ing.unit_en || ing.unit_mr);
              const name = lang === 'mr' ? (ing.name_mr || ing.name_en) : (ing.name_en || ing.name_mr);
              const secondaryName = lang === 'mr' ? ing.name_en : ing.name_mr;

              return (
                <div
                  key={ing.id}
                  onClick={() => toggleCheck(ing.id)}
                  className={`p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isChecked
                      ? 'bg-stone-50/80 text-stone-400'
                      : 'hover:bg-amber-50/30 text-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      className="shrink-0 text-stone-400 hover:text-orange-500"
                      aria-label="Toggle ingredient checked state"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300" />
                      )}
                    </button>
                    <div className="truncate">
                      <p
                        className={`text-xs font-semibold leading-tight truncate ${
                          isChecked ? 'line-through text-stone-400' : 'text-stone-900'
                        }`}
                      >
                        {name}
                      </p>
                      {secondaryName && secondaryName !== name && (
                        <p className="text-[11px] text-stone-400 truncate">
                          {secondaryName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Scaled Quantity Display */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-extrabold tracking-tight ${
                        isChecked ? 'text-stone-400' : 'text-orange-600'
                      }`}
                    >
                      {formattedQty}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500 ml-1">
                      {unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Copy Scaled Ingredients Button */}
          <button
            onClick={handleCopyIngredients}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.99] ${
              copied
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-orange-200 text-orange-700 hover:bg-orange-50 shadow-2xs'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{t.copiedToast}</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-orange-500" />
                <span>{t.copyIngredients}</span>
              </>
            )}
          </button>
        </div>

        {/* Chef's Secret Tip */}
        {chefTip && (
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-amber-900 mb-1">
                {t.chefTip}
              </h4>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                {chefTip}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP-BY-STEP INSTRUCTIONS                                                 */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-2">
          <h2 className="font-extrabold text-stone-900 text-base">
            {t.instructions}
          </h2>

          <div className="space-y-3">
            {steps.map((stepText, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs flex items-start gap-3.5"
              >
                <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                  {lang === 'mr' ? toMarathiDigits(idx + 1) : idx + 1}
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
