import React from 'react';
import {
  StoreIcon,
  CreditCardIcon,
  BanknoteIcon,
  CoinsIcon,
  SparklesIcon,
  CpuIcon,
  CarIcon,
  BikeIcon,
  TruckIcon,
  FlameIcon,
  KeyIcon,
  LockIcon,
  PackageIcon,
  RadioIcon,
  ZapIcon,
  CameraIcon,
  FileTextIcon,
  MapPinIcon,
  ShieldCheckIcon
} from '@animateicons/react/lucide';

import {
  Store,
  Wine,
  Sparkles,
  Scissors,
  Shirt,
  CreditCard,
  Landmark,
  Gem,
  MapPin,
  Banknote,
  Cpu,
  Hammer,
  FileText,
  Wrench,
  Shield,
  Crosshair,
  Flame,
  Coins,
  Car,
  Skull,
  Key,
  Briefcase,
  Radio,
  Package,
  Lock,
  Zap,
  Target,
  Luggage,
  Scale,
  Anchor,
  Truck,
  Bike,
  Plane,
  Camera
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'Store', label: 'Tienda 24/7 / LTD' },
  { id: 'CreditCard', label: 'Cajero ATM' },
  { id: 'Landmark', label: 'Banco / Fleeca' },
  { id: 'Gem', label: 'Joyería' },
  { id: 'Wine', label: 'Licorería' },
  { id: 'Shirt', label: 'Tienda de Ropa' },
  { id: 'Scissors', label: 'Barbería' },
  { id: 'Sparkles', label: 'Tatuajes' },
  { id: 'Banknote', label: 'Lavado de Dinero' },
  { id: 'Cpu', label: 'Hackeo / USB' },
  { id: 'Hammer', label: 'Mesa de Crafteo' },
  { id: 'FileText', label: 'Matrícula / Papeles' },
  { id: 'Wrench', label: 'Taller / Mecánico' },
  { id: 'Car', label: 'Coches / Concesionario' },
  { id: 'Bike', label: 'Motos' },
  { id: 'Truck', label: 'Camiones / Carga' },
  { id: 'Plane', label: 'Hangar / Aviones' },
  { id: 'Anchor', label: 'Muelle / Barcos' },
  { id: 'Flame', label: 'Fuego / Peligro' },
  { id: 'Skull', label: 'Calavera / Mafias' },
  { id: 'Crosshair', label: 'Armería / Mira' },
  { id: 'Target', label: 'Diana / Objetivo' },
  { id: 'Shield', label: 'Blindaje / Policía' },
  { id: 'Key', label: 'Llaves / Escondite' },
  { id: 'Lock', label: 'Candado / Caja Fuerte' },
  { id: 'Briefcase', label: 'Maletín / Tratos' },
  { id: 'Luggage', label: 'Maleta / Drogas' },
  { id: 'Package', label: 'Paquetes / Envíos' },
  { id: 'Coins', label: 'Monedas / Oro' },
  { id: 'Scale', label: 'Balanza / Juzgados' },
  { id: 'Radio', label: 'Radio / Frecuencia' },
  { id: 'Zap', label: 'Energía / Central' },
  { id: 'Camera', label: 'Cámaras / Vigilancia' },
  { id: 'MapPin', label: 'Punto de Interés' }
];

const ANIMATED_ICON_MAP = {
  Store: StoreIcon,
  CreditCard: CreditCardIcon,
  Banknote: BanknoteIcon,
  Coins: CoinsIcon,
  Sparkles: SparklesIcon,
  Cpu: CpuIcon,
  Car: CarIcon,
  Bike: BikeIcon,
  Truck: TruckIcon,
  Flame: FlameIcon,
  Key: KeyIcon,
  Lock: LockIcon,
  Package: PackageIcon,
  Radio: RadioIcon,
  Zap: ZapIcon,
  Camera: CameraIcon,
  FileText: FileTextIcon,
  MapPin: MapPinIcon,
  Shield: ShieldCheckIcon
};

const STATIC_ICON_MAP = {
  Store,
  Wine,
  Sparkles,
  Scissors,
  Shirt,
  CreditCard,
  Landmark,
  Gem,
  MapPin,
  Banknote,
  Cpu,
  Hammer,
  FileText,
  Wrench,
  Shield,
  Crosshair,
  Flame,
  Coins,
  Car,
  Skull,
  Key,
  Briefcase,
  Radio,
  Package,
  Lock,
  Zap,
  Target,
  Luggage,
  Scale,
  Anchor,
  Truck,
  Bike,
  Plane,
  Camera
};

