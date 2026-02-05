import { useState, useCallback, useRef, useEffect, Suspense, lazy, Component, ReactNode } from 'react';
import { Map as LeafletMap } from 'leaflet';
import { motion } from 'framer-motion';
import { MapComponent } from './MapContainer';
import { InfoPanel } from './InfoPanel';
import { ControlPanel } from './ControlPanel';
import { SatelliteSelector } from './SatelliteSelector';
import { AstronautPanel } from './AstronautPanel';
import { PassPredictionPanel } from './PassPredictionPanel';
import { useSatelliteData } from './hooks/useSatelliteData';
import { TrackerState, COUNTRY_FLAGS } from './types';
import { SATELLITE_CATALOG } from '../../config/satellite-config';
import { Globe2 } from 'lucide-react';

const GlobeView = lazy(() => import('./GlobeView'));

function GlobeFallback() {
  return (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading 3D Globe...</p>
      </div>
    </div>
  );
}

function GlobeErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="w-full h-full bg-background flex items-center justify-center">
      <div className="text-center glass-panel p-8 rounded-xl">
        <Globe2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">3D Globe Unavailable</h3>
        <p className="text-muted-foreground text-sm mb-4">The 3D view couldn't load. Try the flat map view.</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary text-sm hover:bg-primary/30 transition-colors"
        >
          Switch to Flat Map
        </button>
      </div>
    </div>
  );
}

