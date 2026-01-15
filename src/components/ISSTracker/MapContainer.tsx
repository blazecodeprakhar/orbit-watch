import { useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer, useMap } from 'react-leaflet';
import { Map as LeafletMap, LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import { ISSMarker } from './ISSMarker';
import { OrbitPath } from './OrbitPath';
import { TerminatorOverlay } from './TerminatorOverlay';
import { ISSPosition, OrbitPoint, TrackerState } from './types';

interface MapComponentProps {
  position: ISSPosition | null;
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

export function MapComponent({ position, orbitPath, state, onMapReady }: MapComponentProps) {
  const tileConfig = MAP_TILES[state.mapStyle];
  
  const center: LatLngExpression = [0, 0];
  const maxBounds: LatLngBoundsExpression = [[-90, -Infinity], [90, Infinity]];

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
      zoomControl={true}
    >
      <MapController onMapReady={onMapReady} />
      
      {/* Base Tile Layer */}
      <TileLayer
        key={state.mapStyle}
        url={tileConfig.url}
        attribution={tileConfig.attribution}
      />
      
      {/* Labels Layer (on top of satellite/dark maps) */}
      {state.showLabels && (state.mapStyle === 'satellite' || state.mapStyle === 'dark') && (
        <TileLayer
          url={LABELS_LAYER.url}
          attribution={LABELS_LAYER.attribution}
          pane="overlayPane"
        />
      )}
      
      {/* Day/Night Terminator */}
      {state.showTerminator && <TerminatorOverlay />}
      
      {/* Orbit Path */}
      {state.showOrbit && position && (
        <OrbitPath 
          orbitPath={orbitPath} 
          currentTimestamp={position.timestamp} 
        />
      )}
      
      {/* ISS Marker */}
      {position && (
        <ISSMarker 
          position={position} 
          followISS={state.followISS} 
        />
      )}
    </LeafletMapContainer>
  );
}
