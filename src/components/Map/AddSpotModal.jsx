import React, { useState, useEffect } from 'react';
import { useGang } from '../../context/GangContext';
import { CategoryIcon } from '../Common/CategoryIcon';
import {
  MapPin,
  X,
  Check,
  Plus,
  Compass,
  Flame
} from 'lucide-react';

export const AddSpotModal = ({ coords, initialSection = 'robberies', onClose }) => {
  const { settings, addCustomSpot, spots } = useGang();
  
  // Section: 'robberies' or 'pois'
  const [section, setSection] = useState(initialSection || 'robberies');

  const robberyCategories = Object.values(settings.categories || {});
  const poiCategories = Object.values(settings.poiCategories || {});

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (initialSection === 'pois') {
      return Object.keys(settings.poiCategories || {})[0] || 'lavado';
    }
    return 'badulaque';
  });
  const [customName, setCustomName] = useState('');

  // Sync section whenever modal opens with a different activeSection
  useEffect(() => {
    if (initialSection) {
      setSection(initialSection);
      if (initialSection === 'pois') {
        const firstPoi = Object.keys(settings.poiCategories || {})[0] || 'lavado';
        setSelectedCategory(firstPoi);
      } else {
        setSelectedCategory('badulaque');
      }
    }
  }, [initialSection, coords, settings.poiCategories]);

  // When switching section, select first item of that list
  const handleSwitchSection = (newSec) => {
    setSection(newSec);
    if (newSec === 'robberies') {
      setSelectedCategory('badulaque');
    } else {
      const firstPoi = Object.keys(settings.poiCategories || {})[0] || 'lavado';
      setSelectedCategory(firstPoi);
    }
  };

  useEffect(() => {
    if (section === 'robberies') {
      const cat = settings.categories?.[selectedCategory];
      const catName = cat ? (cat.shortName || cat.name) : '24/7';
      const count = spots.filter(s => s.category === selectedCategory).length + 1;
      setCustomName(`${catName} #${count}`);
    } else {
      const poi = settings.poiCategories?.[selectedCategory];
      const poiName = poi ? poi.name : 'Punto de Interés';
      const count = spots.filter(s => s.category === selectedCategory).length + 1;
      setCustomName(`${poiName} #${count}`);
    }
  }, [section, selectedCategory, settings.categories, settings.poiCategories, spots]);

  if (!coords) return null;

  const handleSave = () => {
    const isPoi = section === 'pois';
    const activeDict = isPoi ? settings.poiCategories : settings.categories;
    const catObj = activeDict?.[selectedCategory];
    const finalName = customName.trim() || (catObj ? catObj.name : 'Nuevo Punto');
    
    addCustomSpot({
      name: finalName,
      category: selectedCategory,
      type: isPoi ? 'poi' : 'robbery',
      zone: `Coordenadas (${coords.lat?.toFixed(3)}, ${coords.lng?.toFixed(3)})`,
      lat: coords.lat,
      lng: coords.lng
    });

    onClose();
  };

  const currentCategoryList = section === 'robberies' ? robberyCategories : poiCategories;
  const activeCategoryObj = (section === 'robberies' ? settings.categories : settings.poiCategories)?.[selectedCategory] || currentCategoryList[0];

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-tactical tracking-wide">
                Añadir Nuevo Punto
              </h3>
              <p className="text-[11px] text-slate-400">
                Ubicar en ({coords.lat?.toFixed(3)}, {coords.lng?.toFixed(3)})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Section Type Switcher (Tiendas de Robo vs Puntos de Interés) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Tipo de Marcador:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSwitchSection('robberies')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  section === 'robberies'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 text-red-400" />
                <span>Tienda de Robo</span>
              </button>

              <button
                type="button"
                onClick={() => handleSwitchSection('pois')}
                className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  section === 'pois'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Punto de Interés</span>
              </button>
            </div>
          </div>

          {/* Combobox interactivo desplegable */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              {section === 'robberies' ? 'Tipo de Tienda:' : 'Tipo de Punto de Interés:'}
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full appearance-none bg-slate-950 border-2 border-slate-700 hover:border-cyan-500 focus:border-cyan-400 text-white font-semibold text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none transition cursor-pointer shadow-inner"
              >
                {currentCategoryList.map(cat => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-white py-2">
                    {cat.shortName === '24/7' ? '24/7' : cat.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-cyan-400 font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* Grid interactivo de selección visual rápida */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-slate-400 block">
              Selección táctil rápida:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {currentCategoryList.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const displayName = cat.shortName === '24/7' ? '24/7' : (cat.shortName || cat.name);

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-md shadow-cyan-950/40 text-white font-bold scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}` }}
                    >
                      <CategoryIcon iconName={cat.icon} color={cat.color} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] truncate w-full">{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Nombre / Etiqueta del Punto:
            </label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="Ej: Lavado Central, 24/7 Vinewood..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>

          {/* Preview Card */}
          {activeCategoryObj && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${activeCategoryObj.color}25`, border: `1.5px solid ${activeCategoryObj.color}` }}
              >
                <CategoryIcon iconName={activeCategoryObj.icon} color={activeCategoryObj.color} className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {customName || activeCategoryObj.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {activeCategoryObj.description || (section === 'pois' ? 'Punto de Interés de la Banda' : 'Tienda de Robo')}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar en el Mapa</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
