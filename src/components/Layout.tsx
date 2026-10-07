import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import SiteHeader from './SiteHeader';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
