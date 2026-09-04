import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, User } from "lucide-react";
import { getButtonStyleProps } from "../ui/button";

type MarketingShellProps = {
  children: ReactNode;
  footer?: ReactNode;
};

const navLinks = [
  { href: "#program", label: "Program Belajar" },
  
  { href: "#biaya", label: "Pilihan Paket" },
] as const;

function MarketingShell({ children, footer }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-primary/20 selection:text-primary">
      {/* Skip to Content for Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl focus:shadow-lg focus:outline-none"
      >
        Lewati ke konten utama
      </a>

      <div className="relative flex min-h-screen w-full flex-col">
        {/* Stitch-style Header: True Full Width, Fixed Top, No Margins */}
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] border-b border-border/30">
          <div className="h-20 w-full px-6 md:px-12 lg:px-24 flex items-center justify-between">
            {/* Left Side: Brand & Nav */}
            <div className="flex items-center gap-10">
              {/* Brand / Logo */}
              <Link
                to="/"
                className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-xs overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                  <img
                    src="/logo.png?v=3"
                    alt="Planet Drill Logo"
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                </div>
                <span className="font-bold text-xl tracking-tight text-primary">
                  Planet Drill
                </span>
              </Link>

              {/* Navigation Links */}
              <nav aria-label="Navigasi Utama Beranda" className="hidden md:flex items-center gap-8">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Auth Action Buttons */}
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/auth/login?view=register"
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium shadow-[0_4px_20px_rgba(79,70,229,0.15)] hover:opacity-90 transition-all flex items-center gap-2"
              >
                Mulai Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area (padding-top is needed because header is fixed) */}
        <main id="main-content" className="flex-1 focus:outline-none w-full pt-20">
          {children}
        </main>

        {/* Full Width Footer */}
        {footer ? (
          footer
        ) : (
          <footer className="w-full bg-card py-16 border-t border-border/30 mt-auto">
            <div className="w-full px-6 md:px-12 lg:px-24">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div className="space-y-2">
                  <div className="font-bold text-xl text-foreground flex items-center justify-center md:justify-start gap-2">
                     <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary font-bold text-xs">PD</div>
                     Planet Drill
                  </div>
                  <p className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Planet Drill UTBK. All rights reserved.
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-sm font-medium">
                  <a href="#program" className="text-muted-foreground hover:text-primary transition-colors">Program Belajar</a>
                  <a href="#biaya" className="text-muted-foreground hover:text-primary transition-colors">Pilihan Paket</a>
                  <a href="#testimoni" className="text-muted-foreground hover:text-primary transition-colors">Testimoni</a>
                  <Link to="/auth/login" className="text-muted-foreground hover:text-primary transition-colors">Login Siswa</Link>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}

export default MarketingShell;
