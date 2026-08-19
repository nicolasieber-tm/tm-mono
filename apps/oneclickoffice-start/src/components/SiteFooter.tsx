import { Link } from "react-router-dom";
import { footer } from "@/lib/content";
import { openConsentSettings } from "@/lib/analytics";

const SiteFooter = () => (
  <footer className="mt-16 border-t border-border bg-white px-5 py-10 md:px-8">
    <div className="section-container flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-3">
        <img
          src="/oneclick-office-icon.webp"
          alt=""
          width={128}
          height={128}
          className="h-8 w-8 rounded-lg object-cover"
        />
        <span className="font-semibold text-text-primary">OneClick Office</span>
      </div>
      <p className="text-sm text-text-secondary">{footer.tagline}</p>
      <nav className="flex flex-wrap items-center justify-center gap-5 text-sm">
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
        <button
          type="button"
          onClick={openConsentSettings}
          className="text-text-secondary transition-colors hover:text-text-primary hover:underline"
        >
          Cookie-Einstellungen
        </button>
      </nav>
      <p className="text-xs text-text-muted">{footer.copyright}</p>
    </div>
  </footer>
);

export default SiteFooter;
