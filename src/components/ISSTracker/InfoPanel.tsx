import { motion } from 'framer-motion';
import {
  Satellite,
  Globe2,
  Clock,
  Users,
  MapPin,
  Activity,
  ChevronRight,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { SatelliteData, Astronaut, COUNTRY_FLAGS } from './types';
import { SATELLITE_CATALOG } from '../../config/satellite-config';

// Premium Flag component
function CountryFlag({ countryCode }: { countryCode: string }) {
  const flagUrl = COUNTRY_FLAGS[countryCode];

  if (!flagUrl) {
    return <span className="text-sm grayscale opacity-70">🌍</span>;
  }

  return (
    <div className="w-5 h-3.5 relative overflow-hidden rounded-[2px] shadow-sm ring-1 ring-white/10">
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

interface InfoPanelProps {
  satellite: SatelliteData | null;
  astronautCount: number;
  astronauts: Astronaut[];
  lastUpdate: Date | null;
  onShowAstronauts?: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function InfoPanel({
  satellite,
  astronautCount,
  astronauts,
  lastUpdate,
  onShowAstronauts,
  isMinimized,
  onToggleMinimize,
}: InfoPanelProps) {
  const catalogEntry = satellite ? SATELLITE_CATALOG.find(s => s.id === satellite.id) : null;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel rounded-full p-1.5 shadow-2xl border border-white/10"
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-full transition-all duration-300 group"
          title="Expand Stats"
        >
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground/90 group-hover:text-primary transition-colors">
            Telemetry
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0, filter: 'blur(10px)' }}
      animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel rounded-2xl p-0 w-72 shadow-2xl border border-white/10 ring-1 ring-black/20 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
        <div className="flex items-center gap-2.5">
          <div
            className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20"
          >
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-foreground">Live Telemetry</h2>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
              </span>
              <span className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider">Receiving Data</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all"
          title="Minimize"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Data Grid */}
      <div className="p-3 space-y-2.5">
        {/* Position Group */}
        <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-primary/70" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Geospatial</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DataItem
              label="Latitude"
              value={satellite?.position ? `${satellite.position.latitude.toFixed(4)}°` : '--'}
            />
            <DataItem
              label="Longitude"
              value={satellite?.position ? `${satellite.position.longitude.toFixed(4)}°` : '--'}
            />
          </div>
        </div>

        {/* Orbital Group */}
        <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
          <div className="flex items-center gap-1.5 mb-2">
            <Globe2 className="w-3 h-3 text-primary/70" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Orbital Params</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <DataItem
              label="Altitude"
              value={satellite ? `${satellite.altitude.toFixed(1)} km` : '--'}
              subValue={satellite ? `~${(satellite.altitude * 0.621371).toFixed(1)} mi` : undefined}
            />
            <DataItem
              label="Velocity"
              value={satellite ? `${(satellite.velocity / 1000).toFixed(1)}k` : '--'}
              unit="km/h"
              subValue={satellite ? `${(satellite.velocity / 3600).toFixed(2)} km/s` : undefined}
            />
          </div>
        </div>

        {/* Crew (Conditional) */}
        {satellite?.type === 'space-station' && satellite.id === 'iss' && (
          <div className="bg-primary/5 rounded-xl p-2.5 border border-primary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Crew Onboard</div>
                  <div className="text-sm font-bold text-foreground flex items-baseline gap-1">
                    {astronautCount} <span className="text-[10px] text-muted-foreground font-normal">Astronauts</span>
                  </div>
                </div>
              </div>

              {astronauts.length > 0 && onShowAstronauts && (
                <button
                  onClick={onShowAstronauts}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quick Info */}
        {catalogEntry && (
          <div className="bg-secondary/20 rounded-xl p-2.5 border border-white/5">
            <div className="flex items- justify-between mb-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registration</div>
              <CountryFlag countryCode={catalogEntry.countryCode} />
            </div>
            <div className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
              {catalogEntry.description}
            </div>
          </div>
        )}

        {/* Footer / Last Update */}
        <div className="pt-1 flex items-center justify-end gap-1.5 border-t border-white/5">
          <span className="text-[9px] text-muted-foreground">Last Update:</span>
          <span className="text-[9px] font-mono text-primary/80">
            {lastUpdate
              ? lastUpdate.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : 'Syncing...'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function DataItem({ label, value, unit, subValue }: { label: string; value: string; unit?: string; subValue?: string }) {
  return (
    <div>
      <div className="text-[9px] text-muted-foreground mb-0.5 uppercase tracking-wide opacity-70">{label}</div>
      <div className="font-mono text-sm text-foreground font-medium flex items-baseline gap-0.5">
        {value}
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      {subValue && <div className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">{subValue}</div>}
    </div>
  );
}
