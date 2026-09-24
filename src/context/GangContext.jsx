import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { DEFAULT_SPOTS } from '../data/defaultSpots';
import { DEFAULT_SETTINGS, MAP_CONFIGS } from '../data/defaultSettings';
import { soundManager } from '../utils/soundAlerts';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc, updateDoc, deleteField } from 'firebase/firestore';

const GangContext = createContext(null);
const ROOM_ID = 'animals_city';

export const GangProvider = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('gang_tracker_settings_v1');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load settings:', e);
    }
    return DEFAULT_SETTINGS;
  });

  // 2. Member Profile & Presence state
  const [memberId] = useState(() => {
    let id = localStorage.getItem('gang_member_id');
    if (!id) {
      id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      localStorage.setItem('gang_member_id', id);
    }
    return id;
  });

  const [memberName, setMemberName] = useState(() => {
    return localStorage.getItem('gang_member_name') || '';
  });

  const [members, setMembers] = useState({});
  const [showRosterModal, setShowRosterModal] = useState(false);

  // Admin & Access Control State
  const [adminConfig, setAdminConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('gang_admin_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      adminPin: '2026',
      whitelistEnabled: false,
      allowedMembers: ['Héctor'],
      gangPasswordEnabled: false,
      gangPassword: '',
      bannedNames: []
    };
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('gang_is_admin') === 'true';
  });

  const [showAdminModal, setShowAdminModal] = useState(false);

  // 3. Spots state
  const [spots, setSpots] = useState(() => {
    try {
      const saved = localStorage.getItem('gang_tracker_spots_v2_tiles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0].lat === 'number') {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load spots:', e);
    }
    return DEFAULT_SPOTS.map(s => ({
      ...s,
      status: 'available',
      robStartedAt: null,
      robDuration: null,
      robbedBy: null,
      cooldownStartedAt: null,
      cooldownDuration: null
    }));
  });

  // 4. Selection & View state
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [alerts, setAlerts] = useState([]);
  const [tick, setTick] = useState(0);
  const [syncStatus, setSyncStatus] = useState('connecting');

  const selectedSpot = spots.find(s => s.id === selectedSpotId) || null;

  const setSelectedSpot = (spotOrId) => {
    if (!spotOrId) {
      setSelectedSpotId(null);
    } else if (typeof spotOrId === 'string') {
      setSelectedSpotId(spotOrId);
    } else {
      setSelectedSpotId(spotOrId.id);
    }
  };

  const saveMemberName = (newName) => {
    setMemberName(newName);
    localStorage.setItem('gang_member_name', newName);
    sendHeartbeat(newName);
  };

  // Keep refs for interval and async handlers
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const spotsRef = useRef(spots);
  spotsRef.current = spots;
  const memberNameRef = useRef(memberName);
  memberNameRef.current = memberName;
  const membersRef = useRef(members);
  membersRef.current = members;
  const adminConfigRef = useRef(adminConfig);
  adminConfigRef.current = adminConfig;

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('gang_tracker_settings_v1', JSON.stringify(settings));
    } catch (e) {
      // ignore
    }
  }, [settings]);

  // Persist spots locally
  useEffect(() => {
    try {
      localStorage.setItem('gang_tracker_spots_v2_tiles', JSON.stringify(spots));
    } catch (e) {
      // ignore
    }
  }, [spots]);

  // Admin Management Actions
  const unlockAdmin = (inputPin) => {
    const currentPin = adminConfigRef.current?.adminPin || '2026';
    if (inputPin === currentPin) {
      setIsAdmin(true);
      localStorage.setItem('gang_is_admin', 'true');
      return { success: true };
    }
    return { success: false, error: 'PIN incorrecto. Intenta de nuevo.' };
  };

  const lockAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('gang_is_admin');
  };

  const updateAdminConfig = async (updates) => {
    const nextConfig = { ...adminConfigRef.current, ...updates };
    setAdminConfig(nextConfig);
    try {
      localStorage.setItem('gang_admin_config', JSON.stringify(nextConfig));
    } catch (e) {}
    if (!db) return;
    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      await setDoc(roomRef, {
        adminConfig: nextConfig
      }, { merge: true });
    } catch (e) {
      console.warn('Error saving adminConfig:', e);
    }
  };

  const deleteMember = async (targetMemberId) => {
    setMembers(prev => {
      const next = { ...prev };
      delete next[targetMemberId];
      return next;
    });
    if (!db) return;
    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      await updateDoc(roomRef, {
        [`members.${targetMemberId}`]: deleteField()
      });
    } catch (e) {
      try {
        const nextMembers = { ...membersRef.current };
        delete nextMembers[targetMemberId];
        await setDoc(roomRef, { members: nextMembers }, { merge: true });
      } catch (err) {}
    }
  };

  const banMember = async (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const currentBanned = adminConfigRef.current?.bannedNames || [];
    if (!currentBanned.some(b => b.toLowerCase() === trimmed.toLowerCase())) {
      const nextBanned = [...currentBanned, trimmed];
      await updateAdminConfig({ bannedNames: nextBanned });
    }
    const current = membersRef.current || {};
    const updates = {};
    Object.values(current).forEach(m => {
      if (m.name && m.name.toLowerCase() === trimmed.toLowerCase()) {
        updates[`members.${m.id}`] = deleteField();
      }
    });
    if (db && Object.keys(updates).length > 0) {
      try {
        const roomRef = doc(db, 'gang_rooms', ROOM_ID);
        await updateDoc(roomRef, updates);
      } catch (e) {}
    }
  };

  const unbanMember = async (name) => {
    const trimmed = (name || '').trim();
    const nextBanned = (adminConfigRef.current?.bannedNames || []).filter(b => b.toLowerCase() !== trimmed.toLowerCase());
    await updateAdminConfig({ bannedNames: nextBanned });
  };

  const addAllowedMember = async (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const currentAllowed = adminConfigRef.current?.allowedMembers || [];
    if (!currentAllowed.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
      const nextAllowed = [...currentAllowed, trimmed];
      await updateAdminConfig({ allowedMembers: nextAllowed });
    }
  };

  const removeAllowedMember = async (name) => {
    const trimmed = (name || '').trim();
    const nextAllowed = (adminConfigRef.current?.allowedMembers || []).filter(a => a.toLowerCase() !== trimmed.toLowerCase());
    await updateAdminConfig({ allowedMembers: nextAllowed });
  };

  const cleanupDuplicateMembers = async () => {
    const current = membersRef.current || {};
    const seen = new Map();
    const toKeep = {};
    const toDeleteIds = [];

    Object.values(current)
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
      .forEach(m => {
        const norm = (m.name || '').trim().toLowerCase();
        if (!norm) {
          toDeleteIds.push(m.id);
          return;
        }
        if (!seen.has(norm)) {
          seen.set(norm, m.id);
          toKeep[m.id] = m;
        } else {
          toDeleteIds.push(m.id);
        }
      });

    setMembers(toKeep);
    if (!db || toDeleteIds.length === 0) return;
    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      const updates = {};
      toDeleteIds.forEach(id => {
        updates[`members.${id}`] = deleteField();
      });
      await updateDoc(roomRef, updates);
    } catch (e) {}
  };

  const cleanupOfflineMembers = async (hours = 12) => {
    const current = membersRef.current || {};
    const cutoff = Date.now() - (hours * 3600 * 1000);
    const toDeleteIds = [];
    const toKeep = {};

    Object.values(current).forEach(m => {
      if (m.lastSeen && m.lastSeen >= cutoff) {
        toKeep[m.id] = m;
      } else {
        toDeleteIds.push(m.id);
      }
    });

    setMembers(toKeep);
    if (!db || toDeleteIds.length === 0) return;
    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      const updates = {};
      toDeleteIds.forEach(id => {
        updates[`members.${id}`] = deleteField();
      });
      await updateDoc(roomRef, updates);
    } catch (e) {}
  };

  const sendHeartbeat = async (nameToUse) => {
    if (!db) return;
    const name = (nameToUse || memberName || '').trim();
    if (!name) return;

    // Check if name is banned
    if (adminConfigRef.current?.bannedNames?.some(b => b.toLowerCase() === name.toLowerCase())) {
      setMemberName('');
      localStorage.removeItem('gang_member_name');
      return;
    }

    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      const updates = {
        [`members.${memberId}`]: {
          id: memberId,
          name: name,
          lastSeen: Date.now()
        }
      };

      // Auto-purge any duplicate ghost sessions sharing the same name
      const current = membersRef.current || {};
      Object.values(current).forEach(m => {
        if (m.id !== memberId && m.name && m.name.toLowerCase() === name.toLowerCase()) {
          updates[`members.${m.id}`] = deleteField();
        }
      });

      await updateDoc(roomRef, updates);
    } catch (e) {
      try {
        await setDoc(roomRef, {
          members: {
            [memberId]: {
              id: memberId,
              name: name,
              lastSeen: Date.now()
            }
          }
        }, { merge: true });
      } catch (err) {}
    }
  };

  // ================= FIRESTORE REAL-TIME WEBSOCKET LISTENER =================
  useEffect(() => {
    if (!db) {
      setSyncStatus('local');
      return;
    }

    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      const unsubscribe = onSnapshot(roomRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            if (Array.isArray(data.spots) && data.spots.length > 0) {
              if (typeof data.spots[0].lat === 'number') {
                setSpots(data.spots);
              } else {
                // Si la base de datos tiene datos del mapa anterior, migrar a los 60 blips oficiales
                const initialV2 = DEFAULT_SPOTS.map(s => ({
                  ...s,
                  status: 'available',
                  robStartedAt: null,
                  robDuration: null,
                  robbedBy: null,
                  cooldownStartedAt: null,
                  cooldownDuration: null
                }));
                broadcastSpots(initialV2);
              }
            }
            if (data.adminConfig && typeof data.adminConfig === 'object') {
              setAdminConfig(prev => ({
                ...prev,
                ...data.adminConfig
              }));
            }
            if (data.members && typeof data.members === 'object') {
              // Deduplicate by name so multiple cards never show for the same person
              const seen = new Map();
              const deduped = {};
              Object.values(data.members)
                .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0))
                .forEach(m => {
                  const norm = (m.name || '').trim().toLowerCase();
                  if (norm && !seen.has(norm)) {
                    seen.set(norm, m.id);
                    deduped[m.id] = m;
                  }
                });
              setMembers(deduped);
            }
            setSyncStatus('connected');
          }
        } else {
          setDoc(roomRef, {
            spots: spotsRef.current,
            updatedAt: Date.now(),
            members: {},
            adminConfig: adminConfigRef.current
          }, { merge: true }).catch(err => {
            console.warn('Init room error:', err);
          });
          setSyncStatus('connected');
        }
      }, (err) => {
        console.warn('Firestore subscription (modo local hasta activar base de datos):', err.message);
        setSyncStatus('local');
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase error:', e);
      setSyncStatus('local');
    }
  }, []);

  // Send periodic presence heartbeat every 25 seconds
  useEffect(() => {
    if (memberName) {
      sendHeartbeat(memberName);
    }
    const heartbeatTimer = setInterval(() => {
      if (memberNameRef.current) {
        sendHeartbeat(memberNameRef.current);
      }
    }, 25000);

    return () => clearInterval(heartbeatTimer);
  }, [memberName]);

  // Helper to push updates to Firestore so all friends see it live
  const broadcastSpots = async (newSpots) => {
    setSpots(newSpots);
    if (!db) return;
    try {
      const roomRef = doc(db, 'gang_rooms', ROOM_ID);
      await setDoc(roomRef, {
        spots: newSpots,
        updatedAt: Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('Broadcast to firestore failed:', e.message);
    }
  };

  // Real-time ticking engine: ticks every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      let stateChanged = false;
      const newAlerts = [];

      setTick(t => t + 1);

      const updated = spotsRef.current.map(spot => {
        // 1. Robo en curso
        if (spot.status === 'robbing') {
          const duration = spot.robDuration || 60;
          const elapsed = (now - spot.robStartedAt) / 1000;
          if (elapsed >= duration) {
            stateChanged = true;
            const catSettings = settingsRef.current?.categories?.[spot.category] || {};
            const cooldownTime = catSettings.cooldownTime || 1800;
            
            soundManager.playTick('high');
            return {
              ...spot,
              status: 'cooldown',
              robStartedAt: null,
              robDuration: null,
              cooldownStartedAt: now,
              cooldownDuration: cooldownTime
            };
          }
        }

        // 2. Cooldown en curso
        if (spot.status === 'cooldown') {
          const duration = spot.cooldownDuration || 1800;
          const elapsed = (now - spot.cooldownStartedAt) / 1000;
          if (elapsed >= duration) {
            stateChanged = true;
            newAlerts.push({
              id: `${spot.id}-${now}`,
              spotId: spot.id,
              name: spot.name,
              zone: spot.zone,
              category: spot.category,
              timestamp: now
            });

            return {
              ...spot,
              status: 'available',
              robStartedAt: null,
              robDuration: null,
              cooldownStartedAt: null,
              cooldownDuration: null
            };
          }
        }

        return spot;
      });

      if (stateChanged) {
        broadcastSpots(updated);
      }

      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 10));
        if (settingsRef.current.soundEnabled) {
          soundManager.playAlarm(settingsRef.current.soundType, settingsRef.current.soundVolume);
        }
        // Vibrate mobile device on store release
        soundManager.vibrate([300, 150, 300, 150, 400]);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Action: Iniciar Robo (Atribuido al miembro actual)
  const startRobbery = (spotId) => {
    soundManager.initContext();
    const now = Date.now();
    const currentAuthor = memberName || 'Compañero';
    const updated = spots.map(s => {
      if (s.id === spotId) {
        const catConfig = settings.categories?.[s.category] || {};
        const robDuration = catConfig.robTime || 90;
        return {
          ...s,
          status: 'robbing',
          robStartedAt: now,
          robDuration: robDuration,
          robbedBy: currentAuthor,
          cooldownStartedAt: null,
          cooldownDuration: null
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Cancelar Robo
  const cancelRobbery = (spotId) => {
    const updated = spots.map(s => {
      if (s.id === spotId) {
        return {
          ...s,
          status: 'available',
          robStartedAt: null,
          robDuration: null,
          robbedBy: null,
          cooldownStartedAt: null,
          cooldownDuration: null
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Finalizar Robo Manualmente e ir a Cooldown
  const finishRobberyNow = (spotId) => {
    const now = Date.now();
    const updated = spots.map(s => {
      if (s.id === spotId) {
        const catConfig = settings.categories?.[s.category] || {};
        const cooldownTime = catConfig.cooldownTime || 1800;
        return {
          ...s,
          status: 'cooldown',
          robStartedAt: null,
          robDuration: null,
          cooldownStartedAt: now,
          cooldownDuration: cooldownTime
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Poner en Disponible Inmediatamente
  const resetCooldown = (spotId) => {
    const updated = spots.map(s => {
      if (s.id === spotId) {
        return {
          ...s,
          status: 'available',
          robStartedAt: null,
          robDuration: null,
          robbedBy: null,
          cooldownStartedAt: null,
          cooldownDuration: null
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Reiniciar Cooldown desde cero
  const restartCooldown = (spotId, customSeconds = null) => {
    const now = Date.now();
    const updated = spots.map(s => {
      if (s.id === spotId) {
        const catConfig = settings.categories?.[s.category] || {};
        const duration = customSeconds || catConfig.cooldownTime || 1800;
        return {
          ...s,
          status: 'cooldown',
          robStartedAt: null,
          robDuration: null,
          cooldownStartedAt: now,
          cooldownDuration: duration
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Establecer Cooldown al momento
  const setCustomCooldown = (spotId, minutes) => {
    const duration = Math.max(10, Math.round(minutes * 60));
    const now = Date.now();
    const updated = spots.map(s => {
      if (s.id === spotId) {
        return {
          ...s,
          status: 'cooldown',
          robStartedAt: null,
          robDuration: null,
          cooldownStartedAt: now,
          cooldownDuration: duration
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Ajustar Cooldown (+ / - minutos)
  const adjustCooldown = (spotId, deltaMinutes) => {
    const updated = spots.map(s => {
      if (s.id === spotId) {
        const currentRemaining = s.status === 'cooldown' && s.cooldownStartedAt
          ? Math.max(0, s.cooldownDuration - (Date.now() - s.cooldownStartedAt) / 1000)
          : (settings.categories?.[s.category]?.cooldownTime || 1800);
        const newRemaining = Math.max(10, currentRemaining + deltaMinutes * 60);
        return {
          ...s,
          status: 'cooldown',
          robStartedAt: null,
          robDuration: null,
          cooldownStartedAt: Date.now(),
          cooldownDuration: Math.round(newRemaining)
        };
      }
      return s;
    });
    broadcastSpots(updated);
  };

  // Action: Añadir nuevo punto personalizado
  const addCustomSpot = (newSpot) => {
    const activeMap = settings.currentMap || 'atlas';
    const spot = {
      id: `custom-${Date.now()}`,
      name: newSpot.name || 'Nuevo Blip',
      category: newSpot.category || 'badulaque',
      type: newSpot.type || (settings.poiCategories?.[newSpot.category] ? 'poi' : 'robbery'),
      zone: newSpot.zone || 'Los Santos',
      description: newSpot.description || '',
      lat: Number(newSpot.lat.toFixed(6)),
      lng: Number(newSpot.lng.toFixed(6)),
      mapCoords: {
        [activeMap]: { lat: Number(newSpot.lat.toFixed(6)), lng: Number(newSpot.lng.toFixed(6)) },
        ...(newSpot.mapCoords || {})
      },
      status: 'available',
      robStartedAt: null,
      robDuration: null,
      robbedBy: null,
      cooldownStartedAt: null,
      cooldownDuration: null
    };
    const updated = [spot, ...spots];
    broadcastSpots(updated);
    return spot;
  };

  // Action: Mover punto y guardar coordenadas fijas para un mapa específico
  const updateSpotCoords = useCallback((spotId, mapId, newCoords) => {
    const currentSpots = spotsRef.current || [];
    const targetCoords = {
      lat: Number(newCoords.lat.toFixed(6)),
      lng: Number(newCoords.lng.toFixed(6))
    };
    const updated = currentSpots.map(s => {
      if (s.id !== spotId) return s;
      const currentMapCoords = s.mapCoords || {};
      const newMapCoords = {
        ...currentMapCoords,
        [mapId]: targetCoords
      };
      return {
        ...s,
        lat: targetCoords.lat,
        lng: targetCoords.lng,
        mapCoords: newMapCoords
      };
    });
    spotsRef.current = updated;
    setSpots(updated);
    try {
      localStorage.setItem('gang_tracker_spots_v2_tiles', JSON.stringify(updated));
    } catch (e) {}
    broadcastSpots(updated);
  }, []);

  // Action: Modificar o mover punto
  const updateSpot = (spotId, updates) => {
    const updated = spots.map(s => s.id === spotId ? { ...s, ...updates } : s);
    broadcastSpots(updated);
  };

  // Action: Crear nueva categoría al vuelo ('robbery' o 'poi')
  const createCategory = (type, name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return null;
    const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#a855f7', '#3b82f6', '#ef4444', '#14b8a6', '#f97316'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];

    if (type === 'robbery') {
      const cleanId = 'rob_' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
      const newCat = {
        id: cleanId,
        name: trimmed,
        shortName: trimmed.slice(0, 10),
        robTime: 90,
        cooldownTime: 1800,
        approxRewardBlack: 25000,
        icon: 'Store',
        color: chosenColor,
        minCops: 2,
        allowedVehicles: 'F, E, D, C',
        rehenes: 'NPC / Civil',
        description: `Robo a ${trimmed}`
      };
      setSettings(prev => ({
        ...prev,
        categories: {
          ...prev.categories,
          [cleanId]: newCat
        },
        filterCategories: {
          ...prev.filterCategories,
          [cleanId]: true
        }
      }));
      return newCat;
    } else {
      const cleanId = 'poi_' + trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
      const newPoi = {
        id: cleanId,
        name: trimmed,
        shortName: trimmed.slice(0, 10),
        icon: 'MapPin',
        color: chosenColor,
        description: `Punto de interés: ${trimmed}`
      };
      setSettings(prev => ({
        ...prev,
        poiCategories: {
          ...(prev.poiCategories || {}),
          [cleanId]: newPoi
        },
        filterPois: {
          ...(prev.filterPois || {}),
          [cleanId]: true
        }
      }));
      return newPoi;
    }
  };

  // Action: Eliminar categoría de Robo
  const deleteCategory = (catId) => {
    setSettings(prev => {
      const nextCategories = { ...prev.categories };
      delete nextCategories[catId];
      const nextFilters = { ...prev.filterCategories };
      delete nextFilters[catId];
      return {
        ...prev,
        categories: nextCategories,
        filterCategories: nextFilters
      };
    });
  };

  // Action: Añadir nueva categoría de Punto de Interés (POI)
  const addPoiCategory = (poiData) => {
    setSettings(prev => ({
      ...prev,
      poiCategories: {
        ...(prev.poiCategories || {}),
        [poiData.id]: poiData
      },
      filterPois: {
        ...(prev.filterPois || {}),
        [poiData.id]: true
      }
    }));
  };

  // Action: Actualizar categoría de Punto de Interés
  const updatePoiCategory = (poiId, updates) => {
    setSettings(prev => ({
      ...prev,
      poiCategories: {
        ...(prev.poiCategories || {}),
        [poiId]: {
          ...(prev.poiCategories?.[poiId] || {}),
          ...updates
        }
      }
    }));
  };

  // Action: Eliminar categoría de Punto de Interés
  const deletePoiCategory = (poiId) => {
    setSettings(prev => {
      const nextPois = { ...(prev.poiCategories || {}) };
      delete nextPois[poiId];
      const nextFilters = { ...(prev.filterPois || {}) };
      delete nextFilters[poiId];
      return {
        ...prev,
        poiCategories: nextPois,
        filterPois: nextFilters
      };
    });
  };

  // Action: Eliminar punto
  const deleteSpot = (spotId) => {
    const updated = spots.filter(s => s.id !== spotId);
    if (selectedSpotId === spotId) {
      setSelectedSpotId(null);
    }
    broadcastSpots(updated);
  };

  // Action: Restaurar todos los puntos de fábrica
  const resetAllSpots = () => {
    const restored = DEFAULT_SPOTS.map(s => ({
      ...s,
      status: 'available',
      robStartedAt: null,
      robDuration: null,
      robbedBy: null,
      cooldownStartedAt: null,
      cooldownDuration: null
    }));
    broadcastSpots(restored);
  };

  // Action: Actualizar configuración
  const updateCategorySettings = (catId, updates) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [catId]: {
          ...prev.categories[catId],
          ...updates
        }
      }
    }));
  };

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  // Switch map
  const switchMap = (mapId) => {
    if (MAP_CONFIGS[mapId]) {
      setSettings(prev => ({ ...prev, currentMap: mapId }));
    }
  };

  // Action: Actualizar configuración general y sincronizar duraciones activas automáticamente
  const handleUpdateSettings = (newSettingsOrUpdater) => {
    setSettings(prev => {
      const next = typeof newSettingsOrUpdater === 'function' ? newSettingsOrUpdater(prev) : newSettingsOrUpdater;

      // Auto-update any active robberies or cooldowns to reflect new category duration
      setSpots(prevSpots => {
        let changed = false;
        const updated = prevSpots.map(spot => {
          if (spot.status === 'robbing') {
            const newRobTime = next?.categories?.[spot.category]?.robTime;
            if (newRobTime && spot.robDuration !== newRobTime) {
              changed = true;
              return { ...spot, robDuration: newRobTime };
            }
          } else if (spot.status === 'cooldown') {
            const newCooldown = next?.categories?.[spot.category]?.cooldownTime;
            if (newCooldown && spot.cooldownDuration !== newCooldown) {
              changed = true;
              return { ...spot, cooldownDuration: newCooldown };
            }
          }
          return spot;
        });

        if (changed) {
          broadcastSpots(updated);
          return updated;
        }
        return prevSpots;
      });

      return next;
    });
  };

  return (
    <GangContext.Provider
      value={{
        spots,
        tick,
        syncStatus,
        memberId,
        memberName,
        saveMemberName,
        members,
        showRosterModal,
        setShowRosterModal,
        settings,
        setSettings: handleUpdateSettings,
        updateCategorySettings,
        switchMap,
        currentMapConfig: MAP_CONFIGS[settings.currentMap] || MAP_CONFIGS.atlas,
        selectedSpot,
        setSelectedSpot,
        activeTab,
        setActiveTab,
        alerts,
        dismissAlert,
        clearAllAlerts,
        startRobbery,
        cancelRobbery,
        finishRobberyNow,
        resetCooldown,
        restartCooldown,
        setCustomCooldown,
        adjustCooldown,
        addCustomSpot,
        updateSpot,
        updateSpotCoords,
        addPoiCategory,
        updatePoiCategory,
        deletePoiCategory,
        createCategory,
        deleteCategory,
        deleteSpot,
        resetAllSpots,
        adminConfig,
        isAdmin,
        showAdminModal,
        setShowAdminModal,
        unlockAdmin,
        lockAdmin,
        updateAdminConfig,
        deleteMember,
        banMember,
        unbanMember,
        addAllowedMember,
        removeAllowedMember,
        cleanupDuplicateMembers,
        cleanupOfflineMembers
      }}
    >
      {children}
    </GangContext.Provider>
  );
};

export const useGang = () => {
  const context = useContext(GangContext);
  if (!context) throw new Error('useGang must be used within GangProvider');
  return context;
};
