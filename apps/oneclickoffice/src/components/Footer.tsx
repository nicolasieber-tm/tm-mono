import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { footer } from "@/lib/content";

const Footer = () => (
  <footer className="border-t border-border py-12 px-6 md:px-12">
    <div className="section-container space-y-8">
      {/* Logo + Tagline */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src="/OneClick Office.png" alt="OneClick Office" className="h-10" />
          <span className="font-bold text-lg text-text-primary">OneClick Office</span>
        </div>
        <span className="text-text-secondary text-sm">{footer.tagline}</span>
      </div>

      {/* Links */}
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {footer.links.map((link) => (
          <Link
            key={link.label}
            to={link.href}
            className="text-text-muted text-sm hover:text-text-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <div className="text-center">
        <p className="text-text-muted text-xs">{footer.copyright}</p>
      </div>
    </div>
  </footer>
);

export default Footer;
