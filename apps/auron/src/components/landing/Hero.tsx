import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Map, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from "framer-motion";
import { useLenis } from "lenis/react";
import { PhoneMockup } from "./PhoneMockup";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  
  // Track scroll through the massive 350vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smooth the raw scroll progress — acts as a low-pass filter so motion
  // stays fluid even when native mobile scroll fires events at variable rates.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
    restDelta: 0.001,
  });

  const [isPhoneActive, setIsPhoneActive] = useState(false);
  const [mockupScale, setMockupScale] = useState(0.85);
  const [introVisible, setIntroVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let lastWidth = window.innerWidth;

    const updateScale = () => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      setIsMobile(vw < 640);

      let baseScale = 0.9;
      if (vw < 640) baseScale = 0.55;
      else if (vw < 768) baseScale = 0.65;
      else if (vw < 1024) baseScale = 0.75;
      else if (vw < 1280) baseScale = 0.8;

      const maxScaleByHeight = (vh * 0.60) / 720;

      setMockupScale(Math.min(baseScale, maxScaleByHeight));
    };

    // Only recalc on width changes; height-only changes on mobile are just
    // the URL bar toggling and would cause re-renders that ripple into jank.
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      updateScale();
    };

    updateScale();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sync scroll position to phone state
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Activate the phone tracker when user scrolls past 35% of the section
    setIsPhoneActive(latest > 0.35);
    setIntroVisible(latest <= 0.15);
  });

  // --- SCROLL ANIMATION CONFIG ---
  
  // 1. Text Intro Fades Out as we scroll down (0% to 20%)
  const introOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.15], [0, -50]);

  // 2. Phone appears and comes to center (5% to 25%)
  const phoneOpacity = useTransform(smoothProgress, [0.03, 0.15], [0, 1]);
  const phoneScale = useTransform(smoothProgress, [0.05, 0.25], [0.85, 1]);
  const phoneY = useTransform(smoothProgress, [0, 0.25], [350, 0]);
  const phoneRotateX = useTransform(smoothProgress, [0.05, 0.25, 1], [8, 0, 0]);

  // 3. Floating Left Card "GPS Tracking" — wider range gives a gentler fade-in
  const leftCardOpacity = useTransform(smoothProgress, [0.22, 0.38], [0, 1]);
  const leftCardX = useTransform(smoothProgress, [0.22, 0.38], [-50, 0]);

  // 4. Floating Right Cards — wider ranges for smoother reveal
  const rightCard1Opacity = useTransform(smoothProgress, [0.42, 0.58], [0, 1]);
  const rightCard1X = useTransform(smoothProgress, [0.42, 0.58], [50, 0]);

  const rightCard2Opacity = useTransform(smoothProgress, [0.57, 0.73], [0, 1]);
  const rightCard2X = useTransform(smoothProgress, [0.57, 0.73], [50, 0]);

  // 5. Bottom CTA — appears after ERP-Sync card
  const ctaOpacity = useTransform(smoothProgress, [0.75, 0.88], [0, 1]);

  return (
    // The massive container allows scrolling for "350vh"
    <section ref={containerRef} className="h-[250lvh] sm:h-[350lvh] relative bg-background">

      {/* Sticky Inner Container holds the actual viewport */}
      <div className="sticky top-0 h-[100svh] w-full flex flex-col justify-center items-center overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-primary/10 blur-[60px] sm:blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* --- INTRO TEXT BLOCK --- */}
        <motion.div 
          style={{ opacity: introOpacity, y: introY }}
          className="absolute top-[12svh] sm:top-[20svh] max-w-5xl mx-auto text-center px-4 sm:px-6 z-20 pointer-events-none"
        >
          <Badge
            variant="secondary"
            className="mb-6 sm:mb-8 text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary tracking-wide shadow-sm whitespace-normal text-center"
          >
            Entwickelt für Handwerker und Bauunternehmen
          </Badge>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
            Zeiterfassung für <span className="text-primary">Handwerker</span> <br className="hidden md:block"/> in nur 2 Klicks
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mt-6 sm:mt-8 max-w-2xl mx-auto leading-relaxed text-center">
            Einsatzorte werden automatisch erkannt. Ihre Mitarbeitenden starten und stoppen – den Rest übernimmt Auron im Hintergrund.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`flex flex-col sm:flex-row gap-4 mt-8 sm:mt-12 justify-center ${introVisible ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <Button asChild size="lg" className="h-14 px-8 text-lg font-medium rounded-full gap-2 relative overflow-hidden group">
              <a href="#early-access" onClick={(e) => {
                e.preventDefault();
                const target =
                  document.getElementById("early-access-content") ??
                  document.getElementById("early-access");
                if (!target) return;
                const header = document.querySelector("header") as HTMLElement | null;
                const headerHeight = header?.offsetHeight ?? 80;
                const viewportHeight = window.innerHeight;
                const elementHeight = target.offsetHeight;
                const centerYTop = (viewportHeight - elementHeight) / 2;
                const yTop = Math.max(headerHeight + 24, centerYTop);
                if (lenis) {
                  lenis.scrollTo(target, { offset: -yTop, duration: 1.4 });
                } else {
                  const rect = target.getBoundingClientRect();
                  window.scrollTo({ top: window.scrollY + rect.top - yTop, behavior: "smooth" });
                }
              }}>
                <span className="relative z-10 font-bold tracking-wide">Pilotbetrieb werden</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-primary-foreground/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </a>
            </Button>
          </motion.div>

          {/* Scroll-down indicator */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="mt-10 flex justify-center text-muted-foreground/70"
            aria-hidden="true"
          >
            <ChevronDown className="w-7 h-7" strokeWidth={2} />
          </motion.div>
        </motion.div>

        {/* --- THE PHONE SCENE --- */}
        <motion.div
           style={{
             opacity: phoneOpacity,
             scale: phoneScale,
             y: phoneY,
             ...(isMobile ? {} : { rotateX: phoneRotateX }),
             willChange: "transform, opacity",
             transform: "translateZ(0)",
           }}
           className="relative max-w-[800px] w-full flex justify-center items-center [perspective:1200px]"
        >
          {/* Main Phone Component */}
          <div
             className={`relative z-10 flex items-center justify-center mt-0 ${isMobile ? "" : "drop-shadow-2xl"}`}
             style={{ height: 720 * mockupScale }}
          >
            {/* The wrapper scaling forces exactly the transform needed, regardless of Tailwind setup */}
            <div
              style={{ transform: `scale(${mockupScale}) translateZ(0)`, willChange: "transform" }}
              className="origin-center"
            >
              <PhoneMockup isActive={isPhoneActive} />
            </div>
          </div>

          {/* Background Glow Behind Phone */}
          <div className="absolute inset-x-20 -top-10 -bottom-10 -z-10 glow !blur-[120px] opacity-60" />

          {/* Floating Action Cards */}
          
          {/* Card 1: GPS Auto Start */}
          <motion.div
            style={{ opacity: leftCardOpacity, x: leftCardX, willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="absolute left-2 -left-0 sm:-left-4 md:-left-20 top-[22%] sm:top-[30%] w-[170px] sm:w-[260px] rounded-xl bg-white/90 sm:bg-white/80 sm:backdrop-blur-xl border border-border shadow-xl sm:shadow-2xl p-2.5 sm:p-4 flex items-center gap-2 sm:gap-4 z-20"
          >
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center shadow-inner flex-shrink-0">
              <Map className="w-4 h-4 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">Zeiterfassung</p>
              <p className="text-[10px] sm:text-xs text-primary font-bold mt-0.5 leading-tight">auf Knopfdruck</p>
            </div>
          </motion.div>

          {/* Card 2: Time Captured */}
          <motion.div
            style={{ opacity: rightCard1Opacity, x: rightCard1X, willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="absolute right-2 sm:-right-4 md:-right-24 top-[12%] sm:top-[20%] w-[180px] sm:w-[260px] rounded-xl bg-white/90 sm:bg-white/80 sm:backdrop-blur-xl border border-border shadow-xl sm:shadow-2xl p-2.5 sm:p-4 flex items-start gap-2 sm:gap-4 z-20"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">Baustellen</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">werden automatisch erkannt</p>
            </div>
          </motion.div>

          {/* Card 3: ERP Sync */}
          <motion.div
            style={{ opacity: rightCard2Opacity, x: rightCard2X, willChange: "transform, opacity", transform: "translateZ(0)" }}
            className="absolute right-2 sm:-right-12 md:-right-32 bottom-[22%] sm:bottom-[30%] w-[180px] sm:w-[280px] rounded-xl bg-white/90 sm:bg-white/80 sm:backdrop-blur-xl border border-border shadow-xl sm:shadow-2xl p-2.5 sm:p-4 flex items-start gap-2 sm:gap-4 z-20 sm:z-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">Saubere Exports</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">ERP-Anbindung in Entwicklung</p>
            </div>
          </motion.div>

        </motion.div>

        {/* --- FIXED BOTTOM CTA (Only shows up as user scrolls) --- */}
        <motion.div
           style={{ opacity: ctaOpacity }}
           className="absolute bottom-12 sm:bottom-4 md:bottom-6 inset-x-0 mx-auto w-full flex justify-center items-center flex-col gap-3 z-30 px-4"
        >
          <Button asChild size="lg" className="text-sm sm:text-base px-6 sm:px-10 h-12 sm:h-14 font-semibold rounded-full shadow-lg sm:shadow-xl shadow-primary/20 hover:shadow-primary/40 sm:hover:-translate-y-0.5 transition-all">
            <a href="/anfrage" className="inline-flex items-center">
              Beratung buchen
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </Button>

          <div className="hidden md:flex items-center justify-center gap-6 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Unverbindlich & kostenlos</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary" /> Persönliche Beratung</div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
