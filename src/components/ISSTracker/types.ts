export interface SatellitePosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface SatelliteData {
  id: string;
  name: string;
  shortName: string;
  noradId: number;
  description: string;
  country: string;
  countryCode: string;
  type: 'space-station' | 'satellite' | 'rocket-body';
  color: string;
  position: SatellitePosition | null;
  altitude: number;
  velocity: number;
  visibility: 'daylight' | 'eclipsed';
}

export interface Astronaut {
  name: string;
  craft: string;
  nationality?: string;
  role?: string;
  launchDate?: string;
}

export interface AstronautsResponse {
  number: number;
  people: Astronaut[];
  message: string;
}

export interface OrbitPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface TrackerState {
  isTracking: boolean;
  showOrbit: boolean;
  showTerminator: boolean;
  showLabels: boolean;
  mapStyle: 'satellite' | 'dark' | 'standard';
  viewMode: 'flat' | 'globe';
  followSatellite: boolean;
  isFullscreen: boolean;
  showPassPredictions: boolean;
  showAllSatellites: boolean;
}

// Country flag URLs (using flagcdn.com for high-quality flags)
export const COUNTRY_FLAGS: Record<string, string> = {
  'IN': 'https://flagcdn.com/w40/in.png',
  'US': 'https://flagcdn.com/w40/us.png',
  'CN': 'https://flagcdn.com/w40/cn.png',
  'EU': 'https://flagcdn.com/w40/eu.png',
  'RU': 'https://flagcdn.com/w40/ru.png',
  'JP': 'https://flagcdn.com/w40/jp.png',
  'INT': 'https://flagcdn.com/w40/un.png',
  'SPACEX': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/SpaceX-Logo.svg/40px-SpaceX-Logo.svg.png',
};

// Satellite catalog with free API endpoints