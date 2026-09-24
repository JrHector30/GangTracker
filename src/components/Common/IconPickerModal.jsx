import React, { useState } from 'react';
import { AVAILABLE_ICONS, CategoryIcon } from './CategoryIcon';
import { Search, X, Check } from 'lucide-react';

export const IconPickerModal = ({ isOpen, selectedIcon, onSelect, onClose, title = "Seleccionar Ícono" }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredIcons = AVAILABLE_ICONS.filter(item => {
    const q = search.toLowerCase();
    return item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Selecciona el ícono que representará a este punto o tienda en el mapa.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-800 bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar ícono (ej. Tienda, Dinero, Arma, Coche, Llave...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Icons Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredIcons.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No se encontraron íconos con "{search}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {filteredIcons.map(iconItem => {
                const isSelected = selectedIcon === iconItem.id;
                return (
                  <button
                    key={iconItem.id}
                    type="button"
                    onClick={() => {
                      onSelect(iconItem.id);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div 
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isSelected 
                          ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30' 
                          : 'bg-slate-800 text-slate-300 group-hover:text-cyan-400 group-hover:bg-slate-700'
                      }`}
                    >
                      <CategoryIcon iconName={iconItem.id} className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate group-hover:text-white">
                        {iconItem.label}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {iconItem.id}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>{AVAILABLE_ICONS.length} íconos disponibles</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
