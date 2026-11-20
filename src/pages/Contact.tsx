import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BASE_URL = 'https://www.digitalnomadspin.com';
const PAGE_URL = `${BASE_URL}/contact`;
const TITLE = 'Contact | Nomad Spin';
const DESCRIPTION = 'Get in touch with the Nomad Spin team. Share feedback, suggest a city, or ask a question.';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: TITLE,
  url: PAGE_URL,
  description: DESCRIPTION,
  mainEntity: {
    '@type': 'Organization',
    name: 'Nomad Spin',
    url: BASE_URL,
  },
};

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
    <div className="page-content min-h-screen bg-background">
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${BASE_URL}/og-preview.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${BASE_URL}/og-preview.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="dns-container grid gap-10 py-12 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-20">
        <div>
        <p className="dns-eyebrow">Get in touch</p>
        <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
          Contact
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          Have a question, feedback, or a city you'd like us to add? Drop us a message.
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Spotted a wrong number on a city page? Tell us which city and which figure, with a source if you have one.
        </p>
        </div>

        <div className="dns-card p-6 md:p-8">
        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-display text-2xl font-bold text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground mt-2">We'll get back to you soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dns-input !py-3"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dns-input !py-3"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">Message</label>
              <textarea
                id="message"
                required
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="dns-input resize-none !py-3"
                placeholder="Your message..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2 text-sm font-semibold">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
