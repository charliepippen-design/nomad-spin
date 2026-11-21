import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import { SiteDefaultMeta } from "./components/SEO";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import DestinationGuide from "./pages/DestinationGuide";
import DestinationsIndex from "./pages/DestinationsIndex";
import GuidesList from "./pages/GuidesList";
import GuideArticle from "./pages/GuideArticle";
import Compare from "./pages/Compare";
import FindYourBase from "./pages/FindYourBase";
import Methodology from "./pages/Methodology";
import NotFound from "./pages/NotFound";
import ConsentBanner from "./components/ConsentBanner";
import { DEFAULT_LOCALE, PUBLISHED_LOCALES } from "./i18n/config";
import { LocaleProvider } from "./i18n/LocaleProvider";
import { localizePath, parsePath, routePattern } from "./i18n/paths";

/** Every page, by its English route. Other languages get the same pages under their prefix. */
const PAGES: { path: string; element: JSX.Element }[] = [
  { path: "/", element: <Index /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/privacy-policy", element: <PrivacyPolicy /> },
  { path: "/terms-of-use", element: <TermsOfUse /> },
  { path: "/destinations", element: <DestinationsIndex /> },
  { path: "/destinations/:citySlug", element: <DestinationGuide /> },
  { path: "/compare", element: <Compare /> },
  { path: "/find-your-base", element: <FindYourBase /> },
  { path: "/methodology", element: <Methodology /> },
  { path: "/guides", element: <GuidesList /> },
  { path: "/guides/:slug", element: <GuideArticle /> },
];

/**
 * A URL under a language prefix that matches no translated route: an English
 * segment typed under the prefix, or a page that language does not have.
 * Sends the reader to the translated URL when there is one, else to English.
 */
function LocalePrefixFallback() {
  const { pathname, search, hash } = useLocation();
  const { locale, enPath } = parsePath(pathname);
  const translated = localizePath(enPath, locale);
  const target = translated && translated !== pathname ? translated : enPath;
  return <Navigate to={`${target}${search}${hash}`} replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <SiteDefaultMeta />
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<LocaleProvider><Layout /></LocaleProvider>}>
                {PUBLISHED_LOCALES.flatMap((locale) =>
                  PAGES.map((page) => (
                    <Route key={`${locale}${page.path}`} path={routePattern(page.path, locale)} element={page.element} />
                  )),
                )}
                {PUBLISHED_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).map((locale) => (
                  <Route key={`${locale}-fallback`} path={`/${locale}/*`} element={<LocalePrefixFallback />} />
                ))}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <ConsentBanner />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
