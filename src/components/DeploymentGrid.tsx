import { motion } from 'framer-motion';
import { Building, Plane, Wifi, Shield, ExternalLink } from 'lucide-react';
import { SPONSORED_REL, type AffiliateLinks } from '@/utils/affiliateEngine';
import { trackAffiliateClick } from '@/utils/analytics';
import { useT } from '@/i18n/LocaleProvider';

interface DeploymentGridProps {
  links: AffiliateLinks;
  /** Same links with labels in the reader's language. `links` stays English for URLs and analytics. */
  displayLinks?: AffiliateLinks;
  cityName: string;
}

const VERTICALS: { key: keyof AffiliateLinks; icon: typeof Building; primary: boolean }[] = [
  { key: 'accommodation', icon: Building, primary: true },
  { key: 'flights', icon: Plane, primary: false },
  { key: 'connectivity', icon: Wifi, primary: false },
  { key: 'insurance', icon: Shield, primary: false },
];

export default function DeploymentGrid({ links, displayLinks, cityName }: DeploymentGridProps) {
  const t = useT();
  // A partner without a confirmed affiliate link has an empty URL and is not shown.
  const shown = VERTICALS.filter(({ key }) => links[key].url);
  if (shown.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {shown.map(({ key, icon: Icon, primary }, i) => {
          const link = links[key];

          return (
            <motion.a
              href={link.url}
              target="_blank"
              rel={SPONSORED_REL}
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.08 }}
              onClick={() => trackAffiliateClick(link.partner, link.vertical, cityName, link.url, link.label, { placement: 'spin_card_grid' })}
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
                {(displayLinks ?? links)[key].label}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-1">
                {link.partner} <ExternalLink className="w-2.5 h-2.5" />
              </span>
              <span className="text-[7px] font-mono text-muted-foreground/40 tracking-wider">
                {t('globe.deploy.external')}
              </span>
            </motion.a>
          );
        })}
      </div>

      {/* Affiliate disclaimer */}
      <p className="text-[8px] font-mono text-muted-foreground/30 text-center tracking-wider leading-relaxed">
        {t('globe.deploy.disclaimer')}
      </p>
    </div>
  );
}
