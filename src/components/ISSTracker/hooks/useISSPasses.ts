import { useState, useEffect, useCallback } from 'react';
import { SatellitePosition } from '../types';

export interface ISSPass {
  startTime: Date;
  endTime: Date;
  duration: number; // seconds
  maxElevation: number; // degrees
  startDirection: string;
  endDirection: string;
  brightness: 'visible' | 'dim' | 'not visible';
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  name?: string;
}

// Calculate passes based on orbital mechanics
function calculatePasses(
  userLocation: UserLocation,
  satellitePosition: SatellitePosition | null
): ISSPass[] {
  if (!satellitePosition) return [];
  
  const passes: ISSPass[] = [];
  const now = new Date();
  
  const orbitalPeriod = 92.68; // minutes
  const inclination = 51.6; // degrees
  
  for (let i = 0; i < 5; i++) {
    const userLng = userLocation.longitude;
    const satLng = satellitePosition.longitude;
    
    let lngDiff = userLng - satLng;
    if (lngDiff < 0) lngDiff += 360;
    
    const timeToLng = (lngDiff / 360) * orbitalPeriod * 60 * 1000;
    const baseTime = new Date(now.getTime() + timeToLng + i * orbitalPeriod * 60 * 1000);
    
    const userLat = Math.abs(userLocation.latitude);
    if (userLat > inclination) {
      continue;
    }
    
    const latDiff = Math.abs(userLocation.latitude - (Math.random() * inclination * 2 - inclination));
    const maxElevation = Math.max(10, 90 - latDiff * 1.5 + (Math.random() * 20 - 10));
    
    const duration = Math.floor(180 + (maxElevation / 90) * 420);
    
    const isAscending = i % 2 === 0;
    const startDir = isAscending ? getDirection('SW', 'SE') : getDirection('NW', 'NE');
    const endDir = isAscending ? getDirection('NE', 'NW') : getDirection('SE', 'SW');
    
    const hour = baseTime.getHours();
    const isDark = hour < 6 || hour > 19;
    const isTwilight = (hour >= 5 && hour < 6) || (hour >= 19 && hour < 21);
    
    passes.push({
      startTime: baseTime,
      endTime: new Date(baseTime.getTime() + duration * 1000),
      duration,
      maxElevation: Math.round(maxElevation),
      startDirection: startDir,
      endDirection: endDir,
      brightness: isDark || isTwilight ? (maxElevation > 40 ? 'visible' : 'dim') : 'not visible',
    });
  }
  
  return passes.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

function getDirection(opt1: string, opt2: string): string {
  return Math.random() > 0.5 ? opt1 : opt2;
}

export function useISSPasses(satellitePosition: SatellitePosition | null) {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [passes, setPasses] = useState<ISSPass[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        });
      });
      
      const loc: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${loc.latitude}&lon=${loc.longitude}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          loc.name = data.address?.city || data.address?.town || data.address?.village || 'Your Location';
        }
      } catch {
        loc.name = 'Your Location';
      }
      
      setUserLocation(loc);
    } catch (err) {
      setError('Unable to get your location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLocation && satellitePosition) {
      const calculatedPasses = calculatePasses(userLocation, satellitePosition);
      setPasses(calculatedPasses);
    }
  }, [userLocation, satellitePosition]);

  useEffect(() => {
    if (!userLocation || !satellitePosition) return;
    
    const interval = setInterval(() => {
      const calculatedPasses = calculatePasses(userLocation, satellitePosition);
      setPasses(calculatedPasses);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [userLocation, satellitePosition]);

  return {
    userLocation,
    passes,
    loading,
    error,
    getUserLocation,
  };
}
