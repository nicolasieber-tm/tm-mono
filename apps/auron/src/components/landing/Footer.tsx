import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="py-10 px-6 border-t border-border bg-zinc-950 text-zinc-400">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-bold text-white">Trending Media</span>
        <span>© 2026 Trending Media KLG ‒ Alle Rechte vorbehalten</span>
      </div>
      <div className="flex items-center gap-6">
        <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
        <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutzerklärung</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
