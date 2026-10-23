import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";
import { BOOK_HREF, WIDGET_TM, loadBooking, openBooking } from "@/lib/booking";
import { NISCHEN } from "@/data/nischen";
import { usePageMeta } from "@/lib/head";
import "@/pages/apple-home.css";
import "./site.css";

export const MAIL = "info@trendingmedia.ch";

/* ---- Navigation ----
   Eine Navigation für alle Seiten. „Leistungen" und „Produkte" sind Dropdowns
   (Desktop: Hover/Fokus, Mobile: als Gruppen im Burger-Menü). */
type NavItem = { to: string; label: string; desc?: string };
const NAV: { label: string; items?: NavItem[]; to?: string }[] = [
  {
    label: "Leistungen",
    items: [
      { to: "/automationen", label: "Automationen & Software", desc: "Prozesse, KI und massgeschneiderte Tools" },
      { to: "/landingpages", label: "Landingpages & Websites", desc: "Auftritte, die Anfragen bringen" },
      ...NISCHEN.map((n) => ({ to: `/${n.path}`, label: n.navLabel, desc: n.navDesc })),
    ],
  },
  {
    label: "Produkte",
    items: [
      { to: "/oneclick-office", label: "OneClick Office", desc: "Administration für Coaches & Berater" },
      { to: "/auron", label: "AURON", desc: "Zeiterfassung für Handwerk & Bau" },
    ],
  },
  { label: "Kundenstimmen", to: "/kundenstimmen" },
  { label: "Über uns", to: "/ueber-uns" },
];

/* ---- Reduzierte Navigation (Branchenseiten wie /handwerk) ----
   Nur Logo, ein paar Links, optional Telefonnummer und Erstgespräch: wer über
   eine Branchenseite kommt, soll nicht wieder alle Leistungen sehen. */
export type SlimNav = { links: NavItem[]; phone?: string };

