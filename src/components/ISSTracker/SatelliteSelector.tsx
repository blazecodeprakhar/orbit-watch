import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  ChevronDown,
  Check,
  Minimize2,
  Maximize2,
  Layers,
  Search
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

// Flag component with premium fallback
function CountryFlag({ countryCode, size = 'sm' }: { countryCode: string; size?: 'sm' | 'md' }) {
  const flagUrl = COUNTRY_FLAGS[countryCode];
  const sizeClasses = size === 'sm' ? 'w-5 h-3.5' : 'w-6 h-4';

  if (!flagUrl) {
    return <span className="text-sm grayscale opacity-70">🌍</span>;
  }

  return (
    <div className={`${sizeClasses} relative overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/10`}>
      <img
        src={flagUrl}
        alt={countryCode}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
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
  const [searchQuery, setSearchQuery] = useState('');

  const activeSatellite = satellites.get(activeSatelliteId);
  const catalogEntry = SATELLITE_CATALOG.find(s => s.id === activeSatelliteId);

  // Filter satellites based on search
  const filteredCatalog = SATELLITE_CATALOG.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedSatellites = {
    'Space Stations': filteredCatalog.filter(s => s.type === 'space-station'),
    'ISRO (India)': filteredCatalog.filter(s => s.countryCode === 'IN'),
    'NASA (USA)': filteredCatalog.filter(s => s.countryCode === 'US' && s.type !== 'space-station'),
    'International': filteredCatalog.filter(s => !['US', 'IN', 'CN'].includes(s.countryCode) && s.type !== 'space-station'),
  };

  // Remove empty groups
  Object.keys(groupedSatellites).forEach(key => {
    if (groupedSatellites[key as keyof typeof groupedSatellites].length === 0) {
      delete groupedSatellites[key as keyof typeof groupedSatellites];
    }
  });

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-full p-1.5 shadow-2xl border border-white/10"
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-3 px-3 py-1.5 hover:bg-white/5 rounded-full transition-all duration-300 group"
          title="Expand"
        >
          <div className="relative">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: catalogEntry?.color || '#00d4ff' }}
            />
            <div
              className="absolute inset-0 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: catalogEntry?.color || '#00d4ff' }}
            />
          </div>
          <span className="text-xs font-medium text-foreground/90 group-hover:text-primary transition-colors">
            {catalogEntry?.shortName || 'ISS'}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      className="glass-panel rounded-2xl shadow-2xl w-80 flex flex-col overflow-hidden border border-white/10 ring-1 ring-black/20"
    >
      {/* Header Area */}
      <div className="p-4 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Satellite className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight">Orbit Watch</h2>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Live Satellite Tracking</p>
            </div>
          </div>
          <motion.button
            onClick={onToggleMinimize}
            className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Minimize2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Current Selection Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 border border-white/5 hover:border-primary/30 rounded-xl transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 shadow-inner"
              >
                <span className="text-xs font-bold" style={{ color: catalogEntry?.color }}>
                  {catalogEntry?.shortName.substring(0, 2)}
                </span>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-card"
                style={{ backgroundColor: catalogEntry?.color }}
              />
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {catalogEntry?.shortName || 'Select Satellite'}
                </span>
                {catalogEntry && <CountryFlag countryCode={catalogEntry.countryCode} />}
              </div>
              <div className="text-[10px] text-muted-foreground group-hover:text-primary/70 transition-colors">
                {catalogEntry?.country || 'Click to browse'}
              </div>
            </div>
          </div>

          <div className={`p-1.5 rounded-full bg-white/5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.button>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'circOut' }}
            className="border-t border-white/5 bg-black/20"
          >
            {/* Search Bar */}
            <div className="p-3 sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search satellites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary/50 border border-white/5 focus:border-primary/50 text-xs text-foreground placeholder-muted-foreground/70 transition-all outline-none"
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto p-2 space-y-4 scroll-smooth">
              {Object.entries(groupedSatellites).map(([group, sats]) => (
                <div key={group}>
                  <div className="px-2 py-1.5 mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">{group}</span>
                    <div className="h-px flex-1 bg-white/5" />
                  </div>
                  <div className="space-y-1">
                    {sats.map((sat) => {
                      const isActive = activeSatelliteId === sat.id;
                      const satData = satellites.get(sat.id);

                      return (
                        <button
                          key={sat.id}
                          onClick={() => {
                            onSelectSatellite(sat.id);
                            setIsExpanded(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group relative overflow-hidden ${isActive
                              ? 'bg-primary/10 border border-primary/20'
                              : 'hover:bg-white/5 border border-transparent hover:border-white/5'
                            }`}
                        >
                          {/* Active Indicator Bar */}
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                            />
                          )}

                          <div className="relative">
                            <div
                              className="w-8 h-8 rounded-md flex items-center justify-center bg-secondary/50 border border-white/5 group-hover:border-primary/30 transition-colors"
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: sat.color,
                                  boxShadow: isActive ? `0 0 8px ${sat.color}` : 'none'
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-medium truncate ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                {sat.shortName}
                              </span>
                              {isActive && <Check className="w-3 h-3 text-primary" />}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <CountryFlag countryCode={sat.countryCode} />
                              <span className="text-[10px] text-muted-foreground truncate">{sat.country}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Actions */}
      <div className="p-3 bg-secondary/10 border-t border-white/5">
        <motion.button
          onClick={onToggleShowAll}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all duration-300 text-xs font-semibold ${showAllSatellites
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground border border-white/5'
            }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {showAllSatellites ? 'Hide Other Satellites' : 'Show All Satellites'}
        </motion.button>
      </div>

      {/* Live Active Data Mini-Panel */}
      <AnimatePresence>
        {activeSatellite && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-primary/5 border-t border-primary/10"
          >
            <div className="grid grid-cols-2 divide-x divide-primary/10">
              <div className="p-3 text-center">
                <div className="text-[9px] font-bold text-primary/60 uppercase tracking-wider mb-0.5">Altitude</div>
                <div className="font-mono text-sm text-foreground">{Math.round(activeSatellite.altitude)} km</div>
              </div>
              <div className="p-3 text-center">
                <div className="text-[9px] font-bold text-primary/60 uppercase tracking-wider mb-0.5">Velocity</div>
                <div className="font-mono text-sm text-foreground">{(activeSatellite.velocity / 1000).toFixed(1)}k km/h</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}