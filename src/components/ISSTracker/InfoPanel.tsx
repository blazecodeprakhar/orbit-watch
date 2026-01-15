import { motion } from 'framer-motion';
import {
  Satellite,
  Globe2,
  Gauge,
  Clock,
  Users,
  MapPin,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ISSPosition, Astronaut } from './types';

interface InfoPanelProps {
  position: ISSPosition | null;
  altitude: number;
  velocity: number;
  astronautCount: number;
  astronauts: Astronaut[];
  lastUpdate: Date | null;
  onShowAstronauts?: () => void;
}

export function InfoPanel({
  position,
  altitude,
  velocity,
  astronautCount,
  astronauts,
  lastUpdate,
  onShowAstronauts,
}: InfoPanelProps) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="glass-panel rounded-2xl p-6 w-72 sm:w-80 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 glow-border shimmer">
          <Satellite className="w-6 h-6 text-primary animate-float" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground mb-1">ISS Tracker</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse block" />
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
            </div>
            <span className="text-xs text-green-400 font-medium">Live Tracking</span>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="space-y-4">
        {/* Position */}
        <DataSection icon={<MapPin className="w-4 h-4" />} title="Position">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="Latitude"
              value={position ? `${position.latitude.toFixed(4)}°` : '--'}
            />
            <DataItem
              label="Longitude"
              value={position ? `${position.longitude.toFixed(4)}°` : '--'}
            />
          </div>
        </DataSection>

        {/* Orbital Data */}
        <DataSection icon={<Globe2 className="w-4 h-4" />} title="Orbital Data">
          <div className="grid grid-cols-2 gap-3">
            <DataItem
              label="Altitude"
              value={`${altitude} km`}
            />
            <DataItem
              label="Velocity"
              value={`${velocity.toLocaleString()} km/h`}
            />
          </div>
        </DataSection>

        {/* Crew */}
        <DataSection icon={<Users className="w-4 h-4" />} title="Crew Aboard">
          <div className="flex items-center justify-between">
            <span className="data-value text-2xl">{astronautCount}</span>
            <span className="text-xs text-muted-foreground">astronauts</span>
          </div>
          {astronauts.length > 0 && (
            <div className="mt-2 space-y-1">
              {astronauts.slice(0, 3).map((astronaut, i) => (
                <div key={i} className="text-xs text-muted-foreground truncate">
                  • {astronaut.name}
                </div>
              ))}
              {astronauts.length > 3 && (
                <button
                  onClick={onShowAstronauts}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
                >
                  <span>+{astronauts.length - 3} more</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
          {astronauts.length > 0 && astronauts.length <= 3 && onShowAstronauts && (
            <button
              onClick={onShowAstronauts}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2"
            >
              <span>View all crew</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </DataSection>

        {/* Last Update */}
        <DataSection icon={<Clock className="w-4 h-4" />} title="Last Update">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-green-500 animate-pulse" />
            <span className="text-sm text-muted-foreground font-mono">
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

      {/* Footer Stats */}
      <div className="mt-5 pt-4 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Orbital Period</span>
          <span className="text-foreground font-medium font-mono">~92.68 min</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Orbits/Day</span>
          <span className="text-foreground font-medium font-mono">~15.5</span>
        </div>
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
    <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary">{icon}</span>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
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
      <div className="data-label mb-0.5">{label}</div>
      <div className="data-value text-lg">{value}</div>
    </div>
  );
}
