import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react';
import { guides } from '@/data/guides';

export default function GuidesList() {
  return (
    <div className="noise-overlay min-h-screen bg-background pb-24">
      <Helmet>
        <title>Guides & Articles — Nomad Spin</title>
        <meta name="description" content="In-depth guides, tax residency breakdowns, and digital nomad strategies." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        {/* Header section */}
        <div className="flex flex-col gap-6 mb-16">
          <Link to="/" className="w-max text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> Back to Spin
          </Link>
          
          <div>
            <div className="rounded-full w-12 h-12 bg-primary/10 border border-primary/20 flex flex-shrink-0 items-center justify-center mb-6">
              <BookOpen className="w-5 h-5 text-primary/60" />
            </div>
            <h1 className="font-mono text-2xl tracking-[0.1em] text-foreground uppercase mb-3">
              Guides & Articles
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
              No fluff. No discovery calls. Just the actual mechanics of moving, living, and optimizing taxes as a remote worker.
            </p>
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => (
            <Link 
              key={guide.id} 
              to={`/guides/${guide.slug}`}
              className="group block rounded-xl border border-border/40 bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] hover:border-border transition-all duration-300 flex flex-col h-full"
            >
              <div className="p-6 md:p-8 flex flex-col flex-1">
                <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {guide.readTime}</span>
                </div>
                
                <h2 className="text-lg font-mono tracking-wide text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                  {guide.title}
                </h2>
                
                <p className="text-sm text-muted-foreground leading-relaxed mt-auto">
                  {guide.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
