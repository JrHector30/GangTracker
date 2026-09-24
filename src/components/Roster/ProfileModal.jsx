import React, { useState } from 'react';
import { useGang } from '../../context/GangContext';
import { User, Shield, Check, Skull, Lock, ShieldAlert } from 'lucide-react';

export const ProfileModal = ({ isOpen, onClose, isEditing = false }) => {
  const { memberName, saveMemberName, memberId, members, adminConfig, setShowAdminModal } = useGang();
  const [nameInput, setNameInput] = useState(memberName || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed.length < 2) {
      setError('Escribe al menos 2 caracteres para tu nombre de rol.');
      return;
    }
    if (trimmed.length > 20) {
      setError('El nombre no puede tener más de 20 caracteres.');
      return;
    }

    // 1. Check if name is banned
    const isBanned = (adminConfig?.bannedNames || []).some(
      b => b.toLowerCase() === trimmed.toLowerCase()
    );
    if (isBanned) {
      setError(`El nombre "${trimmed}" está bloqueado por el Administrador.`);
      return;
    }

    // 2. Check Whitelist if enabled
    if (adminConfig?.whitelistEnabled) {
      const isAllowed = (adminConfig?.allowedMembers || []).some(
        a => a.toLowerCase() === trimmed.toLowerCase()
      );
      if (!isAllowed) {
        setError(`Acceso restringido por Whitelist. Contacta al Líder para autorizar "${trimmed}".`);
        return;
      }
    }

    // 3. Check for currently active duplicate online session
    const now = Date.now();
    const hasOnlineDuplicate = Object.values(members || {}).some(
      m => m.id !== memberId &&
           m.name &&
           m.name.trim().toLowerCase() === trimmed.toLowerCase() &&
           m.lastSeen &&
           (now - m.lastSeen) < 60000
    );
    if (hasOnlineDuplicate) {
      setError(`Ya hay otro usuario conectado con el nombre "${trimmed}".`);
      return;
    }

    saveMemberName(trimmed);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-[3500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-sm bg-[#0f172a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden p-6 text-center space-y-4 relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Admin Quick Entry Button */}
        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          title="Panel de Administrador"
          className="absolute top-4 right-4 p-2 text-slate-500 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
        >
          <Lock className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-950/60 text-slate-950">
          <Skull className="w-9 h-9 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white tracking-wide">
            {isEditing ? 'Editar Perfil de Banda' : '¡Bienvenido a Gang Tracker!'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isEditing 
              ? 'Actualiza tu apodo o nombre de personaje IC.' 
              : 'Escribe tu apodo o nombre de rol IC para identificarte con tus compañeros en tiempo real.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 pt-2 text-left">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tu Apodo / Nombre IC:
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Ej: Héctor, Chino, Brian, Frank..."
                value={nameInput}
                onChange={e => {
                  setNameInput(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-3 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-400 shadow-inner"
              />
            </div>
            {error && (
              <p className="text-[11px] text-red-400 mt-1.5 font-medium flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-slate-950 font-black text-sm shadow-xl shadow-cyan-950/60 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isEditing ? 'Guardar Cambios' : 'Ingresar a la Banda'}</span>
          </button>
        </form>

        <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
          <Shield className="w-3 h-3 text-cyan-400" />
          <span>Solo se te pedirá una única vez por celular</span>
        </div>
      </div>
    </div>
  );
};
