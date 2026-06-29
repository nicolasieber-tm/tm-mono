import { Link } from "react-router-dom";
import { footer } from "@/lib/landing-content";

const Footer = () => (
  <footer className="border-t border-border bg-white px-6 py-12">
    <div className="section-container flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-3">
        <img
          src="/oneclick-office-icon.png"
          alt="OneClick Office"
          className="h-8 w-8 rounded-lg object-cover"
        />
        <span className="font-semibold text-text-primary">OneClick Office</span>
      </div>
      <p className="text-sm text-text-secondary">{footer.tagline}</p>
      <nav className="flex items-center gap-5 text-sm">
        <Link
          to="/impressum"
          className="text-text-secondary transition-colors hover:text-text-primary hover:underline"
        >
          Impressum
        </Link>
        <Link
          to="/datenschutz"
          className="text-text-secondary transition-colors hover:text-text-primary hover:underline"
        >
          Datenschutz
        </Link>
      </nav>
      <p className="text-xs text-text-muted">{footer.copyright}</p>
    </div>
  </footer>
);

export default Footer;
