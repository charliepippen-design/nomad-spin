import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import dnsLogo from '@/assets/dns-logo.png';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <img
        src={dnsLogo}
        alt="Digital Nomad Spin"
        className="fixed top-4 right-4 z-50 h-14 w-auto pointer-events-none"
      />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
