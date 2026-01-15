export interface ISSPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface ISSData {
  position: ISSPosition;
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
  followISS: boolean;
  isFullscreen: boolean;
  timeReplayEnabled: boolean;
  timeReplayOffset: number; // minutes offset from current time
  showLiveStream: boolean;
  showPassPredictions: boolean;
}
