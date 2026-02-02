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
  onTogglePassPredictions: () => void;
  onChangeMapStyle: (style: 'satellite' | 'dark' | 'standard') => void;
  onChangeViewMode: (mode: 'flat' | 'globe') => void;
  onCenterSatellite: () => void;
}

export function ControlPanel({
  state,
  onToggleTracking,
  onToggleOrbit,
  onToggleTerminator,
  onToggleFollow,
  onToggleLabels,
  onToggleFullscreen,
  onTogglePassPredictions,
  onChangeMapStyle,
  onChangeViewMode,
  onCenterSatellite,
}: ControlPanelProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="glass-panel rounded-full px-4 py-2 sm:px-5 sm:py-2.5 shadow-2xl border border-white/10 ring-1 ring-black/20"
    >
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5">
          <ControlButton
            active={state.viewMode === 'flat'}
            onClick={() => onChangeViewMode('flat')}
            icon={<Map className="w-3.5 h-3.5" />}
            label="Flat"
            tooltip="Flat map view"
            compact
          />
          <ControlButton
            active={state.viewMode === 'globe'}
            onClick={() => onChangeViewMode('globe')}
            icon={<Globe2 className="w-3.5 h-3.5" />}
            label="Globe"
            tooltip="3D globe view"
            compact
          />
        </div>

        <Divider />

        {/* Tracking Controls */}
        <div className="flex items-center gap-1.5">
          <ControlButton
            active={state.isTracking}
            onClick={onToggleTracking}
            icon={state.isTracking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            label={state.isTracking ? 'Pause' : 'Track'}
            tooltip={state.isTracking ? 'Pause tracking' : 'Resume tracking'}
            variant="primary"
          />

          <ControlButton
            active={state.followSatellite}
            onClick={onToggleFollow}
            icon={<Crosshair className="w-3.5 h-3.5" />}
            label="Follow"
            tooltip="Follow satellite"
          />

          <ControlButton
            onClick={onCenterSatellite}
            icon={<SatelliteIcon className="w-3.5 h-3.5" />}
            label="Center"
            tooltip="Center on satellite"
          />
        </div>

        <Divider />

        {/* Display Controls */}
        <div className="flex items-center gap-1.5">
          <ControlButton
            active={state.showOrbit}
            onClick={onToggleOrbit}
            icon={<Orbit className="w-3.5 h-3.5" />}
            label="Orbit"
            tooltip="Show orbit path"
          />

          <ControlButton
            active={state.showTerminator}
            onClick={onToggleTerminator}
            icon={<Sun className="w-3.5 h-3.5" />}
            label="Day/Night"
            tooltip="Toggle day/night visualization"
            variant={state.showTerminator ? 'warning' : 'default'}
          />

          <ControlButton
            active={state.showLabels}
            onClick={onToggleLabels}
            icon={<Tag className="w-3.5 h-3.5" />}
            label="Labels"
            tooltip="Show place labels"
          />
        </div>

        <Divider />

        {/* Map Style Controls (only for flat view) */}
        {state.viewMode === 'flat' && (
          <>
            <div className="flex items-center gap-1 bg-black/20 rounded-full p-1 border border-white/5">
              <ControlButton
                active={state.mapStyle === 'satellite'}
                onClick={() => onChangeMapStyle('satellite')}
                icon={<SatelliteIcon className="w-3.5 h-3.5" />}
                label="Sat"
                tooltip="Satellite view"
                compact
              />

              <ControlButton
                active={state.mapStyle === 'dark'}
                onClick={() => onChangeMapStyle('dark')}
                icon={<Map className="w-3.5 h-3.5" />}
                label="Dark"
                tooltip="Dark map"
                compact
              />

              <ControlButton
                active={state.mapStyle === 'standard'}
                onClick={() => onChangeMapStyle('standard')}
                icon={<Layers className="w-3.5 h-3.5" />}
                label="Std"
                tooltip="Standard map"
                compact
              />
            </div>
            <Divider />
          </>
        )}

        {/* Pass Predictions */}
        <ControlButton
          active={state.showPassPredictions}
          onClick={onTogglePassPredictions}
          icon={<Eye className="w-3.5 h-3.5" />}
          label="Passes"
          tooltip="Pass Predictions"
        />

        <Divider />

        {/* Fullscreen */}
        <ControlButton
          active={state.isFullscreen}
          onClick={onToggleFullscreen}
          icon={state.isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          label={state.isFullscreen ? 'Exit' : 'Full'}
          tooltip={state.isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        />
      </div>
    </motion.div>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-white/10 hidden sm:block" />;
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
  tooltip,
  variant = 'default',
  compact = false,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  variant?: 'default' | 'primary' | 'warning';
  compact?: boolean;
}) {
  const variantStyles = {
    default: active
      ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_10px_rgba(6,182,212,0.2)]'
      : 'hover:bg-white/5 hover:border-white/20 text-muted-foreground hover:text-foreground border-transparent',
    primary: active
      ? 'bg-primary/30 border-primary text-primary shadow-[0_0_15px_rgba(6,182,212,0.3)]'
      : 'hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary border-transparent',
    warning: active
      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
      : 'hover:bg-amber-500/10 hover:border-amber-500/30 text-muted-foreground hover:text-amber-400 border-transparent',
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        flex items-center gap-1.5 rounded-full transition-all duration-200 border
        ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}
        ${variantStyles[variant]}
        active:scale-95 group
      `}
    >
      {icon}
      <span className={`text-[10px] font-medium tracking-wide ${compact ? 'hidden xl:inline' : 'hidden md:inline'}`}>
        {label}
      </span>
    </button>
  );
}
