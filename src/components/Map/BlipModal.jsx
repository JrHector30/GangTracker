import React, { useState } from 'react';
import { useGang } from '../../context/GangContext';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatSeconds, getRemainingRobTime, getRemainingCooldown } from '../../utils/timeFormat';
import {
  X,
  Play,
  RotateCcw,
  Ban,
  CheckCircle2,
  ShieldAlert,
  Car,
  Users,
  Clock,
  Trash2,
  Sparkles,
  Plus,
  Minus,
  Edit3
} from 'lucide-react';

export const BlipModal = () => {
  const {
    selectedSpot,
    setSelectedSpot,
    settings,
    tick, // Reacts every second to live clock
    startRobbery,
    cancelRobbery,
    finishRobberyNow,
    resetCooldown,
    restartCooldown,
    setCustomCooldown,
    adjustCooldown,
    deleteSpot
  } = useGang();

  const [customInputMinutes, setCustomInputMinutes] = useState('24');
  const [showCustomCooldown, setShowCustomCooldown] = useState(false);

  if (!selectedSpot) return null;

  const isPoi = selectedSpot.type === 'poi' || Boolean(settings.poiCategories?.[selectedSpot.category]);
  const category = isPoi
    ? (settings.poiCategories?.[selectedSpot.category] || {})
    : (settings.categories?.[selectedSpot.category] || {});

  // Detect GTA 5 Brand Colors
  let brandColor = null;
  let brandLabel = null;
  let brandIcon = null;
  const lowerName = (selectedSpot.name || '').toLowerCase();
  const lowerZone = (selectedSpot.zone || '').toLowerCase();

  if (lowerName.includes('ltd') || lowerZone.includes('ltd')) {
    brandColor = '#c084fc'; // LTD Gasoline: Lila
    brandLabel = 'LTD Gasoline';
    brandIcon = 'Store';
  } else if (lowerName.includes("rob's") || lowerName.includes("rob’s") || lowerName.includes('robs') || lowerZone.includes('rob')) {
    brandColor = '#f43f5e'; // Rob's Liquor: Vino
    brandLabel = "Rob's Liquor";
    brandIcon = 'Wine';
  } else if (lowerName.includes('24/7') || lowerZone.includes('24/7') || lowerName.includes('convenience') || lowerZone.includes('convenience')) {
    brandColor = '#10b981'; // 24/7: Verde
    brandLabel = 'Tienda 24/7';
    brandIcon = 'Store';
  } else if (selectedSpot.color) {
    brandColor = selectedSpot.color;
  }

  const effectiveColor = brandColor || category.color || '#06b6d4';
  const effectiveIcon = brandIcon || category.icon || selectedSpot.category;

  const isRobbing = !isPoi && selectedSpot.status === 'robbing';
  const isCooldown = !isPoi && selectedSpot.status === 'cooldown';
  const isAvailable = !isPoi && selectedSpot.status === 'available';

  const robStats = getRemainingRobTime(selectedSpot);
  const cooldownStats = getRemainingCooldown(selectedSpot);

  // Radial calculation for SVG
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (robStats.percent / 100) * circumference;

  const handleApplyCustomCooldown = (mins) => {
    const parsed = parseInt(mins, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setCustomCooldown(selectedSpot.id, parsed);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[3500] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => setSelectedSpot(null)}
    >
      <div 
        className="w-full max-w-lg bg-[#0f172a] border-t sm:border border-slate-700/80 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-start justify-between bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0"
              style={{ backgroundColor: `${effectiveColor}25`, border: `2px solid ${effectiveColor}` }}
            >
              <CategoryIcon iconName={effectiveIcon} color={effectiveColor} className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full border"
                  style={{ color: effectiveColor, borderColor: `${effectiveColor}60`, backgroundColor: `${effectiveColor}15` }}
                >
                  {brandLabel || category.name || selectedSpot.category}
                </span>
                {isPoi && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    📍 PUNTO DE INTERÉS
                  </span>
                )}
                {isAvailable && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                    🟢 DISPONIBLE
                  </span>
                )}
                {isRobbing && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                    🔴 ROBANDO ({robStats.percent}%)
                  </span>
                )}
                {isCooldown && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    ⏳ COOLDOWN ({formatSeconds(cooldownStats.remaining)})
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-white font-tactical mt-0.5 tracking-wide">
                {selectedSpot.name}
              </h3>
              <p className="text-xs text-slate-400">{selectedSpot.zone}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedSpot(null)}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* SPECIAL VIEW: PUNTO DE INTERÉS (POI) */}
          {isPoi ? (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Información Táctica del Lugar
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {category.description || 'Punto de interés estratégico para la banda.'}
                </p>
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div>📍 <b>Coordenadas:</b> {selectedSpot.coords?.x?.toFixed?.(1)}%, {selectedSpot.coords?.y?.toFixed?.(1)}%</div>
                  <div>🗺️ <b>Ubicación:</b> {selectedSpot.zone || 'Los Santos'}</div>
                </div>
              </div>

              {/* Drag instruction card */}
              <div className="bg-gradient-to-r from-cyan-950/30 to-slate-900/60 border border-cyan-500/30 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs text-slate-300">
                  <b className="text-white">¿Quieres mover este punto?</b> Activa el botón <b>"Mover"</b> en la barra superior del mapa para arrastrarlo y fijar su nueva posición.
                </div>
              </div>

              {/* Delete Spot Action */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    if (window.confirm(`¿Deseas eliminar el punto "${selectedSpot.name}"?`)) {
                      deleteSpot(selectedSpot.id);
                      setSelectedSpot(null);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-2 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Punto de Interés</span>
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* STATE 1: ROBANDO (Active Robbery Progress Bar) */}
          {isRobbing && (
            <div className="bg-gradient-to-b from-red-950/40 to-slate-900/60 border border-red-500/40 rounded-xl p-5 text-center shadow-inner">
              <div className="text-xs uppercase tracking-widest text-red-400 font-bold mb-3 flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Atraco en curso - Tiempo de escape
              </div>

              {/* Radial Progress Circle */}
              <div className="relative w-36 h-36 mx-auto my-2 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-slate-800"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="text-red-500 transition-all duration-300"
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-white font-tactical tracking-tight">
                    {robStats.percent}%
                  </span>
                  <span className="text-sm font-semibold text-red-300 font-mono">
                    {formatSeconds(robStats.remaining)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 mt-2">
                Mantén vigilada la zona. Al completar el 100%, el lugar entrará en cooldown automáticamente.
              </p>

              {/* Botones de acción durante el robo */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => cancelRobbery(selectedSpot.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/60 font-semibold text-sm transition"
                  title="Cancela el robo y vuelve a poner la tienda como disponible de inmediato"
                >
                  <Ban className="w-4 h-4 text-amber-400" />
                  Cancelar Robo
                </button>
                <button
                  onClick={() => finishRobberyNow(selectedSpot.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-lg shadow-red-900/40 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Completado
                </button>
              </div>
            </div>
          )}

          {/* STATE 2: COOLDOWN (Waiting for respawn) */}
          {isCooldown && (
            <div className="bg-gradient-to-b from-amber-950/30 to-slate-900/60 border border-amber-500/30 rounded-xl p-5 text-center shadow-inner">
              <div className="text-xs uppercase tracking-widest text-amber-400 font-bold mb-2 flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Tiempo de enfriamiento restante
              </div>

              {/* Digital Big Countdown */}
              <div className="my-3 py-3 px-4 bg-black/40 rounded-xl border border-amber-500/20 inline-block min-w-[200px]">
                <span className="text-4xl font-black text-amber-400 font-mono tracking-widest">
                  {formatSeconds(cooldownStats.remaining)}
                </span>
                <div className="text-xs text-amber-300/80 mt-1 font-mono">
                  {100 - cooldownStats.percent}% completado
                </div>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2.5 my-3 overflow-hidden border border-slate-700">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${100 - cooldownStats.percent}%` }}
                ></div>
              </div>

              {/* Nudge buttons (+5m, +1m, -1m, -5m) */}
              <div className="flex items-center justify-center gap-2 my-2 text-xs">
                <button
                  onClick={() => adjustCooldown(selectedSpot.id, -5)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Restar 5 minutos al cooldown actual"
                >
                  -5 min
                </button>
                <button
                  onClick={() => adjustCooldown(selectedSpot.id, -1)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Restar 1 minuto"
                >
                  -1 min
                </button>
                <button
                  onClick={() => adjustCooldown(selectedSpot.id, 1)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Sumar 1 minuto"
                >
                  +1 min
                </button>
                <button
                  onClick={() => adjustCooldown(selectedSpot.id, 5)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  title="Sumar 5 minutos"
                >
                  +5 min
                </button>
              </div>

              {/* Quick adjustment controls */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => resetCooldown(selectedSpot.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-700/60 hover:bg-emerald-600 text-emerald-100 border border-emerald-500/40 font-semibold text-sm transition"
                >
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  Disponible Ya
                </button>
                <button
                  onClick={() => restartCooldown(selectedSpot.id)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-sm transition"
                >
                  <RotateCcw className="w-4 h-4 text-amber-400" />
                  Reiniciar Timer
                </button>
              </div>
            </div>
          )}

          {/* STATE 3: DISPONIBLE (Ready to Rob) */}
          {isAvailable && (
            <div className="bg-gradient-to-b from-emerald-950/30 to-slate-900/60 border border-emerald-500/30 rounded-xl p-5 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-lg shadow-emerald-950/60">
                <Play className="w-8 h-8 ml-1" />
              </div>
              <h4 className="text-lg font-bold text-white font-tactical">
                ¡Lugar Listo para Atracar!
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
                Presiona el botón para iniciar el temporizador en vivo del golpe y sincronizar la rotación.
              </p>

              <button
                onClick={() => startRobbery(selectedSpot.id)}
                className="w-full mt-5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition transform active:scale-98"
              >
                <Play className="w-5 h-5 fill-current" />
                INICIAR ROBO AHORA
              </button>
            </div>
          )}

          {/* NUEVO: PANEL DE AJUSTE RÁPIDO DE COOLDOWN AL MOMENTO (SOLICITUD EXPLÍCITA) */}
          <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <h5 className="font-bold text-white text-xs uppercase tracking-wide">
                  Fijar Cooldown al Momento
                </h5>
              </div>
              <span className="text-[10px] text-amber-300/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Servidor In-Game
              </span>
            </div>
            
            <p className="text-[11px] text-slate-300">
              ¿Llegaste a la tienda y en el juego dice <strong>24 min</strong> o <strong>7 min</strong>? Elige o escribe los minutos exactos para fijarlos ahora mismo:
            </p>

            {/* Botones de presets rápidos */}
            <div className="flex flex-wrap gap-1.5">
              {[3, 5, 7, 10, 15, 20, 24, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => handleApplyCustomCooldown(mins)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-400/60 font-mono text-xs font-bold transition active:scale-95"
                >
                  {mins} min
                </button>
              ))}
            </div>

            {/* Input numérico manual */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  max="180"
                  placeholder="Minutos..."
                  value={customInputMinutes}
                  onChange={e => setCustomInputMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                  min
                </span>
              </div>
              <button
                onClick={() => handleApplyCustomCooldown(customInputMinutes)}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition shrink-0"
              >
                Fijar Cooldown
              </button>
            </div>
          </div>

          {/* Reglas e Información de Servidor (Animals City) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs">
            <h5 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              Normativa Específica ({category.shortName || category.name})
            </h5>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-300">
              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 flex items-start gap-2">
                <Car className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 text-[10px]">Vehículos permitidos:</div>
                  <div className="font-semibold text-white">{category.allowedVehicles || 'Consultar'}</div>
                </div>
              </div>

              <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50 flex items-start gap-2">
                <Users className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-slate-400 text-[10px]">Policías mínimos:</div>
                  <div className="font-semibold text-white">{category.minCops || 2} agentes requeridos</div>
                </div>
              </div>
            </div>

            {category.rehenes && (
              <div className="bg-slate-800/40 p-2 rounded-lg border border-slate-700/30 text-slate-300">
                <span className="text-slate-400">Rehenes: </span>
                <span className="text-slate-200 font-medium">{category.rehenes}</span>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800">
              <span>Tiempo de robo: <strong className="text-slate-200">{formatSeconds(category.robTime)}</strong></span>
              <span>Cooldown tras robo: <strong className="text-slate-200">{formatSeconds(category.cooldownTime)}</strong></span>
            </div>
          </div>

          {/* Delete spot option */}
          <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
            <span className="font-mono text-[11px]">ID: {selectedSpot.id}</span>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar el marcador "${selectedSpot.name}" del mapa?`)) {
                  deleteSpot(selectedSpot.id);
                }
              }}
              className="text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Marcador</span>
            </button>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
