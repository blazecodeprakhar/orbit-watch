import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Satellite,
  Globe2,
  Clock,
  Users,
  MapPin,
  Activity,
  ChevronRight,
  ChevronLeft,
  Minimize2,
  Maximize2
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
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        width: isMinimized ? 'auto' : undefined
      }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`glass-panel rounded-2xl shadow-2xl ${isMinimized ? 'p-4' : 'p-6 w-72 sm:w-80'}`}
    >
      {isMinimized ? (
        /* Minimized View */
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setIsMinimized(false)}
            className="p-3 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 hover:from-primary/40 hover:to-primary/20 transition-all duration-300 group"
            title="Expand panel"
          >
            <Satellite className="w-6 h-6 text-primary animate-float" />
          </button>

          <div className="flex flex-col gap-2 items-center">
            <div className="relative">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse block" />
              <span className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping" />
            </div>

            <div className="writing-mode-vertical text-xs text-primary font-semibold tracking-wider transform rotate-180">
              LIVE
            </div>
          </div>

          <button
            onClick={() => setIsMinimized(false)}
            className="p-2 rounded-lg bg-secondary/60 hover:bg-primary/20 transition-all duration-300 text-primary"
            title="Expand panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Expanded View */
        <>
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
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-lg bg-secondary/60 hover:bg-primary/20 transition-all duration-300 text-muted-foreground hover:text-primary"
              title="Minimize panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
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
              <div className="flex items-center justify-between mb-2">
                <span className="data-value text-3xl">{astronautCount}</span>
                <span className="text-xs text-muted-foreground font-medium">astronauts</span>
              </div>
              {astronauts.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {astronauts.slice(0, 3).map((astronaut, i) => (
                    <div key={i} className="text-xs text-muted-foreground truncate flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/60" />
                      {astronaut.name}
                    </div>
                  ))}
                  {astronauts.length > 3 && (
                    <button
                      onClick={onShowAstronauts}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2 font-medium"
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
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors mt-2 font-medium"
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
          <div className="mt-5 pt-4 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Orbital Period</span>
              <span className="text-primary font-semibold font-mono">~92.68 min</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Orbits/Day</span>
              <span className="text-primary font-semibold font-mono">~15.5</span>
            </div>
          </div>
        </>
      )}
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
    <div className="bg-gradient-to-br from-secondary/40 to-secondary/20 rounded-xl p-4 border border-border/40 hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-primary group-hover:scale-110 transition-transform duration-300">{icon}</span>
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
      <div className="data-label mb-1">{label}</div>
      <div className="data-value text-lg">{value}</div>
    </div>
  );
}
