import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';
import { SatelliteData, SatellitePosition, OrbitPoint } from './types';
import { SATELLITE_CATALOG } from '../../config/satellite-config';

interface GlobeViewProps {
  satellites: Map<string, SatelliteData>;
  activeSatelliteId: string;
  orbitPath: OrbitPoint[];
  showOrbit: boolean;
  showTerminator: boolean;
  showAllSatellites: boolean;
}

// High-quality Earth textures
const EARTH_TEXTURES = {
  map: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg',
  bump: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-topology.png',
  specular: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-water.png',
  clouds: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-clouds.png',
  night: 'https://unpkg.com/three-globe@2.24.13/example/img/earth-night.jpg',
};

// Calculate sun position based on current time
function calculateSunPosition(): THREE.Vector3 {
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const hours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;

  // Solar declination (approximate)
  const declination = -23.45 * Math.cos((360 / 365) * (dayOfYear + 10) * Math.PI / 180);
  const declinationRad = declination * Math.PI / 180;

  // Hour angle (sun position relative to Greenwich)
  const hourAngle = (hours - 12) * 15 * Math.PI / 180;

  const distance = 15;
  const x = distance * Math.cos(declinationRad) * Math.sin(-hourAngle);
  const y = distance * Math.sin(declinationRad);
  const z = distance * Math.cos(declinationRad) * Math.cos(-hourAngle);

  return new THREE.Vector3(x, y, z);
}

// Earth Component with realistic textures and proper day/night
function Earth({ showTerminator }: { showTerminator: boolean }) {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const nightRef = useRef<THREE.Mesh>(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);

  const [earthTexture, bumpTexture, specularTexture, nightTexture, cloudTexture] = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return [
      loader.load(EARTH_TEXTURES.map, () => setTexturesLoaded(true)),
      loader.load(EARTH_TEXTURES.bump),
      loader.load(EARTH_TEXTURES.specular),
      loader.load(EARTH_TEXTURES.night),
      loader.load(EARTH_TEXTURES.clouds),
    ];
  }, []);

  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.008;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.012;
    }
    if (nightRef.current) {
      nightRef.current.rotation.y = earthRef.current?.rotation.y || 0;
    }
  });

  return (
    <group>
      {/* Main Earth - day side */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Night lights layer - only visible on dark side */}
      {showTerminator && (
        <mesh ref={nightRef}>
          <sphereGeometry args={[2.001, 128, 128]} />
          <meshBasicMaterial
            map={nightTexture}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Cloud layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.015, 96, 96]} />
        <meshStandardMaterial
          map={cloudTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
          side={THREE.DoubleSide}
          roughness={1}
        />
      </mesh>
    </group>
  );
}