export function ISSTracker() {
  const mapRef = useRef<LeafletMap | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeSatelliteId, setActiveSatelliteId] = useState('iss');

  const [state, setState] = useState<TrackerState>({
    isTracking: true,
    showOrbit: true,
    showTerminator: true,
    showLabels: true,
    mapStyle: 'satellite',
    viewMode: 'flat',
    followSatellite: false,
    isFullscreen: false,
    showPassPredictions: false,
    showAllSatellites: false,
  });

  const [showAstronautPanel, setShowAstronautPanel] = useState(false);
  const [globeError, setGlobeError] = useState(false);

  // Panel minimize states
  const [infoMinimized, setInfoMinimized] = useState(true);
  const [selectorMinimized, setSelectorMinimized] = useState(() => window.innerWidth < 768);

  const [passMinimized, setPassMinimized] = useState(false);

  const {
    satellites,
    activeSatellite,
    orbitPath,
    astronauts,
    astronautCount,
    error,
    lastUpdate,
  } = useSatelliteData(activeSatelliteId, state.isTracking, state.showAllSatellites);

  const handleToggleSelector = useCallback(() => {
    setSelectorMinimized(prev => {
      const willBeMaximized = !!prev;
      if (willBeMaximized) {
        setInfoMinimized(true);
      }
      return !prev;
    });
  }, []);

  const handleToggleInfo = useCallback(() => {
    setInfoMinimized(prev => {
      const willBeMaximized = !!prev;
      if (willBeMaximized) {
        setSelectorMinimized(true);
      }
      return !prev;
    });
  }, []);

  const handleMapReady = useCallback((map: LeafletMap) => {
    mapRef.current = map;
  }, []);

  const handleToggleTracking = useCallback(() => {
    setState(prev => ({ ...prev, isTracking: !prev.isTracking }));
  }, []);

  const handleToggleOrbit = useCallback(() => {
    setState(prev => ({ ...prev, showOrbit: !prev.showOrbit }));
  }, []);

  const handleToggleTerminator = useCallback(() => {
    setState(prev => ({ ...prev, showTerminator: !prev.showTerminator }));
  }, []);

  const handleToggleFollow = useCallback(() => {
    setState(prev => ({ ...prev, followSatellite: !prev.followSatellite }));
  }, []);

  const handleToggleLabels = useCallback(() => {
    setState(prev => ({ ...prev, showLabels: !prev.showLabels }));
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setState(prev => ({ ...prev, isFullscreen: true }));
    } else {
      document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const handleChangeMapStyle = useCallback((style: 'satellite' | 'dark' | 'standard') => {
    setState(prev => ({ ...prev, mapStyle: style }));
  }, []);

  const handleChangeViewMode = useCallback((mode: 'flat' | 'globe') => {
    if (mode === 'globe' && globeError) return;
    setState(prev => ({ ...prev, viewMode: mode }));
  }, [globeError]);

  const handleCenterSatellite = useCallback(() => {
    if (mapRef.current && activeSatellite?.position) {
      const currentZoom = mapRef.current.getZoom();
      const targetZoom = Math.max(currentZoom, 4);

      mapRef.current.setView(
        [activeSatellite.position.latitude, activeSatellite.position.longitude],
        targetZoom,
        {
          animate: true,
          duration: 1.5
        }
      );
    }
  }, [activeSatellite]);

  const handleTogglePassPredictions = useCallback(() => {
    setState(prev => ({ ...prev, showPassPredictions: !prev.showPassPredictions }));
  }, []);

  const handleToggleShowAll = useCallback(() => {
    setState(prev => ({ ...prev, showAllSatellites: !prev.showAllSatellites }));
  }, []);

  const handleSelectSatellite = useCallback((id: string) => {
    setActiveSatelliteId(id);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setState(prev => ({ ...prev, isFullscreen: !!document.fullscreenElement }));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleGlobeError = useCallback(() => {
    setGlobeError(true);
    setState(prev => ({ ...prev, viewMode: 'flat' }));
  }, []);

  const catalogEntry = SATELLITE_CATALOG.find(s => s.id === activeSatelliteId);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-background"
    >
      {/* Map/Globe View */}
      <div className="absolute inset-0">
        {state.viewMode === 'flat' ? (
          <MapComponent
            satellites={satellites}
            activeSatelliteId={activeSatelliteId}
            orbitPath={orbitPath}
            state={state}
            onMapReady={handleMapReady}
          />
        ) : (
          <ErrorBoundary
            onError={handleGlobeError}
            fallback={<GlobeErrorFallback onRetry={() => setState(prev => ({ ...prev, viewMode: 'flat' }))} />}
          >
            <Suspense fallback={<GlobeFallback />}>
              <GlobeView
                satellites={satellites}
                activeSatelliteId={activeSatelliteId}
                orbitPath={orbitPath}
                showOrbit={state.showOrbit}
                showTerminator={state.showTerminator}
                showAllSatellites={state.showAllSatellites}
              />
            </Suspense>
          </ErrorBoundary>
        )}
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/30 pointer-events-none" style={{ zIndex: 500 }} />

      {/* Satellite Selector - Top Left */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="absolute top-4 left-4"
        style={{ zIndex: 1000 }}
      >
        <SatelliteSelector
          activeSatelliteId={activeSatelliteId}
          satellites={satellites}
          showAllSatellites={state.showAllSatellites}
          onSelectSatellite={handleSelectSatellite}
          onToggleShowAll={handleToggleShowAll}
          isMinimized={selectorMinimized}
          onToggleMinimize={handleToggleSelector}
        />
      </motion.div>

      {/* Info Panel - Below Selector */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`absolute left-4 ${selectorMinimized ? 'top-20' : 'top-auto bottom-24'}`}
        style={{ zIndex: 1000 }}
      >
        <InfoPanel
          satellite={activeSatellite || null}
          astronautCount={astronautCount}
          astronauts={astronauts}
          lastUpdate={lastUpdate}
          onShowAstronauts={() => setShowAstronautPanel(true)}
          isMinimized={infoMinimized}
          onToggleMinimize={handleToggleInfo}
        />
      </motion.div>



      {/* Control Panel */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2"
        style={{ zIndex: 1000 }}
      >
        <ControlPanel
          state={state}
          onToggleTracking={handleToggleTracking}
          onToggleOrbit={handleToggleOrbit}
          onToggleTerminator={handleToggleTerminator}
          onToggleFollow={handleToggleFollow}
          onToggleLabels={handleToggleLabels}
          onToggleFullscreen={handleToggleFullscreen}
          onTogglePassPredictions={handleTogglePassPredictions}
          onChangeMapStyle={handleChangeMapStyle}
          onChangeViewMode={handleChangeViewMode}
          onCenterSatellite={handleCenterSatellite}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-20 right-4 glass-panel rounded-lg p-4 border-destructive/50"
          style={{ zIndex: 1000 }}
        >
          <p className="text-destructive text-sm">{error}</p>
        </motion.div>
      )}

      {/* Astronaut Panel */}
      <AstronautPanel
        astronauts={astronauts}
        isOpen={showAstronautPanel}
        onClose={() => setShowAstronautPanel(false)}
      />

      {/* Pass Predictions Panel */}
      <PassPredictionPanel
        isOpen={state.showPassPredictions}
        onClose={() => setState(prev => ({ ...prev, showPassPredictions: false }))}
        satellitePosition={activeSatellite?.position || null}
        isMinimized={passMinimized}
        onToggleMinimize={() => setPassMinimized(!passMinimized)}
      />
      {/* Developer Watermark */}
      <motion.a
        href="https://blazecodeprakhar.netlify.app/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-20 right-4 sm:bottom-4 sm:right-4 z-[1000] glass-panel px-3 py-1.5 rounded-full flex items-center gap-2 hover:bg-primary/20 transition-all duration-300 group text-decoration-none border border-white/10 hover:border-primary/40 hover:scale-105"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_hsl(var(--primary))]" />
        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors tracking-wide">
          blazecodeprakhar
        </span>
      </motion.a>

    </div>
  );
}

// Error Boundary component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Globe view error:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
