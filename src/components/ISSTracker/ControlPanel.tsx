import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Orbit,
  Sun,
  Map,
  Satellite as SatelliteIcon,
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  Globe2,
  Tag,
  Video,
  Eye
} from 'lucide-react';
import { TrackerState } from './types';

interface ControlPanelProps {
  state: TrackerState;
  onToggleTracking: () => void;
  onToggleOrbit: () => void;
  onToggleTerminator: () => void;
  onToggleFollow: () => void;
  onToggleLabels: () => void;
  onToggleFullscreen: () => void;
  onToggleLiveStream: () => void;
  onTogglePassPredictions: () => void;
  onChangeMapStyle: (style: 'satellite' | 'dark' | 'standard') => void;
  onChangeViewMode: (mode: 'flat' | 'globe') => void;
  onCenterISS: () => void;
}

export function ControlPanel({
  state,
  onToggleTracking,
  onToggleOrbit,
  onToggleTerminator,
  onToggleFollow,
  onToggleLabels,
  onToggleFullscreen,
  onToggleLiveStream,
  onTogglePassPredictions,
  onChangeMapStyle,
  onChangeViewMode,
  onCenterISS,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="glass-panel rounded-2xl p-4 sm:p-5 shadow-2xl max-w-7xl"
      style={{ zIndex: 1000 }}
    >
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center">
        {/* View Mode Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-secondary/30 rounded-xl p-1">
          <ControlButton
            active={state.viewMode === 'flat'}
            onClick={() => onChangeViewMode('flat')}
            icon={<Map className="w-4 h-4" />}
            label="Flat"
            tooltip="Flat map view"
          />
          <ControlButton
            active={state.viewMode === 'globe'}
            onClick={() => onChangeViewMode('globe')}
            icon={<Globe2 className="w-4 h-4" />}
            label="Globe"
            tooltip="3D globe view"
          />
        </div>

        <div className="w-px h-8 bg-border/50 hidden sm:block" />

        {/* Tracking Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton
            active={state.isTracking}
            onClick={onToggleTracking}
            icon={state.isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            label={state.isTracking ? 'Pause' : 'Track'}
            tooltip={state.isTracking ? 'Pause tracking' : 'Resume tracking'}
          />

          <ControlButton
            active={state.followISS}
            onClick={onToggleFollow}
            icon={<Crosshair className="w-4 h-4" />}
            label="Follow"
            tooltip="Follow ISS"
          />

          <ControlButton
            onClick={onCenterISS}
            icon={<SatelliteIcon className="w-4 h-4" />}
            label="Center"
            tooltip="Center on ISS"
          />
        </div>

        <div className="w-px h-8 bg-border/50 hidden sm:block" />

        {/* Display Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton
            active={state.showOrbit}
            onClick={onToggleOrbit}
            icon={<Orbit className="w-4 h-4" />}
            label="Orbit"
            tooltip="Show orbit path"
          />

          <ControlButton
            active={state.showTerminator}
            onClick={onToggleTerminator}
            icon={<Sun className="w-4 h-4" />}
            label="Day/Night"
            tooltip="Show day/night"
          />

          <ControlButton
            active={state.showLabels}
            onClick={onToggleLabels}
            icon={<Tag className="w-4 h-4" />}
            label="Labels"
            tooltip="Show place labels"
          />
        </div>

        <div className="w-px h-8 bg-border/50 hidden sm:block" />

        {/* Map Style Controls (only for flat view) */}
        {state.viewMode === 'flat' && (
          <>
            <div className="flex items-center gap-1 sm:gap-2">
              <ControlButton
                active={state.mapStyle === 'satellite'}
                onClick={() => onChangeMapStyle('satellite')}
                icon={<SatelliteIcon className="w-4 h-4" />}
                label="Satellite"
                tooltip="Satellite view"
              />

              <ControlButton
                active={state.mapStyle === 'dark'}
                onClick={() => onChangeMapStyle('dark')}
                icon={<Map className="w-4 h-4" />}
                label="Dark"
                tooltip="Dark map"
              />

              <ControlButton
                active={state.mapStyle === 'standard'}
                onClick={() => onChangeMapStyle('standard')}
                icon={<Layers className="w-4 h-4" />}
                label="Standard"
                tooltip="Standard map"
              />
            </div>
            <div className="w-px h-8 bg-border/50 hidden sm:block" />
          </>
        )}

        {/* Live Stream & Pass Predictions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton
            active={state.showLiveStream}
            onClick={onToggleLiveStream}
            icon={<Video className="w-4 h-4" />}
            label="Live"
            tooltip="NASA Live Stream"
          />
          <ControlButton
            active={state.showPassPredictions}
            onClick={onTogglePassPredictions}
            icon={<Eye className="w-4 h-4" />}
            label="Passes"
            tooltip="ISS Pass Predictions"
          />
        </div>

        <div className="w-px h-8 bg-border/50 hidden sm:block" />

        {/* Fullscreen */}
        <ControlButton
          active={state.isFullscreen}
          onClick={onToggleFullscreen}
          icon={state.isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          label={state.isFullscreen ? 'Exit' : 'Full'}
          tooltip={state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        />
      </div>
    </motion.div>
  );
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
  tooltip,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        relative flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold
        transition-all duration-300 overflow-hidden group
        ${active
          ? 'bg-gradient-to-br from-primary/35 to-primary/20 border-2 border-primary/70 text-primary shadow-lg shadow-primary/25'
          : 'bg-gradient-to-br from-secondary/70 to-secondary/50 border-2 border-border/60 text-foreground hover:from-primary/25 hover:to-primary/15 hover:border-primary/50'
        }
        active:scale-95 hover:shadow-xl hover:shadow-primary/10
      `}
    >
      <span className={`relative z-10 ${active ? 'animate-pulse-glow' : ''}`}>{icon}</span>
      <span className="hidden sm:inline relative z-10">{label}</span>
      {!active && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
      )}
    </button>
  );
}
