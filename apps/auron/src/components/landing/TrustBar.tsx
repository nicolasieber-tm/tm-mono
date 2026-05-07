import { Button } from "@/components/ui/button";

const TrustBar = () => {
  return (
    <section className="py-16 sm:py-24 border-y border-border/50 bg-muted/20 overflow-hidden relative px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto flex flex-col items-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3 sm:mb-4 text-center">Anbindung an Ihre Systeme</h2>
        <p className="text-muted-foreground mb-8 sm:mb-12 max-w-2xl text-center text-sm sm:text-base">
          Die direkte Integration mit gängigen ERP- und Buchhaltungssystemen wird in den kommenden Monaten schrittweise ausgerollt. Bis dahin stehen strukturierte Exports zur Verfügung.
        </p>

        <Button asChild className="h-11 px-8 rounded-full font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
          <a href="/anfrage">Beratung buchen</a>
        </Button>
      </div>
    </section>
  );
};

export default TrustBar;
