import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Smartphone, Laptop, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { FocusRail, type FocusRailItem } from "@/components/ui/focus-rail";
import { useReveal } from "@/hooks/use-reveal";

const appFeatures = [
  {
    title: "Baustellen Management",
    description: "Einfache Erfassung und Verwaltung von Baustellen direkt in der App. Adresse eingeben, benennen und Beschreibung hinzufügen.",
  },
  {
    title: "Mitarbeiter Management",
    description: "Übersicht und einfache Verwaltung von Mitarbeiter. Echtzeit Mitarbeiterübersicht und Arbeitszeit Monitoring.",
  },
];

const desktopFeatures = [
  {
    title: "Dashboard",
    description: "Übersicht und Schnellzugriffe für die tägliche Verwaltung.",
  },
  {
    title: "Baustellenverwaltung",
    description: "Adresse eingeben oder auf Karte suchen, Baustelle benennen, Beschreibung hinzufügen, Baustelle abschliessen.",
  },
  {
    title: "Mitarbeiterverwaltung",
    description: "Rolle wählen (Admin/Mitarbeiter), Team zuordnen, Soll-Arbeitszeit festlegen.",
  },
  {
    title: "Anträge",
    description: "Urlaubsanträge verwalten, manuelle Zeiterfassungen bestätigen, Spesen genehmigen.",
  },
];

const adminHubScreenshots = [
  {
    title: "Dashboard",
    description: "Schnellzugriffe und Kennzahlen auf einen Blick.",
    src: "/admin-hub/dashboard.png",
  },
  {
    title: "Mitarbeiter-Übersicht",
    description: "Live-Status der Teams und aktive Baustellen.",
    src: "/admin-hub/mitarbeiter-uebersicht.png",
  },
  {
    title: "Zeiterfassung",
    description: "Alle erfassten Arbeitszeiten pro Mitarbeiter.",
    src: "/admin-hub/zeiterfassung.png",
  },
  {
    title: "Spesen",
    description: "Übersicht aller eingereichten Spesen.",
    src: "/admin-hub/spesen.png",
  },
];

const appDashboardScreenshots = [
  {
    title: "Mitarbeiter-Übersicht",
    description: "Zeigt in Echtzeit, wer aktiv ist und wo gearbeitet wird.",
    src: "/app-hub/mitarbeiter-uebersicht.png",
  },
  {
    title: "Baustellen",
    description: "Alle Baustellen mit Status, Team und Fortschritt im Überblick.",
    src: "/app-hub/baustelle.png",
  },
  {
    title: "Spesenanträge",
    description: "Spesen direkt erfassen, einreichen und schnell prüfen.",
    src: "/app-hub/spesen.png",
  },
  {
    title: "Ferienanträge",
    description: "Ferien transparent beantragen und Freigaben einfach steuern.",
    src: "/app-hub/ferien.png",
  },
];

