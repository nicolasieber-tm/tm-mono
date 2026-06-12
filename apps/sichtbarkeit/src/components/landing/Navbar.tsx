import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NAV = [
  { label: "Ausgangslage", href: "#ausgangslage" },
  { label: "Lösung", href: "#leistungen" },
  { label: "Ablauf", href: "#ablauf" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <nav className="cosmic cosmic-softdark fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center rounded-full border c-border-soft backdrop-blur-xl px-2 py-2 transition-shadow ${
          scrolled ? "shadow-lg shadow-black/40" : ""
        }`}
        style={{ backgroundColor: "hsl(var(--c-surface) / 0.85)" }}
      >
        <Link to="/" className="group relative flex items-center justify-center" aria-label="Trending Media">
          <img src="/Webseiten_logo.png" alt="Trending Media — Webseiten" className="h-9 w-9 rounded-[10px] object-contain" />
        </Link>

        <span className="hidden sm:block w-px h-5 c-line-soft mx-1" />

        <ul className="hidden sm:flex items-center">
          {NAV.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-xs sm:text-sm rounded-full px-3 sm:px-4 py-1.5 sm:py-2 c-text-55 hover:c-text hover:c-fill-6 transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <span className="hidden sm:block w-px h-5 c-line-soft mx-1" />

        <Link
          to="/beratung"
          className="hidden sm:inline-flex group/cta relative items-center rounded-full text-xs sm:text-sm c-text"
        >
          <span className="absolute inset-[-2px] rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity accent-gradient-anim" />
          <span
            className="relative inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2"
            style={{ backgroundColor: "hsl(var(--c-surface))" }}
          >
            Beratung
            <span className="inline-block translate-y-[-1px]">↗</span>
          </span>
        </Link>

        {/* Mobile burger button */}
        <button
          type="button"
          aria-label={open ? "Menü schliessen" : "Menü öffnen"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full c-text hover:c-fill-6 transition-colors"
        >
          <span className="relative block h-3.5 w-5">
            <span
              className={`absolute left-0 right-0 h-px bg-current transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 right-0 h-px bg-current transition-all duration-300 ${
                open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
              }`}
            />
          </span>
        </button>
      </div>

      {/* Mobile menu overlay */}
      <div
        className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ backgroundColor: "hsl(var(--c-bg) / 0.96)", backdropFilter: "blur(16px)" }}
        onClick={() => setOpen(false)}
      >
        <div
          className="flex h-full flex-col items-center justify-center gap-2 px-6"
          onClick={(e) => e.stopPropagation()}
        >
          <ul className="flex flex-col items-center gap-1 w-full max-w-xs">
            {NAV.map((item) => (
              <li key={item.href} className="w-full">
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block w-full text-center rounded-full px-5 py-3 text-base c-text-85 hover:c-text hover:c-fill-6 transition-colors"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            to="/beratung"
            onClick={() => setOpen(false)}
            className="mt-6 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm"
            style={{ backgroundColor: "rgb(var(--c-fg))", color: "hsl(var(--c-bg))" }}
          >
            Beratung
            <span>↗</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};
