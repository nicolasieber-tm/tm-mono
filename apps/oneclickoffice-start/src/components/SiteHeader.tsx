import { Link } from "react-router-dom";

/**
 * Bewusst minimaler Kopfbereich: nur die Marke, keine Navigation.
 * Auf einer Kampagnen-Landingpage ist jeder zusätzliche Link ein Ausgang —
 * es soll genau einen Weg geben, und der führt ins Formular.
 */
const SiteHeader = () => (
  <header className="w-full pt-6 md:pt-8">
    <div className="section-container">
      <Link to="/" className="inline-flex items-center gap-2.5">
        <img
          src="/oneclick-office-icon.webp"
          alt=""
          width={128}
          height={128}
          className="h-8 w-8 rounded-lg object-cover"
        />
        <span className="text-[0.9375rem] font-semibold text-text-primary">
          OneClick Office
        </span>
      </Link>
    </div>
  </header>
);

export default SiteHeader;
