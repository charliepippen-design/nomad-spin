import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { useGuides } from '@/hooks/useGuides';
import { guides as staticGuides } from '@/data/guides';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BASE_URL = 'https://www.digitalnomadspin.com';

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
  const { data: liveGuides, isLoading } = useGuides();

  const allGuides = (() => {
    if (!liveGuides) return staticGuides;
    return [...liveGuides, ...staticGuides.filter(sg => !liveGuides.some(lg => lg.slug === sg.slug))];
  })();

  const guide = allGuides.find(g => g.slug === slug);

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
          <title>Page Not Found (404) | Nomad Spin</title>
          <meta name="description" content="Entry not found." />
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <h1 className="text-3xl text-foreground mb-4">Guide not found</h1>
          <p className="text-base text-muted-foreground mb-8">This guide is not in the library.</p>
          <Link
            to="/guides"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Browse guides
          </Link>
        </div>
      </div>
    );
  }

  const pageUrl = `${BASE_URL}/guides/${guide.slug}`;
  const SUFFIX = ' | Nomad Spin';
  const MAX_TITLE = 60;
  const headline = guide.seoTitle ?? guide.title;
  const baseTitle =
    headline.length + SUFFIX.length <= MAX_TITLE
      ? `${headline}${SUFFIX}`
      : headline;
  const title =
    baseTitle.length <= MAX_TITLE
      ? baseTitle
      : `${baseTitle.slice(0, MAX_TITLE - 1).replace(/[\s—:,-]+\S*$/, '')}…`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    url: pageUrl,
    datePublished: guide.date,
    dateModified: guide.updated ?? guide.date,
    description: guide.excerpt,
    author: {
      '@type': 'Organization',
      name: 'Nomad Spin',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nomad Spin',
      logo: `${BASE_URL}/favicon.svg`,
    },
  };
  const updatedLabel = new Date(`${(guide.updated ?? guide.date).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
        <meta property="og:image" content={`${BASE_URL}/og-preview.png`} />
        <meta property="article:published_time" content={guide.date} />
        <meta property="article:modified_time" content={(guide.updated ?? guide.date).slice(0, 10)} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={guide.excerpt} />
        <meta name="twitter:image" content={`${BASE_URL}/og-preview.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="font-mono text-xs tracking-wider text-muted-foreground mb-4">
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
            ">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, guideSchema]]}>
            {guide.content}
          </ReactMarkdown>
        </div>
      </article>

      {(guide.relatedDestinations?.length ?? 0) > 0 && (
        <div className="max-w-3xl mx-auto px-6 mt-4">
          <p className="font-mono text-xs tracking-wider text-muted-foreground mb-3">Related destinations</p>
          <div className="flex flex-wrap gap-2">
            {guide.relatedDestinations!.map((destinationSlug) => (
              <Link
                key={destinationSlug}
                to={`/destinations/${destinationSlug}`}
                className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground hover:border-primary/50 hover:text-primary transition-colors capitalize"
              >
                {destinationSlug.replace(/-/g, ' ')}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 mt-12 text-center border-t border-border pt-12">
        <p className="text-base text-muted-foreground mb-4">Ready to find a base?</p>
        <Link
          to="/"
          className="inline-flex items-center px-5 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Spin the globe
        </Link>
      </div>
    </div>
  );
}
