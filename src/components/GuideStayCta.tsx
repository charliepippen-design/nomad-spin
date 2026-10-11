import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { guideStayCta } from '@/lib/guideStayCta';
import { trackAffiliateClick } from '@/utils/analytics';

export default function GuideStayCta({ slug }: { slug: string }) {
  const cta = guideStayCta(slug);
  if (!cta) return null;

  const label = cta.city ? `Search stays in ${cta.city} on Booking.com` : 'Search stays on Booking.com';

  return (
    <aside className="max-w-3xl mx-auto px-6 mt-8">
      <div className="rounded-lg border border-border/30 bg-card p-5">
        <h2 className="text-xl font-serif text-foreground mb-2">{cta.heading}</h2>
        <p className="text-base text-muted-foreground">{cta.body}</p>
        <a
          href={cta.url}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() => trackAffiliateClick(cta.partner, 'accommodation', cta.city ?? '', cta.url, label)}
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-primary hover:bg-primary/20 transition-colors"
        >
          {label} <ExternalLink className="w-3 h-3" />
        </a>
        {cta.destinationSlug && cta.city ? (
          <p className="mt-3 text-sm">
            <Link to={`/destinations/${cta.destinationSlug}`} className="text-primary underline underline-offset-4">
              See the {cta.city} destination page
            </Link>
          </p>
        ) : null}
        <p className="mt-3 text-xs text-muted-foreground">
          Affiliate link: Nomad Spin may earn a commission at no extra cost to you.
        </p>
      </div>
    </aside>
  );
}
