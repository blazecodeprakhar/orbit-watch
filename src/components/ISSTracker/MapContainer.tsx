import { useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { Map as LeafletMap, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { ISSMarker } from './ISSMarker';
import { OrbitPath } from './OrbitPath';
import { TerminatorOverlay } from './TerminatorOverlay';
import { SatelliteData, OrbitPoint, TrackerState } from './types';
import { SATELLITE_CATALOG } from '../../config/satellite-config';

interface MapComponentProps {
  satellites: Map<string, SatelliteData>;
  activeSatelliteId: string;
  orbitPath: OrbitPoint[];
  state: TrackerState;
  onMapReady: (map: LeafletMap) => void;
}

const MAP_TILES = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

const LABELS_LAYER = {
  url: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  attribution: '&copy; OpenStreetMap &copy; CARTO',
};

function MapController({ onMapReady }: { onMapReady: (map: LeafletMap) => void }) {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

  return null;
}

export function MapComponent({
  satellites,
  activeSatelliteId,
  orbitPath,
  state,
  onMapReady
}: MapComponentProps) {
  const tileConfig = MAP_TILES[state.mapStyle];

  const center: LatLngExpression = [0, 0];
  const maxBounds: LatLngBoundsExpression = [[-90, -Infinity], [90, Infinity]];

  const activeSatellite = satellites.get(activeSatelliteId);

  return (
    <LeafletMapContainer
      center={center}
      zoom={2}
      className="w-full h-full"
      worldCopyJump={true}
      maxBounds={maxBounds}
      maxBoundsViscosity={0.5}
      minZoom={2}
      maxZoom={18}
      zoomControl={false}
      attributionControl={false}
    >
      <MapController onMapReady={onMapReady} />

      {/* Base Tile Layer */}
      <TileLayer
        key={state.mapStyle}
        url={tileConfig.url}
      />

      {/* Labels Layer (on top of satellite/dark maps) */}
      {state.showLabels && (state.mapStyle === 'satellite' || state.mapStyle === 'dark') && (
        <TileLayer
          url={LABELS_LAYER.url}
          pane="overlayPane"
        />
      )}

      {/* Day/Night Terminator */}
      {state.showTerminator && <TerminatorOverlay />}

      {/* Orbit Path for active satellite */}
      {state.showOrbit && activeSatellite?.position && (
        <OrbitPath
          orbitPath={orbitPath}
          currentTimestamp={activeSatellite.position.timestamp}
          color={SATELLITE_CATALOG.find(s => s.id === activeSatelliteId)?.color || '#00d4ff'}
        />
      )}

      {/* All Satellites or Active Satellite */}
      {state.showAllSatellites ? (
        // Show all satellites
        Array.from(satellites.values()).map((sat) => {
          if (!sat.position) return null;
          const isActive = sat.id === activeSatelliteId;
          const catalog = SATELLITE_CATALOG.find(s => s.id === sat.id);

          return (
            <ISSMarker
              key={sat.id}
              position={sat.position}
              followISS={isActive && state.followSatellite}
              color={catalog?.color || '#00d4ff'}
              label={sat.shortName}
              isActive={isActive}
            />
          );
        })
      ) : (
        // Show only active satellite
        activeSatellite?.position && (
          <ISSMarker
            position={activeSatellite.position}
            followISS={state.followSatellite}
            color={SATELLITE_CATALOG.find(s => s.id === activeSatelliteId)?.color || '#00d4ff'}
            label={activeSatellite.shortName}
            isActive={true}
          />
        )
      )}
    </LeafletMapContainer>
  );
}
