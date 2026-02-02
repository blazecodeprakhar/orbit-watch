import { useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { SatellitePosition } from './types';

interface ISSMarkerProps {
  position: SatellitePosition;
  followISS: boolean;
  color?: string;
  label?: string;
  isActive?: boolean;
}

export function ISSMarker({
  position,
  followISS,
  color = '#00d4ff',
  label = 'SAT',
  isActive = true
}: ISSMarkerProps) {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());

  useEffect(() => {
    const handleZoom = () => {
      setZoomLevel(map.getZoom());
    };

    // Initial set
    setZoomLevel(map.getZoom());

    map.on('zoomend', handleZoom);
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  const size = useMemo(() => {
    const base = isActive ? 45 : 30;
    // Scale size with zoom level
    // Zoom 2: factor ~0
    // Zoom 18: factor ~1.6 (add 80px)
    // Formula: extra pixels = (zoom - 2) * 5
    // Z2: 45
    // Z10: 45 + 40 = 85
    // Z18: 45 + 80 = 125
    const growthRate = 5;
    const zoomFactor = Math.max(0, zoomLevel - 2);
    const dynamicSize = base + (zoomFactor * growthRate);

    // Cap at reasonable max size
    return Math.min(dynamicSize, 130);
  }, [isActive, zoomLevel]);

  const icon = useMemo(() => {
    return L.divIcon({
      html: `
        <div class="satellite-marker" style="
          position: relative;
          width: ${size}px;
          height: ${size}px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <!-- Glow Effect -->
          <div style="
            position: absolute;
            width: ${size + 12}px;
            height: ${size + 12}px;
            background: radial-gradient(circle, ${color}30 0%, transparent 70%);
            border-radius: 50%;
            animation: pulse-glow 2s ease-in-out infinite;
          "></div>
          
          <!-- Satellite Image -->
          <img src="/satellite-real.png" style="
            width: ${size}px !important;
            height: ${size}px !important;
            max-width: ${size}px !important;
            max-height: ${size}px !important;
            filter: drop-shadow(0 0 4px ${color}) drop-shadow(0 0 8px ${color}40) brightness(1.1);
            transform: rotate(-45deg);
            object-fit: contain;
            pointer-events: none;
          " />
          
          ${isActive ? `
            <div style="
              position: absolute;
              top: -16px; 
              left: 50%;
              transform: translateX(-50%);
              background: ${color}25;
              border: 1px solid ${color}60;
              padding: 2px 8px;
              border-radius: 6px;
              font-size: 10px;
              font-weight: 600;
              color: ${color};
              white-space: nowrap;
              backdrop-filter: blur(4px);
              font-family: 'Inter', system-ui, sans-serif;
              pointer-events: none;
            ">${label}</div>
          ` : ''}
          
          <!-- Ping Rings -->
          <div style="
            position: absolute;
            width: ${size + 20}px;
            height: ${size + 20}px;
            border: 2px solid ${color}40;
            border-radius: 50%;
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
          "></div>
        </div>
        <style>
          @keyframes ping {
            75%, 100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
        </style>
      `,
      className: 'satellite-marker-container',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2],
    });
  }, [color, label, isActive, size]);

  useEffect(() => {
    if (followISS && isActive) {
      map.flyTo([position.latitude, position.longitude], map.getZoom(), {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [followISS, isActive, position.latitude, position.longitude, map]);

  const markerPosition: LatLngExpression = [position.latitude, position.longitude];

  return (
    <Marker
      position={markerPosition}
      icon={icon}
      zIndexOffset={isActive ? 1000 : 0}
    >
      <Popup>
        <div className="text-foreground bg-card p-2 rounded">
          <h3 className="font-bold mb-2" style={{ color }}>{label}</h3>
          <p className="text-sm">Lat: {position.latitude.toFixed(4)}°</p>
          <p className="text-sm">Lng: {position.longitude.toFixed(4)}°</p>
        </div>
      </Popup>
    </Marker>
  );
}
