import React from 'react';
import { useGang } from '../../context/GangContext';
import {
  Map as MapIcon,
  Flame,
  BookOpen,
  Settings,
  Shield,
  Layers,
  Radio,
  Users,
  Banknote
} from 'lucide-react';

export const Navbar = () => {
  const { 
    activeTab, 
    setActiveTab, 
    spots, 
    alerts, 
    syncStatus,
    memberName,
    members,
    setShowRosterModal
  } = useGang();

  const robbingCount = spots.filter(s => s.status === 'robbing').length;
  const cooldownCount = spots.filter(s => s.status === 'cooldown').length;

  const onlineMembersCount = Object.values(members || {}).filter(
    m => m && m.lastSeen && (Date.now() - m.lastSeen < 60000)
  ).length;

  return (
    <header className="h-14 sm:h-16 bg-[#090d16]/95 border-b border-slate-800/80 px-4 flex items-center justify-between z-[1500] backdrop-blur-md">
      {/* Brand & Live status indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('map')}>
          <img
            src="/icons/icon-192.png"
            alt="Gang Tracker"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-cyan-500/40 shadow-lg shadow-cyan-900/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-pricedown text-lg sm:text-xl text-white tracking-wider">
                GANG TRACKER
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                ANIMALS CITY
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono">
              {syncStatus === 'connected' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 font-bold">EN VIVO</span>
                </>
              ) : syncStatus === 'connecting' ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="text-amber-400">CONECTANDO...</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  <span className="text-slate-400">MODO LOCAL</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop / Tablet Nav Tabs */}
      <nav className="hidden sm:flex items-center gap-1.5">
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-tactical transition ${
            activeTab === 'converter'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span>LAVADO</span>
        </button>

        <button
          onClick={() => setActiveTab('active_robs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-tactical relative transition ${
            activeTab === 'active_robs'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Flame className={`w-4 h-4 ${robbingCount > 0 ? 'text-red-400 animate-pulse' : ''}`} />
          <span>ROBOS Y COOLDOWNS</span>
          {(robbingCount > 0 || cooldownCount > 0) && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-500/80 text-white font-black">
              {robbingCount + cooldownCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black font-tactical transition ${
            activeTab === 'map'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60 scale-105 border border-cyan-400/50'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <MapIcon className="w-4 h-4 text-cyan-300" />
          <span>MAPA</span>
        </button>

        <button
          onClick={() => setActiveTab('normativa')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-tactical transition ${
            activeTab === 'normativa'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>NORMATIVA</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-tactical transition ${
            activeTab === 'settings'
              ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950/60'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>AJUSTES</span>
        </button>
      </nav>


      {/* Quick counters & Roster */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setShowRosterModal(true)}
          title="Ver miembros conectados de la banda"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/70 hover:border-cyan-500/50 transition cursor-pointer text-slate-300 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Users className="w-3.5 h-3.5 text-cyan-400 hidden sm:inline-block" />
          <span className="font-bold text-[11px] text-white max-w-[75px] sm:max-w-[120px] truncate">
            {memberName || 'Banda'}
          </span>
          <span className="text-[10px] text-cyan-300 font-mono font-bold bg-cyan-950/70 px-1 py-0.2 rounded border border-cyan-800/70">
            {Math.max(1, onlineMembersCount)}
          </span>
        </button>
      </div>
    </header>
  );
};
