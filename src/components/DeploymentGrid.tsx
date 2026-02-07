import { motion } from 'framer-motion';
import { Building, Plane, Wifi, Shield, ExternalLink, AlertCircle } from 'lucide-react';
import { type AffiliateLinks, type AffiliateLinkData } from '@/utils/affiliateEngine';
import { trackAffiliateClick, trackAffiliateClickError, type Vertical } from '@/utils/analytics';
import { useToast } from '@/hooks/use-toast';

interface DeploymentGridProps {
  links: AffiliateLinks;
  cityName: string;
}

const VERTICALS: { key: keyof AffiliateLinks; icon: typeof Building; primary: boolean }[] = [
  { key: 'accommodation', icon: Building, primary: true },
  { key: 'flights', icon: Plane, primary: false },
  { key: 'connectivity', icon: Wifi, primary: false },
  { key: 'insurance', icon: Shield, primary: false },
];

export default function DeploymentGrid({ links, cityName }: DeploymentGridProps) {
  const { toast } = useToast();

  const handleClick = (link: AffiliateLinkData) => {
    if (!link.url) return;

    // Track before opening
    trackAffiliateClick(link.partner, link.vertical, cityName, link.url, link.label);

    try {
      window.open(link.url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      trackAffiliateClickError(link.partner, link.vertical, cityName, link.url, msg);
      toast({
        title: 'LINK UNAVAILABLE',
        description: `Unable to open ${link.partner} link. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {VERTICALS.map(({ key, icon: Icon, primary }, i) => {
          const link = links[key];
          const isDisabled = !link.url;

          if (isDisabled) {
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 0.4, y: 0 }}
                transition={{ delay: 1.4 + i * 0.08 }}
                className="flex flex-col items-center gap-1 py-3 px-2 rounded-sm border border-border/30 bg-white/[0.01] text-center cursor-not-allowed"
                title="Unavailable for this destination"
              >
                <AlertCircle className="w-4 h-4 text-muted-foreground/50" />
                <span className="text-[7px] font-mono tracking-wider text-muted-foreground/50 uppercase">
                  UNAVAILABLE
                </span>
              </motion.div>
            );
          }

          return (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.08 }}
              onClick={() => handleClick(link)}
              className={`group relative flex flex-col items-center gap-1.5 rounded-sm border transition-all text-center cursor-pointer ${
                primary
                  ? 'py-4 px-3 border-primary/40 bg-primary/[0.06] hover:bg-primary/[0.12] hover:border-primary/60 hover:shadow-[0_0_16px_hsl(var(--primary)/0.2)]'
                  : 'py-3 px-2 border-border/50 bg-white/[0.02] hover:bg-white/[0.06] hover:border-border hover:shadow-[0_0_8px_hsl(var(--foreground)/0.05)]'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${
                primary
                  ? 'text-primary/70 group-hover:text-primary'
                  : 'text-muted-foreground group-hover:text-foreground'
              }`} />
              <span className={`text-[8px] font-mono tracking-[0.1em] uppercase leading-tight transition-colors max-w-full truncate ${
                primary
                  ? 'text-primary/80 group-hover:text-primary'
                  : 'text-foreground/60 group-hover:text-foreground'
              }`}>
                {link.label}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                {link.partner} <ExternalLink className="w-2.5 h-2.5" />
              </span>
              <span className="text-[7px] font-mono text-muted-foreground/40 tracking-wider">
                EXTERNAL AFFILIATE LINK
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Affiliate disclaimer */}
      <p className="text-[8px] font-mono text-muted-foreground/30 text-center tracking-wider leading-relaxed">
        SOME OUTBOUND LINKS ARE AFFILIATE LINKS — WE MAY EARN A COMMISSION AT NO EXTRA COST TO YOU.
      </p>
    </div>
  );
}
