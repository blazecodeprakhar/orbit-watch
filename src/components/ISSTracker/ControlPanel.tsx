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
      className="glass-panel rounded-2xl p-2 sm:p-3 shadow-2xl border-primary/30"
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 justify-center">
        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1">
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

        <Divider />

        {/* Tracking Controls */}
        <div className="flex items-center gap-1">
          <ControlButton
            active={state.isTracking}
            onClick={onToggleTracking}
            icon={state.isTracking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            label={state.isTracking ? 'Pause' : 'Track'}
            tooltip={state.isTracking ? 'Pause tracking' : 'Resume tracking'}
            variant="primary"
          />
          
          <ControlButton
            active={state.followSatellite}
            onClick={onToggleFollow}
            icon={<Crosshair className="w-4 h-4" />}
            label="Follow"
            tooltip="Follow satellite"
          />
          
          <ControlButton
            onClick={onCenterSatellite}
            icon={<SatelliteIcon className="w-4 h-4" />}
            label="Center"
            tooltip="Center on satellite"
          />
        </div>

        <Divider />

        {/* Display Controls */}
        <div className="flex items-center gap-1">
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
            tooltip="Toggle day/night visualization"
            variant={state.showTerminator ? 'warning' : 'default'}
          />

          <ControlButton
            active={state.showLabels}
            onClick={onToggleLabels}
            icon={<Tag className="w-4 h-4" />}
            label="Labels"
            tooltip="Show place labels"
          />
        </div>

        <Divider />

        {/* Map Style Controls (only for flat view) */}
        {state.viewMode === 'flat' && (
          <>
            <div className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1">
              <ControlButton
                active={state.mapStyle === 'satellite'}
                onClick={() => onChangeMapStyle('satellite')}
                icon={<SatelliteIcon className="w-4 h-4" />}
                label="Sat"
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
                label="Std"
                tooltip="Standard map"
              />
            </div>
            <Divider />
          </>
        )}

        {/* Pass Predictions */}
        <ControlButton
          active={state.showPassPredictions}
          onClick={onTogglePassPredictions}
          icon={<Eye className="w-4 h-4" />}
          label="Passes"
          tooltip="Pass Predictions"
        />

        <Divider />

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

function Divider() {
  return <div className="w-px h-6 bg-border/50 hidden sm:block" />;
}

function ControlButton({
  active,
  onClick,
  icon,
  label,
  tooltip,
  variant = 'default',
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
  variant?: 'default' | 'primary' | 'warning';
}) {
  const variantStyles = {
    default: active 
      ? 'bg-primary/25 border-primary/60 text-primary shadow-lg shadow-primary/20' 
      : 'bg-secondary/50 border-border/40 text-foreground hover:bg-primary/15 hover:border-primary/40',
    primary: active 
      ? 'bg-primary/30 border-primary text-primary shadow-lg shadow-primary/30' 
      : 'bg-secondary/50 border-border/40 text-foreground hover:bg-primary/20 hover:border-primary/50',
    warning: active
      ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 shadow-lg shadow-amber-500/20'
      : 'bg-secondary/50 border-border/40 text-foreground hover:bg-amber-500/15 hover:border-amber-500/40',
  };

  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        flex items-center gap-1.5 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium
        transition-all duration-200 ease-out border
        ${variantStyles[variant]}
        hover:scale-[1.02] active:scale-95
      `}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
