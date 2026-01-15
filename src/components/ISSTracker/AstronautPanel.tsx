import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, User, Rocket, Globe2, Calendar } from 'lucide-react';
import { Astronaut } from './types';

interface AstronautPanelProps {
  astronauts: Astronaut[];
  isOpen: boolean;
  onClose: () => void;
}

// Extended astronaut data (since the API only provides name and craft)
const ASTRONAUT_DETAILS: Record<string, { nationality: string; role: string; image?: string }> = {
  'Oleg Kononenko': { nationality: '🇷🇺 Russia', role: 'Commander' },
  'Nikolai Chub': { nationality: '🇷🇺 Russia', role: 'Flight Engineer' },
  'Tracy Caldwell Dyson': { nationality: '🇺🇸 USA', role: 'Flight Engineer' },
  'Matthew Dominick': { nationality: '🇺🇸 USA', role: 'Pilot' },
  'Michael Barratt': { nationality: '🇺🇸 USA', role: 'Flight Engineer' },
  'Jeanette Epps': { nationality: '🇺🇸 USA', role: 'Flight Engineer' },
  'Alexander Grebenkin': { nationality: '🇷🇺 Russia', role: 'Flight Engineer' },
  'Butch Wilmore': { nationality: '🇺🇸 USA', role: 'Commander' },
  'Sunita Williams': { nationality: '🇺🇸 USA', role: 'Pilot' },
  'default': { nationality: '🌍 Unknown', role: 'Astronaut' },
};

export function AstronautPanel({ astronauts, isOpen, onClose }: AstronautPanelProps) {
  const getDetails = (name: string) => {
    return ASTRONAUT_DETAILS[name] || ASTRONAUT_DETAILS['default'];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md glass-panel z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">ISS Crew</h2>
                  <p className="text-sm text-muted-foreground">
                    {astronauts.length} astronauts aboard
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Astronaut List */}
            <div className="p-6 space-y-4 overflow-y-auto h-[calc(100%-100px)]">
              {astronauts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Loading crew information...</p>
                </div>
              ) : (
                astronauts.map((astronaut, index) => {
                  const details = getDetails(astronaut.name);
                  return (
                    <motion.div
                      key={astronaut.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-secondary/30 rounded-xl p-4 border border-border/30"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">
                            {astronaut.name}
                          </h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Globe2 className="w-4 h-4 text-primary/70" />
                              <span>{details.nationality}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Rocket className="w-4 h-4 text-primary/70" />
                              <span>{details.role}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 text-primary/70" />
                              <span>Craft: {astronaut.craft}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Fun Facts Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card to-transparent">
              <div className="text-xs text-center text-muted-foreground">
                <p>🚀 The ISS has been continuously inhabited since November 2, 2000</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
