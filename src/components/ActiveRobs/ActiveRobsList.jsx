import React, { useState, useEffect } from 'react';
import { useGang } from '../../context/GangContext';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatSeconds, getRemainingRobTime, getRemainingCooldown } from '../../utils/timeFormat';
import {
  Flame,
  Clock,
  CheckCircle2,
  Ban,
  Sparkles,
  MapPin,
  Play,
  ArrowRight
} from 'lucide-react';

export const ActiveRobsList = () => {
  const {
    spots,
    settings,
    setSelectedSpot,
    setActiveTab,
    startRobbery,
    cancelRobbery,
    resetCooldown
  } = useGang();

  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const robbingSpots = spots.filter(s => s.status === 'robbing');
  const cooldownSpots = spots
    .filter(s => s.status === 'cooldown')
    .sort((a, b) => {
      const aStats = getRemainingCooldown(a);
      const bStats = getRemainingCooldown(b);
      return aStats.remaining - bStats.remaining; // Soonest available first
    });
  const availableSpots = spots.filter(s => s.status === 'available');

  const goToSpot = (spot) => {
    setSelectedSpot(spot);
    setActiveTab('map');
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 p-4 pb-24 space-y-6">
      {/* Top summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-950/30 border border-red-500/30 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-red-400 font-tactical">{robbingSpots.length}</div>
          <div className="text-[11px] text-red-300 font-medium uppercase mt-0.5">En Robo</div>
        </div>
        <div className="bg-amber-950/30 border border-amber-500/30 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-amber-400 font-tactical">{cooldownSpots.length}</div>
          <div className="text-[11px] text-amber-300 font-medium uppercase mt-0.5">En Cooldown</div>
        </div>
        <div className="bg-emerald-950/30 border border-emerald-500/30 p-3.5 rounded-xl text-center">
          <div className="text-2xl font-black text-emerald-400 font-tactical">{availableSpots.length}</div>
          <div className="text-[11px] text-emerald-300 font-medium uppercase mt-0.5">Disponibles</div>
        </div>
      </div>

      {/* SECTION 1: ROBOS ACTIVOS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-tactical flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            Robos en Progreso ({robbingSpots.length})
          </h2>
        </div>

        {robbingSpots.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
            No hay ningún atraco en curso actualmente.
          </div>
        ) : (
          <div className="space-y-2.5">
            {robbingSpots.map(spot => {
              const cat = settings.categories?.[spot.category] || {};
              const stats = getRemainingRobTime(spot);
              return (
                <div
                  key={spot.id}
                  className="bg-slate-900/90 border border-red-500/40 rounded-xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${cat.color}25`, border: `1.5px solid ${cat.color}` }}
                      >
                        <CategoryIcon iconName={cat.icon} color={cat.color} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{spot.name}</h4>
                        <p className="text-xs text-slate-400">{spot.zone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-red-400 font-mono">
                        {stats.percent}%
                      </span>
                      <div className="text-[11px] text-slate-300 font-mono">
                        {formatSeconds(stats.remaining)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-red-600 to-red-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.percent}%` }}
                    ></div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => cancelRobbery(spot.id)}
                      className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 transition"
                      title="Cancela el robo y vuelve a Disponible"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancelar (Volver a Disponible)
                    </button>
                    <button
                      onClick={() => goToSpot(spot)}
                      className="flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 font-medium transition"
                    >
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      Ver en Mapa
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: COOLDOWNS (Siguiente en abrir primero) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-tactical flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Lugares en Cooldown ({cooldownSpots.length})
          </h2>
          <span className="text-[11px] text-slate-400">Ordenados por reapertura</span>
        </div>

        {cooldownSpots.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
            ¡Todos los lugares están disponibles para robar!
          </div>
        ) : (
          <div className="space-y-2.5">
            {cooldownSpots.map(spot => {
              const cat = settings.categories?.[spot.category] || {};
              const stats = getRemainingCooldown(spot);
              return (
                <div
                  key={spot.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-3.5 transition flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}60` }}
                    >
                      <CategoryIcon iconName={cat.icon} color={cat.color} className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-white text-xs truncate">{spot.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">{spot.zone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-black text-amber-400 font-mono tracking-wider">
                        {formatSeconds(stats.remaining)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {100 - stats.percent}% tiempo
                      </div>
                    </div>
                    <button
                      onClick={() => resetCooldown(spot.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition"
                      title="Poner disponible ya"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => goToSpot(spot)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Ver en mapa"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
