import { useCallback, useRef, useState } from "react";
import { Play } from "lucide-react";
import { video, VIDEO_ASPECT_RATIO } from "@/lib/content";
import { track } from "@/lib/analytics";

/** Bei welchen Fortschritts-Marken ein Event gemeldet wird. */
const MILESTONES = [25, 50, 75, 95] as const;

/**
 * Selbst gehosteter MP4-Player.
 *
 * Zwei Dinge sind hier absichtlich so gebaut:
 * 1. preload="none" — das Video wird erst beim Klick geladen. Sonst zieht der
 *    Browser schon beim Seitenaufruf Megabytes, auch bei allen, die nie
 *    abspielen. Das Startbild kommt aus dem poster-Attribut.
 * 2. Solange die Videodatei fehlt (onError), erscheint ein ehrlicher Hinweis
 *    statt eines schwarzen, toten Rahmens.
 */
const VideoPlayer = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const reached = useRef<Set<number>>(new Set());

  const handlePlay = () => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => {
      /* Autoplay-Richtlinie o. Ä. — der native Play-Button bleibt ja sichtbar */
    });
    if (!started) {
      setStarted(true);
      track("video_play", { video_id: "vsl" });
    }
  };

  // Fortschritt melden: sagt später, ob das Video zu lang ist oder wo es abreisst.
  const handleTimeUpdate = useCallback(() => {
    const el = ref.current;
    if (!el || !el.duration || Number.isNaN(el.duration)) return;
    const percent = (el.currentTime / el.duration) * 100;
    for (const mark of MILESTONES) {
      if (percent >= mark && !reached.current.has(mark)) {
        reached.current.add(mark);
        track("video_progress", { video_id: "vsl", video_percent: mark });
      }
    }
  }, []);

  if (failed) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-bg-elevated px-6 text-center"
        style={{ aspectRatio: VIDEO_ASPECT_RATIO }}
      >
        <p className="font-semibold text-text-primary">Das Video ist gleich da.</p>
        <p className="max-w-[380px] text-sm text-text-secondary">
          Wir laden es in diesem Moment hoch. Du bekommst den Link zusätzlich per
          E-Mail — schau in ein paar Minuten nochmals rein.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-slate-950 shadow-2xl shadow-slate-300/50">
      <video
        ref={ref}
        className="w-full"
        style={{ aspectRatio: VIDEO_ASPECT_RATIO }}
        poster={video.source.poster}
        preload="none"
        playsInline
        controls={started}
        onPlay={() => setStarted(true)}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => track("video_complete", { video_id: "vsl" })}
        onError={() => setFailed(true)}
      >
        {video.source.webm && <source src={video.source.webm} type="video/webm" />}
        <source src={video.source.src} type="video/mp4" />
        {video.source.captions && (
          <track kind="captions" srcLang="de" label="Deutsch" src={video.source.captions} default />
        )}
      </video>

      {/* Eigener Start-Button, solange nichts läuft: grösser und eindeutiger als
          der native Play-Button, und er trägt das Tracking. */}
      {!started && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label="Video abspielen"
          className="group absolute inset-0 bg-slate-950/20 transition-colors hover:bg-slate-950/10"
        >
          {/* Wie beim Startbild auf der Opt-in-Seite: der Button sitzt unterhalb
              der Bildmitte, weil dort auf den Standbildern dieses Videos Text steht. */}
          <span className="absolute left-1/2 top-[72%] flex h-[62px] w-[62px] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[76px] md:w-[76px]">
            <span className="absolute inset-0 rounded-full bg-white/70 animate-pulse-ring" />
            <span className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-200 group-hover:scale-105">
              <Play className="ml-1 h-6 w-6 fill-accent text-accent md:h-8 md:w-8" />
            </span>
          </span>
        </button>
      )}
    </div>
  );
};

export default VideoPlayer;
