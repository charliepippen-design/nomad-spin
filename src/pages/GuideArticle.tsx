import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import { useGuides } from '@/hooks/useGuides';
import { guides as staticGuides } from '@/data/guides';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BASE_URL = 'https://www.digitalnomadspin.com';

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: liveGuides, isLoading } = useGuides();

  const allGuides = (() => {
    if (!liveGuides) return staticGuides;
    return [...liveGuides, ...staticGuides.filter(sg => !liveGuides.some(lg => lg.slug === sg.slug))];
  })();

  const guide = allGuides.find(g => g.slug === slug);

  if (isLoading) {
    return (
      <div className="noise-overlay min-h-screen bg-background flex items-center justify-center p-24">
        <Loader2 className="w-10 h-10 animate-spin text-primary/30" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="noise-overlay min-h-screen bg-background">
        <Helmet>
          <title>{slug ? `${slug.replace(/-/g, ' ')} — Nomad Spin Guides` : 'Guides — Nomad Spin'}</title>
          <meta name="description" content="Entry not found." />
        </Helmet>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <Link to="/guides" className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-16 inline-flex items-center gap-2 px-4 py-2 border border-white/5 bg-white/[0.01] hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Database
          </Link>
          <h1 className="font-mono text-3xl tracking-[0.2em] text-foreground uppercase mt-12 mb-6 font-bold">404: MISSING</h1>
          <p className="text-sm text-muted-foreground mb-12 font-mono">SEGMENT_NOT_FOUND // The requested archive page does not exist in this sector.</p>
          <Link to="/guides" className="px-8 py-4 rounded-sm bg-primary/10 border border-primary/40 text-xs font-mono tracking-widest text-primary uppercase hover:bg-primary/20 transition-all">Re-initialize lookup</Link>
        </div>
      </div>
    );
  }

  const pageUrl = `${BASE_URL}/guides/${guide.slug}`;
  const SUFFIX = ' | Nomad Spin';
  const MAX_TITLE = 60;
  const baseTitle =
    guide.title.length + SUFFIX.length <= MAX_TITLE
      ? `${guide.title}${SUFFIX}`
      : guide.title;
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

  return (
    <div className="noise-overlay min-h-screen bg-background pb-40">
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
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={guide.excerpt} />
        <meta name="twitter:image" content={`${BASE_URL}/og-preview.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="sticky top-0 z-50 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent backdrop-blur-md"></div>

      <article className="max-w-3xl mx-auto px-6 py-16 md:py-28">
        <Link 
          to="/guides" 
          className="inline-flex items-center gap-3 text-[10px] font-mono tracking-[0.3em] text-primary/70 hover:text-primary transition-all duration-300 uppercase mb-24 bg-white/[0.01] border border-white/10 px-6 py-3 rounded-none hover:bg-primary/5 hover:border-primary/40"
        >
          <ChevronLeft className="w-4 h-4" /> 
          Archive_Database
        </Link>
        
        <header className="mb-24 relative">
          <div className="flex flex-wrap items-center gap-5 text-[10px] font-mono text-primary/60 uppercase tracking-[0.3em] mb-10 pl-6 border-l-2 border-primary/50 py-1">
            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/30"></span>
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {guide.readTime}</span>
          </div>
          <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl tracking-tighter text-foreground leading-[1.05] mb-12 font-black uppercase text-balance">
            {guide.title}
          </h1>
          <div className="h-0.5 w-24 bg-primary/30 mb-12"></div>
          <p className="text-xl text-muted-foreground/80 leading-relaxed font-light italic pl-10 border-l border-white/5 py-2">
            {guide.excerpt}
          </p>
        </header>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none
            prose-headings:font-mono prose-headings:tracking-widest prose-headings:text-foreground prose-headings:uppercase prose-headings:font-black prose-headings:mb-8
            prose-h2:text-3xl prose-h2:mt-24 prose-h2:mb-10 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-6
            prose-h3:text-xl prose-h3:mt-16 prose-h3:mb-8 prose-h3:text-primary/80 prose-h3:tracking-widest
            prose-p:text-muted-foreground/90 prose-p:leading-9 prose-p:mb-10 prose-p:text-[1.1rem] prose-p:font-light
            prose-a:text-primary prose-a:underline prose-a:underline-offset-8 prose-a:decoration-primary/30 hover:prose-a:decoration-primary transition-all
            prose-ul:text-muted-foreground/80 prose-ul:my-12 prose-ul:list-disc prose-ul:pl-10
            prose-li:my-4 prose-li:pl-2
            prose-strong:text-foreground prose-strong:font-bold prose-strong:text-primary/90
            prose-em:text-primary/80 prose-em:italic
            prose-table:w-full prose-table:border prose-table:border-white/10 prose-table:my-16 prose-table:font-mono prose-table:text-xs
            prose-th:bg-white/[0.03] prose-th:border prose-th:border-white/10 prose-th:p-5 prose-th:text-left prose-th:font-bold prose-th:tracking-widest prose-th:text-primary/70 prose-th:uppercase
            prose-td:border prose-td:border-white/10 prose-td:p-5 prose-td:text-muted-foreground/80
            prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-primary/[0.01] prose-blockquote:py-8 prose-blockquote:px-12 prose-blockquote:my-16 prose-blockquote:italic prose-blockquote:text-xl prose-blockquote:text-foreground/90
            prose-hr:border-white/10 prose-hr:my-20
            selection:bg-primary/30 selection:text-white">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeSanitize]}>
            {guide.content}
          </ReactMarkdown>
        </div>
      </article>
      
      <div className="max-w-3xl mx-auto px-6 mt-16 text-center border-t border-border/20 pt-16">
         <p className="text-xs font-mono tracking-widest text-muted-foreground/60 uppercase mb-6">Ready to find a base?</p>
         <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono tracking-wider text-primary hover:bg-primary/20 transition-colors uppercase"
          >
            Spin the Globe
          </Link>
      </div>
    </div>
  );
}
