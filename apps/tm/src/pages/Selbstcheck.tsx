import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { CAL_URL } from "@/lib/links";

const Selbstcheck = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-24 md:py-36">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Startseite
        </Link>

        <div className="mt-10 max-w-2xl">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-primary">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Digitalisierungs-Check
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              kommt bald.
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Wir bauen gerade einen kurzen Selbsttest, mit dem Sie in wenigen
            Minuten herausfinden, wo in Ihrem Betrieb die grössten
            Digitalisierungs-Hebel liegen, inklusive konkreter Empfehlungen.
          </p>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Wenn Sie nicht warten möchten: Buchen Sie ein 30-minütiges
            Erstgespräch. Wir machen den Check mit Ihnen gemeinsam: live,
            ehrlich und ohne Verpflichtung.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="group">
              <a href={CAL_URL} target="_blank" rel="noopener noreferrer">
                Erstgespräch buchen
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Selbstcheck;
