import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { renderToStaticMarkup } from 'react-dom/server';
import L from 'leaflet';
import { useGang } from '../../context/GangContext';
import { AddSpotModal } from './AddSpotModal';
import { CategoryIcon } from '../Common/CategoryIcon';
import { formatSeconds, getRemainingRobTime, getRemainingCooldown } from '../../utils/timeFormat';
import { MAP_CONFIGS } from '../../data/defaultSettings';
import {
  Layers,
  Plus,
  Compass,
  Filter,
  Search,
  Check,
  RotateCcw,
  Crosshair,
  Flame,
  MapPin,
  HelpCircle,
  Move,
  X
} from 'lucide-react';

const RING_RADIUS = 23;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~144.51

export const GangMap = () => {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersGroupRef = useRef(null);

  const {
    activeTab,
    spots,
    settings,
    currentMapConfig,
    selectedSpot,
    setSelectedSpot,
    updateSpotCoords,
    switchMap,
    createCategory
  } = useGang();

  const spotsRef = useRef(spots);
  spotsRef.current = spots;

  const [showRadialMenu, setShowRadialMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Active viewing section: 'robberies' (default/priority) vs 'pois' (Puntos de Interés)
  const [activeSection, setActiveSection] = useState('robberies');

  // Inline Category creation in Filters
  const [showAddRobberyCategoryInput, setShowAddRobberyCategoryInput] = useState(false);
  const [newRobberyCategoryName, setNewRobberyCategoryName] = useState('');
  const [showAddPoiCategoryInput, setShowAddPoiCategoryInput] = useState(false);
  const [newPoiCategoryName, setNewPoiCategoryName] = useState('');

  const [addMode, setAddMode] = useState(false);
  const [moveMode, setMoveMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag & drop toast notification
  const [dragToast, setDragToast] = useState('');

  // Category filters for Robberies
  const [enabledCategories, setEnabledCategories] = useState(() => {
    const init = {};
    Object.keys(settings.categories || {}).forEach(k => {
      init[k] = true;
    });
    return init;
  });

  // Category filters for POIs
  const [enabledPois, setEnabledPois] = useState(() => {
    const init = {};
    Object.keys(settings.poiCategories || {}).forEach(k => {
      init[k] = true;
    });
    return init;
  });

  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showFilterBar, setShowFilterBar] = useState(false);

  const toggleCategory = (catId) => {
    setEnabledCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const togglePoiCategory = (poiId) => {
    setEnabledPois(prev => ({
      ...prev,
      [poiId]: !prev[poiId]
    }));
  };

  const selectAllCategories = () => {
    if (activeSection === 'robberies') {
      const all = {};
      Object.keys(settings.categories || {}).forEach(k => { all[k] = true; });
      setEnabledCategories(all);
    } else {
      const all = {};
      Object.keys(settings.poiCategories || {}).forEach(k => { all[k] = true; });
      setEnabledPois(all);
    }
  };

  const deselectAllCategories = () => {
    if (activeSection === 'robberies') {
      const none = {};
      Object.keys(settings.categories || {}).forEach(k => { none[k] = false; });
      setEnabledCategories(none);
    } else {
      const none = {};
      Object.keys(settings.poiCategories || {}).forEach(k => { none[k] = false; });
      setEnabledPois(none);
    }
  };

  // Quick creation of new Robbery category from filter bar
  const handleCreateRobberyCategory = (e) => {
    e.preventDefault();
    if (!newRobberyCategoryName.trim()) return;
    const cat = createCategory('robbery', newRobberyCategoryName.trim());
    if (cat) {
      setEnabledCategories(prev => ({ ...prev, [cat.id]: true }));
      setDragToast(`✓ Categoría "${cat.name}" creada. Pulsa "Añadir" para ubicarla en el mapa.`);
      setTimeout(() => setDragToast(''), 4000);
      setNewRobberyCategoryName('');
      setShowAddRobberyCategoryInput(false);
    }
  };

  // Quick creation of new POI category from filter bar
  const handleCreatePoiCategory = (e) => {
    e.preventDefault();
    if (!newPoiCategoryName.trim()) return;
    const poi = createCategory('poi', newPoiCategoryName.trim());
    if (poi) {
      setEnabledPois(prev => ({ ...prev, [poi.id]: true }));
      setDragToast(`✓ Punto "${poi.name}" creado. Pulsa "Añadir" para ubicarlo en el mapa.`);
      setTimeout(() => setDragToast(''), 4000);
      setNewPoiCategoryName('');
      setShowAddPoiCategoryInput(false);
    }
  };

  // Check if a spot is a POI
  const isPoiSpot = (spot) => {
    return spot.type === 'poi' || Boolean(settings.poiCategories?.[spot.category]);
  };

  // 1. Initialize Leaflet Map with 60 FPS Slippy Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const oceanColor = currentMapConfig.oceanColor || '#0fa8d2';
    document.documentElement.style.setProperty('--map-ocean-bg', oceanColor);

    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        minZoom: 3,
        maxZoom: 7,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        attributionControl: false,
        zoomControl: false,
        maxBounds: [
          [38, -185],
          [88, -70]
        ],
        maxBoundsViscosity: 0.5
      });

      map.setView([64.05969, -130.31379], 4.75);

      markersGroupRef.current = L.layerGroup().addTo(map);
      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    if (map && map.getContainer()) {
      map.getContainer().style.backgroundColor = oceanColor;
    }

    const tileUrl = currentMapConfig.url || 'https://tiles.mapgenie.io/games/gta5/los-santos/atlas/{z}/{x}/{y}.png';

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    tileLayerRef.current = L.tileLayer(tileUrl, {
      minZoom: 3,
      maxZoom: 7,
      maxNativeZoom: 7,
      bounds: [
        [38, -185],
        [88, -70]
      ],
      noWrap: true,
      updateWhenIdle: false,
      keepBuffer: 3
    }).addTo(map);
  }, [currentMapConfig]);


  // 2. Map click for adding custom blips (Opens interactive AddSpotModal)
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const handleMapClick = (e) => {
      if (!addMode) return;
      if (!e.latlng) return;
      setPendingCoords({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6))
      });
      setAddMode(false);
    };

    map.on('click', handleMapClick);

    // Cambiar cursor directamente sobre el contenedor de Leaflet para no sobrescribir clases de React
    const container = map.getContainer();
    if (container) {
      container.style.cursor = addMode ? 'crosshair' : '';
    }

    return () => {
      map.off('click', handleMapClick);
      if (container) {
        container.style.cursor = '';
      }
    };
  }, [addMode]);

  // Center on spot when selected (e.g., from ActiveRobs list)
  useEffect(() => {
    if (!selectedSpot || !leafletMapRef.current) return;
    const activeMapId = settings.currentMap || 'atlas';
    const spotMapCoords = (selectedSpot.mapCoords && selectedSpot.mapCoords[activeMapId]) ? selectedSpot.mapCoords[activeMapId] : null;
    const lat = spotMapCoords?.lat ?? (selectedSpot.lat ?? (selectedSpot.coords?.lat ?? null));
    const lng = spotMapCoords?.lng ?? (selectedSpot.lng ?? (selectedSpot.coords?.lng ?? null));
    if (lat !== null && lng !== null) {
      leafletMapRef.current.flyTo([lat, lng], Math.max(leafletMapRef.current.getZoom(), 5.5), { duration: 0.6 });
    }
  }, [selectedSpot, settings.currentMap]);

  // Tab visibility synchronization: Force Leaflet to recalculate size and reload tiles/bounds whenever switching back to Map tab
  useEffect(() => {
    if (activeTab !== 'map') return;

    const map = leafletMapRef.current;
    if (!map) return;

    const triggerResize = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize({ pan: false });
      }
    };

    triggerResize();
    const t1 = setTimeout(triggerResize, 50);
    const t2 = setTimeout(triggerResize, 200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [activeTab]);

  // 3. Render markers whenever spots, map, section, filters, or activeTab change
  useEffect(() => {
    if (activeTab !== 'map') return; // Do not rebuild markers while on another tab!

    const map = leafletMapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    map.invalidateSize({ pan: false });
    markersGroup.clearLayers();
    const activeMapId = settings.currentMap || currentMapConfig.id || 'atlas';

    // Filter spots strictly by activeSection:
    // When activeSection === 'robberies': show ONLY robbery stores, hide all POIs
    // When activeSection === 'pois': show ONLY POIs, hide all robbery stores
    const filtered = spots.filter(spot => {
      const isPoi = isPoiSpot(spot);

      if (activeSection === 'robberies') {
        if (isPoi) return false; // Hide POIs
        if (enabledCategories[spot.category] === false) return false;
        if (selectedStatusFilter !== 'all' && spot.status !== selectedStatusFilter) return false;
      } else {
        if (!isPoi) return false; // Hide Robberies
        if (enabledPois[spot.category] === false) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = spot.name.toLowerCase().includes(query);
        const matchesZone = (spot.zone || '').toLowerCase().includes(query);
        if (!matchesName && !matchesZone) return false;
      }

      return true;
    });

    filtered.forEach(spot => {
      // Coordenadas geográficas estándar EPSG:3857
      const spotMapCoords = (spot.mapCoords && spot.mapCoords[activeMapId]) ? spot.mapCoords[activeMapId] : null;
      const lat = spotMapCoords?.lat ?? (spot.lat ?? (spot.coords?.lat ?? 64.06));
      const lng = spotMapCoords?.lng ?? (spot.lng ?? (spot.coords?.lng ?? -130.31));

      const isPoi = isPoiSpot(spot);
      const category = isPoi
        ? (settings.poiCategories?.[spot.category] || {})
        : (settings.categories?.[spot.category] || {});

      // Detect GTA 5 Brand Colors (LTD Gasoline -> Lila #c084fc, Rob's -> Vino #f43f5e, 24/7 -> Verde #10b981)
      let brandColor = null;
      let brandIcon = null;
      const lowerName = (spot.name || '').toLowerCase();
      const lowerZone = (spot.zone || '').toLowerCase();

      if (lowerName.includes('ltd') || lowerZone.includes('ltd')) {
        brandColor = '#c084fc'; // LTD Gasoline: Lila / Púrpura neón
        brandIcon = 'Store';
      } else if (lowerName.includes("rob's") || lowerName.includes("rob’s") || lowerName.includes('robs') || lowerZone.includes('rob')) {
        brandColor = '#f43f5e'; // Rob's Liquor: Carmesí / Vino neón
        brandIcon = 'Wine';
      } else if (lowerName.includes('24/7') || lowerZone.includes('24/7') || lowerName.includes('convenience') || lowerZone.includes('convenience')) {
        brandColor = '#10b981'; // 24/7 Supermarket: Verde esmeralda neón
        brandIcon = 'Store';
      } else if (spot.color) {
        brandColor = spot.color;
      }

      const color = brandColor || category.color || '#06b6d4';
      const iconToUse = brandIcon || category.icon || spot.category;

      let stateClass = 'blip-available';
      let hudClass = 'hud-available';
      let hudContent = '';
      let showHud = false;
      let showRadialRing = false;
      let strokeDashoffset = RING_CIRCUMFERENCE;

      if (!isPoi) {
        if (spot.status === 'robbing') {
          stateClass = 'blip-robbing';
          hudClass = 'hud-robbing';
          const robStats = getRemainingRobTime(spot);
          hudContent = `🔴 ${robStats.percent}% • ${formatSeconds(robStats.remaining)}`;
          showHud = true;
          showRadialRing = true;
          strokeDashoffset = RING_CIRCUMFERENCE - (robStats.percent / 100) * RING_CIRCUMFERENCE;
        } else if (spot.status === 'cooldown') {
          stateClass = 'blip-cooldown';
          hudClass = 'hud-cooldown';
          const cdStats = getRemainingCooldown(spot);
          hudContent = `⏳ ${formatSeconds(cdStats.remaining)}`;
          showHud = true;
        }
      } else {
        // POI visual style
        stateClass = 'blip-poi';
      }

      // Active neon accent color for this blip (Robbing = Red, Cooldown = Amber, Available = Brand/Category Color)
      const activeColor = (!isPoi && spot.status === 'robbing')
        ? '#ef4444'
        : (!isPoi && spot.status === 'cooldown')
          ? '#f59e0b'
          : color;

      // Render crisp, borderless Lucide icon in PURE BLACK (#000000) so it contrasts against map terrain
      const iconMarkup = renderToStaticMarkup(
        <CategoryIcon iconName={iconToUse} color="#000000" size={30} className="w-7 h-7" strokeWidth={2.4} />
      );

      const html = `
        <div class="custom-blip-container" data-spot-id="${spot.id}">
          <!-- Modal / Badge flotante para Robo o Cooldown -->
          <div 
            class="floating-marker-hud ${hudClass}" 
            id="marker-hud-${spot.id}"
            style="display: ${showHud ? 'flex' : 'none'};"
          >
            ${hudContent}
          </div>

          <!-- Circular SVG Progress Ring (Visible during Robbery) -->
          <svg class="radial-progress-svg" style="display: ${showRadialRing ? 'block' : 'none'}">
            <circle
              cx="26"
              cy="26"
              r="${RING_RADIUS}"
              stroke="rgba(239, 68, 68, 0.3)"
              stroke-width="2.5"
              fill="transparent"
            />
            <circle
              id="marker-ring-${spot.id}"
              cx="26"
              cy="26"
              r="${RING_RADIUS}"
              stroke="#ef4444"
              stroke-width="3"
              stroke-dasharray="${RING_CIRCUMFERENCE}"
              stroke-dashoffset="${strokeDashoffset}"
              stroke-linecap="round"
              fill="transparent"
              class="transition-all duration-300"
            />
          </svg>

          <!-- Central Blip Icon: Pure Black Icon with Soft Neon Border Contour -->
          <div 
            id="marker-node-${spot.id}"
            class="blip-icon-node ${stateClass}" 
            style="--neon-color: ${activeColor};"
            title="${spot.name}"
          >
            ${iconMarkup}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html,
        className: 'blip-marker-wrapper',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // DRAGGABLE MARKER: Only draggable when moveMode is active
      const marker = L.marker([lat, lng], {
        icon: customIcon,
        draggable: moveMode
      });

      marker.on('add', () => {
        const el = marker.getElement();
        if (!el) return;
        if (moveMode) {
          el.classList.add('marker-drag-unlocked');
        } else {
          el.classList.remove('marker-drag-unlocked');
        }
      });

      marker.on('dragstart', () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.dragging.disable();
        }
      });

      marker.on('dragend', () => {
        if (leafletMapRef.current) {
          leafletMapRef.current.dragging.enable();
        }
        const newLatLng = marker.getLatLng();

        // Guardar nuevas coordenadas para el mapa activo
        updateSpotCoords(spot.id, activeMapId, {
          lat: Number(newLatLng.lat.toFixed(6)),
          lng: Number(newLatLng.lng.toFixed(6))
        });

        setDragToast(`✓ Posición guardada para ${currentMapConfig.name}`);
        setTimeout(() => setDragToast(''), 3000);
      });

      marker.on('click', (e) => {
        if (e && e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        if (addMode) {
          const clickLatLng = marker.getLatLng();
          setPendingCoords({
            lat: Number(clickLatLng.lat.toFixed(6)),
            lng: Number(clickLatLng.lng.toFixed(6))
          });
          setAddMode(false);
          return;
        }
        if (moveMode) return;
        setSelectedSpot(spot.id);
      });

      markersGroup.addLayer(marker);
    });
  }, [spots, settings, currentMapConfig, searchQuery, enabledCategories, enabledPois, selectedStatusFilter, activeSection, moveMode, addMode, setSelectedSpot, updateSpotCoords, activeTab]);

  // 4. LIVE TICKER: Updates DOM badges directly every 1s without triggering React re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      const currentSpots = spotsRef.current || [];
      currentSpots.forEach(spot => {
        const hudElem = document.getElementById(`marker-hud-${spot.id}`);
        if (!hudElem) return;

        if (spot.status === 'robbing') {
          const robStats = getRemainingRobTime(spot);
          hudElem.style.display = 'flex';
          hudElem.className = 'floating-marker-hud hud-robbing';
          hudElem.innerHTML = `🔴 <span class="font-black">${robStats.percent}%</span> • <span class="font-mono">${formatSeconds(robStats.remaining)}</span>`;

          const ringElem = document.getElementById(`marker-ring-${spot.id}`);
          if (ringElem) {
            const offset = RING_CIRCUMFERENCE - (robStats.percent / 100) * RING_CIRCUMFERENCE;
            ringElem.setAttribute('stroke-dashoffset', offset.toString());
            if (ringElem.parentElement) ringElem.parentElement.style.display = 'block';
          }
        } else if (spot.status === 'cooldown') {
          const cdStats = getRemainingCooldown(spot);
          hudElem.style.display = 'flex';
          hudElem.className = 'floating-marker-hud hud-cooldown';
          hudElem.innerHTML = `⏳ <span class="font-mono font-bold">${formatSeconds(cdStats.remaining)}</span>`;

          const ringElem = document.getElementById(`marker-ring-${spot.id}`);
          if (ringElem && ringElem.parentElement) {
            ringElem.parentElement.style.display = 'none';
          }
        } else {
          hudElem.style.display = 'none';
          const ringElem = document.getElementById(`marker-ring-${spot.id}`);
          if (ringElem && ringElem.parentElement) {
            ringElem.parentElement.style.display = 'none';
          }
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Quick camera presets
  const zoomToArea = (area) => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (area === 'city') {
      map.flyTo([65.2, -127.5], 5.5, { duration: 0.8 });
    } else if (area === 'sandy') {
      map.flyTo([72.5, -120.0], 5.2, { duration: 0.8 });
    } else if (area === 'paleto') {
      map.flyTo([81.0, -112.0], 5.8, { duration: 0.8 });
    } else {
      map.flyTo([68.5, -125.0], 4.5, { duration: 0.8 });
    }
  };

  const robberySpotsCount = spots.filter(s => !isPoiSpot(s)).length;
  const poiSpotsCount = spots.filter(s => isPoiSpot(s)).length;

  return (
    <div
      className="relative w-full h-full flex flex-col overflow-hidden select-none transition-colors duration-300"
      style={{ backgroundColor: currentMapConfig.oceanColor || '#0fa8d2' }}
    >
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">

        {/* Row 1: Left = Compact Switcher, Right = Controls (Desktop bar / Mobile Radial Menu) */}
        <div className="flex items-center justify-between gap-2 pointer-events-auto">
          {/* Compact Section Switcher (Tiendas vs Interés) */}
          <div className="flex items-center p-0.5 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-xl text-[11px] font-bold shrink-0">
            <button
              onClick={() => setActiveSection('robberies')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${activeSection === 'robberies'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Flame className={`w-3.5 h-3.5 ${activeSection === 'robberies' ? 'text-red-300' : 'text-slate-400'}`} />
              <span className="text-xs">Tiendas</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-cyan-300 font-black">
                {robberySpotsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveSection('pois')}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${activeSection === 'pois'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Compass className={`w-3.5 h-3.5 ${activeSection === 'pois' ? 'text-emerald-300' : 'text-slate-400'}`} />
              <span className="text-xs">Interés</span>
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-900/80 text-emerald-300 font-black">
                {poiSpotsCount}
              </span>
            </button>
          </div>

          {/* Desktop Control Bar (Search, Filters, Mover, Añadir) */}
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-xl ml-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeSection === 'robberies' ? "Buscar tienda, 24/7, calle o barrio..." : "Buscar punto de interés (lavado, crafteo...)"}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilterBar(!showFilterBar)}
              className={`p-2 rounded-xl border transition shadow-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${showFilterBar
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-cyan-950/60'
                : 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </button>

            <button
              onClick={() => {
                setMoveMode(!moveMode);
                if (addMode) setAddMode(false);
                setDragToast(!moveMode ? '📍 Modo Mover Activado: Arrastra cualquier blip.' : '🔒 Modo Mover Desactivado.');
                setTimeout(() => setDragToast(''), 2500);
              }}
              className={`p-2 rounded-xl border transition shadow-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${moveMode
                ? 'bg-amber-500 border-amber-300 text-slate-950 font-black animate-pulse shadow-amber-950/80'
                : 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white'
                }`}
            >
              <Move className="w-4 h-4" />
              <span>{moveMode ? 'Mover Activo' : 'Mover'}</span>
            </button>

            <button
              onClick={() => {
                setAddMode(!addMode);
                if (moveMode) setMoveMode(false);
              }}
              className={`p-2 rounded-xl border transition shadow-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${addMode
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                : 'bg-slate-900/90 backdrop-blur-md border-slate-700/80 text-slate-300 hover:text-white'
                }`}
            >
              <Plus className="w-4 h-4" />
              <span>{addMode ? 'Toca el mapa...' : 'Añadir'}</span>
            </button>
          </div>

          {/* Mobile Floating Radial Menu in Top-Right Corner */}
          <div className="relative sm:hidden pointer-events-auto">
            {/* Backdrop to close radial menu when clicking outside */}
            {showRadialMenu && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowRadialMenu(false)}
              />
            )}

            {/* Radial Action Buttons: Spread out in a 90° to 180° arc */}
            {/* 1. Buscador (Search) -> 180° (pure left) */}
            <button
              type="button"
              onClick={() => {
                setShowMobileSearch(!showMobileSearch);
                setShowRadialMenu(false);
              }}
              style={{
                transform: showRadialMenu ? 'translate(-70px, 0px) scale(1)' : 'translate(0px, 0px) scale(0.3)',
                opacity: showRadialMenu ? 1 : 0,
                pointerEvents: showRadialMenu ? 'auto' : 'none',
                transitionDelay: showRadialMenu ? '50ms' : '0ms'
              }}
              className={`absolute top-0.5 right-0.5 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 z-20 ${showMobileSearch || searchQuery
                ? 'bg-cyan-600 border-cyan-300 text-white shadow-cyan-950/60'
                : 'bg-slate-900/95 border-slate-700/90 text-slate-200 hover:text-white'
                }`}
              title="Buscar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* 2. Filtros (Filters) -> 150° (down-left) */}
            <button
              type="button"
              onClick={() => {
                setShowFilterBar(!showFilterBar);
                setShowRadialMenu(false);
              }}
              style={{
                transform: showRadialMenu ? 'translate(-61px, 35px) scale(1)' : 'translate(0px, 0px) scale(0.3)',
                opacity: showRadialMenu ? 1 : 0,
                pointerEvents: showRadialMenu ? 'auto' : 'none',
                transitionDelay: showRadialMenu ? '100ms' : '0ms'
              }}
              className={`absolute top-0.5 right-0.5 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 z-20 ${showFilterBar
                ? 'bg-cyan-600 border-cyan-300 text-white shadow-cyan-950/60'
                : 'bg-slate-900/95 border-slate-700/90 text-slate-200 hover:text-white'
                }`}
              title="Filtros"
            >
              <Filter className="w-4 h-4" />
            </button>

            {/* 3. Mover (Move) -> 120° (down-left steep) */}
            <button
              type="button"
              onClick={() => {
                setMoveMode(!moveMode);
                if (addMode) setAddMode(false);
                setDragToast(!moveMode ? '📍 Modo Mover Activado: Arrastra cualquier blip.' : '🔒 Modo Mover Desactivado.');
                setTimeout(() => setDragToast(''), 2500);
                setShowRadialMenu(false);
              }}
              style={{
                transform: showRadialMenu ? 'translate(-35px, 61px) scale(1)' : 'translate(0px, 0px) scale(0.3)',
                opacity: showRadialMenu ? 1 : 0,
                pointerEvents: showRadialMenu ? 'auto' : 'none',
                transitionDelay: showRadialMenu ? '150ms' : '0ms'
              }}
              className={`absolute top-0.5 right-0.5 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 z-20 ${moveMode
                ? 'bg-amber-500 border-amber-300 text-slate-950 font-black animate-pulse shadow-amber-950/80'
                : 'bg-slate-900/95 border-slate-700/90 text-slate-200 hover:text-white'
                }`}
              title="Modo Mover"
            >
              <Move className="w-4 h-4" />
            </button>

            {/* 4. Añadir (Add) -> 90° (pure down) */}
            <button
              type="button"
              onClick={() => {
                setAddMode(!addMode);
                if (moveMode) setMoveMode(false);
                setShowRadialMenu(false);
              }}
              style={{
                transform: showRadialMenu ? 'translate(0px, 70px) scale(1)' : 'translate(0px, 0px) scale(0.3)',
                opacity: showRadialMenu ? 1 : 0,
                pointerEvents: showRadialMenu ? 'auto' : 'none',
                transitionDelay: showRadialMenu ? '200ms' : '0ms'
              }}
              className={`absolute top-0.5 right-0.5 w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 z-20 ${addMode
                ? 'bg-emerald-600 border-emerald-400 text-white animate-pulse'
                : 'bg-slate-900/95 border-slate-700/90 text-slate-200 hover:text-white'
                }`}
              title="Añadir Blip"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Main Trigger Button */}
            <button
              type="button"
              onClick={() => setShowRadialMenu(!showRadialMenu)}
              className={`relative w-11 h-11 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-30 cursor-pointer ${showRadialMenu
                ? 'bg-slate-900 border-2 border-cyan-400 text-cyan-300 rotate-90 scale-105 shadow-cyan-950/60'
                : moveMode
                  ? 'bg-amber-500 border-2 border-amber-300 text-slate-950 font-black animate-pulse shadow-amber-950/80'
                  : addMode
                    ? 'bg-emerald-600 border-2 border-emerald-300 text-white animate-pulse shadow-emerald-950/80'
                    : 'bg-slate-950/95 border border-slate-700/90 text-white shadow-xl hover:scale-105'
                }`}
              title="Acciones del Mapa"
            >
              {showRadialMenu ? (
                <X className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <Plus className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Search Bar (expands smoothly when search icon tapped) */}
        {showMobileSearch && (
          <div className="sm:hidden flex items-center gap-2 p-1.5 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/60 rounded-xl shadow-2xl animate-in slide-in-from-top-2 pointer-events-auto">
            <Search className="w-4 h-4 text-cyan-400 ml-1.5 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder={activeSection === 'robberies' ? "Buscar tienda, 24/7, calle..." : "Buscar punto (lavado, crafteo...)"}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent px-2 py-1 text-xs text-white placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-white text-xs">✕</button>
            )}
            <button
              onClick={() => { setShowMobileSearch(false); setSearchQuery(''); }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Collapsible Filter Bar */}
        {showFilterBar && (
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-xl p-3.5 shadow-2xl space-y-3 pointer-events-auto animate-in slide-in-from-top-2">

            {activeSection === 'robberies' ? (
              <>
                {/* Status Filter for Robberies */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase">Estado:</span>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'available', label: '🟢 Disponibles' },
                    { id: 'robbing', label: '🔴 Robando' },
                    { id: 'cooldown', label: '⏳ Cooldown' }
                  ].map(st => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStatusFilter(st.id)}
                      className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${selectedStatusFilter === st.id
                        ? 'bg-cyan-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Robbery Category Multi-Select Filter */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Tiendas visibles:</span>
                      <span className="text-cyan-400 font-mono font-black">
                        ({Object.values(enabledCategories).filter(Boolean).length}/{Object.keys(settings.categories || {}).length})
                      </span>
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowAddRobberyCategoryInput(!showAddRobberyCategoryInput)}
                        className="px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                        title="Añadir nueva categoría de tienda de robo"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Nueva</span>
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={selectAllCategories}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer"
                      >
                        Todos
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={deselectAllCategories}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                      >
                        Ninguno
                      </button>
                    </div>
                  </div>

                  {/* Inline creation form for Robbery category */}
                  {showAddRobberyCategoryInput && (
                    <form onSubmit={handleCreateRobberyCategory} className="flex items-center gap-1.5 p-2 bg-slate-950 rounded-xl border border-cyan-500/50 shadow-lg animate-in fade-in duration-150">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Nombre de la nueva tienda (ej. Armería, Licorería 2...)"
                        value={newRobberyCategoryName}
                        onChange={e => setNewRobberyCategoryName(e.target.value)}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        disabled={!newRobberyCategoryName.trim()}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition"
                      >
                        Crear
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddRobberyCategoryInput(false); setNewRobberyCategoryName(''); }}
                        className="p-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    </form>
                  )}

                  {/* Multiselect Chips */}
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {Object.values(settings.categories || {}).map(cat => {
                      const isEnabled = enabledCategories[cat.id] !== false;
                      const displayName = cat.id === 'badulaque' ? '24/7' : cat.shortName || cat.name;
                      const spotCount = spots.filter(s => s.category === cat.id && !isPoiSpot(s)).length;

                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${isEnabled
                            ? 'bg-slate-800/90 text-white shadow-md'
                            : 'bg-slate-950/40 text-slate-500 border-slate-800 opacity-40 hover:opacity-75'
                            }`}
                          style={{ borderColor: isEnabled ? `${cat.color}60` : undefined }}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span>{displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({spotCount})</span>
                          <span className={`text-[10px] font-black ${isEnabled ? 'text-emerald-400' : 'text-slate-600'}`}>
                            {isEnabled ? '✓' : '✕'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* POI Category Multi-Select Filter */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Puntos de Interés visibles:</span>
                    <span className="text-emerald-400 font-mono font-black">
                      ({Object.values(enabledPois).filter(Boolean).length}/{Object.keys(settings.poiCategories || {}).length})
                    </span>
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowAddPoiCategoryInput(!showAddPoiCategoryInput)}
                      className="px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition"
                      title="Añadir nuevo punto de interés"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nuevo</span>
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={selectAllCategories}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                    >
                      Todos
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={deselectAllCategories}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                    >
                      Ninguno
                    </button>
                  </div>
                </div>

                {/* Inline creation form for POI category */}
                {showAddPoiCategoryInput && (
                  <form onSubmit={handleCreatePoiCategory} className="flex items-center gap-1.5 p-2 bg-slate-950 rounded-xl border border-emerald-500/50 shadow-lg animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Nombre del Punto (ej. Lavado 2, Desguace, Taller...)"
                      value={newPoiCategoryName}
                      onChange={e => setNewPoiCategoryName(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                    <button
                      type="submit"
                      disabled={!newPoiCategoryName.trim()}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs cursor-pointer transition"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddPoiCategoryInput(false); setNewPoiCategoryName(''); }}
                      className="p-1.5 text-slate-400 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </form>
                )}

                {/* Multiselect POI Chips */}
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {Object.values(settings.poiCategories || {}).map(poi => {
                    const isEnabled = enabledPois[poi.id] !== false;
                    const spotCount = spots.filter(s => s.category === poi.id || (s.type === 'poi' && s.category === poi.id)).length;

                    return (
                      <button
                        key={poi.id}
                        type="button"
                        onClick={() => togglePoiCategory(poi.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border cursor-pointer ${isEnabled
                          ? 'bg-slate-800/90 text-white shadow-md'
                          : 'bg-slate-950/40 text-slate-500 border-slate-800 opacity-40 hover:opacity-75'
                          }`}
                        style={{ borderColor: isEnabled ? `${poi.color}60` : undefined }}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: poi.color }}
                        />
                        <span>{poi.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({spotCount})</span>
                        <span className={`text-[10px] font-black ${isEnabled ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {isEnabled ? '✓' : '✕'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* DRAG & DROP FLOATING TOAST FEEDBACK */}
      {dragToast && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[2500] max-w-sm w-[90%] bg-slate-900/95 backdrop-blur-xl border border-cyan-400 px-4 py-2.5 rounded-2xl shadow-2xl shadow-cyan-950/80 text-xs font-bold text-white text-center animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none flex items-center justify-center gap-2">
          <Move className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>{dragToast}</span>
        </div>
      )}

      {/* AÑADIR PUNTO INSTRUCTION BANNER */}
      {addMode && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[2500] max-w-sm w-[90%] bg-emerald-950/90 backdrop-blur-xl border-2 border-emerald-400 px-4 py-2.5 rounded-2xl shadow-2xl shadow-emerald-950/80 text-xs font-black text-white text-center animate-in fade-in slide-in-from-top-3 duration-200 pointer-events-none flex items-center justify-center gap-2">
          <Plus className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>Toca cualquier punto del mapa para ubicar {activeSection === 'pois' ? 'el Punto de Interés' : 'la Tienda de Robo'}</span>
        </div>
      )}

      {/* Map Target Canvas */}
      <div
        ref={mapContainerRef}
        className="w-full h-full transition-colors duration-300"
        style={{ backgroundColor: currentMapConfig.oceanColor || '#0fa8d2' }}
      />

      {/* Bottom-Left Controls: Quick Map Style Switcher (Atlas / Satelital / Road) - Elevated well above Docker with Portal and z-[2500] so it is never behind docker */}
      {activeTab === 'map' && createPortal(
        <div className="fixed bottom-24 sm:bottom-6 left-3.5 z-[2500] flex items-center gap-1 pointer-events-auto select-none">
          <div className="bg-slate-950/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-1 flex items-center gap-1 shadow-2xl shadow-cyan-950/80">
            {Object.values(MAP_CONFIGS).map(mapItem => (
              <button
                key={mapItem.id}
                onClick={() => switchMap(mapItem.id)}
                className={`px-2.5 py-1.5 rounded-lg font-bold font-tactical transition cursor-pointer text-xs ${(settings.currentMap || 'atlas') === mapItem.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                title={mapItem.name}
              >
                {mapItem.id === 'atlas' ? 'ATLAS' : mapItem.id === 'satellite' ? 'SAT' : 'ROAD'}
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}



      {/* Modal interactivo con combobox para añadir nuevo punto */}
      <AddSpotModal
        coords={pendingCoords}
        initialSection={activeSection}
        onClose={() => setPendingCoords(null)}
      />
    </div>
  );
};