export const CategoryIcon = ({
  iconName,
  className = "w-5 h-5",
  color = "#000000",
  size,
  strokeWidth = 2.4,
  duration = 1,
  style,
  ...rest
}) => {
  const mergedStyle = color ? { color, ...style } : style;
  const numSize = size || (className.includes('w-7') ? 28 : className.includes('w-6') ? 24 : className.includes('w-8') ? 32 : 20);

  const getComponent = () => {
    if (!iconName) return { Component: MapPinIcon, isAnimated: true };

    if (ANIMATED_ICON_MAP[iconName]) {
      return { Component: ANIMATED_ICON_MAP[iconName], isAnimated: true };
    }
    if (STATIC_ICON_MAP[iconName]) {
      return { Component: STATIC_ICON_MAP[iconName], isAnimated: false };
    }

    const lower = iconName.toLowerCase();
    const animKey = Object.keys(ANIMATED_ICON_MAP).find(k => k.toLowerCase() === lower);
    if (animKey) return { Component: ANIMATED_ICON_MAP[animKey], isAnimated: true };

    const staticKey = Object.keys(STATIC_ICON_MAP).find(k => k.toLowerCase() === lower);
    if (staticKey) return { Component: STATIC_ICON_MAP[staticKey], isAnimated: false };

    // Smart GTA & general fallbacks
    if (lower.includes('store') || lower.includes('24/7') || lower.includes('badulaque') || lower.includes('ltd')) {
      return { Component: StoreIcon, isAnimated: true };
    }
    if (lower.includes('atm') || lower.includes('credit')) return { Component: CreditCardIcon, isAnimated: true };
    if (lower.includes('dinero') || lower.includes('lavado') || lower.includes('banknote')) return { Component: BanknoteIcon, isAnimated: true };
    if (lower.includes('bank') || lower.includes('fleeca') || lower.includes('landmark')) return { Component: Landmark, isAnimated: false };
    if (lower.includes('gem') || lower.includes('joyeria') || lower.includes('diamante')) return { Component: Gem, isAnimated: false };
    if (lower.includes('wine') || lower.includes('licor') || lower.includes('botilleria')) return { Component: Wine, isAnimated: false };
    if (lower.includes('shirt') || lower.includes('ropa')) return { Component: Shirt, isAnimated: false };
    if (lower.includes('scissor') || lower.includes('barber') || lower.includes('peluqueria')) return { Component: Scissors, isAnimated: false };
    if (lower.includes('sparkle') || lower.includes('tattoo') || lower.includes('tatuaje')) return { Component: SparklesIcon, isAnimated: true };
    if (lower.includes('hack') || lower.includes('cpu') || lower.includes('usb')) return { Component: CpuIcon, isAnimated: true };
    if (lower.includes('craft') || lower.includes('hammer') || lower.includes('mesa')) return { Component: Hammer, isAnimated: false };
    if (lower.includes('matricula') || lower.includes('placa') || lower.includes('file')) return { Component: FileTextIcon, isAnimated: true };
    if (lower.includes('car') || lower.includes('coche') || lower.includes('auto')) return { Component: CarIcon, isAnimated: true };
    if (lower.includes('bike') || lower.includes('moto')) return { Component: BikeIcon, isAnimated: true };
    if (lower.includes('truck') || lower.includes('camion')) return { Component: TruckIcon, isAnimated: true };
    if (lower.includes('fuego') || lower.includes('flame')) return { Component: FlameIcon, isAnimated: true };
    if (lower.includes('llave') || lower.includes('key')) return { Component: KeyIcon, isAnimated: true };
    if (lower.includes('candado') || lower.includes('lock')) return { Component: LockIcon, isAnimated: true };
    if (lower.includes('paquete') || lower.includes('package')) return { Component: PackageIcon, isAnimated: true };
    if (lower.includes('radio')) return { Component: RadioIcon, isAnimated: true };
    if (lower.includes('rayo') || lower.includes('zap') || lower.includes('energia')) return { Component: ZapIcon, isAnimated: true };
    if (lower.includes('camara') || lower.includes('camera')) return { Component: CameraIcon, isAnimated: true };

    return { Component: MapPinIcon, isAnimated: true };
  };

  const { Component, isAnimated } = getComponent();

  if (isAnimated) {
    return (
      <Component
        size={numSize}
        color={color}
        duration={duration}
        className={className}
        style={mergedStyle}
        {...rest}
      />
    );
  }

  return (
    <Component
      size={numSize}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      style={mergedStyle}
      {...rest}
    />
  );
};
