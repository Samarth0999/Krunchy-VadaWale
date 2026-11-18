import React, { useState, useEffect } from 'react';
import { X, Cloud, Key, Database, CheckCircle, RefreshCw, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { translations } from '../data/translations';
import {
  getSavedFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  DEFAULT_FIREBASE_CONFIG,
} from '../firebase/config';
import { seedFirestoreWithDefaultRecipes } from '../firebase/recipeService';

export default function FirebaseSettingsModal({
  lang,
  isOpen,
  onClose,
  cloudStatus,
  onConfigUpdated,
}) {
  const t = translations[lang];

  const [config, setConfig] = useState({
    apiKey: '',
    projectId: '',
    appId: '',
    authDomain: '',
    storageBucket: '',
    messagingSenderId: '',
  });

  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = getSavedFirebaseConfig();
    if (saved) {
      setConfig(saved);
    } else {
      setConfig({
        apiKey: '',
        projectId: '',
        appId: '',
        authDomain: '',
        storageBucket: '',
        messagingSenderId: '',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) {
      alert(lang === 'mr' ? 'कृपया किमान API Key आणि Project ID भरा.' : 'Please provide at least API Key and Project ID.');
      return;
    }

    saveFirebaseConfig({
      ...config,
      authDomain: config.authDomain || `${config.projectId}.firebaseapp.com`,
      storageBucket: config.storageBucket || `${config.projectId}.appspot.com`,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onConfigUpdated();
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    clearFirebaseConfig();
    setConfig({
      apiKey: '',
      projectId: '',
      appId: '',
      authDomain: '',
      storageBucket: '',
      messagingSenderId: '',
    });
    onConfigUpdated();
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      setSeedMessage('');
      const count = await seedFirestoreWithDefaultRecipes();
      setSeedMessage(
        lang === 'mr'
          ? `यशस्वी! ${count} अस्सल पाककृती फायरस्टोअरवर सेव्ह झाल्या!`
          : `Success! ${count} preloaded recipes seeded to Cloud Firestore!`
      );
    } catch (err) {
      setSeedMessage(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm">{t.firebaseSetupTitle}</h2>
              <p className="text-[11px] text-orange-100">
                {cloudStatus.connected ? t.connected : t.disconnected}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
          {/* Status Alert */}
          <div
            className={`p-3 rounded-2xl border flex items-center gap-3 ${
              cloudStatus.connected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold text-xs">
                {cloudStatus.connected ? t.connected : t.disconnected}
              </p>
              <p className="text-[11px] opacity-90">
                {cloudStatus.message || t.firebaseInstructions}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">{t.apiKey} *</label>
              <input
                type="text"
                required
                placeholder="AIzaSy..."
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.projectId} *</label>
                <input
                  type="text"
                  required
                  placeholder="my-recipe-app"
                  value={config.projectId}
                  onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.appId}</label>
                <input
                  type="text"
                  placeholder="1:12345:web:..."
                  value={config.appId}
                  onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.authDomain}</label>
                <input
                  type="text"
                  placeholder="app.firebaseapp.com"
                  value={config.authDomain}
                  onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">{t.storageBucket}</label>
                <input
                  type="text"
                  placeholder="app.appspot.com"
                  value={config.storageBucket}
                  onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {saveSuccess && (
              <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold text-center">
                ✓ {t.firebaseSavedToast}
              </div>
            )}

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-stone-500 hover:text-stone-800 font-semibold text-xs"
              >
                {t.useDemoConfig}
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
              >
                {t.saveConfigBtn}
              </button>
            </div>
          </form>

          {/* Seed Database Section */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-orange-500" />
              <span>{t.seedDatabase}</span>
            </h4>
            <p className="text-[11px] text-stone-500">
              {lang === 'mr'
                ? 'कांदे पोहे, चहा, मिसळ पाव, पुरणपोळी यांसारख्या अस्सल पाककृती फायरस्टोअर क्लाउडवर १-क्लिकमध्ये अपलोड करा.'
                : 'Upload authentic preloaded recipes (Kanda Poha, Chai, Misal, Puran Poli) to your Cloud Firestore with 1 click.'}
            </p>

            {seedMessage && (
              <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 font-semibold text-xs">
                {seedMessage}
              </div>
            )}

            <button
              onClick={handleSeed}
              disabled={seeding}
              className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-stone-300 disabled:opacity-50 transition-colors"
            >
              {seeding ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{lang === 'mr' ? 'अपलोड होत आहे...' : 'Seeding...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                  <span>{t.seedDatabase}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
