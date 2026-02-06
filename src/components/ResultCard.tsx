import { motion } from 'framer-motion';
import { MapPin, Wifi, Shield, DollarSign, Clock, Plane, ThumbsUp, ThumbsDown, Bookmark, RotateCcw, Share2 } from 'lucide-react';
import { City } from '@/data/cities';
import { Button } from '@/components/ui/button';

interface ResultCardProps {
  city: City;
  matchScore: number;
  onSave: () => void;
  onRespin: () => void;
  onShare: () => void;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
            <stop offset="100%" stopColor="hsl(var(--goldenrod))" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-foreground neon-text-gold">{score}</span>
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">match</span>
      </div>
    </div>
  );
}

export default function ResultCard({ city, matchScore, onSave, onRespin, onShare }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto glass-strong rounded-2xl overflow-hidden"
    >
      {/* City header with gradient */}
      <div className="relative p-6 pb-4 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent">
        <div className="flex items-start gap-4">
          <ScoreRing score={matchScore} />
          <div className="flex-1 min-w-0">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-display font-bold text-foreground neon-text truncate"
            >
              {city.name}
            </motion.h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">{city.country} · {city.region}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {city.vibe.map((v) => (
                <span key={v} className="px-2 py-0.5 text-xs rounded-full bg-secondary/20 text-secondary border border-secondary/30 capitalize">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 px-6 py-4">
        <StatItem icon={<DollarSign className="w-4 h-4" />} label="Monthly Cost" value={`$${city.costUSD}`} color="text-accent" />
        <StatItem icon={<Wifi className="w-4 h-4" />} label="Internet" value={`${city.internetMbps} Mbps`} color="text-primary" />
        <StatItem icon={<Shield className="w-4 h-4" />} label="Safety" value={`${city.safety}/10`} color="text-primary" />
        <StatItem icon={<Clock className="w-4 h-4" />} label="Visa" value={`${city.visa.days}d`} color="text-secondary" />
      </div>

      {/* Visa info */}
      <div className="px-6 py-2">
        <div className="flex items-center gap-2 text-sm">
          <Plane className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">{city.visa.type}</span>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="px-6 py-4 grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1 text-sm font-medium text-primary mb-2">
            <ThumbsUp className="w-3 h-3" /> Pros
          </div>
          {city.pros.slice(0, 3).map((pro, i) => (
            <p key={i} className="text-xs text-muted-foreground mb-1">✓ {pro}</p>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 text-sm font-medium text-destructive mb-2">
            <ThumbsDown className="w-3 h-3" /> Cons
          </div>
          {city.cons.slice(0, 3).map((con, i) => (
            <p key={i} className="text-xs text-muted-foreground mb-1">✗ {con}</p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-border flex gap-2">
        <Button onClick={onSave} variant="outline" className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/10">
          <Bookmark className="w-4 h-4" /> Save
        </Button>
        <Button onClick={onRespin} variant="outline" className="flex-1 gap-2 border-secondary/30 text-secondary hover:bg-secondary/10">
          <RotateCcw className="w-4 h-4" /> Re-spin
        </Button>
        <Button onClick={onShare} variant="outline" className="gap-2 border-border text-muted-foreground hover:bg-muted">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
      <span className={color}>{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}
