import React, { useState } from 'react';
import { useGang } from '../../context/GangContext';
import { ProfileModal } from './ProfileModal';
import {
  Users,
  X,
  Edit2,
  Circle,
  Clock,
  Shield,
  Radio,
  UserCheck
} from 'lucide-react';

export const RosterModal = ({ isOpen, onClose }) => {
  const { memberName, memberId, members, tick, setShowAdminModal } = useGang();
  const [editingProfile, setEditingProfile] = useState(false);

  if (!isOpen) return null;

  const now = Date.now();
  const memberList = Object.values(members || {});

  // Online if active in the last 60 seconds
  const onlineMembers = memberList.filter(m => (now - m.lastSeen) < 60000);
  const offlineMembers = memberList
    .filter(m => (now - m.lastSeen) >= 60000)
    .sort((a, b) => b.lastSeen - a.lastSeen);

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Desconocido';
    const diffSecs = Math.round((now - timestamp) / 1000);
    if (diffSecs < 60) return 'Hace unos segundos';
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours} h`;
    return `Hace ${Math.floor(diffHours / 24)} días`;
  };

  return (
    <>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div 
          className="w-full max-w-md bg-[#0f172a] border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Integrantes en Vivo
                </h3>
                <p className="text-[11px] text-slate-400">
                  {onlineMembers.length} conectados ahora en Animals City
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4">
            {/* Current user's card */}
            <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900/80 to-slate-900/80 border border-cyan-500/40 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center font-black text-cyan-300 text-sm">
                  {memberName ? memberName.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                    Tu Perfil de Banda
                  </div>
                  <div className="font-extrabold text-white text-sm mt-0.5">
                    {memberName || 'Sin Identificar'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              >
                <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Cambiar</span>
              </button>
            </div>

            {/* Online Members List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conectados ({onlineMembers.length})
                </span>
                <span className="text-[10px] text-slate-400 font-mono">En vivo</span>
              </div>

              {onlineMembers.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 text-center text-xs text-slate-400">
                  Esperando conexión de compañeros...
                </div>
              ) : (
                <div className="space-y-1.5">
                  {onlineMembers.map(m => {
                    const isSelf = m.id === memberId;
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition ${
                          isSelf
                            ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                            : 'bg-slate-900/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400"></span>
                          <span className="font-bold text-white text-xs">
                            {m.name}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              TÚ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          En línea
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Offline Members List */}
            {offlineMembers.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    Desconectados ({offlineMembers.length})
                  </span>
                </div>

                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {offlineMembers.map(m => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between text-xs opacity-75"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                        <span className="font-medium text-slate-300">
                          {m.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatLastSeen(m.lastSeen)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer with Admin Panel button */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setShowAdminModal(true);
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Panel de Administración (Solo Líder)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={editingProfile}
        onClose={() => setEditingProfile(false)}
        isEditing={true}
      />
    </>
  );
};
