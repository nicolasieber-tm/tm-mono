import * as React from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FocusRailItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc: string;
  href?: string;
  meta?: string;
};

interface FocusRailProps {
  items: FocusRailItem[];
  initialIndex?: number;
  loop?: boolean;
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

function wrap(min: number, max: number, v: number) {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
}

const BASE_SPRING = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
} as const;

export function FocusRail({
  items,
  initialIndex = 0,
  loop = true,
  autoPlay = false,
  interval = 4000,
  className,
}: FocusRailProps) {
  const [active, setActive] = React.useState(initialIndex);
  const [isHovering, setIsHovering] = React.useState(false);
  const lastWheelTime = React.useRef<number>(0);

  const count = items.length;
  const activeIndex = wrap(0, count, active);
  const activeItem = items[activeIndex];

  const handlePrev = React.useCallback(() => {
    if (!loop && active === 0) return;
    setActive((p) => p - 1);
  }, [loop, active]);

  const handleNext = React.useCallback(() => {
    if (!loop && active === count - 1) return;
    setActive((p) => p + 1);
  }, [loop, active, count]);

  const onWheel = React.useCallback(
    (e: React.WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime.current < 400) return;

      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      const delta = isHorizontal ? e.deltaX : e.deltaY;

      if (Math.abs(delta) > 20) {
        if (delta > 0) handleNext();
        else handlePrev();
        lastWheelTime.current = now;
      }
    },
    [handleNext, handlePrev]
  );

  React.useEffect(() => {
    if (!autoPlay || isHovering) return;
    const timer = window.setInterval(() => handleNext(), interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, isHovering, handleNext, interval]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;
  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) handleNext();
    else if (swipe > swipeConfidenceThreshold) handlePrev();
  };

  const visibleIndices = [-2, -1, 0, 1, 2];

  if (!items.length) return null;

  return (
    <div
      className={cn(
        "group relative flex h-[660px] w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 text-white outline-none select-none overflow-x-hidden",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onWheel={onWheel}
    >
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${activeItem.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img src={activeItem.imageSrc} alt="" className="h-full w-full object-cover blur-3xl saturate-200" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-2 md:px-4">
        <motion.div
          className="relative mx-auto flex h-[400px] w-full max-w-6xl items-center justify-center perspective-[1200px] cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={onDragEnd}
        >
          {visibleIndices.map((offset) => {
            const absIndex = active + offset;
            const index = wrap(0, count, absIndex);
            const item = items[index];
            if (!loop && (absIndex < 0 || absIndex >= count)) return null;

            const isCenter = offset === 0;
            const dist = Math.abs(offset);
            const xOffset = offset * 260;
            const zOffset = -dist * 160;
            const scale = isCenter ? 1 : 0.82;
            const rotateY = offset * -18;
            const opacity = isCenter ? 1 : Math.max(0.08, 1 - dist * 0.5);
            const blur = isCenter ? 0 : dist * 5;
            const brightness = isCenter ? 1 : 0.55;

            return (
              <motion.div
                key={absIndex}
                className={cn(
                  "absolute aspect-[9/19] w-[180px] md:w-[210px] rounded-2xl border border-white/15 bg-neutral-900 shadow-2xl transition-shadow duration-300",
                  isCenter ? "z-20 shadow-white/10" : "z-10"
                )}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  scale,
                  rotateY,
                  opacity,
                  filter: `blur(${blur}px) brightness(${brightness})`,
                }}
                transition={BASE_SPRING}
                style={{ transformStyle: "preserve-3d" }}
                onClick={() => {
                  if (offset !== 0) setActive((p) => p + offset);
                }}
              >
                <img src={item.imageSrc} alt={item.title} className="h-full w-full rounded-2xl object-cover pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-between gap-5 md:flex-row pointer-events-auto px-2">
          <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left min-h-[86px] justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-1"
              >
                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">{activeItem.title}</h3>
                {activeItem.description && <p className="max-w-md text-sm md:text-base text-neutral-300">{activeItem.description}</p>}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-full bg-neutral-900/80 p-1 ring-1 ring-white/10 backdrop-blur-md">
              <button
                onClick={handlePrev}
                className="rounded-full p-2.5 text-neutral-300 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[44px] text-center text-xs font-mono text-neutral-400">
                {activeIndex + 1} / {count}
              </span>
              <button
                onClick={handleNext}
                className="rounded-full p-2.5 text-neutral-300 transition hover:bg-white/10 hover:text-white active:scale-95"
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {activeItem.href && (
              <a
                href={activeItem.href}
                className="group flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105 active:scale-95"
              >
                Öffnen
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
