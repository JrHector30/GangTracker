import React, { useState } from 'react';
import { useGang } from '../../context/GangContext';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Trash2,
  Ban,
  UserCheck,
  Sparkles,
  Users,
  X,
  Check,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const AdminModal = () => {
  const {
    showAdminModal,
    setShowAdminModal,
    isAdmin,
    unlockAdmin,
    lockAdmin,
    adminConfig,
    updateAdminConfig,
    members,
    memberId,
    deleteMember,
    banMember,
    unbanMember,
    addAllowedMember,
    removeAllowedMember,
    cleanupDuplicateMembers,
    cleanupOfflineMembers
  } = useGang();

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [newAllowedInput, setNewAllowedInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSuccessMsg, setPinSuccessMsg] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  if (!showAdminModal) return null;

  const handleUnlock = (e) => {
    e.preventDefault();
    const res = unlockAdmin(pinInput.trim());
    if (!res.success) {
      setPinError(res.error || 'PIN incorrecto');
    } else {
      setPinInput('');
      setPinError('');
    }
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    const clean = newPinInput.trim();
    if (clean.length < 4) {
      setActionMsg('El PIN debe tener al menos 4 caracteres/números.');
      return;
    }
    updateAdminConfig({ adminPin: clean });
    setNewPinInput('');
    setPinSuccessMsg('¡PIN de Administrador actualizado con éxito!');
    setTimeout(() => setPinSuccessMsg(''), 3000);
  };

  const handleAddAllowed = (e) => {
    e.preventDefault();
    const clean = newAllowedInput.trim();
    if (!clean) return;
    addAllowedMember(clean);
    setNewAllowedInput('');
  };

  const handleRunCleanup = async () => {
    await cleanupDuplicateMembers();
    setActionMsg('¡Duplicados eliminados correctamente!');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const handleRunOfflineCleanup = async () => {
    await cleanupOfflineMembers(12);
    setActionMsg('¡Miembros inactivos eliminados correctamente!');
    setTimeout(() => setActionMsg(''), 3000);
  };

  const now = Date.now();
  const memberList = Object.values(members || {}).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

  return (
    <div className="fixed inset-0 z-[3600] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-[#0c121e] border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isAdmin
              ? 'bg-emerald-500/20 border border-emerald-400/60 text-emerald-400'
              : 'bg-amber-500/20 border border-amber-400/60 text-amber-400'
              }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Panel de Administración
                {isAdmin && (
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Líder
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isAdmin ? 'Control total de integrantes y accesos' : 'Acceso restringido'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                onClick={lockAdmin}
                title="Bloquear sesión"
                className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-800 transition text-xs flex items-center gap-1"
              >
                <Lock className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              onClick={() => setShowAdminModal(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action feedback banner */}
        {actionMsg && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Unlocked / Locked views */}
        {!isAdmin ? (
          /* LOCKED VIEW */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-950/40">
              <Key className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white">Ingresa el PIN de Administrador</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sección exclusiva para el líder de la banda para purgar duplicados y gestionar accesos desde el celular.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 max-w-xs mx-auto">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  autoFocus
                  placeholder="Solo tu marido sabe el PIN"
                  value={pinInput}
                  onChange={e => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  className="w-full text-center tracking-widest text-lg font-bold py-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-400 shadow-inner"
                />
                {pinError && (
                  <p className="text-xs text-red-400 mt-1.5 font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{pinError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-950/60 transition flex items-center justify-center gap-2 active:scale-98"
              >
                <Unlock className="w-4 h-4 stroke-[3]" />
                <span>Desbloquear Panel</span>
              </button>
            </form>
          </div>
        ) : (
          /* UNLOCKED ADMIN DASHBOARD */
          <div className="p-4 sm:p-5 overflow-y-auto space-y-6">
            {/* Quick Actions (Duplicate cleaner & Inactive cleaner) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Acciones Rápidas de Limpieza
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleRunCleanup}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 transition flex items-center gap-3 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Limpiar Duplicados</div>
                    <div className="text-[10px] text-slate-400">Elimina perfiles repetidos</div>
                  </div>
                </button>

                <button
                  onClick={handleRunOfflineCleanup}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 hover:bg-slate-800 transition flex items-center gap-3 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Limpiar Inactivos</div>
                    <div className="text-[10px] text-slate-400">Desconectados &gt; 12 horas</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Whitelist / Access Control */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <span>Modo Whitelist (Acceso Exclusivo)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Si está activo, solo los nombres registrados aquí podrán entrar a la web.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateAdminConfig({ whitelistEnabled: !adminConfig?.whitelistEnabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${adminConfig?.whitelistEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${adminConfig?.whitelistEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {adminConfig?.whitelistEnabled && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <form onSubmit={handleAddAllowed} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nombre exacto del miembro..."
                      value={newAllowedInput}
                      onChange={e => setNewAllowedInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition"
                    >
                      Añadir
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(adminConfig?.allowedMembers || []).map(name => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-xs font-semibold"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeAllowedMember(name)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Registered Members List with Kick and Ban */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  Usuarios Registrados ({memberList.length})
                </span>
                <span className="text-[10px] text-slate-400">Total en sesión</span>
              </div>

              {memberList.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-400">
                  No hay usuarios en la lista
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {memberList.map(m => {
                    const isOnline = m.lastSeen && (now - m.lastSeen) < 60000;
                    const isSelf = m.id === memberId;
                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOnline ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-slate-600'}`} />
                          <div className="truncate">
                            <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                              <span>{m.name || 'Sin nombre'}</span>
                              {isSelf && (
                                <span className="text-[9px] uppercase px-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                                  Tú
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {isOnline ? 'En línea ahora' : 'Desconectado'}
                            </div>
                          </div>
                        </div>

                        {/* Kick & Ban actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => deleteMember(m.id)}
                            title="Eliminar usuario"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-600 transition text-[11px] flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>

                          <button
                            onClick={() => banMember(m.name)}
                            title="Bloquear por completo"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 hover:text-amber-400 text-slate-400 border border-slate-700 hover:border-amber-600 transition text-[11px] flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Banear</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Banned Names List */}
            {(adminConfig?.bannedNames || []).length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-950/20 border border-red-900/50 space-y-2">
                <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <Ban className="w-3.5 h-3.5" />
                  <span>Nombres Bloqueados / Baneados</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {adminConfig.bannedNames.map(name => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950 border border-red-800 text-red-300 text-xs font-semibold"
                    >
                      {name}
                      <button
                        type="button"
                        onClick={() => unbanMember(name)}
                        title="Desbloquear"
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Change Admin PIN */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span>Cambiar PIN Maestro de Administrador</span>
              </div>
              <form onSubmit={handleChangePin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nuevo PIN numérico..."
                  value={newPinInput}
                  onChange={e => setNewPinInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Guardar PIN
                </button>
              </form>
              {pinSuccessMsg && (
                <p className="text-[11px] text-emerald-400 font-medium">{pinSuccessMsg}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
