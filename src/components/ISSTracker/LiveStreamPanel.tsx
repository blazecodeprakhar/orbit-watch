import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  X, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Radio,
  AlertCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface LiveStreamPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type StreamSource = 'nasa-live' | 'iss-hd' | 'space-station';

interface StreamInfo {
  id: StreamSource;
  name: string;
  description: string;
  videoId: string;
}

const STREAM_SOURCES: StreamInfo[] = [
  {
    id: 'nasa-live',
    name: 'NASA TV',
    description: 'Official NASA Television',
    videoId: '21X5lGlDOfg',
  },
  {
    id: 'iss-hd',
    name: 'Earth HD',
    description: 'Live Earth from ISS',
    videoId: 'xRPTBhmcyXY',
  },
  {
    id: 'space-station',
    name: 'ISS Live',
    description: 'Space Station Stream',
    videoId: 'DDU-rZs-Ic4',
  },
];

export function LiveStreamPanel({ isOpen, onClose }: LiveStreamPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentSource, setCurrentSource] = useState<StreamSource>('nasa-live');
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const currentStream = STREAM_SOURCES.find(s => s.id === currentSource) || STREAM_SOURCES[0];
  
  // Build embed URL with proper parameters
  const embedUrl = `https://www.youtube.com/embed/${currentStream.videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  const handleSourceChange = (source: StreamSource) => {
    setCurrentSource(source);
    setHasError(false);
  };

  const panelSize = isExpanded 
    ? { width: '640px', height: '400px' }
    : { width: '320px', height: '220px' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`fixed glass-panel rounded-xl shadow-2xl overflow-hidden ${
            isExpanded 
              ? 'bottom-24 right-4 z-[1100]' 
              : 'bottom-20 right-4 z-[1000]'
          }`}
          style={{ width: panelSize.width, maxWidth: 'calc(100vw - 2rem)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-card/80 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Video className="w-4 h-4 text-primary" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground">{currentStream.name}</h3>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-primary" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                title={isExpanded ? 'Minimize' : 'Expand'}
              >
                {isExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5 text-muted-foreground" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
              <a
                href={`https://www.youtube.com/watch?v=${currentStream.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                title="Open in YouTube"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </a>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-destructive/20 transition-colors"
                title="Close"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Stream Selector */}
          <div className="flex items-center gap-1 px-2 py-1.5 bg-card/60 border-b border-border/30">
            {STREAM_SOURCES.map((source) => (
              <button
                key={source.id}
                onClick={() => handleSourceChange(source.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                  currentSource === source.id
                    ? 'bg-primary/25 border border-primary/50 text-primary'
                    : 'bg-secondary/40 border border-transparent text-muted-foreground hover:bg-primary/10'
                }`}
              >
                <Radio className={`w-2.5 h-2.5 ${currentSource === source.id ? 'text-red-500' : ''}`} />
                {source.name}
              </button>
            ))}
          </div>

          {/* Video Container */}
          <div className="relative bg-black" style={{ height: isExpanded ? '320px' : '150px' }}>
            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground mb-2">
                  Stream temporarily unavailable
                </p>
                <a
                  href={`https://www.youtube.com/watch?v=${currentStream.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 border border-primary/50 rounded-lg text-primary text-xs hover:bg-primary/30 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Watch on YouTube
                </a>
              </div>
            ) : (
              <>
                <iframe
                  key={`${currentStream.videoId}-${isMuted}`}
                  src={embedUrl}
                  title={currentStream.name}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  onError={() => setHasError(true)}
                />
                {/* Live indicator */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/70 rounded-full">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-medium text-white">LIVE</span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
