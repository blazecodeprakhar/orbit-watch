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
  Navigation
} from 'lucide-react';
import { useISSPasses, ISSPass } from './hooks/useISSPasses';
import { ISSPosition } from './types';

interface PassPredictionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  issPosition: ISSPosition | null;
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
      className={`p-3 rounded-lg border transition-all ${
        isVisible 
          ? 'bg-primary/10 border-primary/30 hover:bg-primary/15' 
          : 'bg-secondary/30 border-border/30 opacity-70'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="text-xs text-muted-foreground mb-0.5">
            {formatDate(pass.startTime)}
          </div>
          <div className="text-sm font-semibold text-foreground">
            {formatTime(pass.startTime)}
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          pass.brightness === 'visible' 
            ? 'bg-green-500/20 text-green-400'
            : pass.brightness === 'dim'
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-muted text-muted-foreground'
        }`}>
          {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          {pass.brightness === 'visible' ? 'Visible' : pass.brightness === 'dim' ? 'Dim' : 'Not visible'}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-foreground">{formatDuration(pass.duration)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-muted-foreground" />
          <span className="text-foreground">{pass.maxElevation}°</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-muted-foreground" />
          <span className="text-foreground">{pass.startDirection} → {pass.endDirection}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function PassPredictionPanel({ isOpen, onClose, issPosition }: PassPredictionPanelProps) {
  const { userLocation, passes, loading, error, getUserLocation } = useISSPasses(issPosition);
  const [hasRequested, setHasRequested] = useState(false);

  const handleGetLocation = () => {
    setHasRequested(true);
    getUserLocation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 w-80 max-h-[calc(100vh-8rem)] glass-panel rounded-xl shadow-2xl overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-card/60 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/20">
                <Eye className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">ISS Pass Predictions</h3>
                {userLocation && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {userLocation.name}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {!hasRequested ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  See when ISS passes over you
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Get upcoming visible passes with timing, direction, and brightness info
                </p>
                <button
                  onClick={handleGetLocation}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary/20 border border-primary/50 rounded-lg text-primary text-sm hover:bg-primary/30 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Use My Location
                </button>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Finding your location...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-destructive" />
                </div>
                <p className="text-sm text-destructive mb-4">{error}</p>
                <button
                  onClick={handleGetLocation}
                  className="px-4 py-2 bg-secondary/50 border border-border/50 rounded-lg text-foreground text-sm hover:bg-secondary/70 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : passes.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground">
                  No visible passes found for your location in the next 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">
                  Upcoming passes (next 24 hours)
                </p>
                {passes.map((pass, index) => (
                  <PassCard key={index} pass={pass} index={index} />
                ))}
                <div className="text-xs text-muted-foreground/70 pt-2 border-t border-border/30 mt-3">
                  <p className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />
                    Best viewing at dusk/dawn when ISS is sunlit
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
