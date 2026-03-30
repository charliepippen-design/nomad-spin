import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, ChevronLeft, Loader2 } from 'lucide-react';
import { useGuides } from '@/hooks/useGuides';
import { guides as staticGuides } from '@/data/guides';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      <div className="noise-overlay min-h-screen bg-background flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="noise-overlay min-h-screen bg-background">
        <Helmet>
          <title>{slug ? `${slug.replace(/-/g, ' ')} — Nomad Spin Guides` : 'Guides — Nomad Spin'}</title>
          <meta name="description" content="Manual not found." />
        </Helmet>
        <div className="max-w-2xl mx-auto px-6 py-24 text-center">
          <Link to="/guides" className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase mb-16 inline-flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to Guides
          </Link>
          <h1 className="font-mono text-2xl tracking-widest text-foreground uppercase mt-8 mb-4">Void Entry</h1>
          <p className="text-sm text-muted-foreground mb-12">The guide coordinates you requested don't exist in our databanks.</p>
          <Link to="/guides" className="px-6 py-3 rounded-lg bg-primary/10 border border-primary/30 text-xs font-mono tracking-widest text-primary uppercase">Return to Database</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="noise-overlay min-h-screen bg-background pb-32">
      <Helmet>
        <title>{guide.title} | Nomad Spin</title>
        <meta name="description" content={guide.excerpt} />
        <meta property="og:title" content={`${guide.title} | Nomad Spin`} />
        <meta property="og:description" content={guide.excerpt} />
      </Helmet>

      <div className="sticky top-0 z-50 w-full h-1.5 bg-gradient-to-r from-primary/5 via-primary/30 to-primary/5 border-b border-primary/20 backdrop-blur-sm"></div>

      <article className="max-w-3xl mx-auto px-6 py-12 md:py-24">
        <Link 
          to="/guides" 
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-foreground transition-all duration-300 uppercase mb-20 bg-white/[0.02] border border-white/5 px-4 py-2 rounded-md hover:border-primary/30"
        >
          <ChevronLeft className="w-4 h-4" /> 
          Archive Database
        </Link>
        
        <header className="mb-20">
          <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-primary/60 uppercase tracking-[0.2em] mb-8 border-l-2 border-primary/40 pl-6">
            <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric'})}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
            <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {guide.readTime}</span>
          </div>
          <h1 className="font-mono text-3xl md:text-4xl lg:text-5xl tracking-tight text-foreground leading-tight mb-8 drop-shadow-sm font-bold">
            {guide.title}
          </h1>
          <p className="text-lg text-muted-foreground/80 leading-relaxed font-light italic border-l-4 border-white/5 pl-8 mt-12 mb-16">
            {guide.excerpt}
          </p>
        </header>

        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none
            prose-headings:font-mono prose-headings:tracking-tighter prose-headings:text-foreground/90 prose-headings:uppercase prose-headings:font-bold
            prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:tracking-widest
            prose-h3:text-lg prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-primary/70 prose-h3:tracking-wider
            prose-p:text-muted-foreground/90 prose-p:leading-8 prose-p:mb-8 prose-p:text-[1.05rem]
            prose-a:text-primary/90 prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary transition-colors
            prose-ul:text-muted-foreground/80 prose-ul:my-10 prose-ul:list-square
            prose-li:my-3
            prose-strong:text-foreground prose-strong:font-bold
            prose-em:text-primary/70
            prose-table:w-full prose-table:border prose-table:border-white/5 prose-table:my-12 prose-table:rounded-lg prose-table:overflow-hidden
            prose-th:bg-white/[0.02] prose-th:border-b prose-th:border-white/10 prose-th:p-4 prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:tracking-widest prose-th:text-primary/60
            prose-td:border-b prose-td:border-white/5 prose-td:p-4 prose-td:text-sm prose-td:text-muted-foreground/70
            prose-blockquote:border-l-primary/40 prose-blockquote:bg-primary/[0.02] prose-blockquote:py-2 prose-blockquote:px-8 prose-blockquote:my-12 prose-blockquote:italic
            selection:bg-primary/20 selection:text-primary-foreground">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
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
