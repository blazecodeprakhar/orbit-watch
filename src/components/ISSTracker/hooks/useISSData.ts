import { useState, useEffect, useCallback, useRef } from 'react';
import { ISSPosition, OrbitPoint, Astronaut } from '../types';

// Using WhereTheISS.at API (HTTPS, no CORS issues, more data)
const ISS_API_URL = 'https://api.wheretheiss.at/v1/satellites/25544';
// Fallback API for astronauts
const ASTRONAUTS_API_URL = 'https://corsproxy.io/?url=http://api.open-notify.org/astros.json';
const UPDATE_INTERVAL = 5000;
const ORBIT_PERIOD = 92.68; // ISS orbital period in minutes

export function useISSData(isTracking: boolean) {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [astronautCount, setAstronautCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [altitude, setAltitude] = useState(420);
  const [velocity, setVelocity] = useState(27600);
  const positionHistoryRef = useRef<OrbitPoint[]>([]);

  const fetchISSPosition = useCallback(async () => {
    try {
      const response = await fetch(ISS_API_URL);
      if (!response.ok) throw new Error('Failed to fetch ISS position');
      
      const data = await response.json();
      
      // WhereTheISS.at API returns more data
      const newPosition: ISSPosition = {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp * 1000,
      };
      
      // Update altitude and velocity from API
      setAltitude(Math.round(data.altitude));
      setVelocity(Math.round(data.velocity));
      
      setPosition(newPosition);
      setLastUpdate(new Date());
      setError(null);

      // Add to history for orbit trail
      const newPoint: OrbitPoint = {
        lat: newPosition.latitude,
        lng: newPosition.longitude,
        timestamp: newPosition.timestamp,
      };
      
      positionHistoryRef.current = [
        ...positionHistoryRef.current.slice(-500),
        newPoint,
      ];
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ISS position');
    }
  }, []);

  const fetchAstronauts = useCallback(async () => {
    try {
      const response = await fetch(ASTRONAUTS_API_URL);
      if (!response.ok) throw new Error('Failed to fetch astronauts');
      
      const data = await response.json();
      const issAstronauts = data.people.filter((p: Astronaut) => p.craft === 'ISS');
      setAstronauts(issAstronauts);
      setAstronautCount(issAstronauts.length);
    } catch (err) {
      // Fallback astronaut data if API fails
      const fallbackAstronauts: Astronaut[] = [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Nikolai Chub', craft: 'ISS' },
        { name: 'Tracy Dyson', craft: 'ISS' },
        { name: 'Matthew Dominick', craft: 'ISS' },
        { name: 'Michael Barratt', craft: 'ISS' },
        { name: 'Jeanette Epps', craft: 'ISS' },
        { name: 'Alexander Grebenkin', craft: 'ISS' },
      ];
      setAstronauts(fallbackAstronauts);
      setAstronautCount(fallbackAstronauts.length);
      console.warn('Using fallback astronaut data');
    }
  }, []);

  // Calculate predicted orbit path based on orbital mechanics
  const calculateOrbitPath = useCallback((currentPos: ISSPosition): OrbitPoint[] => {
    const points: OrbitPoint[] = [];
    const now = currentPos.timestamp;
    const orbitPeriodMs = ORBIT_PERIOD * 60 * 1000;
    
    // ISS orbital inclination is 51.6 degrees
    const inclination = 51.6 * (Math.PI / 180);
    
    // Calculate points for past 12 hours and future 12 hours
    for (let i = -720; i <= 720; i += 2) {
      const timeOffset = i * 60 * 1000; // minutes to ms
      const timestamp = now + timeOffset;
      
      // Angular position in orbit (simplified)
      const angularVelocity = (2 * Math.PI) / orbitPeriodMs;
      const currentAngle = angularVelocity * timeOffset;
      
      // Starting from current position, project orbit
      const baseLng = currentPos.longitude;
      const baseLat = currentPos.latitude;
      
      // Earth rotation compensation (Earth rotates ~15 degrees per hour)
      const earthRotation = (timeOffset / 3600000) * 15;
      
      // Simplified sinusoidal orbit path
      const lat = Math.asin(Math.sin(inclination) * Math.sin(currentAngle + baseLat * Math.PI / 180)) * 180 / Math.PI;
      let lng = baseLng + (timeOffset / orbitPeriodMs) * 360 - earthRotation;
      
      // Normalize longitude
      while (lng > 180) lng -= 360;
      while (lng < -180) lng += 360;
      
      points.push({ lat, lng, timestamp });
    }
    
    return points;
  }, []);

  useEffect(() => {
    fetchISSPosition();
    fetchAstronauts();
    
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking) {
      interval = setInterval(fetchISSPosition, UPDATE_INTERVAL);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, fetchISSPosition, fetchAstronauts]);

  useEffect(() => {
    if (position) {
      const calculated = calculateOrbitPath(position);
      setOrbitPath(calculated);
    }
  }, [position, calculateOrbitPath]);

  return {
    position,
    orbitPath,
    astronauts,
    astronautCount,
    error,
    lastUpdate,
    altitude,
    velocity,
    positionHistory: positionHistoryRef.current,
  };
}
