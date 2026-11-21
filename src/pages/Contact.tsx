import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLocale, useT } from '@/i18n/LocaleProvider';
import { LocaleLinks, canonicalUrl } from '@/i18n/seo';

const BASE_URL = 'https://www.digitalnomadspin.com';

export default function Contact() {
  const t = useT();
  const locale = useLocale();
  const PAGE_URL = canonicalUrl('/contact', locale);
  const TITLE = t('static.contact.title');
  const DESCRIPTION = t('static.contact.description');
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
      toast.error(t('static.contact.error'));
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
      <LocaleLinks enPath="/contact" />

      <div className="dns-container grid gap-10 py-12 md:grid-cols-[1fr_1.1fr] md:gap-16 md:py-20">
        <div>
        <p className="dns-eyebrow">{t('static.contact.eyebrow')}</p>
        <h1 className="mt-3 text-4xl leading-[1.08] text-foreground md:text-6xl">
          {t('static.contact.h1')}
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
          {t('static.contact.intro')}
        </p>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {t('static.contact.wrongNumber')}
        </p>
        </div>

        <div className="dns-card p-6 md:p-8">
        {submitted ? (
          <div className="py-8 text-center">
            <p className="font-display text-2xl font-bold text-foreground">{t('static.contact.thanks.title')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('static.contact.thanks.body')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">{t('static.contact.form.name')}</label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="dns-input !py-3"
                placeholder={t('static.contact.form.namePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">{t('static.contact.form.email')}</label>
              <input
                id="email"
                type="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="dns-input !py-3"
                placeholder={t('static.contact.form.emailPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">{t('static.contact.form.message')}</label>
              <textarea
                id="message"
                required
                maxLength={1000}
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="dns-input resize-none !py-3"
                placeholder={t('static.contact.form.messagePlaceholder')}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2 text-sm font-semibold">
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {loading ? t('static.contact.form.sending') : t('static.contact.form.send')}
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