function NavSlim({ links, phone }: SlimNav) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <nav className="ap-nav">
      <div className={`ap-pill ap-pill-slim${scrolled ? " scrolled" : ""}`}>
        <Link className="b" to="/"><img className="brandmark" src="/logo-schwarz.png" alt="" />Trending Media</Link>
        <div className="links">
          {links.map((l) => <Link key={l.to} to={l.to}>{l.label}</Link>)}
          {phone && <a className="tel" href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>}
        </div>
        <a className="cta" href={BOOK_HREF}>Erstgespräch</a>
      </div>
    </nav>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDrop, setOpenDrop] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Menüs beim Seitenwechsel schliessen
  useEffect(() => { setMobileOpen(false); setOpenDrop(null); }, [pathname]);

  const groupActive = (items: NavItem[]) => items.some((i) => pathname.startsWith(i.to));

  return (
    <>
      <nav className="ap-nav">
        <div className={`ap-pill${scrolled ? " scrolled" : ""}`}>
          <Link className="b" to="/"><img className="brandmark" src="/logo-schwarz.png" alt="" />Trending Media</Link>
          <div className="links">
            {NAV.map((n) =>
              n.items ? (
                <div
                  key={n.label}
                  className={`ap-drop${openDrop === n.label ? " open" : ""}`}
                  onMouseEnter={() => setOpenDrop(n.label)}
                  onMouseLeave={() => setOpenDrop(null)}
                >
                  <button
                    type="button"
                    className={groupActive(n.items) ? "active" : undefined}
                    aria-expanded={openDrop === n.label}
                    onClick={() => setOpenDrop(openDrop === n.label ? null : n.label)}
                  >
                    {n.label}<span className="chev" aria-hidden>⌄</span>
                  </button>
                  <div className="ap-drop-panel">
                    {n.items.map((i) => (
                      <Link key={i.to} to={i.to}>
                        <b>{i.label}</b>
                        {i.desc && <span>{i.desc}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <NavLink key={n.to} to={n.to!} className={({ isActive }) => (isActive ? "active" : undefined)}>{n.label}</NavLink>
              )
            )}
          </div>
          <a className="cta" href={BOOK_HREF}>Erstgespräch</a>
          <button className="ap-burger" aria-label="Menü öffnen" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>≡</button>
        </div>
      </nav>
      <div className={`ap-mobile${mobileOpen ? " open" : ""}`}>
        {NAV.map((n) =>
          n.items ? (
            <div className="grp" key={n.label}>
              <span className="grp-k">{n.label}</span>
              {n.items.map((i) => <Link key={i.to} to={i.to}>{i.label}</Link>)}
            </div>
          ) : (
            <Link key={n.to} to={n.to!}>{n.label}</Link>
          )
        )}
        <a className="m-cta" href={BOOK_HREF} onClick={() => setMobileOpen(false)}>Erstgespräch buchen</a>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="ap-foot">
      <div className="wide">
        <div className="grid">
          <div>
            <h4>Trending Media</h4>
            <p style={{ maxWidth: "30ch", lineHeight: 1.6 }}>Digitalisierungspartner für Schweizer KMU. Strategie, Software und Umsetzung. Aus Praxis, für Praxis.</p>
          </div>
          <div>
            <h4>Leistungen</h4>
            <Link className="fl" to="/automationen">Automationen &amp; Software</Link>
            <Link className="fl" to="/landingpages">Landingpages &amp; Websites</Link>
            {NISCHEN.map((n) => <Link key={n.path} className="fl" to={`/${n.path}`}>{n.navLabel}</Link>)}
            <Link className="fl" to="/kundenstimmen">Kundenstimmen</Link>
          </div>
          <div>
            <h4>Produkte</h4>
            <Link className="fl" to="/oneclick-office">OneClick Office</Link>
            <Link className="fl" to="/auron">AURON</Link>
            <Link className="fl" to="/ueber-uns">Über uns</Link>
          </div>
          <div>
            <h4>Kontakt</h4>
            <a className="fl" href={BOOK_HREF}>Erstgespräch</a>
            <a className="fl" href={`mailto:${MAIL}`}>{MAIL}</a>
            <span className="fl">Solothurn · CH</span>
          </div>
        </div>
        <div className="copy">
          <span>© {new Date().getFullYear()} Trending Media · Made with care in Switzerland</span>
          <span className="sep">·</span>
          <Link to="/impressum">Impressum</Link>
          <span className="sep">·</span>
          <Link to="/datenschutz">Datenschutz</Link>
        </div>
      </div>
    </footer>
  );
}

/**
 * Gemeinsamer Rahmen aller Marketing-Seiten: Skin (.ap.ap-vivid), Navigation,
 * Footer, Reveal-Animationen, heller Seitenhintergrund und Terminbuchung.
 *
 * `widgetId`: welches Buchungs-Widget die Buttons dieser Seite öffnen
 * (Standard: Erstgespräch TM; /landingpages hat ein eigenes).
 */
export default function SiteLayout({
  children,
  title,
  description,
  widgetId = WIDGET_TM,
  slimNav,
}: {
  children: ReactNode;
  title: string;
  description?: string;
  widgetId?: string;
  /** reduzierte Navigation statt der Hauptnavigation */
  slimNav?: SlimNav;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const lenis = useLenis();
  usePageMeta(title, description);

  // heller Hintergrund inkl. iOS-Overscroll/Statusbar (siehe frühere Index.tsx)
  useEffect(() => {
    const BG = "#fdfbf8";
    document.body.classList.add("ap-light");
    const html = document.documentElement;
    const prevHtmlBg = html.style.backgroundColor;
    html.style.backgroundColor = BG;
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    const createdMeta = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    const prevTheme = meta.getAttribute("content");
    meta.setAttribute("content", BG);
    return () => {
      document.body.classList.remove("ap-light");
      html.style.backgroundColor = prevHtmlBg;
      if (createdMeta) meta!.remove();
      else if (prevTheme !== null) meta!.setAttribute("content", prevTheme);
    };
  }, []);

  // Seitenwechsel ohne Hash: oben beginnen
  useEffect(() => {
    if (window.location.hash) return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, [pathname, lenis]);

  // Buchungs-Widget: vorladen, eigene Trigger an die Widget-ID dieser Seite leiten.
  // Alte Deep-Links (…/#book-widget) öffnen ebenfalls das Widget.
  useEffect(() => {
    if (window.location.hash === "#book-widget") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      openBooking(widgetId);
    } else {
      loadBooking(widgetId).catch(() => {});
    }
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(`[data-book], a[href="${BOOK_HREF}"]`);
      if (!el) return;
      e.preventDefault();
      openBooking(widgetId);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [widgetId]);

  // reveal-on-scroll (pro Seite neu, da sich der Inhalt beim Routing ändert)
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    const observe = () => root.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
    observe();
    // nachträglich eingeblendete Inhalte (Filter, „Mehr anzeigen") ebenfalls erfassen
    const mo = new MutationObserver(observe);
    mo.observe(root, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, [pathname]);

  return (
    <div className="ap ap-vivid" ref={rootRef}>
      {/* gemeinsamer Verlauf für Icons + Illustrationen */}
      <svg width="0" height="0" aria-hidden style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="tmgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ff8a3c" />
            <stop offset="0.5" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#2f9fd6" />
          </linearGradient>
        </defs>
      </svg>
      {slimNav ? <NavSlim {...slimNav} /> : <Nav />}
      <main>{children}</main>
      <Footer />
    </div>
  );
}
