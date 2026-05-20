import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="cosmic cosmic-softdark relative overflow-hidden">
      <div className="container-tight pt-20 pb-10">
        <div
          className="liquid-glass relative rounded-3xl p-8 md:p-12"
          style={{ backgroundColor: "hsl(var(--c-surface) / 0.4)" }}
        >
          <div
            className="absolute -top-32 right-1/3 h-72 w-72 rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at center, rgba(167,139,250,0.25) 0%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />

          <div className="relative grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
            <div>
              <Link to="/" className="inline-flex items-center gap-2">
                <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <span className="absolute inset-0 rounded-full accent-gradient-anim" />
                  <span
                    className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full"
                    style={{ backgroundColor: "hsl(var(--c-bg))" }}
                  >
                    <img src="/logo-weiss.png" alt="Trending Media" className="h-5 w-5 object-contain" />
                  </span>
                </span>
                <span className="font-semibold tracking-tight c-text">Trending Media</span>
              </Link>
              <p className="mt-5 max-w-sm text-sm c-text-55 leading-relaxed">
                Websites für KMU und lokale Unternehmen in der Schweiz. Verständlich, professionell
                und auf mehr Anfragen ausgerichtet.
              </p>
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] c-text-35">
                sichtbarkeit.trendingmedia.ch
              </p>
            </div>

            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] c-text-55">
                Navigation
              </h4>
              <ul className="mt-4 space-y-2 text-sm c-text-70">
                <li><a href="#leistungen" className="hover:c-text transition-colors">Lösung</a></li>
                <li><a href="#ablauf" className="hover:c-text transition-colors">Ablauf</a></li>
                <li><a href="#faq" className="hover:c-text transition-colors">FAQ</a></li>
                <li><a href="#kontakt" className="hover:c-text transition-colors">Kontakt</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-[10px] uppercase tracking-[0.32em] c-text-55">
                Rechtliches
              </h4>
              <ul className="mt-4 space-y-2 text-sm c-text-70">
                <li><Link to="/impressum" className="hover:c-text transition-colors">Impressum</Link></li>
                <li><Link to="/datenschutz" className="hover:c-text transition-colors">Datenschutz</Link></li>
              </ul>
            </div>
          </div>

          <div className="relative mt-10 pt-6 border-t c-border-faint">
            <div className="flex flex-col items-center justify-between gap-2 text-xs c-text-45 sm:flex-row">
              <span>© {new Date().getFullYear()} Trending Media. Alle Rechte vorbehalten.</span>
              <span className="font-mono uppercase tracking-[0.22em]">
                Für KMU · Schweiz
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
