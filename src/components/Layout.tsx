import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Footer from './Footer';
import SiteHeader from './SiteHeader';

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 min-w-0">
        {/* Route-level boundary keeps header/footer usable; clears on navigation. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </div>
      <Footer />
    </div>
  );
}
