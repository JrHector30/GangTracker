import React, { useState } from 'react';
import { useGang } from '../../context/GangContext';
import {
  Banknote,
  DollarSign,
  ArrowRightLeft,
  Users,
  Percent,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Coins,
  ShieldCheck,
  Building2,
  Gem,
  Store,
  Compass,
  CheckCircle2,
  Skull,
  Flame,
  Clock,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export const MoneyConverter = () => {
  const { settings } = useGang();
  const categories = settings?.categories || {};

  // Mode: 'black_to_white' (Negro a Blanco) or 'white_to_black' (Blanco Deseado a Negro)
  const [direction, setDirection] = useState('white_to_black');
  
  // Rate: default 70% (700 white per 1000 black)
  const [ratePercent, setRatePercent] = useState(70);
  const [customRateOpen, setCustomRateOpen] = useState(false);
  
  // Base amount input (string for easy typing)
  const [rawAmount, setRawAmount] = useState('70000');
  
  // Member split count
  const [memberCount, setMemberCount] = useState(3);

  // Parse numeric value safely
  const numericAmount = Math.max(0, parseInt(rawAmount.replace(/\D/g, '') || '0', 10));

  // Category rewards from Settings or fallbacks
  const getCatReward = (catId, fallback) => {
    return categories[catId]?.approxRewardBlack || fallback;
  };

  const reward247 = getCatReward('badulaque', 18000);
  const rewardLicoreria = getCatReward('licoreria', 22000);
  const rewardTattoo = getCatReward('tattoo', 16000);
  const rewardBarberia = getCatReward('barberia', 15000);
  const rewardRopa = getCatReward('ropa', 20000);
  const rewardATM = getCatReward('atm', 25000);
  const rewardFleeca = getCatReward('fleeca', 80000);
  const rewardJoyeria = getCatReward('joyeria', 220000);

  // Calculations
  const rateRatio = (ratePercent || 70) / 100;
  
  let blackMoney = 0;
  let whiteMoney = 0;
  let feeMoney = 0;

  if (direction === 'black_to_white') {
    blackMoney = numericAmount;
    whiteMoney = Math.round(blackMoney * rateRatio);
    feeMoney = blackMoney - whiteMoney;
  } else {
    // White to black: user wants X white money, how much black needed?
    whiteMoney = numericAmount;
    blackMoney = rateRatio > 0 ? Math.round(whiteMoney / rateRatio) : 0;
    feeMoney = blackMoney - whiteMoney;
  }

  // Split per member
  const members = Math.max(1, memberCount);
  const splitBlackPerMember = Math.floor(blackMoney / members);
  const splitWhitePerMember = Math.floor(whiteMoney / members);
  const splitFeePerMember = Math.floor(feeMoney / members);

  // Format currency
  const formatMoney = (val) => {
    return '$' + Math.round(val).toLocaleString('es-ES');
  };

  const handleQuickAdd = (addVal) => {
    const current = numericAmount;
    setRawAmount(String(current + addVal));
  };

  const handleReset = () => {
    setRawAmount('0');
  };

  const quickPresets = [
    { label: '+$10K', value: 10000 },
    { label: '+$25K', value: 25000 },
    { label: '+$50K', value: 50000 },
    { label: '+$100K', value: 100000 },
    { label: '+$250K', value: 250000 },
    { label: '+$500K', value: 500000 },
    { label: '+$1M', value: 1000000 }
  ];

  // Tactical Store Options for Single-type Recommendations
  const storeOptions = [
    {
      id: 'badulaque',
      name: 'Tienda 24/7',
      reward: reward247,
      icon: Store,
      color: '#10b981',
      cops: categories.badulaque?.minCops || 2,
      time: '2 min'
    },
    {
      id: 'atm',
      name: 'Cajero ATM',
      reward: rewardATM,
      icon: Coins,
      color: '#eab308',
      cops: categories.atm?.minCops || 1,
      time: '40 seg'
    },
    {
      id: 'licoreria',
      name: 'Licorería',
      reward: rewardLicoreria,
      icon: Store,
      color: '#a855f7',
      cops: categories.licoreria?.minCops || 2,
      time: '1.5 min'
    },
    {
      id: 'fleeca',
      name: 'Banco Fleeca',
      reward: rewardFleeca,
      icon: Building2,
      color: '#f97316',
      cops: categories.fleeca?.minCops || 4,
      time: '5 min'
    },
    {
      id: 'joyeria',
      name: 'Joyería Vangelico',
      reward: rewardJoyeria,
      icon: Gem,
      color: '#f43f5e',
      cops: categories.joyeria?.minCops || 5,
      time: '7 min'
    },
    {
      id: 'ropa',
      name: 'Tienda de Ropa',
      reward: rewardRopa,
      icon: Store,
      color: '#3b82f6',
      cops: categories.ropa?.minCops || 2,
      time: '2 min'
    },
  ];

  // Smart greedy optimal plan algorithm to reach blackMoney
  const calculateOptimalPlan = (target) => {
    if (target <= 0) return null;
    let remaining = target;
    const plan = [];

    const available = [
      { id: 'joyeria', name: 'Joyería Vangelico', reward: rewardJoyeria, icon: Gem, color: '#f43f5e' },
      { id: 'fleeca', name: 'Banco Fleeca', reward: rewardFleeca, icon: Building2, color: '#f97316' },
      { id: 'atm', name: 'Cajero ATM', reward: rewardATM, icon: Coins, color: '#eab308' },
      { id: 'licoreria', name: 'Licorería', reward: rewardLicoreria, icon: Store, color: '#a855f7' },
      { id: 'badulaque', name: 'Tienda 24/7', reward: reward247, icon: Store, color: '#10b981' }
    ];

    for (const item of available) {
      if (remaining <= 0) break;
      if (remaining >= item.reward) {
        const count = Math.floor(remaining / item.reward);
        plan.push({ ...item, count });
        remaining -= count * item.reward;
      }
    }

    if (remaining > 0) {
      // Find smallest store covering remaining
      const cover = [
        { id: 'badulaque', name: 'Tienda 24/7', reward: reward247, icon: Store, color: '#10b981' },
        { id: 'licoreria', name: 'Licorería', reward: rewardLicoreria, icon: Store, color: '#a855f7' },
        { id: 'atm', name: 'Cajero ATM', reward: rewardATM, icon: Coins, color: '#eab308' },
        { id: 'fleeca', name: 'Banco Fleeca', reward: rewardFleeca, icon: Building2, color: '#f97316' }
      ].find(s => s.reward >= remaining) || { id: 'badulaque', name: 'Tienda 24/7', reward: reward247, icon: Store, color: '#10b981' };

      const exists = plan.find(p => p.id === cover.id);
      if (exists) {
        exists.count += 1;
      } else {
        plan.push({ ...cover, count: 1 });
      }
    }

    const totalEst = plan.reduce((sum, p) => sum + p.count * p.reward, 0);
    const totalHits = plan.reduce((sum, p) => sum + p.count, 0);
    return { plan, totalEst, totalHits };
  };

  const optimalPlan = calculateOptimalPlan(blackMoney);

  return (
    <div className="w-full h-full overflow-y-auto bg-[#080c14] text-slate-100 p-4 sm:p-6 pb-28 sm:pb-12">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-cyan-950/40 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-600 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-950/60">
              <Banknote className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                <span>Conversor y Lavado de Dinero</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase font-bold">
                  Animals City
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Tasa oficial: <span className="text-cyan-400 font-bold font-mono">$1.000 negro ➔ $700 blanco</span> ({ratePercent}%)
              </p>
            </div>
          </div>

          {/* Rate config badge / toggle */}
          <button
            onClick={() => setCustomRateOpen(!customRateOpen)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tasa: <b className="text-white font-mono">{ratePercent}%</b></span>
          </button>
        </div>

        {/* Custom Rate Drawer (if opened) */}
        {customRateOpen && (
          <div className="bg-slate-900/90 border border-cyan-500/40 p-4 rounded-xl space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-300">Ajustar Tasa de Lavado</span>
              <button
                onClick={() => setRatePercent(70)}
                className="text-[11px] text-slate-400 hover:text-cyan-300 underline"
              >
                Restablecer a 70% (Oficial)
              </button>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="40"
                max="100"
                step="5"
                value={ratePercent}
                onChange={(e) => setRatePercent(Number(e.target.value))}
                className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <span className="font-mono font-black text-sm text-cyan-400 min-w-[50px] text-right">
                {ratePercent}%
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Por cada $1.000 de dinero negro recibirás {formatMoney(1000 * (ratePercent / 100))} en dinero blanco.
            </p>
          </div>
        )}

        {/* Main Interactive Converter Box */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
          
          {/* Direction toggle tab */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => {
                  setDirection('white_to_black');
                  if (rawAmount === '100000') setRawAmount('70000');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  direction === 'white_to_black'
                    ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Blanco Deseado ➔ Negro Necesario
              </button>
              <button
                onClick={() => {
                  setDirection('black_to_white');
                  if (rawAmount === '70000') setRawAmount('100000');
                }}
                className={`px-3 py-1.5 rounded-lg transition ${
                  direction === 'black_to_white'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dinero Negro ➔ Blanco
              </button>
            </div>

            <button
              onClick={() => setDirection(d => d === 'black_to_white' ? 'white_to_black' : 'black_to_white')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition"
              title="Invertir dirección"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>
                {direction === 'white_to_black' 
                  ? '🏦 Dinero Blanco Limpio Deseado:' 
                  : '💀 Cantidad de Dinero Negro a Lavar:'}
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] font-normal text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar</span>
              </button>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-xl sm:text-2xl font-black text-slate-500">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={numericAmount > 0 ? numericAmount.toLocaleString('es-ES') : ''}
                placeholder="0"
                onChange={(e) => setRawAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 sm:py-4 bg-slate-950 border-2 border-slate-700/80 focus:border-cyan-400 rounded-xl font-mono text-2xl sm:text-3xl font-black text-white focus:outline-none transition shadow-inner"
              />
            </div>
          </div>

          {/* Quick Add Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Sumar rápido:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickPresets.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handleQuickAdd(preset.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono font-bold text-cyan-300 transition active:scale-95"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result Cards: Dynamically adapted according to direction */}
          {direction === 'white_to_black' ? (
            /* MODE: Blanco Deseado -> Shows Needed Black Money in Primary Card */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Primary: Dinero Negro Necesario a Robar */}
              <div className="bg-gradient-to-br from-red-950/40 via-slate-900/95 to-slate-900/90 border-2 border-red-500/60 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-red-400 flex items-center gap-1.5">
                    <Skull className="w-4 h-4 text-red-400" />
                    Dinero Negro Necesario a Conseguir
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                    A Robar
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-red-400 mt-2 tracking-tight">
                  {formatMoney(blackMoney)}
                </div>
                <p className="text-[11px] text-slate-300 mt-1">
                  Debes reunir esta suma en negro para obtener <b className="text-emerald-400">{formatMoney(whiteMoney)}</b> limpios.
                </p>
              </div>

              {/* Secondary: Comisión de Lavado que se Perderá */}
              <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/90 to-slate-900/90 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-amber-400" />
                    Comisión de Lavado (Pérdida)
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {100 - ratePercent}%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 mt-2 tracking-tight">
                  {formatMoney(feeMoney)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Corte que retiene el lavador de dinero
                </p>
              </div>
            </div>
          ) : (
            /* MODE: Negro a Blanco -> Shows Clean Money in Primary Card */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              
              {/* Primary: Dinero Blanco Limpio */}
              <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border-2 border-emerald-500/50 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Dinero Blanco (Limpio)
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    {ratePercent}%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 mt-2 tracking-tight">
                  {formatMoney(whiteMoney)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recibes en mano o depósito bancario tras lavar
                </p>
              </div>

              {/* Secondary: Comisión de Lavado */}
              <div className="bg-gradient-to-br from-red-950/30 via-slate-900/90 to-slate-900/90 border-2 border-red-500/40 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-red-400 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    Comisión de Lavado (Pérdida)
                  </span>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300">
                    {100 - ratePercent}%
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-red-400 mt-2 tracking-tight">
                  {formatMoney(feeMoney)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Se queda el lavador o se pierde en el proceso
                </p>
              </div>
            </div>
          )}

          {/* Visual Proportion Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[11px] font-mono font-bold">
              <span className="text-emerald-400">Limpio: {ratePercent}%</span>
              <span className="text-red-400">Comisión: {100 - ratePercent}%</span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${ratePercent}%` }}
              />
              <div 
                className="bg-gradient-to-r from-red-500 to-rose-600 h-full transition-all duration-300"
                style={{ width: `${100 - ratePercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* TACTICAL ROBBERY RECOMMENDATION MODULE */}
        {blackMoney > 0 && (
          <div className="bg-[#0c1220] border border-cyan-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
            
            {/* Recommendation Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-950/50">
                  <Compass className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2">
                    <span>Recomendación Táctica de Robos</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono">
                      Meta: {formatMoney(blackMoney)} negro
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Calculado con las ganancias configuradas en Ajustes
                  </p>
                </div>
              </div>
            </div>

            {/* Optimal Mixed Route Plan */}
            {optimalPlan && (
              <div className="bg-gradient-to-r from-cyan-950/30 via-slate-900/90 to-slate-900/90 border border-cyan-500/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Ruta Combinada Más Rápida (Recomendada)</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Total: {formatMoney(optimalPlan.totalEst)} ({optimalPlan.totalHits} robos)
                  </span>
                </div>

                {/* Plan Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {optimalPlan.plan.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700/80 shadow-md"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                          style={{ backgroundColor: `${item.color}25`, color: item.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-cyan-400 font-mono font-black text-sm">
                              {item.count}x
                            </span>
                            <span>{item.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ~{formatMoney(item.reward * item.count)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Single Type Breakdown (If doing only one type of robbery) */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Opciones por Tipo de Tienda Individual:</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  ¿Cuántas necesitas si solo robas este tipo?
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {storeOptions.map(st => {
                  const neededCount = Math.max(1, Math.ceil(blackMoney / st.reward));
                  const totalYield = neededCount * st.reward;
                  const Icon = st.icon;

                  return (
                    <div
                      key={st.id}
                      className="bg-slate-950/60 border border-slate-800/90 hover:border-cyan-500/50 rounded-xl p-3.5 flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-inner"
                          style={{ backgroundColor: `${st.color}20`, border: `1px solid ${st.color}60`, color: st.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition flex items-center gap-1.5">
                            <span>{st.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                            <span>Botín: ~{formatMoney(st.reward)}</span>
                            <span>•</span>
                            <span>👮‍♂️ {st.cops} cops</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity needed badge */}
                      <div className="text-right">
                        <span className="text-sm sm:text-base font-black font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-lg">
                          {neededCount}x
                        </span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-1">
                          ~{formatMoney(totalYield)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* Loot Split Section (Reparto entre Integrantes de la Banda) */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-400">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Reparto de Botín por Integrante
                </h3>
                <p className="text-[11px] text-slate-400">
                  Divide equitativamente entre los compañeros que participaron
                </p>
              </div>
            </div>

            {/* Member Count Selector */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-xs text-slate-400 font-semibold mr-1">Integrantes:</span>
              {[2, 3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  onClick={() => setMemberCount(num)}
                  className={`w-8 h-8 rounded-lg font-mono font-bold text-xs transition ${
                    memberCount === num
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Split Per-Member Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Negro por Persona ({memberCount})
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-slate-200 mt-1">
                {formatMoney(splitBlackPerMember)}
              </div>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                Limpio por Persona
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-emerald-400 mt-1">
                {formatMoney(splitWhitePerMember)}
              </div>
            </div>

            <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-3.5 text-center">
              <div className="text-[10px] uppercase font-bold text-red-400">
                Pérdida por Persona
              </div>
              <div className="text-lg sm:text-xl font-black font-mono text-red-400 mt-1">
                {formatMoney(splitFeePerMember)}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
