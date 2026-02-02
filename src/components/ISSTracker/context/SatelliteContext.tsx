import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { Satellite, SatellitePosition, OrbitPoint } from '../types';
import { INITIAL_SATELLITES, fetchSatelliteTLE, calculateSatellitePosition, generateOrbitPath } from '@/lib/satellite-utils';

interface SatelliteContextType {
    satellites: Satellite[];
    positions: Map<string, SatellitePosition>;
    orbits: Map<string, OrbitPoint[]>;
    selectedSatelliteId: string;
    setSelectedSatelliteId: (id: string) => void;
    showAllSatellites: boolean;
    setShowAllSatellites: (show: boolean) => void;
    isTracking: boolean;
    setIsTracking: (track: boolean) => void;
    isLoading: boolean;
    addSatellite: (satellite: Satellite) => void;
}

const SatelliteContext = createContext<SatelliteContextType | undefined>(undefined);

export function SatelliteProvider({ children }: { children: React.ReactNode }) {
    const [satellites, setSatellites] = useState<Satellite[]>(INITIAL_SATELLITES);
    const [positions, setPositions] = useState<Map<string, SatellitePosition>>(new Map());
    const [orbits, setOrbits] = useState<Map<string, OrbitPoint[]>>(new Map());
    const [selectedSatelliteId, setSelectedSatelliteId] = useState<string>('ISS');
    const [showAllSatellites, setShowAllSatellites] = useState<boolean>(false);
    const [isTracking, setIsTracking] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const lastUpdateRef = useRef<number>(0);
    const requestRef = useRef<number>();

    // Fetch TLEs on mount
    useEffect(() => {
        const initSatellites = async () => {
            setIsLoading(true);
            const updatedSatellites = [...satellites];

            await Promise.all(updatedSatellites.map(async (sat, index) => {
                const tle = await fetchSatelliteTLE(sat.noradId);
                if (tle) {
                    updatedSatellites[index] = { ...sat, tleLine1: tle.line1, tleLine2: tle.line2 };
                }
            }));

            setSatellites(updatedSatellites);
            setIsLoading(false);
        };

        initSatellites();
    }, []);

    // Tracking Loop
    const updatePositions = useCallback(() => {
        if (!isTracking) return;

        const now = new Date();
        // Throttle updates to 60fps or lower if needed, but for smooth movement, every frame is good.
        // However, React state updates might be heavy. Let's do 100ms or so if performance is bad.
        // For now, let's try 1s (1000ms) interval like the original code, or maybe 100ms for smoothness.
        // The original code used 5000ms. That's choppy. Let's do 500ms? 
        // Actually, for "bombastic" UI, we want smooth movement. Interpolation or fast updates.
        // Let's stick to 1s for now to avoid freezing the tab.

        // Update every 1 second for smooth movement without overwhelming the browser
        if (Date.now() - lastUpdateRef.current < 1000) {
            requestRef.current = requestAnimationFrame(updatePositions);
            return;
        }
        lastUpdateRef.current = Date.now();

        const newPositions = new Map<string, SatellitePosition>();
        const newOrbits = new Map<string, OrbitPoint[]>();

        satellites.forEach(sat => {
            if (sat.tleLine1 && sat.tleLine2) {
                const pos = calculateSatellitePosition(sat.tleLine1, sat.tleLine2, now);
                if (pos) {
                    pos.id = sat.id;
                    newPositions.set(sat.id, pos);

                    // Generate orbit path only occasionally or if missing? 
                    // Re-calculating orbit path every second is expensive.
                    // Only calculate if not exists or if significant time passed.
                    // For now, let's just calculate orbit for the SELECTED satellite or ALL if showAll is true.

                    if (sat.id === selectedSatelliteId || showAllSatellites) {
                        // Only update orbit path every minute?
                        // Or just once on selection change. 
                        // We'll simplisticly do it here but optimize later.
                        // Actually, let's just do it if it's missing or every minute.
                        if (!orbits.has(sat.id) || now.getSeconds() % 60 === 0) {
                            const path = generateOrbitPath(sat.tleLine1, sat.tleLine2, now.getTime());
                            newOrbits.set(sat.id, path);
                        } else {
                            newOrbits.set(sat.id, orbits.get(sat.id) || []);
                        }
                    }
                }
            }
        });

        setPositions(newPositions);
        setOrbits(prev => {
            // Merge new orbits with existing ones
            const next = new Map(prev);
            newOrbits.forEach((val, key) => next.set(key, val));
            return next;
        });

        requestRef.current = requestAnimationFrame(updatePositions);
    }, [satellites, isTracking, selectedSatelliteId, showAllSatellites, orbits]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updatePositions);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [updatePositions]);

    const addSatellite = (satellite: Satellite) => {
        setSatellites(prev => [...prev, satellite]);
    };

    return (
        <SatelliteContext.Provider value={{
            satellites,
            positions,
            orbits,
            selectedSatelliteId,
            setSelectedSatelliteId,
            showAllSatellites,
            setShowAllSatellites,
            isTracking,
            setIsTracking,
            isLoading,
            addSatellite
        }}>
            {children}
        </SatelliteContext.Provider>
    );
}

export function useSatellite() {
    const context = useContext(SatelliteContext);
    if (context === undefined) {
        throw new Error('useSatellite must be used within a SatelliteProvider');
    }
    return context;
}
