import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const NotFound = () => (
  <main className="flex min-h-screen items-center justify-center px-5 text-center">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-deep">
        Seite nicht gefunden
      </p>
      <h1 className="headline-h2 mt-3">Hier gibt es nichts zu sehen.</h1>
      <p className="body-large mx-auto mt-3 max-w-[380px]">
        Der Link scheint nicht zu stimmen. Zurück zum Anfang geht es hier:
      </p>
      <Link
        to="/"
        className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <ArrowLeft className="h-4 w-4" />
        Zur Startseite
      </Link>
    </div>
  </main>
);

export default NotFound;
