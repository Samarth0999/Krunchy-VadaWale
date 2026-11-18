import React from 'react';
import { Globe } from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({
  lang,
  setLang,
}) {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-bold text-lg">
            🍲
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-stone-900 text-lg tracking-tight">
                {lang === 'mr' ? 'चव प्रमाणक' : 'Chav Scaler'}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">
              {lang === 'mr' ? 'द्विभाषिक पाककृती गणक' : 'Bilingual Recipe Multiplier'}
            </p>
          </div>
        </div>

        {/* Action Controls - Clean Bilingual Language Switcher Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-3.5 py-1.5 rounded-full shadow-sm text-xs transition-all transform active:scale-90"
            aria-label="Toggle language between English and Marathi"
            title="Switch Language / भाषा बदला"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="tracking-wide">
              {lang === 'en' ? 'मराठी' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
