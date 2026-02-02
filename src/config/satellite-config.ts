import { SatelliteData } from '../components/ISSTracker/types';

// Enhanced satellite catalog with detailed strategies and information
export const SATELLITE_CATALOG: Omit<SatelliteData, 'position' | 'altitude' | 'velocity' | 'visibility'>[] = [
    // === SPACE STATIONS ===
    {
        id: 'iss',
        name: 'International Space Station',
        shortName: 'ISS',
        noradId: 25544,
        description: 'The ISS is a modular space station in low Earth orbit. It is a multinational collaborative project involving five participating space agencies: NASA (United States), Roscosmos (Russia), JAXA (Japan), ESA (Europe), and CSA (Canada). It serves as a microgravity and space environment research laboratory.',
        country: 'International',
        countryCode: 'INT',
        type: 'space-station',
        color: '#00d4ff',
    },
    {
        id: 'css',
        name: 'Tiangong Space Station',
        shortName: 'Tiangong',
        noradId: 48274,
        description: 'Tiangong ("Palace in the Sky") is a space station constructed by China in low Earth orbit between 340 and 450 km above the surface. It is China\'s first long-term space station.',
        country: 'China',
        countryCode: 'CN',
        type: 'space-station',
        color: '#ff4444',
    },

    // === OBSERVATORIES ===
    {
        id: 'hubble',
        name: 'Hubble Space Telescope',
        shortName: 'Hubble',
        noradId: 20580,
        description: 'The Hubble Space Telescope is a space telescope that was launched into low Earth orbit in 1990 and remains in operation. It is one of the largest and most versatile, renowned as a vital research tool and a public relations boon for astronomy.',
        country: 'USA',
        countryCode: 'US',
        type: 'satellite',
        color: '#ffd700',
    },
    {
        id: 'astrosat',
        name: 'AstroSat',
        shortName: 'AstroSat',
        noradId: 40930,
        description: 'AstroSat is India\'s first dedicated multi-wavelength space observatory. It enables the simultaneous multi-wavelength observation of various astronomical objects with a single satellite.',
        country: 'India',
        countryCode: 'IN',
        type: 'satellite',
        color: '#8b5cf6',
    },

    // === EARTH OBSERVATION ===
    {
        id: 'terra',
        name: 'Terra (EOS AM-1)',
        shortName: 'Terra',
        noradId: 25994,
        description: 'Terra is a multi-national NASA scientific research satellite in a Sun-synchronous orbit around the Earth. It is the flagship of the Earth Observing System (EOS).',
        country: 'USA',
        countryCode: 'US',
        type: 'satellite',
        color: '#4ade80',
    },
    {
        id: 'aqua',
        name: 'Aqua (EOS PM-1)',
        shortName: 'Aqua',
        noradId: 27424,
        description: 'Aqua is a multi-national NASA scientific research satellite in orbit around the Earth. It records information on water in the Earth system.',
        country: 'USA',
        countryCode: 'US',
        type: 'satellite',
        color: '#22d3ee',
    },
    {
        id: 'landsat9',
        name: 'Landsat 9',
        shortName: 'Landsat-9',
        noradId: 49260,
        description: 'Landsat 9 is an Earth observation satellite launched on 27 September 2021. It is the ninth satellite in the Landsat program.',
        country: 'USA',
        countryCode: 'US',
        type: 'satellite',
        color: '#a855f7',
    },
    {
        id: 'sentinel2a',
        name: 'Sentinel-2A',
        shortName: 'Sentinel-2A',
        noradId: 40697,
        description: 'Sentinel-2A is an Earth observation satellite from the European Union Copernicus Programme.',
        country: 'Europe',
        countryCode: 'EU',
        type: 'satellite',
        color: '#60a5fa',
    },

    // === ISRO SATELLITES ===
    {
        id: 'cartosat3',
        name: 'Cartosat-3',
        shortName: 'Cartosat-3',
        noradId: 44804,
        description: 'Cartosat-3 is an advanced Indian Earth observation satellite built and operated by ISRO, replacing the IRS series.',
        country: 'India',
        countryCode: 'IN',
        type: 'satellite',
        color: '#fb923c',
    },
    {
        id: 'risat2br1',
        name: 'RISAT-2BR1',
        shortName: 'RISAT-2B',
        noradId: 44857,
        description: 'RISAT-2BR1 is a radar imaging earth observation satellite developed by ISRO.',
        country: 'India',
        countryCode: 'IN',
        type: 'satellite',
        color: '#f97316',
    },

    // === WEATHER ===
    {
        id: 'noaa19',
        name: 'NOAA 19',
        shortName: 'NOAA-19',
        noradId: 33591,
        description: 'NOAA-19 is the last of the United States National Oceanic and Atmospheric Administration\'s POES series of weather satellites.',
        country: 'USA',
        countryCode: 'US',
        type: 'satellite',
        color: '#f472b6',
    },
    {
        id: 'insat3d',
        name: 'INSAT-3D',
        shortName: 'INSAT-3D',
        noradId: 39216,
        description: 'INSAT-3D is a meteorological satellite with advanced imaging system and atmospheric sounder.',
        country: 'India',
        countryCode: 'IN',
        type: 'satellite',
        color: '#ff6b00',
    },
    {
        id: 'insat3dr',
        name: 'INSAT-3DR',
        shortName: 'INSAT-3DR',
        noradId: 41752,
        description: 'INSAT-3DR is an advanced meteorological satellite of India configured with an imaging System and an Atmospheric Sounder.',
        country: 'India',
        countryCode: 'IN',
        type: 'satellite',
        color: '#f59e0b',
    },

    // === COMMUNICATION ===
    {
        id: 'starlink',
        name: 'Starlink-1007',
        shortName: 'Starlink',
        noradId: 44713,
        description: 'Starlink is a satellite internet constellation operated by American aerospace company SpaceX, providing coverage to over 60 countries.',
        country: 'SpaceX',
        countryCode: 'SPACEX',
        type: 'satellite',
        color: '#e879f9',
    },
];

