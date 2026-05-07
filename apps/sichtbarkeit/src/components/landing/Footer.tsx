export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground font-bold">
              K
            </span>
            <span className="font-semibold tracking-tight">KMU Web Studio</span>
          </a>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Websites für KMU und lokale Unternehmen in der Schweiz. Verständlich, professionell
            und auf mehr Anfragen ausgerichtet.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Navigation</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#leistungen" className="hover:text-foreground">Leistungen</a></li>
            <li><a href="#ablauf" className="hover:text-foreground">Ablauf</a></li>
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            <li><a href="#kontakt" className="hover:text-foreground">Kontakt</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Rechtliches</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="/impressum" className="hover:text-foreground">Impressum</a></li>
            <li><a href="/datenschutz" className="hover:text-foreground">Datenschutz</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} KMU Web Studio. Alle Rechte vorbehalten.</span>
          <span>Für KMU und lokale Unternehmen in der Schweiz.</span>
        </div>
      </div>
    </footer>
  );
};
