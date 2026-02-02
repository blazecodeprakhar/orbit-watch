import { useState, useCallback, useEffect } from 'react';
import { Astronaut } from '../types';

const ASTRONAUTS_API_URL = 'https://corsproxy.io/?url=http://api.open-notify.org/astros.json';

export function useAstronauts() {
    const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
    const [astronautCount, setAstronautCount] = useState(0);

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

    useEffect(() => {
        fetchAstronauts();
    }, [fetchAstronauts]);

    return { astronauts, astronautCount };
}
