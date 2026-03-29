import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import { useGuides } from '@/hooks/useGuides';
import { guides as staticGuides } from '@/data/guides';

export default function GuideArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: liveGuides, isLoading } = useGuides();

  // Merge live + static; Supabase takes precedence
  const allGuides = (() => {
    if (!liveGuides) return staticGuides;
    const liveSlugSet = new Set(liveGuides.map(g => g.slug));
    const staticFallbacks = staticGuides.filter(g => !liveSlugSet.has(g.slug));
    return [...liveGuides, ...staticFallbacks];
  })();

  const guide = allGuides.find(g => g.slug === slug);

  if (isLoading) {
    return (
      <div className="noise-overlay min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-mono">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading guide…
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="noise-overlay min-h-screen bg-background">
        <Helmet>
          <title>{slug ? `${slug.replace(/-/g, ' ')} — Nomad Spin Guides` : 'Guides — Nomad Spin'}</title>
          <meta name="description" content="Article not found." />
        </Helmet>
        <div className="max-w-2xl mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center">
          <Link to="/guides" className="self-start text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-16">
            <ArrowLeft className="w-3 h-3 inline mr-1" /> Back to Guides
          </Link>
          <h1 className="font-mono text-lg tracking-[0.15em] text-foreground uppercase mb-4">
            Article Not Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
            The guide you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/guides"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono tracking-wider text-primary hover:bg-primary/20 transition-colors uppercase"
          >
            Browse all guides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="noise-overlay min-h-screen bg-background pb-24">
      <Helmet>
        <title>{guide.title} — Nomad Spin</title>
        <meta name="description" content={guide.excerpt} />
      </Helmet>

      <div className="w-full h-1 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 border-b border-border/40"></div>

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <Link 
          to="/guides" 
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-12 bg-white/[0.03] px-3 py-1.5 border border-white/5 rounded-full"
        >
          <ChevronLeft className="w-3 h-3" /> 
          Back to Guides
        </Link>
        
        <header className="mb-14">
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-6 border-b border-white/5 pb-4">
            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {guide.readTime}</span>
          </div>
          <h1 className="font-mono text-2xl md:text-3xl tracking-wide text-foreground leading-snug lg:leading-tight mb-6">
            {guide.title}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-4 py-1 italic">
            {guide.excerpt}
          </p>
        </header>

        <div 
          className="prose prose-sm md:prose-base dark:prose-invert max-w-none
            prose-headings:font-mono prose-headings:tracking-wide prose-headings:text-foreground prose-headings:uppercase
            prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-b prose-h2:border-white/10 prose-h2:pb-2
            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-primary/90
            prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-ul:text-muted-foreground/90 prose-ul:my-6
            prose-li:my-2
            prose-strong:text-foreground prose-strong:font-semibold
            prose-em:text-primary/80
            prose-table:w-full prose-table:border-collapse prose-table:my-8
            prose-th:border-b prose-th:border-border prose-th:p-3 prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:tracking-widest prose-th:text-muted-foreground/80
            prose-td:border-b prose-td:border-border/50 prose-td:p-3 prose-td:text-sm prose-td:text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: guide.content }} 
        />
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
