import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../../pages/apple-home.css";
import "../../pages/legal.css";

const MAIL = "info@trendingmedia.ch";

type LegalPageLayoutProps = {
  title: string;
  intro?: string;
  children: ReactNode;
};

export const LegalPageLayout = ({
  title,
  intro,
  children,
}: LegalPageLayoutProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add("ap-light");
    return () => document.body.classList.remove("ap-light");
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="ap ap-vivid">
      <nav className="ap-nav">
        <div className={`ap-pill${scrolled ? " scrolled" : ""}`}>
          <Link className="b" to="/">
            <img className="brandmark" src="/logo-schwarz.png" alt="" />
            Trending Media
          </Link>
          <div className="links">
            <a href="/#leistungen">Leistungen</a>
            <a href="/#vorgehen">Vorgehen</a>
            <a href="/#produkte">Produkte</a>
            <a href="/#faq">FAQ</a>
          </div>
          <a className="cta" href="/#kontakt">Erstgespräch</a>
          <button className="ap-burger" aria-label="Menü öffnen" onClick={() => setMobileOpen((o) => !o)}>≡</button>
        </div>
      </nav>
      <div className={`ap-mobile${mobileOpen ? " open" : ""}`}>
        <a href="/#leistungen" onClick={() => setMobileOpen(false)}>Leistungen</a>
        <a href="/#vorgehen" onClick={() => setMobileOpen(false)}>Vorgehen</a>
        <a href="/#produkte" onClick={() => setMobileOpen(false)}>Produkte</a>
        <a href="/#faq" onClick={() => setMobileOpen(false)}>FAQ</a>
        <a href="/#kontakt" onClick={() => setMobileOpen(false)}>Erstgespräch</a>
      </div>

      <main className="ap-legal-wrap">
        <div className="wrap">
          <div className="ap-legal">
            <Link to="/" className="back">← Zurück zur Startseite</Link>
            <h1>{title}</h1>
            {intro ? <p className="lead">{intro}</p> : null}
            <div className="ap-legal-body">{children}</div>
          </div>
        </div>
      </main>

      <footer className="ap-foot">
        <div className="wide">
          <div className="grid">
            <div>
              <h4>Trending Media</h4>
              <p style={{ maxWidth: "30ch", lineHeight: 1.6 }}>Digitalisierungspartner für Schweizer KMU. Strategie, Software und Umsetzung. Aus Praxis, für Praxis.</p>
            </div>
            <div>
              <h4>Produkte</h4>
              <a className="fl" href="https://auron.trendingmedia.ch">AURON</a>
              <a className="fl" href="https://landingpage.oneclick-office.ch">OneClick Office</a>
              <a className="fl" href="https://sichtbarkeit.trendingmedia.ch">Landingpages</a>
            </div>
            <div>
              <h4>Unternehmen</h4>
              <a className="fl" href="/#leistungen">Leistungen</a>
              <a className="fl" href="/#vorgehen">Vorgehen</a>
              <a className="fl" href="/#team">Team</a>
            </div>
            <div>
              <h4>Kontakt</h4>
              <a className="fl" href="/#kontakt">Erstgespräch</a>
              <a className="fl" href={`mailto:${MAIL}`}>{MAIL}</a>
              <a className="fl" href="/#kontakt">Solothurn · CH</a>
            </div>
          </div>
          <div className="copy">
            <span>© 2026 Trending Media · Made with care in Switzerland</span>
            <span className="sep">·</span>
            <Link to="/impressum">Impressum</Link>
            <span className="sep">·</span>
            <Link to="/datenschutz">Datenschutz</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

type LegalSectionProps = {
  title: string;
  children: ReactNode;
};

export const LegalSection = ({ title, children }: LegalSectionProps) => {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
};
