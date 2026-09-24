import React, { useEffect } from 'react';
import { useGang } from '../../context/GangContext';
import { Sparkles, X } from 'lucide-react';
import { soundManager } from '../../utils/soundAlerts';

const AlertToastItem = ({ alert, spot, onDismiss, onSelect }) => {
  // Auto-dismiss after 5 seconds and trigger mobile vibration
  useEffect(() => {
    // Trigger tactile haptic vibration when alert appears
    soundManager.vibrate([300, 150, 300, 150, 400]);

    const timer = setTimeout(() => {
      onDismiss(alert.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [alert.id, onDismiss]);

  return (
    <div className="pointer-events-auto relative overflow-hidden bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95 border-2 border-emerald-400/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in slide-in-from-top-4 duration-300 ring-4 ring-emerald-500/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shrink-0 text-emerald-300 animate-bounce">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            ¡TIENDA DISPONIBLE PARA ROBAR!
          </div>
          <h4 className="font-bold text-white text-xs truncate mt-0.5">{alert.name}</h4>
          <p className="text-[10px] text-slate-300 truncate">{alert.zone}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {spot && (
          <button
            onClick={() => onSelect(spot, alert.id)}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-[11px] transition shadow cursor-pointer"
          >
            Ver
          </button>
        )}
        <button
          onClick={() => onDismiss(alert.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
          title="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 5-second countdown progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-950/60 pointer-events-none">
        <div className="h-full bg-emerald-400/90 rounded-full toast-progress-bar origin-left" />
      </div>
    </div>
  );
};

export const AlertToast = () => {
  const { alerts, dismissAlert, setSelectedSpot, setActiveTab, spots } = useGang();

  if (alerts.length === 0) return null;

  const handleSelect = (spot, alertId) => {
    setSelectedSpot(spot);
    setActiveTab('map');
    dismissAlert(alertId);
  };

  return (
    <div className="fixed top-16 sm:top-20 right-3 left-3 sm:left-auto sm:w-96 z-[3000] space-y-2 pointer-events-none">
      {alerts.slice(0, 3).map(alert => {
        const spot = spots.find(s => s.id === alert.spotId);
        return (
          <AlertToastItem
            key={alert.id}
            alert={alert}
            spot={spot}
            onDismiss={dismissAlert}
            onSelect={handleSelect}
          />
        );
      })}
    </div>
  );
};
