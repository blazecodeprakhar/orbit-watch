import { useState, useEffect } from 'react';
import { LatLngExpression } from 'leaflet';

// Calculate the terminator line (day/night boundary) with smooth animation
export function useTerminator(): LatLngExpression[][] {
  const [polygons, setPolygons] = useState<LatLngExpression[][]>([]);

  useEffect(() => {
    const calculateTerminator = () => {
      const now = new Date();
      const julianDate = getJulianDate(now);
      const sunPosition = getSunPosition(julianDate);
      
      const nightPolygon: LatLngExpression[] = [];
      
      // Calculate terminator points with higher resolution for smooth curve
      for (let lng = -180; lng <= 180; lng += 1) {
        const lat = getTerminatorLatitude(lng, sunPosition);
        if (!isNaN(lat) && isFinite(lat)) {
          nightPolygon.push([Math.max(-85, Math.min(85, lat)), lng]);
        }
      }
      
      // Close the polygon for night side
      const sunLat = sunPosition.declination * 180 / Math.PI;
      
      if (sunLat >= 0) {
        // Sun in northern hemisphere - night is towards south
        nightPolygon.push([-85, 180]);
        nightPolygon.push([-85, -180]);
      } else {
        // Sun in southern hemisphere - night is towards north
        nightPolygon.push([85, 180]);
        nightPolygon.push([85, -180]);
      }
      
      setPolygons([nightPolygon]);
    };

    // Initial calculation
    calculateTerminator();
    
    // Update every 30 seconds for smooth animation
    const interval = setInterval(calculateTerminator, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return polygons;
}

function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function getSunPosition(julianDate: number): { rightAscension: number; declination: number } {
  const n = julianDate - 2451545.0;
  const L = ((280.460 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360 + 360) % 360) * Math.PI / 180;
  const lambda = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * Math.PI / 180;
  const epsilon = 23.439 * Math.PI / 180;
  
  const rightAscension = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  const declination = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  
  return { rightAscension, declination };
}

function getTerminatorLatitude(longitude: number, sunPosition: { rightAscension: number; declination: number }): number {
  const now = new Date();
  const gmst = getGMST(now);
  const hourAngle = gmst + longitude * Math.PI / 180 - sunPosition.rightAscension;
  
  // Avoid division by zero when declination is 0
  if (Math.abs(sunPosition.declination) < 0.0001) {
    return 0;
  }
  
  const lat = Math.atan(-Math.cos(hourAngle) / Math.tan(sunPosition.declination));
  return lat * 180 / Math.PI;
}

function getGMST(date: Date): number {
  const julianDate = getJulianDate(date);
  const T = (julianDate - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (julianDate - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  return gmst * Math.PI / 180;
}
