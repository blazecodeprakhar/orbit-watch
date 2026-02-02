import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  ChevronDown,
  ChevronUp,
  Check,
  Minimize2,
  Maximize2,
  Layers
} from 'lucide-react';
import { SatelliteData, COUNTRY_FLAGS } from './types';
import { SATELLITE_CATALOG } from '../../config/satellite-config';

interface SatelliteSelectorProps {
  activeSatelliteId: string;
  satellites: Map<string, SatelliteData>;
  showAllSatellites: boolean;
  onSelectSatellite: (id: string) => void;
  onToggleShowAll: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

// Flag component with fallback
function CountryFlag({ countryCode, size = 'sm' }: { countryCode: string; size?: 'sm' | 'md' }) {
  const flagUrl = COUNTRY_FLAGS[countryCode];
  const sizeClass = size === 'sm' ? 'w-4 h-3' : 'w-5 h-4';

  if (!flagUrl) {
    return <span className="text-xs">🌍</span>;
  }

  return (
    <img
      src={flagUrl}
      alt={countryCode}
      className={`${sizeClass} object-cover rounded-sm shadow-sm`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

export function SatelliteSelector({
  activeSatelliteId,
  satellites,
  showAllSatellites,
  onSelectSatellite,
  onToggleShowAll,
  isMinimized,
  onToggleMinimize,
}: SatelliteSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeSatellite = satellites.get(activeSatelliteId);
  const catalogEntry = SATELLITE_CATALOG.find(s => s.id === activeSatelliteId);

  const groupedSatellites = {
    'Space Stations': SATELLITE_CATALOG.filter(s => s.type === 'space-station'),
    'ISRO (India)': SATELLITE_CATALOG.filter(s => s.countryCode === 'IN'),
    'NASA (USA)': SATELLITE_CATALOG.filter(s => s.countryCode === 'US' && s.type !== 'space-station'),
    'International': SATELLITE_CATALOG.filter(s => !['US', 'IN', 'CN'].includes(s.countryCode) && s.type !== 'space-station'),
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="glass-panel rounded-xl p-2 shadow-2xl"
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 p-2 hover:bg-primary/20 rounded-lg transition-all duration-300"
          title="Expand Satellite Selector"
        >
          <div
            className="w-3 h-3 rounded-full animate-glow-pulse"
            style={{ backgroundColor: catalogEntry?.color || '#00d4ff' }}
          />
          <Satellite className="w-4 h-4 text-primary" />
          <Maximize2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="glass-panel rounded-xl shadow-2xl w-72 max-h-[80vh] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <motion.div
            className="p-1.5 rounded-lg bg-primary/20"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Satellite className="w-4 h-4 text-primary" />
          </motion.div>
          <span className="text-sm font-semibold text-foreground">Satellites</span>
          <span className="text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded-full">
            {SATELLITE_CATALOG.length}
          </span>
        </div>
        <motion.button
          onClick={onToggleMinimize}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Minimize"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Minimize2 className="w-4 h-4 text-muted-foreground" />
        </motion.button>
      </div>

      {/* Current Selection */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between p-3 hover:bg-primary/10 transition-all duration-300"
        whileHover={{ backgroundColor: 'hsl(var(--primary) / 0.1)' }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="w-3 h-3 rounded-full shadow-lg"
            style={{
              backgroundColor: catalogEntry?.color || '#00d4ff',
              boxShadow: `0 0 12px ${catalogEntry?.color || '#00d4ff'}`
            }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="text-left">
            <div className="flex items-center gap-2">
              <CountryFlag countryCode={catalogEntry?.countryCode || 'INT'} />
              <span className="text-sm font-medium text-foreground">
                {catalogEntry?.shortName || 'ISS'}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {catalogEntry?.country}
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Satellite List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="max-h-[50vh] overflow-y-auto p-2 space-y-3">
              {Object.entries(groupedSatellites).map(([group, sats], groupIndex) => (
                <motion.div
                  key={group}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.05 }}
                >
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {group}
                    </div>
                    <div className="flex-1 h-px bg-border/50" />
                    <span className="text-[10px] text-muted-foreground bg-secondary/50 px-1.5 rounded">
                      {sats.length}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {sats.map((sat, index) => {
                      const isActive = activeSatelliteId === sat.id;
                      const satData = satellites.get(sat.id);

                      return (
                        <motion.button
                          key={sat.id}
                          onClick={() => {
                            onSelectSatellite(sat.id);
                            setIsExpanded(false);
                          }}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ x: 4, backgroundColor: 'hsl(var(--secondary) / 0.5)' }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 ${isActive
                              ? 'bg-primary/20 border border-primary/40'
                              : 'hover:bg-secondary/50 border border-transparent'
                            }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all duration-300"
                            style={{
                              backgroundColor: sat.color,
                              boxShadow: satData ? `0 0 10px ${sat.color}` : 'none',
                              opacity: satData ? 1 : 0.5,
                            }}
                          />
                          <CountryFlag countryCode={sat.countryCode} />
                          <div className="flex-1 text-left min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">
                              {sat.shortName}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {sat.name}
                            </div>
                          </div>
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show All Toggle */}
      <div className="p-3 border-t border-border/50">
        <motion.button
          onClick={onToggleShowAll}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-lg transition-all duration-300 text-xs font-medium ${showAllSatellites
              ? 'bg-primary/20 border border-primary/40 text-primary shadow-lg'
              : 'bg-secondary/50 border border-border/50 text-foreground hover:bg-secondary'
            }`}
          style={showAllSatellites ? { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' } : {}}
        >
          <Layers className="w-3.5 h-3.5" />
          {showAllSatellites ? 'Showing All Satellites' : 'Show All on Map'}
        </motion.button>
      </div>

      {/* Live Stats */}
      <AnimatePresence>
        {activeSatellite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3 border-t border-border/50 bg-card/50"
          >
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-secondary/30 rounded-lg p-2">
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Altitude</div>
                <div className="font-mono text-primary text-sm">{activeSatellite.altitude} km</div>
              </div>
              <div className="bg-secondary/30 rounded-lg p-2">
                <div className="text-muted-foreground text-[10px] uppercase tracking-wide">Velocity</div>
                <div className="font-mono text-primary text-sm">{activeSatellite.velocity.toLocaleString()} km/h</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}