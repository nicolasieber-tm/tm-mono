import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

const productLinks = [
  { label: "AURON", href: "https://auron.trendingmedia.ch" },
  { label: "OneClick Office", href: "https://landingpage.oneclick-office.ch" },
  { label: "Landingpages", href: "https://sichtbarkeit.trendingmedia.ch" },
];

const companyLinks = [
  { label: "Leistungen", href: "/#leistungen" },
  { label: "Vorgehen", href: "/#vorgehen" },
  { label: "FAQ", href: "/#faq" },
  { label: "Kontakt", href: "/#kontakt" },
];

const legalLinks = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <a
              href="#"
              className="flex items-center gap-2 font-semibold tracking-tight"
            >
              <img src={logo} alt="Trending Media Logo" className="h-7 w-auto" />
              <span>Trending Media</span>
            </a>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Digitalisierungspartner für Schweizer KMU. Strategie, Software und
              Umsetzung. Aus Praxis, für Praxis.
            </p>
          </div>

          <FooterCol title="Produkte" links={productLinks} />
          <FooterCol title="Unternehmen" links={companyLinks} />
          <FooterCol title="Rechtliches" links={legalLinks} />
        </div>

        <div className="mt-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Trending Media. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-muted-foreground">
            Made with care in Switzerland.
          </p>
        </div>
      </div>
    </footer>
  );
};

const FooterCol = ({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) => (
  <div>
    <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
    <ul className="mt-4 space-y-3">
      {links.map((l) => (
        <li key={l.label}>
          {l.href.startsWith("/") && !l.href.startsWith("/#") ? (
            <Link
              to={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ) : (
            <a
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);
