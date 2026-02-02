import { Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { OrbitPoint } from './types';

interface OrbitPathProps {
  orbitPath: OrbitPoint[];
  currentTimestamp: number;
  color?: string;
}

export function OrbitPath({ orbitPath, currentTimestamp, color = '#00d4ff' }: OrbitPathProps) {
  // Split path into segments to handle dateline crossing
  const { pastSegments, futureSegments } = splitOrbitPath(orbitPath, currentTimestamp);

  // Generate a lighter/purple color for future path
  const futureColor = '#a855f7';

  return (
    <>
      {/* Past orbit path */}
      {pastSegments.map((segment, index) => (
        <Polyline
          key={`past-${index}`}
          positions={segment}
          pathOptions={{
            color: color,
            weight: 2.5,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ))}
      
      {/* Future orbit path */}
      {futureSegments.map((segment, index) => (
        <Polyline
          key={`future-${index}`}
          positions={segment}
          pathOptions={{
            color: futureColor,
            weight: 2,
            opacity: 0.5,
            dashArray: '10, 5',
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />
      ))}
    </>
  );
}

function splitOrbitPath(
  path: OrbitPoint[],
  currentTimestamp: number
): { pastSegments: LatLngExpression[][]; futureSegments: LatLngExpression[][] } {
  const pastSegments: LatLngExpression[][] = [];
  const futureSegments: LatLngExpression[][] = [];
  
  let currentPastSegment: LatLngExpression[] = [];
  let currentFutureSegment: LatLngExpression[] = [];
  
  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    const prevPoint = path[i - 1];
    
    // Check for dateline crossing (large longitude jump)
    const isDatelineCross = prevPoint && Math.abs(point.lng - prevPoint.lng) > 180;
    
    const latLng: LatLngExpression = [point.lat, point.lng];
    
    if (point.timestamp <= currentTimestamp) {
      if (isDatelineCross && currentPastSegment.length > 0) {
        pastSegments.push(currentPastSegment);
        currentPastSegment = [];
      }
      currentPastSegment.push(latLng);
    } else {
      if (isDatelineCross && currentFutureSegment.length > 0) {
        futureSegments.push(currentFutureSegment);
        currentFutureSegment = [];
      }
      currentFutureSegment.push(latLng);
    }
  }
  
  if (currentPastSegment.length > 0) pastSegments.push(currentPastSegment);
  if (currentFutureSegment.length > 0) futureSegments.push(currentFutureSegment);
  
  return { pastSegments, futureSegments };
}
