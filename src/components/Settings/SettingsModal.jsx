import React, { useState, useEffect } from 'react';
import { useGang } from '../../context/GangContext';
import { MAP_CONFIGS, DEFAULT_SETTINGS } from '../../data/defaultSettings';
import { CategoryIcon, AVAILABLE_ICONS } from '../Common/CategoryIcon';
import { IconPickerModal } from '../Common/IconPickerModal';
import { soundManager } from '../../utils/soundAlerts';
import {
  Settings,
  Volume2,
  VolumeX,
  Map as MapIcon,
  RotateCcw,
  Download,
  Upload,
  Play,
  Check,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  Sparkles,
  X,
  Save,
  MapPin,
  Plus,
  Trash2
} from 'lucide-react';

export const SettingsModal = () => {
  const {
    settings,
    setSettings,
    switchMap
  } = useGang();

  // Local draft state for settings changes
  const [draftSettings, setDraftSettings] = useState(() => JSON.parse(JSON.stringify(settings)));
  const [isDirty, setIsDirty] = useState(false);

  // Sync draft if external settings change
  useEffect(() => {
    if (!isDirty) {
      setDraftSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, isDirty]);

  const [testSuccess, setTestSuccess] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // Icon Picker Modal Target: { type: 'robbery' | 'poi' | 'new_poi', id?: string, currentIcon: string, title: string }
  const [iconPickerTarget, setIconPickerTarget] = useState(null);

  // Update a top-level setting in draft
  const updateDraft = (updater) => {
    setDraftSettings(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
    setIsDirty(true);
  };

  // POI Creation State in Draft
  const [newPoiName, setNewPoiName] = useState('');
  const [newPoiDesc, setNewPoiDesc] = useState('');
  const [newPoiIcon, setNewPoiIcon] = useState('MapPin');
  const [newPoiColor, setNewPoiColor] = useState('#06b6d4');

  // Update a robbery category in draft
  const updateDraftCategory = (catId, updates) => {
    setDraftSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catId]: {
          ...prev.categories[catId],
          ...updates
        }
      }
    }));
    setIsDirty(true);
  };

  // Update a POI category in draft
  const updateDraftPoiCategory = (poiId, updates) => {
    setDraftSettings(prev => ({
      ...prev,
      poiCategories: {
        ...(prev.poiCategories || {}),
        [poiId]: {
          ...(prev.poiCategories?.[poiId] || {}),
          ...updates
        }
      }
    }));
    setIsDirty(true);
  };

  // Delete a robbery category from draft
  const handleDeleteRobberyCategory = (catId) => {
    if (!window.confirm('¿Eliminar esta categoría de robo?')) return;
    setDraftSettings(prev => {
      const next = { ...prev.categories };
      delete next[catId];
      const nextFilters = { ...(prev.filterCategories || {}) };
      delete nextFilters[catId];
      return {
        ...prev,
        categories: next,
        filterCategories: nextFilters
      };
    });
    setIsDirty(true);
  };

  // Select an icon from the picker
  const handleSelectIcon = (iconId) => {
    if (!iconPickerTarget) return;
    if (iconPickerTarget.type === 'robbery') {
      updateDraftCategory(iconPickerTarget.id, { icon: iconId });
    } else if (iconPickerTarget.type === 'poi') {
      updateDraftPoiCategory(iconPickerTarget.id, { icon: iconId });
    } else if (iconPickerTarget.type === 'new_poi') {
      setNewPoiIcon(iconId);
    }
  };

  // Add new POI to draft
  const handleAddPoiToDraft = (e) => {
    e.preventDefault();
    if (!newPoiName.trim()) return;
    const cleanId = 'poi_' + newPoiName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    
    setDraftSettings(prev => {
      const currentPois = prev.poiCategories || {};
      const currentFilterPois = prev.filterPois || {};
      return {
        ...prev,
        poiCategories: {
          ...currentPois,
          [cleanId]: {
            id: cleanId,
            name: newPoiName.trim(),
            shortName: newPoiName.trim().slice(0, 10),
            icon: newPoiIcon,
            color: newPoiColor,
            description: newPoiDesc.trim() || 'Punto de interés de la banda'
          }
        },
        filterPois: {
          ...currentFilterPois,
          [cleanId]: true
        }
      };
    });
    setIsDirty(true);
    setNewPoiName('');
    setNewPoiDesc('');
  };

  // Delete a POI from draft
  const handleDeletePoiFromDraft = (poiId) => {
    if (!window.confirm('¿Eliminar esta categoría de punto de interés?')) return;
    setDraftSettings(prev => {
      const newPois = { ...(prev.poiCategories || {}) };
      delete newPois[poiId];
      const newFilters = { ...(prev.filterPois || {}) };
      delete newFilters[poiId];
      return {
        ...prev,
        poiCategories: newPois,
        filterPois: newFilters
      };
    });
    setIsDirty(true);
  };

  // Commit changes
  const handleSave = () => {
    setSettings(draftSettings);
    setIsDirty(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  // Discard changes
  const handleCancel = () => {
    setDraftSettings(JSON.parse(JSON.stringify(settings)));
    setIsDirty(false);
  };

  const testAlarm = () => {
    soundManager.playAlarm(draftSettings.soundType, draftSettings.soundVolume);
    soundManager.vibrate([300, 150, 300, 150, 400]);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 1500);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftSettings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "gang_tracker_ajustes.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        setDraftSettings(prev => ({ ...prev, ...parsed }));
        setIsDirty(true);
        alert('¡Configuración cargada en el borrador! Pulsa "Guardar Cambios" para aplicarla.');
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  const resetToFactory = () => {
    if (window.confirm('¿Deseas restablecer todos los tiempos de robo y cooldown a los valores de fábrica?')) {
      setDraftSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
      setIsDirty(true);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-4 pb-32 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white font-tactical flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            Ajustes y Parámetros
          </h2>
          <p className="text-xs text-slate-400">
            Personaliza tiempos de robo, cooldowns de servidor, alarmas sonoras y estilo de mapa.
          </p>
        </div>
        {saveToast && (
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse font-bold">
            ✓ Guardado
          </span>
        )}
      </div>

      {/* 1. SELECCIÓN DE MAPA */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-cyan-400" />
          Estilo del Mapa GTA V
        </h3>
        <p className="text-xs text-slate-300">
          Alterna entre los 3 mapas oficiales de GTA V (Atlas, Satelital HD y Callejero Road). Las teselas dinámicas cargan con fluidez instantánea a 60 FPS en celular.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {Object.values(MAP_CONFIGS).map(mapItem => {
            const isSelected = draftSettings.currentMap === mapItem.id;
            return (
              <button
                key={mapItem.id}
                onClick={() => updateDraft({ currentMap: mapItem.id })}
                className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-1.5">
                    {mapItem.name}
                    {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{mapItem.description}</div>
                  <div className="text-[10px] text-cyan-400 font-mono mt-1.5">
                    Motor Tiles 60 FPS • gta-5-map
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CONFIGURACIÓN DE AUDIO Y ALARMAS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-400" />
          Alarmas y Alertas Sonoras
        </h3>

        {/* Toggle Sound */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          <div>
            <div className="font-semibold text-white">Activar Sonido de Alarma</div>
            <div className="text-slate-400 text-[11px]">Suena cuando una tienda vuelve a estar disponible</div>
          </div>
          <button
            onClick={() => updateDraft(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              draftSettings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                draftSettings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-semibold">Volumen de Alarma:</span>
            <span className="text-cyan-400 font-mono font-bold">
              {Math.round((draftSettings.soundVolume || 0.8) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={draftSettings.soundVolume || 0.8}
            onChange={e => updateDraft({ soundVolume: parseFloat(e.target.value) })}
            className="w-full accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tone Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 block">Tono de Alarma:</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'tactical', label: 'Táctico Militar' },
              { id: 'siren', label: 'Sirena Alarma' },
              { id: 'radar', label: 'Beep Digital 3x' },
              { id: 'chime', label: 'Cristal Chime' }
            ].map(snd => (
              <button
                key={snd.id}
                onClick={() => updateDraft({ soundType: snd.id })}
                className={`py-2 px-3 rounded-lg text-xs font-semibold border transition ${
                  draftSettings.soundType === snd.id
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={testAlarm}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {testSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 fill-current" />}
          {testSuccess ? '¡Sonando!' : 'Probar Sonido de Alarma Ahora'}
        </button>
      </div>

      {/* 3. TIEMPOS EDITABLES POR CATEGORÍA DE ROBO */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Tiempos de Robo y Cooldowns por Tipo
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Personaliza la duración del atraco (en minutos y segundos separados), cooldowns y ganancias estimadas en dinero negro.
          </p>
        </div>

        <div className="space-y-4">
          {Object.values(draftSettings.categories || {}).map(cat => (
            <div
              key={cat.id}
              className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3.5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Clickable Icon Button to change icon */}
                  <button
                    type="button"
                    onClick={() => setIconPickerTarget({ type: 'robbery', id: cat.id, currentIcon: cat.icon, title: `Cambiar Ícono: ${cat.name}` })}
                    className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md group cursor-pointer"
                    style={{ backgroundColor: `${cat.color}25`, border: `2px solid ${cat.color}` }}
                    title="Haz click para cambiar el ícono en el mapa"
                  >
                    <CategoryIcon iconName={cat.icon} color={cat.color} className="w-5 h-5" />
                    <span className="text-[7.5px] font-black uppercase text-slate-300 group-hover:text-white">Cambiar</span>
                  </button>

                  {/* Name and Color inputs */}
                  <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Nombre de la Tienda / Robo:</label>
                      <input
                        type="text"
                        value={cat.name || ''}
                        onChange={e => updateDraftCategory(cat.id, { name: e.target.value, shortName: e.target.value.slice(0, 10) })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                        placeholder="Nombre de la categoría..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block font-medium">Color Distintivo:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="color"
                          value={cat.color || '#06b6d4'}
                          onChange={e => updateDraftCategory(cat.id, { color: e.target.value })}
                          className="w-7 h-7 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={cat.color || '#06b6d4'}
                          onChange={e => updateDraftCategory(cat.id, { color: e.target.value })}
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteRobberyCategory(cat.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition cursor-pointer"
                    title="Eliminar esta categoría de robo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
                {/* Rob Time (Separated Minutes and Seconds) */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Duración Robo:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={Math.floor((cat.robTime || 0) / 60)}
                        onChange={e => {
                          const mins = Math.max(0, parseInt(e.target.value) || 0);
                          const secs = (cat.robTime || 0) % 60;
                          updateDraftCategory(cat.id, { robTime: Math.max(5, mins * 60 + secs) });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-5 pl-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">
                        m
                      </span>
                    </div>

                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={(cat.robTime || 0) % 60}
                        onChange={e => {
                          const mins = Math.floor((cat.robTime || 0) / 60);
                          const secs = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
                          updateDraftCategory(cat.id, { robTime: Math.max(5, mins * 60 + secs) });
                        }}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pr-5 pl-2 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono pointer-events-none">
                        s
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    = {cat.robTime} seg total
                  </span>
                </div>

                {/* Cooldown Time (minutes) */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Cooldown (minutos):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={Math.round(cat.cooldownTime / 60)}
                    onChange={e => updateDraftCategory(cat.id, { cooldownTime: Math.max(60, (parseInt(e.target.value) || 1) * 60) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    = {cat.cooldownTime} seg
                  </span>
                </div>

                {/* Approx Black Money Reward */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Botín Aprox. Negro ($):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={cat.approxRewardBlack || 18000}
                    onChange={e => updateDraftCategory(cat.id, { approxRewardBlack: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                    ${(cat.approxRewardBlack || 18000).toLocaleString('es-ES')}
                  </span>
                </div>

                {/* Min Cops */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Policías Mínimos:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={cat.minCops || 2}
                    onChange={e => updateDraftCategory(cat.id, { minCops: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Allowed Vehicles */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Vehículos:
                  </label>
                  <input
                    type="text"
                    value={cat.allowedVehicles || 'F, E, D, C'}
                    onChange={e => updateDraftCategory(cat.id, { allowedVehicles: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. PUNTOS DE INTERÉS DE LA BANDA (POIs) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Puntos de Interés de la Banda (POIs)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Crea o elimina categorías de puntos estratégicos como Lavado, Hackeo, Crafteo o talleres de matrículas.
          </p>
        </div>

        {/* Existing POI List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(draftSettings.poiCategories || {}).map(poi => (
            <div
              key={poi.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2.5">
                {/* Clickable Icon Button */}
                <button
                  type="button"
                  onClick={() => setIconPickerTarget({ type: 'poi', id: poi.id, currentIcon: poi.icon, title: `Cambiar Ícono: ${poi.name}` })}
                  className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 shrink-0 transition-transform hover:scale-105 active:scale-95 shadow-md group cursor-pointer"
                  style={{ backgroundColor: `${poi.color}25`, border: `2px solid ${poi.color}` }}
                  title="Haz click para cambiar el ícono en el mapa"
                >
                  <CategoryIcon iconName={poi.icon} color={poi.color} className="w-5 h-5" />
                  <span className="text-[7.5px] font-black uppercase text-slate-300 group-hover:text-white">Cambiar</span>
                </button>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <input
                    type="text"
                    value={poi.name || ''}
                    onChange={e => updateDraftPoiCategory(poi.id, { name: e.target.value, shortName: e.target.value.slice(0, 10) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    placeholder="Nombre del punto..."
                  />
                  <input
                    type="text"
                    value={poi.description || ''}
                    onChange={e => updateDraftPoiCategory(poi.id, { description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-cyan-400"
                    placeholder="Descripción..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePoiFromDraft(poi.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition shrink-0 cursor-pointer"
                  title="Eliminar categoría de punto de interés"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Color Picker for POI */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-900 text-xs">
                <span className="text-[10px] text-slate-400 font-medium">Color de marcador:</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={poi.color || '#06b6d4'}
                    onChange={e => updateDraftPoiCategory(poi.id, { color: e.target.value })}
                    className="w-6 h-6 rounded-md border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={poi.color || '#06b6d4'}
                    onChange={e => updateDraftPoiCategory(poi.id, { color: e.target.value })}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New POI Form */}
        <form onSubmit={handleAddPoiToDraft} className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Añadir Nueva Categoría de Punto de Interés</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nombre:</label>
              <input
                type="text"
                placeholder="Ej. Huerto Ilegal, Laboratorio..."
                value={newPoiName}
                onChange={e => setNewPoiName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Descripción corta:</label>
              <input
                type="text"
                placeholder="Ej. Punto de entrega o recolección"
                value={newPoiDesc}
                onChange={e => setNewPoiDesc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Icon Selector with Full Picker */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Ícono del punto:</label>
              <button
                type="button"
                onClick={() => setIconPickerTarget({ type: 'new_poi', currentIcon: newPoiIcon, title: 'Elegir Ícono para Nuevo Punto' })}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-xs text-white transition cursor-pointer"
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${newPoiColor}20`, border: `1px solid ${newPoiColor}` }}
                >
                  <CategoryIcon iconName={newPoiIcon} color={newPoiColor} className="w-4 h-4" />
                </div>
                <span className="font-bold">{AVAILABLE_ICONS.find(i => i.id === newPoiIcon)?.label || newPoiIcon}</span>
                <span className="text-[10px] text-cyan-400 font-bold ml-auto underline">Cambiar (34)</span>
              </button>
            </div>

            {/* Color Selector */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">Color de Marcador:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newPoiColor}
                  onChange={e => setNewPoiColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-700 cursor-pointer bg-transparent shrink-0"
                />
                <div className="flex flex-wrap gap-1.5 items-center">
                  {[
                    '#10b981', '#06b6d4', '#f59e0b', '#ec4899', 
                    '#a855f7', '#3b82f6', '#ef4444', '#14b8a6'
                  ].map(clr => (
                    <button
                      key={clr}
                      type="button"
                      onClick={() => setNewPoiColor(clr)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newPoiColor === clr ? 'scale-125 border-white ring-2 ring-cyan-400/50' : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: clr }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={!newPoiName.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Categoría POI</span>
            </button>
          </div>
        </form>
      </div>

      {/* 5. EXPORTAR / IMPORTAR / RESTAURAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-400" />
          Copia de Seguridad y Sincronización
        </h3>
        <p className="text-xs text-slate-300">
          Exporta tu configuración personalizada a un archivo JSON para compartirla con los miembros de tu banda o guardarla en tu dispositivo.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar Ajustes (JSON)</span>
          </button>

          <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white cursor-pointer transition">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Importar Ajustes (JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToFactory}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer Fábrica</span>
          </button>
        </div>
      </div>

      {/* FLOATING GLASSMORPHISM SAVE / CANCEL BAR */}
      {isDirty && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[2500] w-[94%] max-w-md bg-slate-900/85 backdrop-blur-xl border border-cyan-500/60 shadow-2xl shadow-cyan-950/80 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">
                Cambios sin guardar
              </div>
              <div className="text-[10px] text-slate-400 truncate hidden sm:block">
                Guarda para aplicar al mapa y temporizadores
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCancel}
              title="Cancelar y descartar cambios"
              className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">Cancelar</span>
            </button>

            <button
              onClick={handleSave}
              title="Guardar todos los cambios"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-950/60 transition active:scale-95 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPickerModal
        isOpen={!!iconPickerTarget}
        selectedIcon={iconPickerTarget?.currentIcon}
        title={iconPickerTarget?.title || "Seleccionar Ícono"}
        onSelect={handleSelectIcon}
        onClose={() => setIconPickerTarget(null)}
      />
    </div>
  );
};
