import { motion } from 'framer-motion';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface TimeSliderProps {
  enabled: boolean;
  offset: number; // in minutes
  onToggle: () => void;
  onOffsetChange: (offset: number) => void;
  onReset: () => void;
}

export function TimeSlider({
  enabled,
  offset,
  onToggle,
  onOffsetChange,
  onReset,
}: TimeSliderProps) {
  const formatTime = (minutes: number) => {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes < 0 ? '-' : '+';
    return `${sign}${hours}h ${mins}m`;
  };

  const getTimeLabel = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + offset);
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-4 w-full max-w-md"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Time Replay</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Reset to now"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onToggle}
            className={`p-1.5 rounded-lg transition-colors ${
              enabled 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Slider
          value={[offset]}
          min={-720}
          max={720}
          step={5}
          onValueChange={(value) => onOffsetChange(value[0])}
          className="w-full"
        />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">-12h</span>
          <div className="flex flex-col items-center">
            <span className="text-primary font-mono font-bold">{getTimeLabel()}</span>
            <span className="text-muted-foreground">{formatTime(offset)}</span>
          </div>
          <span className="text-muted-foreground">+12h</span>
        </div>
      </div>
    </motion.div>
  );
}
