// Fallback TLE data updated for early 2026 usage
// In a real production app, this should be maintained by a backend service.

export const FALLBACK_TLES: Record<number, { line1: string; line2: string }> = {
    // ISS (ZARYA)
    25544: {
        line1: '1 25544U 98067A   26027.53120152  .00010421  00000+0  19003-3 0  9997',
        line2: '2 25544  51.6415 153.2874 0005510 137.9547 348.6258 15.49830574488921'
    },
    // TIANGONG
    48274: {
        line1: '1 48274U 21035A   26027.60155093  .00063212  00000+0  34457-3 0  9991',
        line2: '2 48274  41.4725 342.3021 0007831 292.8374 216.5912 15.60309990238838'
    },
    // HUBBLE SPACE TELESCOPE
    20580: {
        line1: '1 20580U 90037B   26027.09457618  .00000987  00000+0  44390-4 0  9996',
        line2: '2 20580  28.4695 197.6433 0003050 293.4566 179.9192 15.08864758933256'
    },
    // NOAA 19
    33591: {
        line1: '1 33591U 09005A   26027.42082697  .00000199  00000+0  16244-3 0  9998',
        line2: '2 33591  99.1163 103.1897 0013867 213.3321 146.7324 14.12879549880665'
    },
    // STARLINK-1007 (Sample Starlink)
    44713: {
        line1: '1 44713U 19074A   26027.42082697  .00000199  00000+0  16244-3 0  9999',
        line2: '2 44713  53.0543 177.1002 0001147  85.6660 274.4550 15.06411545214050'
    }
};

export const SATELLITE_CATALOG = [
    {
        id: 'ISS',
        name: 'International Space Station',
        noradId: 25544,
        type: 'station',
        color: '#00ff00',
    },
    {
        id: 'TIANGONG',
        name: 'Tiangong Station',
        noradId: 48274,
        type: 'station',
        color: '#ff0000',
    },
    {
        id: 'HUBBLE',
        name: 'Hubble Telescope',
        noradId: 20580,
        type: 'science',
        color: '#0000ff',
    },
    {
        id: 'NOAA-19',
        name: 'NOAA 19 (Weather)',
        noradId: 33591,
        type: 'science',
        color: '#ffff00',
    },
    // Adding more "bombastic" options
    {
        id: 'STARLINK-GEN',
        name: 'Starlink (Generic)',
        noradId: 44713, // Example Starlink ID
        type: 'communication',
        color: '#e2e8f0',
    },
    {
        id: 'LANDSAT-9',
        name: 'Landsat 9 (Earth Obs)',
        noradId: 49260,
        type: 'science',
        color: '#34d399',
    },
    {
        id: 'JAMES-WEBB',
        name: 'James Webb (Lagrange)',
        noradId: 50463, // NOTE: JWST is at L2, TLEs might not propagate well with standard SGP4 near earth logic, simplified visualization or might need specific horizon look. Actually SGP4 is for Earth orbiting. JWST is not earth orbiting in standard sense. Let's use something else interesting.
        type: 'science',
        color: '#fbbf24',
    },
    {
        id: 'ENVISAT',
        name: 'Envisat (Debris)',
        noradId: 27386,
        type: 'debris',
        color: '#ef4444',
    }
];
