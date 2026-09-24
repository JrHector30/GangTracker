import React, { useState } from 'react';
import { NORMATIVA_DATA } from '../../data/normativaData';
import { NormativaAiChat } from './NormativaAiChat';
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Zap,
  ExternalLink,
  Shield,
  Skull,
  BadgeCheck,
  Store,
  Users,
  Copy,
  Check,
  Bot,
  Sparkles
} from 'lucide-react';

export const NormativaViewer = () => {
  const [viewMode, setViewMode] = useState('browser'); // Default: 'browser' (Explorador de Reglas)
  const [selectedCategory, setSelectedCategory] = useState(NORMATIVA_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSelectChostito = () => {
    setViewMode('ai');
    // Condicional: solo debe sonar una vez por sesión (sessionStorage se limpia al recargar/cerrar pestaña)
    const hasPlayedThisSession = sessionStorage.getItem('chostito_intro_played');
    if (!hasPlayedThisSession) {
      try {
        const audio = new Audio('/audios/HolaChostito.m4a');
        audio.play().catch(err => console.log('Audio autoplay prevented or error:', err));
        sessionStorage.setItem('chostito_intro_played', 'true');
      } catch (e) {
        console.log('Error playing Chostito audio:', e);
      }
    }
  };


  const activeCategory = NORMATIVA_DATA.find(c => c.id === selectedCategory) || NORMATIVA_DATA[0];

  // Filtering items based on search query
  const filteredItems = activeCategory.items.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.content.toLowerCase().includes(query)
    );
  });

  const getCategoryIcon = (id) => {
    switch (id) {
      case 'resumen-tactico': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'ilegales': return <Skull className="w-4 h-4 text-red-400" />;
      case 'general': return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'policia': return <BadgeCheck className="w-4 h-4 text-blue-400" />;
      case 'locales': return <Store className="w-4 h-4 text-emerald-400" />;
      case 'crews': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-cyan-950/50 border border-purple-500/30 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ANIMALS CITY RP
            </span>
            <span className="text-[11px] text-slate-400">Edición Oficial 2025/2026</span>
          </div>
          <h2 className="text-xl font-black text-white font-tactical tracking-wide mt-1">
            Normativa & Asistente Inteligente
          </h2>
          <p className="text-xs text-slate-300">
            Pregúntale al Asistente IA con respuestas Sí/No o examina los 105 artículos oficiales.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://sites.google.com/view/normativaanimalscity/inicio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-400 font-semibold text-xs border border-slate-700 transition"
          >
            <span>Web Oficial</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Selector Principal: Explorador de Reglas a la izquierda, Asistente Chostito a la derecha */}
      <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
        <button
          onClick={() => setViewMode('browser')}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition ${
            viewMode === 'browser'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-950/50 border border-cyan-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-300" />
          <span>Explorador de Reglas</span>
        </button>

        <button
          onClick={handleSelectChostito}
          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition ${
            viewMode === 'ai'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-950/50 border border-purple-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <img
            src="/img/PersonajeChostito.png"
            alt="Chostito"
            className="w-5 h-5 rounded-full object-cover border border-purple-400/60 shadow-sm"
          />
          <span>Asistente Chostito</span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-semibold">
            VOZ
          </span>
        </button>
      </div>


      {/* Modo Asistente IA */}
      {viewMode === 'ai' && (
        <NormativaAiChat />
      )}

      {/* Modo Explorador Tradicional de Artículos */}
      {viewMode === 'browser' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar en la normativa (ej: 'rehenes', 'persecucion', '15 minutos', 'badulaque')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Categories Horizontal Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {NORMATIVA_DATA.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setExpandedIndex(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-cyan-600/90 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Content Section */}
          <div className="space-y-3">

        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{activeCategory.description}</span>
          <span>{filteredItems.length} artículos</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            No se encontraron artículos con la palabra "{searchQuery}" en esta sección.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item, idx) => {
              const isExpanded = expandedIndex === idx || searchQuery.length > 0;
              return (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition"
                >
                  <button
                    onClick={() => setExpandedIndex(isExpanded && !searchQuery ? null : idx)}
                    className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shrink-0"></span>
                      <h4 className="font-bold text-white text-sm font-tactical leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <div className="shrink-0 text-slate-400 mt-0.5">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40 space-y-3">
                      <div className="whitespace-pre-line font-normal">
                        {item.content}
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-800/40">
                        <button
                          onClick={() => handleCopy(`${item.title}\n\n${item.content}`, idx)}
                          className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-cyan-400 px-2.5 py-1 rounded bg-slate-800/60 hover:bg-slate-800 transition"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copiado al portapapeles</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar regla</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
          </div>
        </div>
      )}
    </div>
  );
};


