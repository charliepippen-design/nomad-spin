import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const PAGE_LINKS = [
  { to: "/", label: "Spin" },
  { to: "/guides", label: "Guides" },
  { to: "/destinations", label: "Destinations" },
  { to: "/about", label: "About" },
] as const;

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="page-content flex min-h-[70vh] items-center justify-center bg-background px-6">
      <Helmet>
        <title>Page Not Found (404) | Nomad Spin</title>
        <meta
          name="description"
          content="This page doesn't exist. Head back to Nomad Spin to spin the globe and find your next digital nomad destination."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl text-foreground">Page not found</h1>
        <p className="mb-8 text-xl text-muted-foreground">This page does not exist.</p>
        <nav aria-label="Site" className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {PAGE_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="text-sm font-medium text-primary hover:text-primary/80">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
