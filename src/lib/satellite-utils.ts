import { twoline2satrec, propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';
import { Satellite, SatellitePosition, OrbitPoint } from '../components/ISSTracker/types';

import { FALLBACK_TLES, SATELLITE_CATALOG } from './tle-fallback';

export const INITIAL_SATELLITES: Satellite[] = SATELLITE_CATALOG.map(sat => ({
    ...sat,
    tleLine1: '',
    tleLine2: '',
    type: sat.type as any
}));

export async function fetchSatelliteTLE(noradId: number): Promise<{ line1: string; line2: string } | null> {
    const fetchFromApi = async () => {
        try {
            // Try Celestrak directly first
            const response = await fetch(`https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=tle`, {
                mode: 'cors'
            });
            if (response.ok) {
                const text = await response.text();
                return parseTLE(text);
            }
            throw new Error('Direct fetch failed');
        } catch {
            try {
                // Try proxy
                const response = await fetch(`https://corsproxy.io/?url=https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=tle`);
                if (response.ok) {
                    const text = await response.text();
                    return parseTLE(text);
                }
            } catch (e) {
                console.warn(`All API attempts failed for ${noradId}, using fallback.`);
            }
        }
        return null;
    };

    const apiResult = await fetchFromApi();
    if (apiResult) return apiResult;

    // Use fallback
    if (FALLBACK_TLES[noradId]) {
        console.info(`Using fallback TLE for ${noradId}`);
        return FALLBACK_TLES[noradId];
    }

    return null;
}

function parseTLE(text: string) {
    const lines = text.trim().split('\n');
    if (lines.length >= 2) {
        if (lines.length === 3) {
            return { line1: lines[1].trim(), line2: lines[2].trim() };
        } else if (lines.length === 2 && lines[0].startsWith('1 ')) {
            return { line1: lines[0].trim(), line2: lines[1].trim() };
        }
    }
    return null;
}

export function calculateSatellitePosition(
    tleLine1: string,
    tleLine2: string,
    date: Date
): SatellitePosition | null {
    try {
        const satrec = twoline2satrec(tleLine1, tleLine2);
        const positionAndVelocity = propagate(satrec, date);

        if (!positionAndVelocity.position || !positionAndVelocity.velocity) {
            // Satellite might be decayed or error in TLE
            return null;
        }

        const positionEci = positionAndVelocity.position as { x: number; y: number; z: number };
        const velocityEci = positionAndVelocity.velocity as { x: number; y: number; z: number };

        const gmst = gstime(date);
        const positionGd = eciToGeodetic(positionEci, gmst);

        // Velocity magnitude in km/s -> km/h
        const vel = Math.sqrt(
            velocityEci.x * velocityEci.x +
            velocityEci.y * velocityEci.y +
            velocityEci.z * velocityEci.z
        ) * 3600;

        return {
            latitude: radiansToDegrees(positionGd.latitude),
            longitude: radiansToDegrees(positionGd.longitude),
            altitude: positionGd.height, // km
            velocity: vel, // km/h
            timestamp: date.getTime(),
            id: '' // filled by caller
        };
    } catch (err) {
        console.error('Error calculating satellite position:', err);
        return null;
    }
}

export function generateOrbitPath(tleLine1: string, tleLine2: string, startTime: number, periodMinutes: number = 90): OrbitPoint[] {
    const points: OrbitPoint[] = [];
    const satrec = twoline2satrec(tleLine1, tleLine2);

    // Calculate path for -1 orbit to +1 orbit
    const range = periodMinutes * 2; // cover enough ground
    const step = 2; // minutes

    // Start from -periodMinutes to +periodMinutes relative to now
    // Actually typically we want future path mainly, or current orbit.
    // Let's do -45 min to +45 min (approx 1 orbit)

    const startOffset = -periodMinutes / 2;
    const endOffset = periodMinutes / 2;

    for (let i = startOffset; i <= endOffset; i += step) {
        const time = new Date(startTime + i * 60 * 1000);
        const gmst = gstime(time);
        const pv = propagate(satrec, time);

        if (pv.position && typeof pv.position !== 'boolean') { // boolean check for TS
            const posEci = pv.position as { x: number, y: number, z: number };
            const posGd = eciToGeodetic(posEci, gmst);
            points.push({
                lat: radiansToDegrees(posGd.latitude),
                lng: radiansToDegrees(posGd.longitude),
                timestamp: time.getTime()
            });
        }
    }
    return points;
}
