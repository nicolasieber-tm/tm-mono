import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";
import { useIsTouchOrSmall } from "./useIsTouchOrSmall";

type SmoothScrollProps = {
  children: ReactNode;
  /**
   * Override Lenis options. Defaults match Auron's tuned config.
   */
  options?: Parameters<typeof ReactLenis>[0]["options"];
};

const defaultOptions = {
  lerp: 0.09,
  duration: 1.35,
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1.2,
  anchors: { offset: -80, duration: 1.4 },
};

export const SmoothScroll = ({ children, options }: SmoothScrollProps) => {
  const isTouchOrSmall = useIsTouchOrSmall();
  if (isTouchOrSmall) return <>{children}</>;
  return (
    <ReactLenis root options={{ ...defaultOptions, ...options }}>
      {children}
    </ReactLenis>
  );
};
