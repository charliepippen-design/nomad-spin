import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import dnsLogo from '@/assets/dns-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from './ThemeToggle';

export default function Layout() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Controls Container — always available */}
      <div className="fixed top-4 right-4 z-[100] flex items-center gap-4">
        <ThemeToggle />
        {/* Logo — desktop only (mobile uses MobileNav in Index) */}
        {!isMobile && (
          <img
            src={dnsLogo}
            alt="Digital Nomad Spin"
            className="h-10 md:h-14 w-auto pointer-events-none drop-shadow-sm"
          />
        )}
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
