import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { danke } from "@/lib/landing-content";

// Bestätigungsseite nach dem Absenden der Anfrage (Route /danke).
// Der Mobile-Optin ruft /danke?flow=demo auf → passende „Demo-Link per E-Mail"-Botschaft.
const Danke = () => {
  const [searchParams] = useSearchParams();
  const content = searchParams.get("flow") === "demo" ? danke.demo : danke;

  return (
    <main
      className="flex min-h-screen items-center justify-center px-6 text-foreground"
      style={{
        background:
          "linear-gradient(180deg, hsl(214 95% 93% / 0.5) 0%, hsl(0 0% 100%) 60%)",
      }}
    >
      <div className="w-full max-w-[560px] text-center">
        <span className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-accent-soft">
          <CheckCircle2 className="h-11 w-11 text-accent-deep" />
        </span>
        <h1 className="headline-h2 mb-4 text-text-primary">{content.headline}</h1>
        <p className="body-large mx-auto mb-10 max-w-[440px]">{content.subheadline}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-semibold text-text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          {content.backLabel}
        </Link>
      </div>
    </main>
  );
};

export default Danke;
