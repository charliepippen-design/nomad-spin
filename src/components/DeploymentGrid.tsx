import { motion } from 'framer-motion';
import { Building, Plane, Wifi, Shield, ExternalLink } from 'lucide-react';
import { type AffiliateLinks } from '@/utils/affiliateEngine';
import { trackAffiliateClick } from '@/utils/analytics';

interface DeploymentGridProps {
  links: AffiliateLinks;
  cityName: string;
}

const VERTICALS = [
  { key: 'accommodation' as const, icon: Building, primary: true },
  { key: 'flights' as const, icon: Plane, primary: false },
  { key: 'connectivity' as const, icon: Wifi, primary: false },
  { key: 'insurance' as const, icon: Shield, primary: false },
] as const;

export default function DeploymentGrid({ links, cityName }: DeploymentGridProps) {
  const handleClick = (vertical: keyof AffiliateLinks) => {
    const link = links[vertical];
    trackAffiliateClick(link.partner, vertical, cityName);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {VERTICALS.map(({ key, icon: Icon, primary }, i) => {
        const link = links[key];
        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + i * 0.08 }}
            onClick={() => handleClick(key)}
            className={`group relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-sm border transition-all text-center cursor-pointer ${
              primary
                ? 'border-primary/40 bg-primary/[0.06] hover:bg-primary/[0.12] hover:border-primary/60 hover:shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                : 'border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-border hover:shadow-[0_0_8px_hsl(var(--foreground)/0.05)]'
            }`}
          >
            <Icon className={`w-4 h-4 transition-colors ${
              primary
                ? 'text-primary/70 group-hover:text-primary'
                : 'text-muted-foreground group-hover:text-foreground'
            }`} />
            <span className={`text-[8px] font-mono tracking-[0.12em] uppercase leading-tight transition-colors ${
              primary
                ? 'text-primary/80 group-hover:text-primary'
                : 'text-foreground/60 group-hover:text-foreground'
            }`}>
              {link.label}
            </span>
            <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
              {link.partner} <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
