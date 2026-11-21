import { useLocation } from 'react-router-dom';
import { Link } from '@/i18n/Link';
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useT } from '@/i18n/LocaleProvider';

const PAGE_LINKS = [
  { to: "/", key: "spin" },
  { to: "/guides", key: "guides" },
  { to: "/destinations", key: "destinations" },
  { to: "/about", key: "about" },
] as const;

const NotFound = () => {
  const location = useLocation();
  const t = useT();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-content flex min-h-[70vh] items-center justify-center bg-background px-6">
      <Helmet>
        <title>{t('static.notFound.title')}</title>
        <meta
          name="description"
          content={t('static.notFound.description')}
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="text-center">
        <p className="dns-num text-8xl text-foreground/10 md:text-9xl" aria-hidden="true">404</p>
        <h1 className="mb-3 mt-2 text-4xl text-foreground md:text-5xl">{t('static.notFound.h1')}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{t('static.notFound.body')}</p>
        <nav aria-label={t('static.notFound.navLabel')} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {PAGE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-primary hover:text-primary/80">
              {t(`static.notFound.link.${link.key}`)}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
