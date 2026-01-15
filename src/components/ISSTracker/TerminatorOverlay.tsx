import { Polygon } from 'react-leaflet';
import { useTerminator } from './hooks/useTerminator';

export function TerminatorOverlay() {
  const nightPolygons = useTerminator();

  return (
    <>
      {nightPolygons.map((polygon, index) => (
        <Polygon
          key={index}
          positions={polygon}
          pathOptions={{
            color: 'rgba(0, 180, 230, 0.25)',
            fillColor: 'rgba(5, 10, 25, 0.55)',
            fillOpacity: 0.55,
            weight: 2,
            dashArray: '4, 4',
          }}
          className="terminator-overlay"
        />
      ))}
    </>
  );
}
