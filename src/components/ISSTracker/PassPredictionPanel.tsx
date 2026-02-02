import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  Clock, 
  Compass, 
  Eye, 
  EyeOff,
  ChevronRight,
  Loader2,
  Navigation,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useISSPasses, ISSPass } from './hooks/useISSPasses';
import { SatellitePosition } from './types';

interface UserLocationWithName {
  latitude: number;
  longitude: number;
  name?: string;
}

interface PassPredictionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  satellitePosition: SatellitePosition | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

function PassCard({ pass, index }: { pass: ISSPass; index: number }) {
  const isVisible = pass.brightness !== 'not visible';
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-2.5 rounded-lg border transition-all ${
        isVisible 
          ? 'bg-primary/10 border-primary/30 hover:bg-primary/15' 
          : 'bg-secondary/30 border-border/30 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-[10px] text-muted-foreground mb-0.5">
            {formatDate(pass.startTime)}
          </div>
          <div className="text-xs font-semibold text-foreground">
            {formatTime(pass.startTime)}
          </div>
        </div>
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
          pass.brightness === 'visible' 
            ? 'bg-green-500/20 text-green-400'
            : pass.brightness === 'dim'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isVisible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
          {pass.brightness === 'visible' ? 'Visible' : pass.brightness === 'dim' ? 'Dim' : 'Not visible'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
        <div className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-foreground">{formatDuration(pass.duration)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Navigation className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-foreground">{pass.maxElevation}°</span>
        </div>
        <div className="flex items-center gap-1">
          <Compass className="w-2.5 h-2.5 text-muted-foreground" />
          <span className="text-foreground">{pass.startDirection}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function PassPredictionPanel({ 
  isOpen, 
  onClose, 
  satellitePosition,
  isMinimized,
  onToggleMinimize
}: PassPredictionPanelProps) {
  const { userLocation, passes, loading, error, getUserLocation } = useISSPasses(satellitePosition);
  const [hasRequested, setHasRequested] = useState(false);

  const handleGetLocation = () => {
    setHasRequested(true);
    getUserLocation();
  };

  if (!isOpen) return null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-4 right-4 glass-panel rounded-xl p-2 shadow-2xl"
        style={{ zIndex: 1000 }}
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 p-2 hover:bg-primary/20 rounded-lg transition-colors"
          title="Expand Pass Predictions"
        >
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">Passes</span>
          <Maximize2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="fixed top-4 right-4 w-72 max-h-[60vh] glass-panel rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: 1000 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2.5 bg-card/60 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Eye className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground">Pass Predictions</h3>
            {userLocation && (
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                {userLocation.name}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 overflow-y-auto max-h-[calc(60vh-60px)]">
        {!hasRequested ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h4 className="text-xs font-medium text-foreground mb-1">
              See when satellites pass over you
            </h4>
            <p className="text-[10px] text-muted-foreground mb-3">
              Get timing, direction, and visibility info
            </p>
            <button
              onClick={handleGetLocation}
              className="flex items-center gap-1.5 mx-auto px-3 py-1.5 bg-primary/20 border border-primary/50 rounded-lg text-primary text-xs hover:bg-primary/30 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              Use My Location
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary animate-spin mb-2" />
            <p className="text-xs text-muted-foreground">Finding location...</p>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-2">
              <X className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-xs text-destructive mb-3">{error}</p>
            <button
              onClick={handleGetLocation}
              className="px-3 py-1.5 bg-secondary/50 border border-border/50 rounded-lg text-foreground text-xs hover:bg-secondary/70 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : passes.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">
              No visible passes found in the next 24 hours.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground mb-2">
              Upcoming passes (next 24 hours)
            </p>
            {passes.map((pass, index) => (
              <PassCard key={index} pass={pass} index={index} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
