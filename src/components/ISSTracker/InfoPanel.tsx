import { motion, AnimatePresence } from 'framer-motion';
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

// Flag component
function CountryFlag({ countryCode }: { countryCode: string }) {
  const flagUrl = COUNTRY_FLAGS[countryCode];

  if (!flagUrl) {
    return <span className="text-sm">🌍</span>;
  }

  return (
    <img
      src={flagUrl}
      alt={countryCode}
      className="w-5 h-4 object-cover rounded-sm shadow-sm"
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-panel rounded-xl p-2 shadow-2xl"
      >
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 p-2 hover:bg-primary/20 rounded-lg transition-colors"
          title="Expand Info Panel"
        >
          <Satellite className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-foreground">
            {satellite?.shortName || 'ISS'}
          </span>
          <Maximize2 className="w-3 h-3 text-muted-foreground" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel rounded-xl p-4 w-64 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-lg glow-border"
            style={{
              backgroundColor: `${catalogEntry?.color || '#00d4ff'}20`,
              borderColor: `${catalogEntry?.color || '#00d4ff'}40`
            }}
          >
            <Satellite
              className="w-5 h-5"
              style={{ color: catalogEntry?.color || '#00d4ff' }}
            />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              {satellite?.shortName || 'Loading...'}
            </h2>
            <div className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: catalogEntry?.color || '#00d4ff' }}
              />
              <span className="text-[10px] text-muted-foreground">Live Tracking</span>
            </div>
          </div>
        </div>
        <button
          onClick={onToggleMinimize}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          title="Minimize"
        >
          <Minimize2 className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Data Grid */}
      <div className="space-y-3">
        {/* Position */}
        <DataSection icon={<MapPin className="w-3.5 h-3.5" />} title="Position">
          <div className="grid grid-cols-2 gap-2">
            <DataItem
              label="Lat"
              value={satellite?.position ? `${satellite.position.latitude.toFixed(4)}°` : '--'}
            />
            <DataItem
              label="Lng"
              value={satellite?.position ? `${satellite.position.longitude.toFixed(4)}°` : '--'}
            />
          </div>
        </DataSection>

        {/* Orbital Data */}
        <DataSection icon={<Globe2 className="w-3.5 h-3.5" />} title="Orbital Data">
          <div className="grid grid-cols-2 gap-2">
            <DataItem
              label="Altitude"
              value={satellite ? `${satellite.altitude} km` : '--'}
            />
            <DataItem
              label="Velocity"
              value={satellite ? `${(satellite.velocity / 1000).toFixed(1)}k km/h` : '--'}
            />
          </div>
        </DataSection>

        {/* Crew (only for space stations) */}
        {satellite?.type === 'space-station' && satellite.id === 'iss' && (
          <DataSection icon={<Users className="w-3.5 h-3.5" />} title="Crew Aboard">
            <div className="flex items-center justify-between">
              <span className="data-value text-xl">{astronautCount}</span>
              <span className="text-[10px] text-muted-foreground">astronauts</span>
            </div>
            {astronauts.length > 0 && onShowAstronauts && (
              <button
                onClick={onShowAstronauts}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
              >
                <span>View crew</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </DataSection>
        )}

        {/* Satellite Info */}
        {catalogEntry && (
          <DataSection icon={<Activity className="w-3.5 h-3.5" />} title="Info">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {catalogEntry.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <CountryFlag countryCode={catalogEntry.countryCode} />
              <span className="text-xs text-foreground">{catalogEntry.country}</span>
            </div>
          </DataSection>
        )}

        {/* Last Update */}
        <DataSection icon={<Clock className="w-3.5 h-3.5" />} title="Last Update">
          <div className="flex items-center gap-1.5">
            <Activity className="w-2.5 h-2.5 text-green-500 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">
              {lastUpdate
                ? lastUpdate.toLocaleTimeString('en-US', {
                  hour12: false,
                  timeZoneName: 'short'
                })
                : 'Connecting...'}
            </span>
          </div>
        </DataSection>
      </div>
    </motion.div>
  );
}

function DataSection({
  icon,
  title,
  children
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-secondary/30 rounded-lg p-2.5 border border-border/30">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-primary">{icon}</span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-0.5">{label}</div>
      <div className="data-value text-sm">{value}</div>
    </div>
  );
}
