import { useEffect, useMemo } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import { ISSPosition } from './types';

interface ISSMarkerProps {
  position: ISSPosition;
  followISS: boolean;
}

export function ISSMarker({ position, followISS }: ISSMarkerProps) {
  const map = useMap();

  const issIcon = useMemo(() => {
    return L.divIcon({
      className: 'iss-marker-container',
      html: `
        <div class="iss-marker" style="
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg viewBox="0 0 64 64" width="48" height="48" style="filter: drop-shadow(0 0 8px #00d4ff) drop-shadow(0 0 16px rgba(0, 212, 255, 0.5));">
            <!-- Main body -->
            <rect x="24" y="28" width="16" height="8" rx="2" fill="#e0e0e0" stroke="#00d4ff" stroke-width="1"/>
            <!-- Solar panels left -->
            <rect x="4" y="26" width="18" height="12" rx="1" fill="#1a365d" stroke="#00d4ff" stroke-width="0.5"/>
            <line x1="8" y1="26" x2="8" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <line x1="13" y1="26" x2="13" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <line x1="18" y1="26" x2="18" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <!-- Solar panels right -->
            <rect x="42" y="26" width="18" height="12" rx="1" fill="#1a365d" stroke="#00d4ff" stroke-width="0.5"/>
            <line x1="46" y1="26" x2="46" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <line x1="51" y1="26" x2="51" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <line x1="56" y1="26" x2="56" y2="38" stroke="#00d4ff" stroke-width="0.5" opacity="0.5"/>
            <!-- Connection arms -->
            <rect x="22" y="30" width="2" height="4" fill="#b0b0b0"/>
            <rect x="40" y="30" width="2" height="4" fill="#b0b0b0"/>
            <!-- Modules -->
            <circle cx="28" cy="32" r="3" fill="#c0c0c0" stroke="#00d4ff" stroke-width="0.5"/>
            <circle cx="36" cy="32" r="3" fill="#c0c0c0" stroke="#00d4ff" stroke-width="0.5"/>
            <!-- Radiators top -->
            <rect x="26" y="20" width="12" height="6" rx="1" fill="#8b7355" stroke="#00d4ff" stroke-width="0.5"/>
            <!-- Radiators bottom -->
            <rect x="26" y="38" width="12" height="6" rx="1" fill="#8b7355" stroke="#00d4ff" stroke-width="0.5"/>
          </svg>
          <div style="
            position: absolute;
            width: 60px;
            height: 60px;
            border: 2px solid rgba(0, 212, 255, 0.4);
            border-radius: 50%;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          "></div>
        </div>
        <style>
          @keyframes ping {
            75%, 100% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0;
            }
          }
        </style>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -24],
    });
  }, []);

  useEffect(() => {
    if (followISS && position) {
      map.flyTo([position.latitude, position.longitude], map.getZoom(), {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [position, followISS, map]);

  if (!position) return null;

  const markerPosition: LatLngExpression = [position.latitude, position.longitude];

  return (
    <Marker 
      position={markerPosition} 
      icon={issIcon}
    >
      <Popup>
        <div className="text-foreground bg-card p-2 rounded">
          <h3 className="font-bold text-primary mb-2">International Space Station</h3>
          <p className="text-sm">Lat: {position.latitude.toFixed(4)}°</p>
          <p className="text-sm">Lng: {position.longitude.toFixed(4)}°</p>
        </div>
      </Popup>
    </Marker>
  );
}
