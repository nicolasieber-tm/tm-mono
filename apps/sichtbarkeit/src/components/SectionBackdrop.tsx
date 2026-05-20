import { useEffect, useRef } from "react";
import { useDepth } from "@/lib/theme";

type Props = {
  seed?: number;
};

const GLOW_POSITIONS = [
  { x: "18%", y: "22%", hue: "rgba(167, 139, 250, 0.18)" },
  { x: "82%", y: "30%", hue: "rgba(124, 58, 237, 0.14)" },
  { x: "30%", y: "78%", hue: "rgba(192, 132, 252, 0.15)" },
  { x: "75%", y: "70%", hue: "rgba(139, 92, 246, 0.16)" },
  { x: "50%", y: "15%", hue: "rgba(167, 139, 250, 0.13)" },
  { x: "15%", y: "55%", hue: "rgba(124, 58, 237, 0.12)" },
  { x: "88%", y: "85%", hue: "rgba(167, 139, 250, 0.17)" },
  { x: "40%", y: "40%", hue: "rgba(139, 92, 246, 0.14)" },
];

export const SectionBackdrop = ({ seed = 0 }: Props) => {
  const depth = useDepth();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (depth !== "panels") return;
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let tx = 50, ty = 50, cx = 50, cy = 50;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      tx = ((e.clientX - rect.left) / rect.width) * 100;
      ty = ((e.clientY - rect.top) / rect.height) * 100;
    };
    const onLeave = () => { tx = 50; ty = 50; };
    const tick = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.setProperty("--mx", `${cx}%`);
      el.style.setProperty("--my", `${cy}%`);
      raf = requestAnimationFrame(tick);
    };

    const parent = el.parentElement;
    parent?.addEventListener("mousemove", onMove);
    parent?.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      parent?.removeEventListener("mousemove", onMove);
      parent?.removeEventListener("mouseleave", onLeave);
    };
  }, [depth]);

  if (depth === "off") return null;

  const glow = GLOW_POSITIONS[seed % GLOW_POSITIONS.length];
  const glow2 = GLOW_POSITIONS[(seed + 3) % GLOW_POSITIONS.length];

  const blendStrips = (
    <>
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          top: "-160px",
          height: "160px",
          background:
            "linear-gradient(to top, hsl(var(--c-bg)) 0%, hsl(var(--c-bg) / 0.6) 40%, hsl(var(--c-bg) / 0) 100%)",
        }}
      />
      <div
        className="absolute inset-x-0 pointer-events-none"
        style={{
          bottom: "-160px",
          height: "160px",
          background:
            "linear-gradient(to bottom, hsl(var(--c-bg)) 0%, hsl(var(--c-bg) / 0.6) 40%, hsl(var(--c-bg) / 0) 100%)",
        }}
      />
    </>
  );

  if (depth === "atmosphere") {
    const glow3 = GLOW_POSITIONS[(seed + 5) % GLOW_POSITIONS.length];
    const orbSeed = seed * 7;
    const orbs = [
      { left: `${(orbSeed * 13) % 90 + 5}%`, top: `${(orbSeed * 17) % 80 + 10}%`, size: 120, blur: 14 },
      { left: `${(orbSeed * 23) % 85 + 8}%`, top: `${(orbSeed * 11) % 75 + 12}%`, size: 80, blur: 8 },
      { left: `${(orbSeed * 31) % 88 + 6}%`, top: `${(orbSeed * 19) % 70 + 18}%`, size: 50, blur: 4 },
      { left: `${(orbSeed * 37) % 92 + 4}%`, top: `${(orbSeed * 29) % 78 + 8}%`, size: 180, blur: 24 },
    ];
    return (
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ zIndex: -1 }}>
        {blendStrips}
        <div
          className="absolute rounded-full"
          style={{
            left: glow3.x,
            top: glow3.y,
            width: "90vw",
            height: "90vw",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at center, ${glow3.hue} 0%, transparent 55%)`,
            filter: "blur(80px)",
            opacity: 0.7,
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            left: glow.x,
            top: glow.y,
            width: "60vw",
            height: "60vw",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at center, ${glow.hue} 0%, transparent 60%)`,
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            left: glow2.x,
            top: glow2.y,
            width: "45vw",
            height: "45vw",
            transform: "translate(-50%, -50%)",
            background: `radial-gradient(circle at center, ${glow2.hue} 0%, transparent 65%)`,
            filter: "blur(50px)",
          }}
        />
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full atmos-drift"
            style={{
              left: orb.left,
              top: orb.top,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              transform: "translate(-50%, -50%)",
              background: `radial-gradient(circle at 35% 35%, rgb(var(--c-fg) / 0.08) 0%, rgb(var(--c-fg) / 0.02) 45%, transparent 70%)`,
              filter: `blur(${orb.blur}px)`,
              opacity: 0.5,
              animationDelay: `${i * 1.7}s`,
              animationDuration: `${18 + i * 4}s`,
            }}
          />
        ))}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.8'/></svg>\")",
          }}
        />
      </div>
    );
  }

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ zIndex: -1, ["--mx" as string]: "50%", ["--my" as string]: "50%" }}
    >
      {blendStrips}
      <div
        className="absolute rounded-full"
        style={{
          left: "10%",
          top: "10%",
          width: "55vw",
          height: "55vw",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle at center, ${glow.hue} 0%, transparent 60%)`,
          filter: "blur(50px)",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          right: "5%",
          bottom: "5%",
          width: "50vw",
          height: "50vw",
          transform: "translate(50%, 50%)",
          background: `radial-gradient(circle at center, ${glow2.hue} 0%, transparent 65%)`,
          filter: "blur(50px)",
        }}
      />
    </div>
  );
};
