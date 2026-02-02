import { useState, useEffect, useCallback, useRef } from 'react';
import { SatelliteData, SatellitePosition, OrbitPoint, Astronaut } from '../types';
import { SATELLITE_CATALOG } from '../../../config/satellite-config';
import { fetchTLE, calculateSatellitePosition, calculateOrbitPath, prefetchAllTLE } from '../utils/tleUtils';

const UPDATE_INTERVAL = Number(import.meta.env.VITE_UPDATE_INTERVAL) || 3000;

export function useSatelliteData(activeSatelliteId: string, isTracking: boolean, showAllSatellites: boolean) {
  const [satellites, setSatellites] = useState<Map<string, SatelliteData>>(new Map());
  const [orbitPath, setOrbitPath] = useState<OrbitPoint[]>([]);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [astronautCount, setAstronautCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [tleReady, setTleReady] = useState(false);
  const positionHistoryRef = useRef<Map<string, OrbitPoint[]>>(new Map());
  const tleDataRef = useRef<Map<number, { tle1: string; tle2: string }>>(new Map());

  // Prefetch all TLE data on mount
  useEffect(() => {
    const loadTLEData = async () => {
      const noradIds = SATELLITE_CATALOG.map(s => s.noradId);
      await prefetchAllTLE(noradIds);

      // Store TLE data for quick access
      for (const catalog of SATELLITE_CATALOG) {
        const tle = await fetchTLE(catalog.noradId);
        if (tle) {
          tleDataRef.current.set(catalog.noradId, { tle1: tle.tle1, tle2: tle.tle2 });
        }
      }
      setTleReady(true);
    };

    loadTLEData();
  }, []);

  // Calculate position for a satellite using SGP4
  const calculatePosition = useCallback((noradId: number): {
    latitude: number;
    longitude: number;
    altitude: number;
    velocity: number;
    visibility: 'daylight' | 'eclipsed';
    timestamp: number;
  } | null => {
    const tleData = tleDataRef.current.get(noradId);
    if (!tleData) return null;

    const position = calculateSatellitePosition(tleData.tle1, tleData.tle2);
    if (!position) return null;

    return {
      ...position,
      timestamp: Date.now(),
    };
  }, []);

  const updateAllPositions = useCallback(() => {
    if (!tleReady) return;

    try {
      const satellitesToUpdate = showAllSatellites
        ? SATELLITE_CATALOG
        : SATELLITE_CATALOG.filter(s => s.id === activeSatelliteId);

      const updatedSatellites = new Map<string, SatelliteData>();

      for (const catalog of satellitesToUpdate) {
        const posData = calculatePosition(catalog.noradId);

        if (posData) {
          const satelliteData: SatelliteData = {
            ...catalog,
            position: {
              latitude: posData.latitude,
              longitude: posData.longitude,
              timestamp: posData.timestamp,
            },
            altitude: posData.altitude,
            velocity: posData.velocity,
            visibility: posData.visibility,
          };

          updatedSatellites.set(catalog.id, satelliteData);

          // Track position history for orbit trails
          const history = positionHistoryRef.current.get(catalog.id) || [];
          history.push({
            lat: posData.latitude,
            lng: posData.longitude,
            timestamp: posData.timestamp,
          });
          if (history.length > 500) history.shift();
          positionHistoryRef.current.set(catalog.id, history);
        }
      }

      setSatellites(updatedSatellites);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate satellite positions');
    }
  }, [activeSatelliteId, showAllSatellites, calculatePosition, tleReady]);

  const fetchAstronauts = useCallback(async () => {
    try {
      const proxy = import.meta.env.VITE_CORS_PROXY || 'https://corsproxy.io/?url=';
      const api = import.meta.env.VITE_ASTRONAUTS_API || 'http://api.open-notify.org/astros.json';
      const response = await fetch(`${proxy}${api}`);
      if (!response.ok) throw new Error('Failed to fetch astronauts');

      const data = await response.json();
      const issAstronauts = data.people.filter((p: Astronaut) => p.craft === 'ISS');
      setAstronauts(issAstronauts);
      setAstronautCount(issAstronauts.length);
    } catch (err) {
      // Fallback astronaut data
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
    }
  }, []);

  // Calculate accurate orbit path using SGP4
  const updateOrbitPath = useCallback(() => {
    const activeSatellite = SATELLITE_CATALOG.find(s => s.id === activeSatelliteId);
    if (!activeSatellite) return;

    const tleData = tleDataRef.current.get(activeSatellite.noradId);
    if (!tleData) return;

    const path = calculateOrbitPath(tleData.tle1, tleData.tle2, 90, 1);
    setOrbitPath(path);
  }, [activeSatelliteId]);

  // Initial load and interval updates
  useEffect(() => {
    if (!tleReady) return;

    updateAllPositions();
    fetchAstronauts();
    updateOrbitPath();

    let interval: NodeJS.Timeout | null = null;

    if (isTracking) {
      interval = setInterval(updateAllPositions, UPDATE_INTERVAL);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, updateAllPositions, fetchAstronauts, updateOrbitPath, tleReady]);

  // Update orbit path when active satellite changes
  useEffect(() => {
    if (tleReady) {
      updateOrbitPath();
    }
  }, [activeSatelliteId, tleReady, updateOrbitPath]);

  const activeSatellite = satellites.get(activeSatelliteId);

  return {
    satellites,
    activeSatellite,
    orbitPath,
    astronauts,
    astronautCount,
    error,
    lastUpdate,
    positionHistory: positionHistoryRef.current.get(activeSatelliteId) || [],
    tleReady,
  };
}
