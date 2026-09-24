import React from 'react';
import { useGang } from '../../context/GangContext';
import {
  Banknote,
  Flame,
  Map as MapIcon,
  BookOpen,
  Settings
} from 'lucide-react';

const NavItem = ({
  icon: Icon,
  isActive = false,
  onClick,
  indicatorPosition,
  position,
  badge,
  isCenter = false,
  label
}) => {
  const distance = Math.abs(indicatorPosition - position);
  const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.6);

  return (
    <button
      type="button"
      className={`relative flex flex-col items-center justify-center transition-all duration-300 select-none ${
        isCenter ? 'w-14 h-14 -mt-3 mx-1' : 'w-12 h-12 mx-1'
      }`}
      onClick={onClick}
      aria-label={label}
    >
      {/* Spotlight ray glow from top */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-24 bg-gradient-to-b from-white/40 to-transparent blur-lg rounded-full pointer-events-none transition-opacity duration-300"
        style={{
          opacity: spotlightOpacity,
          transitionDelay: isActive ? '0.1s' : '0s',
        }}
      />

      {/* Central circular pill for Map button to make it stand out */}
      {isCenter ? (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isActive
              ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 text-white shadow-cyan-500/50 scale-105 border-2 border-white/60'
              : 'bg-slate-900/90 text-slate-300 border border-white/20 hover:border-white/40'
          }`}
        >
          <Icon
            className="w-6 h-6 transition-colors duration-200"
            strokeWidth={isActive ? 2.6 : 2}
          />
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <Icon
            className={`w-5 h-5 transition-colors duration-200 ${
              isActive ? 'text-white scale-110' : 'text-gray-400 hover:text-gray-200'
            }`}
            strokeWidth={isActive ? 2.5 : 2}
          />
          {badge !== undefined && badge > 0 && (
            <span className="absolute -top-2 -right-2.5 px-1 min-w-[15px] h-3.5 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center font-mono shadow-md">
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export const BottomNav = () => {
  const { activeTab, setActiveTab, spots } = useGang();

  const robbingCount = spots.filter(s => s.status === 'robbing').length;
  const cooldownCount = spots.filter(s => s.status === 'cooldown').length;
  const totalRobsAlert = robbingCount > 0 ? robbingCount : cooldownCount;

  // Orden estricto solicitado por el usuario:
  // 1: Lavado, 2: Robos, 3: Mapa (al medio y sobresaliente), 4: Normativa, 5: Ajustes
  const navItems = [
    { id: 'converter', icon: Banknote, label: 'Lavado' },
    { id: 'active_robs', icon: Flame, label: 'Robos', badge: totalRobsAlert },
    { id: 'map', icon: MapIcon, label: 'Mapa', isCenter: true },
    { id: 'normativa', icon: BookOpen, label: 'Normativa' },
    { id: 'settings', icon: Settings, label: 'Ajustes' },
  ];

  const activeIndex = navItems.findIndex(item => item.id === activeTab);
  const safeActiveIndex = activeIndex === -1 ? 2 : activeIndex; // fallback al mapa

  return (
    <div className="sm:hidden fixed bottom-4 left-0 right-0 z-[2000] flex items-center justify-center pointer-events-none px-3">
      <nav className="relative flex items-center justify-center px-2 py-2 bg-black/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/10 pointer-events-auto">
        {/* Top White Spotlight Bar Indicator */}
        <div
          className="absolute top-0 h-[2px] bg-white transition-all duration-400 ease-in-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          style={{
            left: `${safeActiveIndex * 56 + 14}px`,
            width: '40px',
            transform: 'translateY(-1px)',
          }}
        />

        {navItems.map((item, index) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={safeActiveIndex === index}
            onClick={() => setActiveTab(item.id)}
            indicatorPosition={safeActiveIndex}
            position={index}
            badge={item.badge}
            isCenter={item.isCenter}
          />
        ))}
      </nav>
    </div>
  );
};

