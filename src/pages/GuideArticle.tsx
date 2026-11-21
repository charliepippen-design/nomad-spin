import { Navigate as RouterNavigate, useParams } from 'react-router-dom';
import { Link, useLocalizedHref } from '@/i18n/Link';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import GuideStayCta from '@/components/GuideStayCta';
import { trackEvent } from '@/utils/analytics';
import { useGuides } from '@/hooks/useGuides';
import UnsplashCredit from '@/components/UnsplashAttribution';
import { cityAttribution } from '@/hooks/useCityImage';
import { guides as staticGuides, type Guide } from '@/data/guides';
import { guideTitleTag } from '@/lib/guideHtml';
import { guideFaqJsonLd } from '@/lib/guideFaq';
import { guideArticleJsonLd, guideBreadcrumbJsonLd } from '@/lib/guideJsonLd';
import { relatedDestinationEntries, relatedGuideEntries } from '@/lib/relatedGuides';
import { rewriteSubAreaDestinationHrefs } from '@/lib/subAreaDestinations';
import { guideHeroImage, guideSocialImage } from '@/lib/socialImage';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { localizedGuide } from '@/i18n/content';
import { formatDate } from '@/i18n/format';
import { englishGuideSlug } from '@/i18n/paths';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Guide hero is full width, so it uses a wider photo than the 1200px social image. */
const HERO_WIDTH = 1600;
const HERO_HEIGHT = Math.round(HERO_WIDTH * 0.56);

