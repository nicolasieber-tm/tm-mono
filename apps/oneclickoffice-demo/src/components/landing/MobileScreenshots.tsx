import ScrollReveal from "./ScrollReveal";

// Screenshots der echten Anwendung – auf Mobile statt der interaktiven Live-Demo.
// Reihenfolge erzählt den Ablauf: Übersicht → erfassen → Belege → abrechnen.
const shots = [
  {
    src: "/oneclick-office_demo_dashboard.png",
    alt: "Dashboard von OneClick Office mit der Monatsübersicht",
  },
  {
    src: "/oneclick-office_demo_neuereintrag.png",
    alt: "Neuen Zeiteintrag direkt nach dem Termin erfassen",
  },
  {
    src: "/oneclick-office_demo_spesen.png",
    alt: "Spesen und Belege erfassen und dem Klienten zuordnen",
  },
  {
    src: "/oneclick-office_demo_Rechnungen.png",
    alt: "Rechnungen aus erfassten Zeiten und Belegen mit einem Klick erstellen",
  },
];

// Mobile-Ersatz für die Live-Demo: kommentierte Screenshots des echten Ablaufs.
const MobileScreenshots = () => (
  <section className="section-padding py-12">
    <div className="section-container max-w-[560px]">
      <ScrollReveal>
        <div className="mb-10 text-center">
          <h2 className="headline-h2 mb-4 text-text-primary">
            Alles bereit für den Monatsabschluss.
          </h2>
          <p className="body-large mx-auto max-w-[520px]">
            Zeiten, Belege, Spesen und Klienteninfos laufen an einem Ort zusammen. Am Ende
            prüfst du den Monat und erstellst deine Rechnung mit wenigen Klicks.
          </p>
        </div>
      </ScrollReveal>

      <div className="space-y-5">
        {shots.map((shot, i) => (
          <ScrollReveal key={shot.src} delay={0.05 * i}>
            <figure className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-slate-200/60">
              <div className="flex items-center gap-2 border-b border-border bg-bg-elevated px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <div className="mx-auto max-w-[200px] flex-1 rounded-md border border-border bg-white px-2 py-0.5 text-center text-[11px] text-text-muted">
                  demo.oneclick-office.ch
                </div>
              </div>
              <img src={shot.src} alt={shot.alt} loading="lazy" className="block w-full" />
            </figure>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.1}>
        <p className="mx-auto mt-8 max-w-[520px] text-center text-sm text-text-muted">
          Die volle Demo funktioniert am Desktop am besten. Auf Mobile zeigen wir dir hier
          den Ablauf, den Demo-Zugang erhältst du direkt per E-Mail.
        </p>
      </ScrollReveal>
    </div>
  </section>
);

export default MobileScreenshots;
