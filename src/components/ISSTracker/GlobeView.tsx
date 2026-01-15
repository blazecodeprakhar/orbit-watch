import { useRef, useMemo, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { ISSPosition, OrbitPoint } from './types';

interface GlobeViewProps {
  position: ISSPosition | null;
  orbitPath: OrbitPoint[];
  showOrbit: boolean;
  showTerminator: boolean;
}

// Earth component with proper ref handling
const Earth = forwardRef<THREE.Mesh>(function Earth(_, ref) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Create materials
  const earthMaterial = useMemo(() => {
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color('#2a5298'),
      emissive: new THREE.Color('#0a1929'),
      emissiveIntensity: 0.1,
      specular: new THREE.Color('#4a90a4'),
      shininess: 15,
    });
    
    // Load texture asynchronously
    const loader = new THREE.TextureLoader();
    loader.load(
      'https://unpkg.com/three-globe@2.24.13/example/img/earth-blue-marble.jpg',
      (texture) => {
        mat.map = texture;
        mat.needsUpdate = true;
      }
    );
    
    return mat;
  }, []);

  // Slow rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <Sphere ref={meshRef} args={[2, 64, 64]}>
      <primitive object={earthMaterial} attach="material" />
    </Sphere>
  );
});

// Atmosphere glow effect
function Atmosphere() {
  return (
    <Sphere args={[2.08, 64, 64]}>
      <meshPhongMaterial
        color="#00b4d8"
        transparent
        opacity={0.1}
        side={THREE.BackSide}
      />
    </Sphere>
  );
}

// ISS 3D marker
function ISSMarker3D({ position }: { position: ISSPosition }) {
  const markerRef = useRef<THREE.Group>(null);
  
  const pos3D = useMemo(() => {
    const phi = (90 - position.latitude) * (Math.PI / 180);
    const theta = (position.longitude + 180) * (Math.PI / 180);
    const radius = 2.18;
    
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [position.latitude, position.longitude]);

  useFrame(() => {
    if (markerRef.current) {
      markerRef.current.lookAt(0, 0, 0);
    }
  });

  return (
    <group ref={markerRef} position={pos3D}>
      {/* ISS Main Body */}
      <mesh>
        <boxGeometry args={[0.1, 0.025, 0.18]} />
        <meshStandardMaterial 
          color="#00d4ff" 
          emissive="#00d4ff" 
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Left Solar Panel */}
      <mesh position={[-0.14, 0, 0]}>
        <boxGeometry args={[0.14, 0.006, 0.08]} />
        <meshStandardMaterial 
          color="#1a365d" 
          emissive="#0a192f"
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Right Solar Panel */}
      <mesh position={[0.14, 0, 0]}>
        <boxGeometry args={[0.14, 0.006, 0.08]} />
        <meshStandardMaterial 
          color="#1a365d" 
          emissive="#0a192f"
          emissiveIntensity={0.2}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Glow light */}
      <pointLight color="#00d4ff" intensity={1} distance={1} />
    </group>
  );
}

// Orbit line visualization
function OrbitLine({ orbitPath, currentTimestamp }: { orbitPath: OrbitPoint[]; currentTimestamp: number }) {
  const line = useMemo(() => {
    const points = orbitPath
      .filter(p => p.timestamp <= currentTimestamp)
      .map(p => {
        const phi = (90 - p.lat) * (Math.PI / 180);
        const theta = (p.lng + 180) * (Math.PI / 180);
        const radius = 2.1;
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      });

    if (points.length < 2) return null;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: '#00d4ff', 
      transparent: true, 
      opacity: 0.6,
      linewidth: 2,
    });
    
    return new THREE.Line(geometry, material);
  }, [orbitPath, currentTimestamp]);

  if (!line) return null;

  return <primitive object={line} />;
}

// Future orbit path (dashed)
function FutureOrbitLine({ orbitPath, currentTimestamp }: { orbitPath: OrbitPoint[]; currentTimestamp: number }) {
  const line = useMemo(() => {
    const points = orbitPath
      .filter(p => p.timestamp > currentTimestamp)
      .slice(0, 50) // Limit future points
      .map(p => {
        const phi = (90 - p.lat) * (Math.PI / 180);
        const theta = (p.lng + 180) * (Math.PI / 180);
        const radius = 2.1;
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
      });

    if (points.length < 2) return null;
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineDashedMaterial({ 
      color: '#9f7aea', 
      transparent: true, 
      opacity: 0.5,
      dashSize: 0.05,
      gapSize: 0.03,
    });
    
    const line = new THREE.Line(geometry, material);
    line.computeLineDistances();
    return line;
  }, [orbitPath, currentTimestamp]);

  if (!line) return null;

  return <primitive object={line} />;
}

// Camera setup component
function CameraSetup() {
  const { camera } = useThree();
  
  useMemo(() => {
    camera.position.set(0, 0, 6);
  }, [camera]);
  
  return null;
}

// Main scene
function Scene({ position, orbitPath, showOrbit }: { position: ISSPosition | null; orbitPath: OrbitPoint[]; showOrbit: boolean }) {
  return (
    <>
      <CameraSetup />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#4a90a4" />
      <pointLight position={[0, 0, 8]} intensity={0.3} color="#00d4ff" />
      
      {/* Background stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
      
      {/* Earth */}
      <Earth />
      <Atmosphere />
      
      {/* Orbit paths */}
      {showOrbit && position && orbitPath.length > 0 && (
        <>
          <OrbitLine orbitPath={orbitPath} currentTimestamp={position.timestamp} />
          <FutureOrbitLine orbitPath={orbitPath} currentTimestamp={position.timestamp} />
        </>
      )}
      
      {/* ISS Marker */}
      {position && <ISSMarker3D position={position} />}
      
      {/* Controls */}
      <OrbitControls 
        enablePan={false} 
        minDistance={3.5} 
        maxDistance={12}
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  );
}

export function GlobeView({ position, orbitPath, showOrbit }: GlobeViewProps) {
  return (
    <div className="w-full h-full bg-background">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: 'radial-gradient(ellipse at center, #0a1929 0%, #000508 100%)' }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Scene 
          position={position} 
          orbitPath={orbitPath} 
          showOrbit={showOrbit}
        />
      </Canvas>
    </div>
  );
}

export default GlobeView;