// Fallback TLE data for when API is unreachable
export const FALLBACK_TLE: Record<number, { name: string; tle1: string; tle2: string }> = {
    // ISS
    25544: {
        name: 'ISS (ZARYA)',
        tle1: '1 25544U 98067A   24350.50000000  .00016717  00000-0  30000-3 0  9999',
        tle2: '2 25544  51.6400 247.4627 0006703  40.5000 320.0000 15.49000000000000',
    },
    // Tiangong
    48274: {
        name: 'CSS (TIANHE)',
        tle1: '1 48274U 21035A   24350.50000000  .00020000  00000-0  27000-3 0  9999',
        tle2: '2 48274  41.4700  80.0000 0005000  10.0000 350.0000 15.62000000000000',
    },
    // Hubble
    20580: {
        name: 'HST',
        tle1: '1 20580U 90037B   24350.50000000  .00001500  00000-0  90000-4 0  9999',
        tle2: '2 20580  28.4700 200.0000 0002500 300.0000  60.0000 15.09000000000000',
    },
    // Terra
    25994: {
        name: 'TERRA',
        tle1: '1 25994U 99068A   24350.50000000  .00000100  00000-0  20000-4 0  9999',
        tle2: '2 25994  98.2100 280.0000 0001200  90.0000 270.0000 14.57000000000000',
    },
    // Aqua
    27424: {
        name: 'AQUA',
        tle1: '1 27424U 02022A   24350.50000000  .00000100  00000-0  20000-4 0  9999',
        tle2: '2 27424  98.2000 320.0000 0001000 100.0000 260.0000 14.57000000000000',
    },
    // NOAA-19
    33591: {
        name: 'NOAA 19',
        tle1: '1 33591U 09005A   24350.50000000  .00000100  00000-0  80000-4 0  9999',
        tle2: '2 33591  99.1900  50.0000 0014000  80.0000 280.0000 14.12000000000000',
    },
    // INSAT-3D (GEO)
    39216: {
        name: 'INSAT-3D',
        tle1: '1 39216U 13041A   24350.50000000  .00000100  00000-0  00000-0 0  9999',
        tle2: '2 39216   0.0500  82.0000 0002000  90.0000 270.0000  1.00270000000000',
    },
    // INSAT-3DR (GEO)
    41752: {
        name: 'INSAT-3DR',
        tle1: '1 41752U 16054A   24350.50000000  .00000100  00000-0  00000-0 0  9999',
        tle2: '2 41752   0.0500  74.0000 0002000  90.0000 270.0000  1.00270000000000',
    },
    // Cartosat-3
    44804: {
        name: 'CARTOSAT-3',
        tle1: '1 44804U 19089A   24350.50000000  .00000500  00000-0  30000-4 0  9999',
        tle2: '2 44804  97.5000 320.0000 0010000  50.0000 310.0000 15.19000000000000',
    },
    // RISAT-2BR1
    44857: {
        name: 'RISAT-2BR1',
        tle1: '1 44857U 19081A   24350.50000000  .00001000  00000-0  50000-4 0  9999',
        tle2: '2 44857  37.0000 150.0000 0010000  40.0000 320.0000 15.09000000000000',
    },
    // EOS-01
    46932: {
        name: 'EOS-01',
        tle1: '1 46932U 20079A   24350.50000000  .00001000  00000-0  50000-4 0  9999',
        tle2: '2 46932  37.0000 200.0000 0010000  60.0000 300.0000 15.09000000000000',
    },
    // Oceansat-3
    54358: {
        name: 'OCEANSAT-3',
        tle1: '1 54358U 22158A   24350.50000000  .00000300  00000-0  20000-4 0  9999',
        tle2: '2 54358  98.3000  30.0000 0010000  90.0000 270.0000 14.20000000000000',
    },
    // Resourcesat-2A
    41877: {
        name: 'RESOURCESAT-2A',
        tle1: '1 41877U 16074A   24350.50000000  .00000200  00000-0  15000-4 0  9999',
        tle2: '2 41877  98.7500 350.0000 0002000  80.0000 280.0000 14.21000000000000',
    },
    // AstroSat
    40930: {
        name: 'ASTROSAT',
        tle1: '1 40930U 15052A   24350.50000000  .00000500  00000-0  35000-4 0  9999',
        tle2: '2 40930   6.0000 300.0000 0010000  50.0000 310.0000 14.76000000000000',
    },
    // EOS-04
    51502: {
        name: 'EOS-04',
        tle1: '1 51502U 22012A   24350.50000000  .00000400  00000-0  25000-4 0  9999',
        tle2: '2 51502  97.4000  60.0000 0010000  70.0000 290.0000 15.18000000000000',
    },
    // Landsat-9
    49260: {
        name: 'LANDSAT 9',
        tle1: '1 49260U 21088A   24350.50000000  .00000200  00000-0  15000-4 0  9999',
        tle2: '2 49260  98.2000 280.0000 0001000 100.0000 260.0000 14.57000000000000',
    },
    // Starlink-1007
    44713: {
        name: 'STARLINK-1007',
        tle1: '1 44713U 19074A   24350.50000000  .00030000  00000-0  20000-3 0  9999',
        tle2: '2 44713  53.0000 120.0000 0001500  50.0000 310.0000 15.06000000000000',
    },
    // Sentinel-2A
    40697: {
        name: 'SENTINEL-2A',
        tle1: '1 40697U 15028A   24350.50000000  .00000100  00000-0  10000-4 0  9999',
        tle2: '2 40697  98.5700 220.0000 0001000 100.0000 260.0000 14.31000000000000',
    },
    // Jason-3
    41240: {
        name: 'JASON-3',
        tle1: '1 41240U 16002A   24350.50000000  .00000100  00000-0  15000-4 0  9999',
        tle2: '2 41240  66.0400 180.0000 0008000 270.0000  90.0000 12.81000000000000',
    },
};
