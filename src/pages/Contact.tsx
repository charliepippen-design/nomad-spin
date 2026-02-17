import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact', {
        body: { name, email, message },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="noise-overlay min-h-screen bg-background">
      <Helmet>
        <title>Contact — Nomad Spin</title>
        <meta name="description" content="Get in touch with the Nomad Spin team. Share feedback, suggest a city, or ask a question." />
      </Helmet>

      <div className="max-w-lg mx-auto px-6 py-16 md:py-24">
        <Link to="/" className="inline-block text-[10px] font-mono tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors uppercase mb-12">
          ← Back to Spin
        </Link>

        <h1 className="font-mono text-lg md:text-2xl tracking-[0.15em] text-foreground uppercase mb-4">
          Contact Us
        </h1>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          Have a question, feedback, or a city you'd like us to add? Drop us a message.
        </p>

        {submitted ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.05] p-8 text-center">
            <p className="font-mono text-sm text-foreground tracking-wider">Thank you!</p>
            <p className="text-xs text-muted-foreground mt-2">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase mb-1.5">Name</label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-[10px] font-mono tracking-[0.15em] text-muted-foreground uppercase mb-1.5">Message</label>
              <textarea
                id="message"
                required
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring font-mono resize-none"
                placeholder="Your message..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2 font-mono tracking-wider uppercase text-xs">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
