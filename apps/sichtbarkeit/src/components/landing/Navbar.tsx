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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="cosmic cosmic-softdark fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
      <div
        className={`pointer-events-auto inline-flex items-center rounded-full border c-border-soft backdrop-blur-xl px-2 py-2 transition-shadow ${
          scrolled ? "shadow-lg shadow-black/40" : ""
        }`}
        style={{ backgroundColor: "hsl(var(--c-surface) / 0.85)" }}
      >
        <Link to="/" className="group relative flex items-center justify-center" aria-label="Trending Media">
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full">
            <span className="absolute inset-0 rounded-full accent-gradient-anim" />
            <span
              className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full"
              style={{ backgroundColor: "hsl(var(--c-bg))" }}
            >
              <img src="/logo-weiss.png" alt="Trending Media" className="h-5 w-5 object-contain" />
            </span>
          </span>
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
          className="group/cta relative inline-flex items-center rounded-full text-xs sm:text-sm c-text"
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
      </div>
    </nav>
  );
};
