import * as satellite from 'satellite.js';
import { FALLBACK_TLE } from '../../../config/satellite-config';

// TLE data source - CelesTrak provides reliable TLE data
const CELESTRAK_BASE = import.meta.env.VITE_CELESTRAK_API || 'https://celestrak.org/NORAD/elements/gp.php';

// Cached TLE data with expiry
interface TLECache {
  tle1: string;
  tle2: string;
  name: string;
  fetchedAt: number;
}

const tleCache = new Map<number, TLECache>();
const TLE_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Fetch TLE data from CelesTrak for a given NORAD ID
 */
export async function fetchTLE(noradId: number): Promise<TLECache | null> {
  // Check cache first
  const cached = tleCache.get(noradId);
  if (cached && Date.now() - cached.fetchedAt < TLE_CACHE_DURATION) {
    return cached;
  }

  try {
    // Try CelesTrak GP data format
    const response = await fetch(
      `${CELESTRAK_BASE}?CATNR=${noradId}&FORMAT=TLE`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const text = await response.text();
    const lines = text.trim().split('\n').map(l => l.trim()).filter(l => l);

    if (lines.length >= 2) {
      // Parse TLE format (either 2 or 3 lines)
      let tle1: string, tle2: string, name: string;

      if (lines.length >= 3 && !lines[0].startsWith('1 ')) {
        name = lines[0];
        tle1 = lines[1];
        tle2 = lines[2];
      } else {
        name = `SAT ${noradId}`;
        tle1 = lines[0];
        tle2 = lines[1];
      }

      const tleData: TLECache = {
        name,
        tle1,
        tle2,
        fetchedAt: Date.now(),
      };

      tleCache.set(noradId, tleData);
      return tleData;
    }
  } catch (error) {
    console.warn(`Failed to fetch TLE for NORAD ${noradId}, using fallback`);
  }

  // Use fallback TLE if available
  const fallback = FALLBACK_TLE[noradId];
  if (fallback) {
    const tleData: TLECache = {
      ...fallback,
      fetchedAt: Date.now() - TLE_CACHE_DURATION + 30 * 60 * 1000, // Retry in 30 min
    };
    tleCache.set(noradId, tleData);
    return tleData;
  }

  return null;
}

/**
 * Calculate satellite position using SGP4 propagation
 */
export function calculateSatellitePosition(
  tle1: string,
  tle2: string,
  date: Date = new Date()
): {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: 'daylight' | 'eclipsed';
} | null {
  try {
    // Parse TLE and create satellite record
    const satrec = satellite.twoline2satrec(tle1, tle2);

    // Propagate to current time
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (!positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
      return null;
    }

    const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
    const velocityEci = positionAndVelocity.velocity as satellite.EciVec3<number>;

    // Get GMST for coordinate conversion
    const gmst = satellite.gstime(date);

    // Convert ECI to geodetic coordinates
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    // Convert to degrees
    const latitude = satellite.degreesLat(positionGd.latitude);
    const longitude = satellite.degreesLong(positionGd.longitude);
    const altitude = positionGd.height; // km

    // Calculate velocity magnitude (km/s)
    const velocityMagnitude = Math.sqrt(
      velocityEci.x ** 2 + velocityEci.y ** 2 + velocityEci.z ** 2
    );

    // Convert to km/h
    const velocity = velocityMagnitude * 3600;

    // Calculate visibility (simple sun position check)
    const visibility = calculateVisibility(positionEci, date);

    return {
      latitude,
      longitude,
      altitude: Math.round(altitude),
      velocity: Math.round(velocity),
      visibility,
    };
  } catch (error) {
    console.error('SGP4 propagation error:', error);
    return null;
  }
}

/**
 * Calculate orbit path for the next N minutes
 */
export function calculateOrbitPath(
  tle1: string,
  tle2: string,
  durationMinutes: number = 90,
  stepMinutes: number = 1
): Array<{ lat: number; lng: number; timestamp: number }> {
  const points: Array<{ lat: number; lng: number; timestamp: number }> = [];
  const now = new Date();

  try {
    const satrec = satellite.twoline2satrec(tle1, tle2);

    // Calculate past and future positions
    for (let i = -durationMinutes; i <= durationMinutes; i += stepMinutes) {
      const time = new Date(now.getTime() + i * 60 * 1000);
      const positionAndVelocity = satellite.propagate(satrec, time);

      if (!positionAndVelocity.position || typeof positionAndVelocity.position === 'boolean') {
        continue;
      }

      const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
      const gmst = satellite.gstime(time);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      points.push({
        lat: satellite.degreesLat(positionGd.latitude),
        lng: satellite.degreesLong(positionGd.longitude),
        timestamp: time.getTime(),
      });
    }
  } catch (error) {
    console.error('Orbit path calculation error:', error);
  }

  return points;
}

/**
 * Calculate if satellite is in daylight or eclipsed
 */
function calculateVisibility(
  positionEci: satellite.EciVec3<number>,
  date: Date
): 'daylight' | 'eclipsed' {
  // Calculate sun position
  const jd = getJulianDate(date);
  const sunPos = getSunPosition(jd);

  // Earth radius in km
  const earthRadius = 6371;

  // Satellite position magnitude
  const satDist = Math.sqrt(positionEci.x ** 2 + positionEci.y ** 2 + positionEci.z ** 2);

  // Angle between satellite and sun
  const dotProduct = positionEci.x * sunPos.x + positionEci.y * sunPos.y + positionEci.z * sunPos.z;
  const cosAngle = dotProduct / (satDist * Math.sqrt(sunPos.x ** 2 + sunPos.y ** 2 + sunPos.z ** 2));

  // Check if satellite is in Earth's shadow
  if (cosAngle < 0) {
    const perpDist = satDist * Math.sqrt(1 - cosAngle ** 2);
    if (perpDist < earthRadius) {
      return 'eclipsed';
    }
  }

  return 'daylight';
}

/**
 * Get Julian date
 */
function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Get approximate sun position in ECI coordinates (simplified)
 */
function getSunPosition(jd: number): { x: number; y: number; z: number } {
  const n = jd - 2451545.0;
  const L = (280.460 + 0.9856474 * n) % 360;
  const g = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const obliquity = 23.439 * Math.PI / 180;

  const AU = 149597870.7; // km

  return {
    x: AU * Math.cos(lambda),
    y: AU * Math.cos(obliquity) * Math.sin(lambda),
    z: AU * Math.sin(obliquity) * Math.sin(lambda),
  };
}

/**
 * Prefetch TLE data for all satellites in catalog
 */
export async function prefetchAllTLE(noradIds: number[]): Promise<void> {
  await Promise.all(noradIds.map(id => fetchTLE(id)));
}
