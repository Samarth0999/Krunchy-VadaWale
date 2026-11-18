import React from 'react';
import { Search, X } from 'lucide-react';
import { translations } from '../data/translations';

export default function SearchBar({ lang, query, setQuery }) {
  const t = translations[lang];

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-xs"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
