import { Link } from "react-router-dom";

const Agb = () => (
  <div className="min-h-screen bg-background text-foreground section-padding">
    <div className="section-container max-w-[760px]">
      <Link to="/" className="text-primary text-sm mb-8 inline-block hover:underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="headline-h2 mb-8">Allgemeine Geschäftsbedingungen</h1>
      <p className="text-text-secondary">
        {/* AGB-Inhalt hier einfügen */}
        Die AGB werden hier ergänzt.
      </p>
    </div>
  </div>
);

export default Agb;
