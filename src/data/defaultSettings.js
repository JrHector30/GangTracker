export const DEFAULT_CATEGORIES = {
  badulaque: {
    id: 'badulaque',
    name: 'Tienda 24/7',
    shortName: '24/7',
    robTime: 120, // 2 minutos en segundos
    cooldownTime: 1800, // 30 minutos en segundos
    approxRewardBlack: 18000,
    icon: 'Store',
    color: '#10b981', // Verde esmeralda
    minCops: 2,
    allowedVehicles: 'F, E, D, C',
    rehenes: 'Tendero + 1 civil/NPC vivo',
    description: 'Tiendas de conveniencia 24/7 y Ltd Gas'
  },
  licoreria: {
    id: 'licoreria',
    name: 'Licorería',
    shortName: 'Licorería',
    robTime: 90, // 1.5 minutos
    cooldownTime: 1800, // 30 minutos
    approxRewardBlack: 22000,
    icon: 'Wine',
    color: '#a855f7', // Púrpura
    minCops: 2,
    allowedVehicles: 'F, E, D, C',
    rehenes: 'Tendero + 1 civil/NPC',
    description: 'Robo a botillerías y licorerías'
  },
  tattoo: {
    id: 'tattoo',
    name: 'Tienda de Tatuajes',
    shortName: 'Tattoo',
    robTime: 90, // 1.5 minutos
    cooldownTime: 1800, // 30 minutos
    approxRewardBlack: 16000,
    icon: 'Sparkles',
    color: '#ec4899', // Rosa neón
    minCops: 2,
    allowedVehicles: 'F, E, D, C',
    rehenes: 'Tendero + 1 civil/NPC',
    description: 'Estudios de tatuajes en Los Santos y Paleto'
  },
  barberia: {
    id: 'barberia',
    name: 'Peluquería / Barbería',
    shortName: 'Barbería',
    robTime: 90, // 1.5 minutos
    cooldownTime: 1800, // 30 minutos
    approxRewardBlack: 15000,
    icon: 'Scissors',
    color: '#06b6d4', // Cian
    minCops: 2,
    allowedVehicles: 'F, E, D, C',
    rehenes: 'Tendero + 1 civil/NPC',
    description: 'Barberías estilo Herr Kutz y Bob Mulét'
  },
  ropa: {
    id: 'ropa',
    name: 'Tienda de Ropa (Binco / Suburban / Ponsonbys)',
    shortName: 'Ropa',
    robTime: 120, // 2 minutos
    cooldownTime: 1800, // 30 minutos
    approxRewardBlack: 20000,
    icon: 'Shirt',
    color: '#3b82f6', // Azul
    minCops: 2,
    allowedVehicles: 'F, E, D, C',
    rehenes: 'Tendero + 1 civil/NPC',
    description: 'Tiendas de ropa minoristas'
  },
  atm: {
    id: 'atm',
    name: 'Cajero ATM (Robo Rápido)',
    shortName: 'ATM',
    robTime: 40, // 40 segundos
    cooldownTime: 900, // 15 minutos
    approxRewardBlack: 25000,
    icon: 'CreditCard',
    color: '#eab308', // Oro/Amarillo
    minCops: 1,
    allowedVehicles: 'Cualquier vehículo',
    rehenes: 'No requiere negociación ni rehenes',
    description: 'Cajeros automáticos (sin espera de policía obligatoria)'
  },
  fleeca: {
    id: 'fleeca',
    name: 'Banco Fleeca',
    shortName: 'Fleeca',
    robTime: 300, // 5 minutos
    cooldownTime: 3600, // 60 minutos
    approxRewardBlack: 80000,
    icon: 'Landmark',
    color: '#f97316', // Naranja
    minCops: 4,
    allowedVehicles: 'B, A hacia abajo',
    rehenes: 'Rehenes requeridos (ilimitados)',
    description: 'Sucursales de Banco Fleeca'
  },
  joyeria: {
    id: 'joyeria',
    name: 'Joyería Vangelico',
    shortName: 'Joyería',
    robTime: 420, // 7 minutos
    cooldownTime: 5400, // 90 minutos
    approxRewardBlack: 220000,
    icon: 'Gem',
    color: '#f43f5e', // Rojo carmesí
    minCops: 5,
    allowedVehicles: 'A+ hacia abajo',
    rehenes: 'Rehenes obligatorios. Preparación máx 3 min',
    description: 'Atraco mayor a Vangelico Joyeros'
  }
};

export const MAP_CONFIGS = {
  atlas: {
    id: 'atlas',
    name: 'Mapa Atlas (Predeterminado)',
    url: 'https://tiles.mapgenie.io/games/gta5/los-santos/atlas/{z}/{x}/{y}.png',
    type: 'tile',
    oceanColor: '#0fa8d2',
    description: 'Mapa oficial estilo Atlas con topografía y carreteras detalladas'
  },
  satellite: {
    id: 'satellite',
    name: 'Mapa Satelital HD',
    url: 'https://tiles.mapgenie.io/games/gta5/los-santos/satellite/{z}/{x}/{y}.png',
    type: 'tile',
    oceanColor: '#143d6b',
    description: 'Vista satelital aérea de alta definición'
  },
  road: {
    id: 'road',
    name: 'Mapa Callejero (Road)',
    url: 'https://tiles.mapgenie.io/games/gta5/los-santos/road/{z}/{x}/{y}.png',
    type: 'tile',
    oceanColor: '#1862ad',
    description: 'Mapa táctico de calles y carreteras para respuesta rápida'
  }
};

export const DEFAULT_POI_CATEGORIES = {
  lavado: {
    id: 'lavado',
    name: 'Lavado de Dinero',
    shortName: 'Lavado',
    icon: 'Banknote',
    color: '#10b981',
    description: 'Punto clandestino de lavado de dinero negro'
  },
  hackeo: {
    id: 'hackeo',
    name: 'Dispositivo de Hackeo',
    shortName: 'Hackeo',
    icon: 'Cpu',
    color: '#06b6d4',
    description: 'Compra o recogida de dispositivos y pendrives de hackeo'
  },
  crafteo: {
    id: 'crafteo',
    name: 'Mesa de Crafteo',
    shortName: 'Crafteo',
    icon: 'Hammer',
    color: '#f59e0b',
    description: 'Mesa de fabricación de herramientas y armas'
  },
  matricula: {
    id: 'matricula',
    name: 'Raspado de Matrícula',
    shortName: 'Matrícula',
    icon: 'FileText',
    color: '#ec4899',
    description: 'Taller para raspar y cambiar matrículas de vehículos'
  }
};

export const DEFAULT_SETTINGS = {
  currentMap: 'atlas',
  soundEnabled: true,
  soundVolume: 0.8,
  soundType: 'tactical', // 'tactical' | 'siren' | 'radar' | 'chime'
  vibrationEnabled: true,
  activeSection: 'robberies', // 'robberies' | 'pois' (Prioridad Tiendas de Robo)
  filterCategories: {
    badulaque: true,
    licoreria: true,
    tattoo: true,
    barberia: true,
    ropa: true,
    atm: true,
    fleeca: true,
    joyeria: true
  },
  filterPois: {
    lavado: true,
    hackeo: true,
    crafteo: true,
    matricula: true
  },
  filterStatus: 'all', // 'all' | 'available' | 'robbing' | 'cooldown'
  categories: DEFAULT_CATEGORIES,
  poiCategories: DEFAULT_POI_CATEGORIES
};
