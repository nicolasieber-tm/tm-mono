import { useRef, useState } from "react";
import { Play } from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import { hero } from "@/lib/content";

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  return (
  <section className="relative overflow-hidden w-full section-padding pt-28 md:pt-40 pb-4 md:pb-8">
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.02]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(222 47% 11% / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(222 47% 11% / 0.04) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }}
    />

    <div className="section-container relative z-10 text-center">
      <ScrollReveal>
        <span className="inline-block px-4 py-2 rounded-full bg-accent-soft text-accent-deep text-xs font-semibold uppercase tracking-[0.12em] mb-8">
          {hero.kicker}
        </span>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <h1 className="headline-display max-w-[900px] mx-auto mb-6">
          {hero.headlineLines.map((line, i) => {
            const inline = "inline" in line && line.inline;
            const nextLine = hero.headlineLines[i + 1];
            const nextIsInline =
              nextLine && "inline" in nextLine && nextLine.inline;
            const emphasisClass =
              "font-extrabold text-[1.08em] tracking-[-0.025em]";
            const classes: string[] = [];
            if (inline) {
              classes.push("ml-[0.35em]");
            } else if (nextIsInline) {
              classes.push("inline-block");
            } else {
              classes.push("block");
            }
            if (line.emphasis) classes.push(emphasisClass);
            return (
              <span key={i} className={classes.join(" ")}>
                {line.accent ? (
                  <span className="text-accent">{line.text}</span>
                ) : (
                  line.text
                )}
              </span>
            );
          })}
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={0.15}>
        <p className="body-large max-w-[680px] mx-auto mb-12">
          {hero.subheadline}
        </p>
      </ScrollReveal>

      <ScrollReveal delay={0.2}>
        <div className="relative max-w-[960px] mx-auto aspect-video rounded-xl border border-border overflow-hidden bg-bg-elevated">
          <video
            ref={videoRef}
            className="block h-full md:h-[112%] w-full object-cover object-center md:object-top md:-translate-y-[6%]"
            controls={isPlaying}
            preload="metadata"
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src="https://filebrowser-beta.up.railway.app/api/public/dl/mBogFHN3?inline=true#t=0.001" type="video/mp4" />
            Dein Browser unterstuetzt dieses Video nicht.
          </video>
          {!isPlaying && (
            <button
              type="button"
              onClick={handlePlay}
              aria-label="Video abspielen"
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <span className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/95 shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 md:w-10 md:h-10 text-accent fill-accent ml-1" />
              </span>
            </button>
          )}
        </div>
      </ScrollReveal>
    </div>
  </section>
  );
};

export default Hero;
