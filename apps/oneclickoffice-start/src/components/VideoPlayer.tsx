import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { video, VIDEO_ASPECT_RATIO } from "@/lib/content";
import { track } from "@/lib/analytics";

/** Bei welchen Fortschritts-Marken ein Event gemeldet wird. */
const MILESTONES = [25, 50, 75, 95] as const;

/**
 * Selbst gehosteter MP4-Player.
 *
 * Zwei Dinge sind hier absichtlich so gebaut:
 * 1. preload="none" — das Video wird erst beim Start geladen. Sonst zieht der
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
  const gemeldet = useRef(false); // „Video gestartet" nur einmal melden
  const autostartTimer = useRef<number | null>(null);
  /* Läuft die Wiedergabe gerade ohne Ton, weil der Browser sie mit Ton nicht
     zugelassen hat? Dann braucht es einen sichtbaren Weg zum Ton. */
  const [stumm, setStumm] = useState(false);

  /* Nur anstossen. Als gestartet gilt das Video erst, wenn wirklich ein Bild
     da ist (onPlaying), nicht schon wenn der Browser die Wiedergabe annimmt
     (onPlay). Der Unterschied ist auf dem iPhone entscheidend: Safari nimmt
     play() an, blendet damit den Poster aus, hat wegen preload="none" aber
     noch keinen einzigen Frame dekodiert. Zu sehen war dann nur Schwarz. */
  const handlePlay = useCallback(() => {
    ref.current?.play().catch(() => {
      /* Wiedergabe-Richtlinie o. Ä. — der Start-Button bleibt sichtbar */
    });
  }, []);

  /* Wiedergabe läuft tatsächlich: erst jetzt Startbild und Button ausblenden. */
  const handlePlaying = useCallback(() => {
    if (autostartTimer.current !== null) {
      window.clearTimeout(autostartTimer.current);
      autostartTimer.current = null;
    }
    setStarted(true);
    if (!gemeldet.current) {
      gemeldet.current = true;
      track("video_play", { video_id: "vsl" });
    }
  }, []);

  /* Wer gerade das Formular abgeschickt hat, hat den Start bereits angefordert:
     Der Button im Overlay heisst „Video jetzt ansehen". Ohne das hier stünde er
     hier vor demselben Standbild wie vorher und müsste ein zweites Mal klicken —
     an der teuersten Stelle des Funnels, direkt nach der Conversion.
     Der Klick von der vorherigen Seite zählt als Nutzergeste, weil der
     Seitenwechsel innerhalb derselben Anwendung passiert; die Wiedergabe darf
     deshalb mit Ton starten. Klappt sie doch nicht, bleibt der Start-Button. */
  useEffect(() => {
    let angefordert = false;
    try {
      angefordert = sessionStorage.getItem("oco_video_autostart") === "1";
      if (angefordert) sessionStorage.removeItem("oco_video_autostart");
    } catch {
      /* Privatmodus — dann eben mit Klick */
    }
    if (!angefordert) return;

    const el = ref.current;
    if (!el) return;

    /* Zuerst mit Ton versuchen. Am Rechner klappt das und der Besucher hört
       den Anfang, so wie es gedacht ist.

       Safari auf dem iPhone lässt Wiedergabe mit Ton nur unmittelbar nach
       einer Nutzergeste zu. Der Klick auf „Video jetzt ansehen" liegt zu dem
       Zeitpunkt schon einige Sekunden zurück, weil dazwischen der Eintrag
       gespeichert wird - die Geste ist damit verbraucht. Ohne Ton ist der
       Start dagegen immer erlaubt: Das Video läuft an, und ein Fingertipp
       holt den Ton dazu, von vorne. */
    el.muted = false;
    el.play().catch(() => {
      el.muted = true;
      setStumm(true);
      el.play().catch(() => {
        /* Auch stumm abgelehnt: Startbild und Button bleiben stehen. */
        setStumm(false);
      });
    });

    /* Der unangenehmere Fall ist der stille: play() wird angenommen, es kommt
       aber kein Bild. Bleibt das playing-Ereignis aus, nehmen wir den Versuch
       zurück — load() holt das Startbild wieder her, und der Besucher hat
       einen sichtbaren Weg zum Abspielen statt einer schwarzen Fläche. */
    autostartTimer.current = window.setTimeout(() => {
      autostartTimer.current = null;
      if (gemeldet.current) return; // läuft ja, alles gut
      try {
        el.pause();
        el.currentTime = 0;
        el.muted = false;
        setStumm(false);
        el.load();
      } catch {
        /* dann eben nicht */
      }
    }, 2500);

    return () => {
      if (autostartTimer.current !== null) {
        window.clearTimeout(autostartTimer.current);
        autostartTimer.current = null;
      }
    };
  }, []);

  /* Ton dazuholen. Bewusst zurück auf Anfang: Wer die ersten Sekunden stumm
     gesehen hat, hat den Einstieg verpasst, und genau der trägt das Video.
     Die Fortschrittsmarken werden mit zurückgesetzt, sonst zählte die zweite
     Runde nicht mehr mit. */
  const tonEinschalten = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.muted = false;
    el.currentTime = 0;
    reached.current.clear();
    setStumm(false);
    void el.play().catch(() => {
      /* dann läuft es eben weiter wie bisher */
    });
    track("video_ton_an", { video_id: "vsl" });
  }, []);

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
          E-Mail. Schau in ein paar Minuten nochmals rein.
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
        onPlaying={handlePlaying}
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
          der native Play-Button. */}
      {/* Läuft stumm an: ein deutlicher, grossflächiger Weg zum Ton. Die
          nativen Bedienelemente bleiben darunter erreichbar. */}
      {started && stumm && (
        <button
          type="button"
          onClick={tonEinschalten}
          className="absolute inset-x-0 top-0 bottom-[18%] flex items-end justify-center bg-slate-950/25 pb-4 transition-colors hover:bg-slate-950/15"
          aria-label="Ton einschalten und von vorne beginnen"
        >
          <span className="flex items-center gap-2 rounded-full bg-white/95 px-5 py-3 text-sm font-semibold text-text-primary shadow-lg md:text-base">
            <Volume2 className="h-5 w-5 text-accent" />
            Tippen für Ton
          </span>
        </button>
      )}

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
