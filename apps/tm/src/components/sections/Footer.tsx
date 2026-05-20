import { Link } from "react-router-dom";
import { Linkedin, Github, Mail, MapPin } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/links";
import { useSectionMode, modeToClass } from "@/lib/theme";

const productLinks = [
  { label: "AURON", href: "https://auron.trendingmedia.ch" },
  { label: "OneClick Office", href: "https://landingpage.oneclick-office.ch" },
  { label: "Landingpages", href: "https://sichtbarkeit.trendingmedia.ch" },
];

const companyLinks = [
  { label: "Leistungen", href: "/#leistungen" },
  { label: "Vorgehen", href: "/#vorgehen" },
  { label: "Produkte", href: "/#produkte" },
  { label: "Team", href: "/#team" },
];

const legalLinks = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "Kontakt", href: "/#kontakt" },
];

export const Footer = () => {
  const mode = useSectionMode("footer");

  return (
    <footer
      className={`cosmic ${modeToClass(mode)} relative pt-24 md:pt-32 pb-8 md:pb-10 overflow-hidden c-bg`}
    >
      {/* Backdrop: soft top glow + perspective grid floor + grain */}
      <div className="absolute inset-0 -z-0 pointer-events-none">
        <div
          className="absolute -top-[10vh] left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] rounded-full"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(78, 133, 191, 0.18) 0%, rgba(78, 133, 191, 0.05) 35%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>\")",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 lg:px-16">
        {/* Marquee-style brand statement */}
        <div className="mb-12 md:mb-16">
          <p className="font-display italic text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight c-text">
            Building the{" "}
            <span className="not-italic font-light c-text-70">future</span>{" "}
            of{" "}
            <span className="not-italic font-light c-text-70">KMU</span>{" "}
            digitalization.
          </p>
        </div>

        {/* Liquid glass panel */}
        <div className="liquid-glass w-full rounded-3xl p-6 md:p-10">
          <div className="grid gap-10 md:gap-12 md:grid-cols-12 mb-10">
            {/* Brand column */}
            <div className="md:col-span-5">
              <a
                href="#"
                className="inline-flex items-center gap-3 group"
              >
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="absolute inset-0 rounded-full accent-gradient-anim" />
                  <span
                    className="relative inline-flex h-[calc(100%-3px)] w-[calc(100%-3px)] items-center justify-center rounded-full"
                    style={{ backgroundColor: "hsl(var(--c-bg))" }}
                  >
                    <img
                      src="/logo-weiss.png"
                      alt="Trending Media"
                      className="h-5 w-5 object-contain"
                    />
                  </span>
                </span>
                <span className="font-display italic text-2xl text-white">
                  Trending Media
                </span>
              </a>
              <p className="mt-5 text-sm leading-relaxed text-white/55 max-w-sm font-light">
                Digitalisierungspartner für Schweizer KMU. Strategie, Software
                und Umsetzung — aus Praxis, für Praxis.
              </p>

              {/* Status row */}
              <div className="mt-8 flex items-center gap-3">
                <span className="inline-block h-2 w-2 rounded-full bg-[#60c882] pulse-dot" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/70">
                  Available for projects
                </span>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                <MapPin className="h-3 w-3" strokeWidth={1.5} />
                Zürich · CH
              </div>
            </div>

            {/* Link columns */}
            <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-10">
              <FooterCol title="Produkte" links={productLinks} />
              <FooterCol title="Unternehmen" links={companyLinks} />
              <FooterCol title="Concierge" links={legalLinks} />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
              © {new Date().getFullYear()} Trending Media · Made with care in
              Switzerland
            </p>
            <div className="flex items-center gap-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                Folgen:
              </span>
              <div className="flex items-center gap-3">
                <SocialIcon href={`mailto:${CONTACT_EMAIL}`} label="Email">
                  <Mail className="h-4 w-4" strokeWidth={1.5} />
                </SocialIcon>
                <SocialIcon
                  href="https://www.linkedin.com/company/trending-media"
                  label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" strokeWidth={1.5} />
                </SocialIcon>
                <SocialIcon
                  href="https://github.com/trending-media"
                  label="GitHub"
                >
                  <Github className="h-4 w-4" strokeWidth={1.5} />
                </SocialIcon>
              </div>
            </div>
          </div>
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
    <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 font-medium mb-4">
      {title}
    </h4>
    <ul className="space-y-2.5">
      {links.map((l) => (
        <li key={l.label}>
          {l.href.startsWith("/") && !l.href.startsWith("/#") ? (
            <Link
              to={l.href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ) : (
            <a
              href={l.href}
              className="text-sm text-white/55 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    aria-label={label}
    target={href.startsWith("mailto:") ? undefined : "_blank"}
    rel="noopener noreferrer"
    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:bg-white/10 hover:text-white hover:border-white/30"
  >
    {children}
  </a>
);
