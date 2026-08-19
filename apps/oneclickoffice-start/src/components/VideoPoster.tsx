import { Play } from "lucide-react";
import { optin, VIDEO_ASPECT_RATIO } from "@/lib/content";

/**
 * Startbild des Videos auf der Opt-in-Seite.
 *
 * Wichtig: Das ist KEIN Player. Ein Klick spielt nichts ab, sondern öffnet das
 * Formular — genau das ist der Zweck der Seite. Bewusst ohne Beschriftungen im
 * Bild: das Standbild trägt seine Aussage selbst, und der Button darunter sagt,
 * was passiert.
 */
const VideoPoster = ({ onOpen }: { onOpen: () => void }) => (
  <button
    type="button"
    onClick={onOpen}
    aria-label={optin.cta.label}
    className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-2xl shadow-slate-300/40 transition-transform duration-200 hover:-translate-y-0.5"
  >
    <img
      src={optin.poster.src}
      alt={optin.poster.alt}
      width={1920}
      height={920}
      /* Grösstes Element im ersten Viewport (LCP) — eager laden, nicht lazy. */
      loading="eager"
      fetchPriority="high"
      decoding="async"
      className="w-full object-cover"
      style={{ aspectRatio: VIDEO_ASPECT_RATIO }}
    />

    {/* Der Play-Button sitzt bewusst NICHT in der Bildmitte: dort steht auf
        praktisch jedem Standbild dieses Videos Text, den er verdecken würde.
        Auf 72 % der Höhe ist die Fläche frei — Text oben, Button darunter.
        Beim Wechsel des Standbilds diesen Wert prüfen. */}
    <span className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2">
      <span className="relative flex h-[62px] w-[62px] items-center justify-center md:h-[76px] md:w-[76px]">
        <span className="absolute inset-0 rounded-full bg-white/70 animate-pulse-ring" />
        <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 group-hover:scale-105">
          <Play className="ml-1 h-6 w-6 fill-accent text-accent md:h-8 md:w-8" />
        </span>
      </span>
    </span>
  </button>
);

export default VideoPoster;