const Verwaltung = () => {
  const { reveal } = useReveal();
  const [activeAdminScreenshot, setActiveAdminScreenshot] = useState(0);

  const changeAdminScreenshot = (direction: "left" | "right") => {
    setActiveAdminScreenshot((prev) => {
      if (direction === "left") {
        return prev === 0 ? adminHubScreenshots.length - 1 : prev - 1;
      }
      return prev === adminHubScreenshots.length - 1 ? 0 : prev + 1;
    });
  };

  const appRailItems: FocusRailItem[] = appDashboardScreenshots.map((item, index) => ({
    id: `app-${index}`,
    title: item.title,
    description: item.description,
    imageSrc: item.src,
  }));

  return (
  <section className="mt-20">
    <div className="bg-zinc-950 text-white py-16 sm:py-24 md:py-32 rounded-t-3xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-20">
          <motion.div {...reveal(0, 30)}>
            <Badge className="mb-8 bg-white/10 text-white/80 border-white/10 text-xs font-medium px-4 py-1.5 rounded-full hover:bg-white/15">
              Zentrale Verwaltung
            </Badge>
          </motion.div>

          <motion.h2
            {...reveal(0.1, 30)}
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
          >
            Auron Admin-Hub & App Dashboard
          </motion.h2>

          <motion.p
            {...reveal(0.2, 30)}
            className="text-base sm:text-lg text-zinc-400 mt-4 sm:mt-6 max-w-3xl mx-auto leading-relaxed"
          >
            Behalten Sie jederzeit den Überblick – mobil in der App oder bequem am Desktop.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* App Dashboard */}
          <motion.div
            {...reveal(0, 20)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 hover:border-white/20 transition-colors text-center md:text-left"
          >
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Admin Dashboard</h3>
                <p className="text-zinc-400 text-sm">App Version für einfachen und schnellen Überblick</p>
              </div>
            </div>
            <div className="space-y-6 text-left">
              {appFeatures.map((f, i) => (
                <div key={i}>
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" /> {f.title}
                  </h4>
                  <p className="text-zinc-400 pl-7 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Desktop Hub */}
          <motion.div
            {...reveal(0.2, 20)}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 md:p-10 hover:border-white/20 transition-colors text-center md:text-left"
          >
            <div className="flex flex-col md:flex-row items-center md:items-center gap-3 md:gap-4 mb-6 sm:mb-8">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0">
                <Laptop className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Auron Admin-Hub</h3>
                <p className="text-zinc-400 text-sm">Desktop Version für bessere Übersicht und Verwaltung</p>
              </div>
            </div>
            <div className="space-y-6 text-left">
              {desktopFeatures.map((f, i) => (
                <div key={i}>
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0" /> {f.title}
                  </h4>
                  <p className="text-zinc-400 pl-7 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          {...reveal(0.3, 30)}
          className="mt-10 sm:mt-14 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Einblicke in den Auron Admin-Hub</h3>
            <p className="text-zinc-400 text-sm md:text-base mt-2">
              Dashboard, Mitarbeiterstatus, Zeiterfassung und Spesenverwaltung in einer zentralen Oberfläche.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 hover:border-white/20 transition-colors">
            <div className="bg-zinc-900 p-3 md:p-4">
              <div className="mx-auto w-full max-w-[1024px] rounded-xl bg-zinc-950 p-2">
                <img
                  src={adminHubScreenshots[activeAdminScreenshot].src}
                  alt={`Auron Admin-Hub ${adminHubScreenshots[activeAdminScreenshot].title}`}
                  className="w-full h-auto rounded-lg"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="px-4 md:px-6 py-4 border-t border-white/10">
              <p className="text-white font-semibold text-base md:text-lg">
                {adminHubScreenshots[activeAdminScreenshot].title}
              </p>
              <p className="text-zinc-400 text-sm md:text-base mt-1">
                {adminHubScreenshots[activeAdminScreenshot].description}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => changeAdminScreenshot("left")}
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              aria-label="Vorheriges Bild"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-200" />
            </button>
            <button
              type="button"
              onClick={() => changeAdminScreenshot("right")}
              className="w-11 h-11 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              aria-label="Nächstes Bild"
            >
              <ArrowRight className="w-4 h-4 text-zinc-200" />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {adminHubScreenshots.map((screen, index) => (
              <button
                key={screen.title}
                type="button"
                onClick={() => setActiveAdminScreenshot(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeAdminScreenshot ? "w-8 bg-white" : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Screenshot ${screen.title} anzeigen`}
              />
            ))}
          </div>
        </motion.div>

        <motion.div
          {...reveal(0.35, 30)}
          className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8"
        >
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Einblicke in das App Dashboard</h3>
            <p className="text-zinc-400 text-sm md:text-base mt-2">
              Mobile Übersicht für Mitarbeiterstatus, Baustellen, Spesen und Ferienanträge.
            </p>
          </div>
          <FocusRail items={appRailItems} loop autoPlay={false} className="bg-zinc-950/90 border-white/10" />
        </motion.div>

        <motion.div
          {...reveal(0.4, 30)}
          className="mt-16 text-center"
        >
          <Button
            asChild
            size="lg"
            className="bg-white text-zinc-900 hover:bg-zinc-100 text-base px-8 h-11 font-semibold rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
          >
            <a href="/anfrage" className="inline-flex items-center">
              Beratung buchen
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>
        </motion.div>
      </div>
    </div>
  </section>
  );
};

export default Verwaltung;