// Day/Night terminator overlay sphere
function TerminatorOverlay3D({ sunPosition }: { sunPosition: THREE.Vector3 }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.sunDirection.value.copy(sunPosition).normalize();
    }
  });

  return (
    <Sphere args={[2.002, 128, 128]}>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        uniforms={{
          sunDirection: { value: sunPosition.clone().normalize() },
        }}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 sunDirection;
          varying vec3 vNormal;
          varying vec3 vPosition;
          
          void main() {
            vec3 normal = normalize(vNormal);
            float sunDot = dot(normal, sunDirection);
            
            // Smooth transition at terminator line
            float terminator = smoothstep(-0.15, 0.1, sunDot);
            
            // Night side darkening
            float nightAlpha = (1.0 - terminator) * 0.5;
            
            // Terminator glow line
            float glowWidth = 0.08;
            float glow = 1.0 - smoothstep(0.0, glowWidth, abs(sunDot));
            glow *= 0.3;
            
            vec3 nightColor = vec3(0.02, 0.03, 0.08);
            vec3 glowColor = vec3(1.0, 0.6, 0.2);
            
            vec3 finalColor = mix(nightColor, glowColor, glow);
            float finalAlpha = nightAlpha + glow * 0.5;
            
            gl_FragColor = vec4(finalColor, finalAlpha);
          }
        `}
      />
    </Sphere>
  );
}

// Multi-layer atmosphere for realistic glow
function Atmosphere() {
  return (
    <group>
      {/* Inner atmospheric glow */}
      <Sphere args={[2.04, 64, 64]}>
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            c: { value: 0.6 },
            p: { value: 4.5 },
            glowColor: { value: new THREE.Color('#4da6ff') },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float c;
            uniform float p;
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, intensity * 0.5);
            }
          `}
        />
      </Sphere>

      {/* Outer glow halo */}
      <Sphere args={[2.15, 64, 64]}>
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            c: { value: 0.4 },
            p: { value: 3.0 },
            glowColor: { value: new THREE.Color('#87ceeb') },
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float c;
            uniform float p;
            uniform vec3 glowColor;
            varying vec3 vNormal;
            void main() {
              float intensity = pow(c - dot(vNormal, vec3(0.0, 0.0, 1.0)), p);
              gl_FragColor = vec4(glowColor, intensity * 0.25);
            }
          `}
        />
      </Sphere>
    </group>
  );
}

// Convert lat/lng to 3D position
function latLngTo3D(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

// Professional satellite marker with label
function SatelliteMarker3D({
  position,
  color,
  isActive,
  label,
  altitude = 420
}: {
  position: SatellitePosition;
  color: string;
  isActive: boolean;
  label: string;
  altitude?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Calculate 3D position with proper altitude scaling
  const pos3D = useMemo(() => {
    const baseRadius = 2.0;
    const altitudeScale = 0.0003;
    const orbitRadius = baseRadius + 0.1 + altitude * altitudeScale;
    return latLngTo3D(position.latitude, position.longitude, orbitRadius);
  }, [position.latitude, position.longitude, altitude]);

  useFrame((state) => {
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      glowRef.current.scale.setScalar(scale);
    }
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
    }
  });

  const size = isActive ? 1.4 : 0.8;
  const colorObj = new THREE.Color(color);

  return (
    <group ref={groupRef} position={pos3D}>
      {/* Outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.1 * size, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Satellite body */}
      <mesh>
        <boxGeometry args={[0.06 * size, 0.02 * size, 0.1 * size]} />
        <meshStandardMaterial
          color="#f0f0f0"
          emissive={colorObj}
          emissiveIntensity={isActive ? 0.8 : 0.4}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Solar panel left */}
      <mesh position={[-0.1 * size, 0, 0]}>
        <boxGeometry args={[0.1 * size, 0.003 * size, 0.05 * size]} />
        <meshStandardMaterial
          color="#1a365d"
          emissive={new THREE.Color('#0066cc')}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Solar panel right */}
      <mesh position={[0.1 * size, 0, 0]}>
        <boxGeometry args={[0.1 * size, 0.003 * size, 0.05 * size]} />
        <meshStandardMaterial
          color="#1a365d"
          emissive={new THREE.Color('#0066cc')}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Point light for glow effect */}
      <pointLight
        color={color}
        intensity={isActive ? 2.5 : 1}
        distance={isActive ? 2 : 1}
        decay={2}
      />

      {/* Active indicator ring */}
      {isActive && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.18, 0.22, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Label for active satellite */}
      {isActive && (
        <Html
          position={[0, 0.2, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2 py-1 rounded-md bg-card/90 backdrop-blur-sm border border-primary/30 text-xs font-medium text-primary whitespace-nowrap">
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

// Orbit line components
function PastOrbitLine({
  orbitPath,
  currentTimestamp,
  color
}: {
  orbitPath: OrbitPoint[];
  currentTimestamp: number;
  color: string;
}) {
  const line = useMemo(() => {
    const pastPoints = orbitPath.filter(p => p.timestamp <= currentTimestamp);
    if (pastPoints.length < 2) return null;

    const points = pastPoints.map(p => latLngTo3D(p.lat, p.lng, 2.18));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9,
      linewidth: 2,
    });

    return new THREE.Line(geometry, material);
  }, [orbitPath, currentTimestamp, color]);

  if (!line) return null;
  return <primitive object={line} />;
}

function FutureOrbitLine({
  orbitPath,
  currentTimestamp,
  color
}: {
  orbitPath: OrbitPoint[];
  currentTimestamp: number;
  color: string;
}) {
  const line = useMemo(() => {
    const futurePoints = orbitPath.filter(p => p.timestamp > currentTimestamp).slice(0, 100);
    if (futurePoints.length < 2) return null;

    const points = futurePoints.map(p => latLngTo3D(p.lat, p.lng, 2.18));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      dashSize: 0.05,
      gapSize: 0.025,
    });

    const lineObj = new THREE.Line(geometry, material);
    lineObj.computeLineDistances();
    return lineObj;
  }, [orbitPath, currentTimestamp, color]);

  if (!line) return null;
  return <primitive object={line} />;
}

// Dynamic sun light that follows real sun position
function SunLight({ showTerminator }: { showTerminator: boolean }) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const [sunPos, setSunPos] = useState(() => calculateSunPosition());

  useEffect(() => {
    const interval = setInterval(() => {
      setSunPos(calculateSunPosition());
    }, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useFrame(() => {
    if (lightRef.current) {
      lightRef.current.position.copy(sunPos);
      lightRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={sunPos.toArray()}
        intensity={showTerminator ? 4 : 2.5}
        color="#fffaf0"
        castShadow
      />
      {/* Sun representation */}
      <mesh position={sunPos.clone().normalize().multiplyScalar(12)}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color="#fff8dc" />
      </mesh>
    </>
  );
}

// Camera controller
function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.5, 5);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  return null;
}

// Main scene component
function Scene({
  satellites,
  activeSatelliteId,
  orbitPath,
  showOrbit,
  showTerminator,
  showAllSatellites
}: {
  satellites: Map<string, SatelliteData>;
  activeSatelliteId: string;
  orbitPath: OrbitPoint[];
  showOrbit: boolean;
  showTerminator: boolean;
  showAllSatellites: boolean;
}) {
  const activeSatellite = satellites.get(activeSatelliteId);
  const activeColor = SATELLITE_CATALOG.find(s => s.id === activeSatelliteId)?.color || '#00d4ff';
  const sunPosition = useMemo(() => calculateSunPosition(), []);

  return (
    <>
      <CameraController />

      {/* Ambient light - provides base illumination */}
      <ambientLight intensity={showTerminator ? 0.15 : 0.6} />

      {/* Main sun light */}
      <SunLight showTerminator={showTerminator} />

      {/* Fill lights for better visibility */}
      <directionalLight position={[-8, 4, -6]} intensity={0.3} color="#6ab0ff" />
      <directionalLight position={[0, -5, 5]} intensity={0.2} color="#ffd699" />

      {/* Star field */}
      <Stars
        radius={300}
        depth={150}
        count={10000}
        factor={6}
        saturation={0.3}
        fade
        speed={0.2}
      />

      {/* Earth */}
      <Earth showTerminator={showTerminator} />

      {/* Day/Night terminator overlay */}
      {showTerminator && <TerminatorOverlay3D sunPosition={sunPosition} />}

      {/* Atmosphere */}
      <Atmosphere />

      {/* Orbit paths */}
      {showOrbit && activeSatellite?.position && orbitPath.length > 0 && (
        <>
          <PastOrbitLine
            orbitPath={orbitPath}
            currentTimestamp={activeSatellite.position.timestamp}
            color={activeColor}
          />
          <FutureOrbitLine
            orbitPath={orbitPath}
            currentTimestamp={activeSatellite.position.timestamp}
            color={activeColor}
          />
        </>
      )}

      {/* Satellite markers */}
      {showAllSatellites ? (
        Array.from(satellites.values()).map((sat) => {
          if (!sat.position) return null;
          const catalog = SATELLITE_CATALOG.find(s => s.id === sat.id);
          return (
            <SatelliteMarker3D
              key={sat.id}
              position={sat.position}
              color={catalog?.color || '#00d4ff'}
              isActive={sat.id === activeSatelliteId}
              label={sat.shortName}
              altitude={sat.altitude}
            />
          );
        })
      ) : (
        activeSatellite?.position && (
          <SatelliteMarker3D
            position={activeSatellite.position}
            color={activeColor}
            isActive={true}
            label={activeSatellite.shortName}
            altitude={activeSatellite.altitude}
          />
        )
      )}

      {/* Orbit controls */}
      <OrbitControls
        enablePan={false}
        minDistance={3.2}
        maxDistance={18}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        autoRotate={false}
      />
    </>
  );
}

export function GlobeView({
  satellites,
  activeSatelliteId,
  orbitPath,
  showOrbit,
  showTerminator,
  showAllSatellites
}: GlobeViewProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 1.5, 5], fov: 50 }}
        style={{
          background: 'radial-gradient(ellipse at center, #0a1628 0%, #000208 100%)'
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3,
        }}
        dpr={[1, 2]}
        shadows
      >
        <Scene
          satellites={satellites}
          activeSatelliteId={activeSatelliteId}
          orbitPath={orbitPath}
          showOrbit={showOrbit}
          showTerminator={showTerminator}
          showAllSatellites={showAllSatellites}
        />
      </Canvas>
    </div>
  );
}

export default GlobeView;