/** Allow the one utility class used to scroll wide guide tables on small screens. */
const guideSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), ['className', 'overflow-x-auto']],
  },
};

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();
  const t = useT();
  const locale = useLocale();
  const localizeHref = useLocalizedHref();
  const isEnglish = locale === DEFAULT_LOCALE;
  // Live rows are English. A translated article comes from the language bundle.
  const { data: liveGuides, isLoading } = useGuides({ enabled: isEnglish });

  let guide: Guide | undefined;
  /** English slug of the article: images, related lists, tracking and hreflang are keyed on it. */
  let enSlug: string;

  if (isEnglish) {
    const allGuides = (() => {
      if (!liveGuides) return staticGuides;
      return [...liveGuides, ...staticGuides.filter(sg => !liveGuides.some(lg => lg.slug === sg.slug))];
    })();
    guide = allGuides.find(g => g.slug === slug);
    enSlug = guide?.slug ?? slug ?? '';
  } else {
    // The URL carries the translated slug (/it/guide/<slug>).
    const sourceSlug = slug ? englishGuideSlug(slug, locale) : null;
    const translated = sourceSlug ? localizedGuide(sourceSlug, locale) : null;
    // Not translated in this language: the English article is the page.
    if (!translated) return <RouterNavigate to={`/guides/${sourceSlug ?? slug ?? ''}`} replace />;
    guide = translated;
    enSlug = translated.sourceSlug;
  }

  // A known static article renders on the first paint. The live query may
  // upgrade that copy when it arrives; it must not replace it with a spinner.
  if (isLoading && !guide) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="page-content min-h-screen bg-background">
        <Helmet>
          <title>{t('guides.article.notFound.title')}</title>
          <meta name="description" content={t('guides.article.notFound.description')} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl text-foreground mb-4">{t('guides.article.notFound.heading')}</h1>
          <p className="text-base text-muted-foreground mb-8">{t('guides.article.notFound.body')}</p>
          <Link
            to="/guides"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {t('guides.article.notFound.cta')}
          </Link>
        </div>
      </div>
    );
  }

  const enPath = `/guides/${enSlug}`;
  const pageUrl = canonicalUrl(enPath, locale);
  const { url: ogImage, alt: ogImageAlt } = guideSocialImage(enSlug);
  const hero = guideHeroImage(enSlug, HERO_WIDTH);
  const heroAttribution = hero ? cityAttribution(hero.cityId) : null;
  const title = guideTitleTag(guide, locale);
  const jsonLd = guideArticleJsonLd(guide, pageUrl, ogImage, locale);
  const breadcrumbJsonLd = guideBreadcrumbJsonLd(guide, pageUrl, locale);
  const faqJsonLd = guideFaqJsonLd(guide, locale);
  const relatedGuides = relatedGuideEntries(enSlug, undefined, locale);
  const relatedDestinations = relatedDestinationEntries(guide, locale);
  const updatedLabel = formatDate((guide.updated ?? guide.date).slice(0, 10), locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Links in the article body are written as English site paths. They lead to
  // the translated page when there is one, and to the English page otherwise.
  const markdownComponents: Components = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    a: ({ node: _node, href, ...rest }) => <a href={href ? localizeHref(href) : href} {...rest} />,
  };

  return (
    <div className="page-content min-h-screen bg-background pb-24">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={guide.excerpt} />
        <link rel="canonical" href={pageUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={guide.excerpt} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={ogImageAlt} />
        <meta property="article:published_time" content={guide.date} />
        <meta property="article:modified_time" content={(guide.updated ?? guide.date).slice(0, 10)} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={guide.excerpt} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={ogImageAlt} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
        {faqJsonLd && <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>}
      </Helmet>
      <LocaleLinks enPath={enPath} />

      {hero && (
        <figure className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={hero.url}
            alt={hero.alt}
            width={HERO_WIDTH}
            height={HERO_HEIGHT}
            className="w-full h-full object-cover"
          />
          {heroAttribution && (
            <div className="absolute top-2 right-2 z-10 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5">
              <UnsplashCredit attribution={heroAttribution} className="text-white/70" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/30" />
        </figure>
      )}

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            {updatedLabel} · {guide.readTime}
          </p>
          <h1 className="text-4xl md:text-5xl leading-tight text-foreground mb-6">
            {guide.title}
          </h1>
          <p className="text-xl leading-relaxed text-muted-foreground">
            {guide.excerpt}
          </p>
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-normal prose-headings:normal-case prose-headings:text-foreground
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:font-normal
            prose-a:text-primary prose-a:underline prose-a:underline-offset-4
            prose-strong:text-foreground prose-strong:font-semibold
            prose-li:my-1
            prose-table:text-sm prose-table:font-mono
            prose-th:text-left prose-th:font-medium
            prose-blockquote:border-primary/40 prose-blockquote:text-foreground/90
            prose-code:before:content-none prose-code:after:content-none
            prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5
            prose-code:font-mono prose-code:font-medium prose-code:text-foreground
            ">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, [rehypeSanitize, guideSchema]]}
            components={markdownComponents}
          >
            {rewriteSubAreaDestinationHrefs(guide.content)}
          </ReactMarkdown>
        </div>
      </article>

      <GuideStayCta slug={enSlug} />

      {relatedGuides.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 mt-4">
          <h2 className="text-2xl font-serif text-foreground mb-4">{t('guides.article.relatedGuides')}</h2>
          <ul className="space-y-3">
            {relatedGuides.map((item) => (
              <li key={item.slug}>
                <Link to={`/guides/${item.slug}`} className="text-primary underline underline-offset-4">
                  {item.name}
                </Link>
                <p className="text-sm text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {relatedDestinations.length > 0 && (
        <div className="max-w-3xl mx-auto px-6 mt-4">
          <p className="mb-3 border-b border-border pb-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-foreground">{t('guides.article.relatedDestinations')}</p>
          <div className="flex flex-wrap gap-2">
            {relatedDestinations.map((destination) => (
              <Link
                key={destination.slug}
                to={`/destinations/${destination.slug}`}
                onClick={() => trackEvent('guide_to_destination_click', { guide: enSlug, city_slug: destination.slug })}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                {destination.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 mt-12 text-center border-t border-border pt-12">
        <p className="text-base text-muted-foreground mb-4">{t('guides.article.readyPrompt')}</p>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {t('guides.article.spin')}
        </Link>
      </div>
    </div>
  );
}
