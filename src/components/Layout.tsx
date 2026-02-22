import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import dnsLogo from '@/assets/dns-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Logo — desktop only (mobile uses MobileNav in Index) */}
      {!isMobile && (
        <img
          src={dnsLogo}
          alt="Digital Nomad Spin"
          className="fixed top-4 right-4 z-50 h-14 w-auto pointer-events-none"
        />
      )}
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
