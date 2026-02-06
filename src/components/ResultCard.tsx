import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Wifi, Shield, DollarSign, Clock, Plane, ThumbsUp, ThumbsDown, Bookmark, RotateCcw, Share2 } from 'lucide-react';
import { City } from '@/data/cities';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface ResultCardProps {
  city: City;
  matchScore: number;
  onSave: () => void;
  onRespin: () => void;
  onShare: () => void;
}

function AnimatedScore({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1200;
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    const timeout = setTimeout(() => {
      rafRef.current = requestAnimationFrame(animate);
    }, 600);
    return () => { clearTimeout(timeout); cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <span>{value}</span>;
}

function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
        <motion.circle
          cx="50" cy="50" r="42"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.6 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-mono font-light text-foreground tracking-wider">
          <AnimatedScore target={score} />
        </span>
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">match</span>
      </div>
    </div>
  );
}

export default function ResultCard({ city, matchScore, onSave, onRespin, onShare }: ResultCardProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffffff', '#4488ff', '#888888'],
        gravity: 1.2,
        ticks: 120,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [city.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md mx-auto glass-strong rounded-sm overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-5">
          <ScoreRing score={matchScore} />
          <div className="flex-1 min-w-0 pt-1">
            <motion.h2
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-2xl md:text-3xl font-light tracking-[0.1em] text-foreground truncate uppercase"
            >
              {city.name}
            </motion.h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-mono tracking-wider">{city.country} · {city.region}</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {city.vibe.map((v) => (
                <span key={v} className="px-2 py-0.5 text-[10px] font-mono tracking-wider rounded-sm border border-border text-muted-foreground uppercase">
                  {v}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-border/30 mx-6">
        <StatItem icon={<DollarSign className="w-3 h-3" />} label="COST/MO" value={`$${city.costUSD}`} />
        <StatItem icon={<Wifi className="w-3 h-3" />} label="SPEED" value={`${city.internetMbps} Mbps`} />
        <StatItem icon={<Shield className="w-3 h-3" />} label="SAFETY" value={`${city.safety}/10`} />
        <StatItem icon={<Clock className="w-3 h-3" />} label="VISA" value={`${city.visa.days}d`} />
      </div>

      {/* Visa */}
      <div className="px-6 py-3">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <Plane className="w-3 h-3" />
          <span className="tracking-wider">{city.visa.type}</span>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="px-6 py-4 grid grid-cols-2 gap-6">
        <div>
          <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-2 uppercase">
            <ThumbsUp className="w-3 h-3" /> ASSETS
          </div>
          {city.pros.slice(0, 3).map((pro, i) => (
            <p key={i} className="text-xs text-foreground/60 mb-1 font-light">+ {pro}</p>
          ))}
        </div>
        <div>
          <div className="flex items-center gap-1 text-[10px] font-mono tracking-[0.2em] text-muted-foreground mb-2 uppercase">
            <ThumbsDown className="w-3 h-3" /> LIABILITIES
          </div>
          {city.cons.slice(0, 3).map((con, i) => (
            <p key={i} className="text-xs text-foreground/60 mb-1 font-light">– {con}</p>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 border-t border-border/50 flex gap-2">
        <Button onClick={onSave} variant="outline" className="flex-1 gap-2 rounded-sm border-border text-foreground/60 hover:bg-muted/50 hover:text-foreground text-xs font-mono tracking-wider">
          <Bookmark className="w-3 h-3" /> SAVE
        </Button>
        <Button onClick={onRespin} variant="outline" className="flex-1 gap-2 rounded-sm border-border text-foreground/60 hover:bg-muted/50 hover:text-foreground text-xs font-mono tracking-wider">
          <RotateCcw className="w-3 h-3" /> RE-DROP
        </Button>
        <Button onClick={onShare} variant="outline" className="gap-2 rounded-sm border-border text-foreground/60 hover:bg-muted/50 hover:text-foreground text-xs font-mono tracking-wider">
          <Share2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-3 bg-muted/20">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="text-[9px] font-mono text-muted-foreground tracking-[0.15em]">{label}</p>
        <p className="text-sm font-light text-foreground">{value}</p>
      </div>
    </div>
  );
}
