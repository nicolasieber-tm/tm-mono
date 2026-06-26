import { useState, useCallback, useRef, useEffect } from 'react';
import type { Element, CanvasConfig } from '../types';
import { clampToCanvas } from '../utils/bounds';

/** 8-point compass handles */
export type ResizeHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

const MIN_SIZE = 20; // px

interface ResizeState {
  elementId: string;
  handle: ResizeHandle;
  startMouseX: number;
  startMouseY: number;
  /** Original element bounds at drag start */
  origX: number;
  origY: number;
  origWidth: number;
  origHeight: number;
  /** Original aspect ratio for Shift-constrained resizing */
  aspectRatio: number;
}

/**
 * 8-point element resize with optional aspect-ratio lock (Shift key).
 *
 * Each of the eight handles moves different edges:
 *   - Corner handles (nw, ne, se, sw) move two edges simultaneously
 *   - Edge handles (n, e, s, w) move one edge, keeping the opposite fixed
 *
 * The hook clamps results to MIN_SIZE and to canvas bounds.
 *
 * See useDrag for the rationale of attaching document listeners inside
 * startResize rather than via a stable useCallback + cleanup useEffect —
 * unstable onResizeEnd callbacks from the parent would otherwise churn
 * the listeners out mid-interaction.
 */
export function useResize(
  elements: Element[],
  updateElement: (id: string, updates: Partial<Element>) => void,
  canvasConfig: CanvasConfig,
  onResizeEnd?: () => void,
) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizingElementId, setResizingElementId] = useState<string | null>(null);

  // Fresh refs for whatever the latest props are — handlers read from these
  // so they never need to be re-created across renders.
  const stateRef = useRef<ResizeState | null>(null);
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const configRef = useRef(canvasConfig);
  configRef.current = canvasConfig;
  const updateElementRef = useRef(updateElement);
  updateElementRef.current = updateElement;
  const onResizeEndRef = useRef(onResizeEnd);
  onResizeEndRef.current = onResizeEnd;

  const activeListenersRef = useRef<{
    mousemove: (e: MouseEvent) => void;
    mouseup: (e: MouseEvent) => void;
  } | null>(null);

  // ---- Which edges does a handle control? ----

  const affectsLeft = (h: ResizeHandle) => h === 'nw' || h === 'w' || h === 'sw';
  const affectsRight = (h: ResizeHandle) => h === 'ne' || h === 'e' || h === 'se';
  const affectsTop = (h: ResizeHandle) => h === 'nw' || h === 'n' || h === 'ne';
  const affectsBottom = (h: ResizeHandle) => h === 'sw' || h === 's' || h === 'se';
  const isCorner = (h: ResizeHandle) => h === 'nw' || h === 'ne' || h === 'se' || h === 'sw';

  const detachListeners = useCallback(() => {
    const active = activeListenersRef.current;
    if (!active) return;
    document.removeEventListener('mousemove', active.mousemove);
    document.removeEventListener('mouseup', active.mouseup);
    activeListenersRef.current = null;
  }, []);

  // ---- Public API ----

  const startResize = useCallback(
    (elementId: string, handle: ResizeHandle, e: React.MouseEvent) => {
      const el = elementsRef.current.find(el => el.id === elementId);
      if (!el) return;

      e.stopPropagation();
      e.preventDefault(); // prevent text selection during resize

      // Defensive: clear any lingering listeners from a prior interaction.
      detachListeners();

      const origWidth = el.width || MIN_SIZE;
      const origHeight = el.height || MIN_SIZE;

      stateRef.current = {
        elementId,
        handle,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        origX: el.x,
        origY: el.y,
        origWidth,
        origHeight,
        aspectRatio: origHeight > 0 ? origWidth / origHeight : 1,
      };

      setIsResizing(true);
      setResizingElementId(elementId);

      const handleMouseMove = (ev: MouseEvent) => {
        const s = stateRef.current;
        if (!s) return;

        const config = configRef.current;
        const zoom = config.zoom;

        const dx = (ev.clientX - s.startMouseX) / zoom;
        const dy = (ev.clientY - s.startMouseY) / zoom;

        let newX = s.origX;
        let newY = s.origY;
        let newW = s.origWidth;
        let newH = s.origHeight;

        // -- Compute raw new bounds based on which handle is being dragged --

        if (affectsRight(s.handle)) {
          newW = s.origWidth + dx;
        }
        if (affectsLeft(s.handle)) {
          newW = s.origWidth - dx;
          newX = s.origX + dx;
        }
        if (affectsBottom(s.handle)) {
          newH = s.origHeight + dy;
        }
        if (affectsTop(s.handle)) {
          newH = s.origHeight - dy;
          newY = s.origY + dy;
        }

        // -- Enforce minimum size --

        if (newW < MIN_SIZE) {
          if (affectsLeft(s.handle)) {
            newX = s.origX + s.origWidth - MIN_SIZE;
          }
          newW = MIN_SIZE;
        }
        if (newH < MIN_SIZE) {
          if (affectsTop(s.handle)) {
            newY = s.origY + s.origHeight - MIN_SIZE;
          }
          newH = MIN_SIZE;
        }

        // -- Shift = maintain aspect ratio (corners only) --

        if (ev.shiftKey && isCorner(s.handle) && s.aspectRatio > 0) {
          const currentRatio = newW / newH;
          if (currentRatio > s.aspectRatio) {
            // Width is dominant, adjust height
            const adjustedH = newW / s.aspectRatio;
            if (affectsTop(s.handle)) {
              newY = newY - (adjustedH - newH);
            }
            newH = adjustedH;
          } else {
            // Height is dominant, adjust width
            const adjustedW = newH * s.aspectRatio;
            if (affectsLeft(s.handle)) {
              newX = newX - (adjustedW - newW);
            }
            newW = adjustedW;
          }
        }

        // -- Clamp to canvas --

        const clamped = clampToCanvas(newX, newY, newW, newH, config.width, config.height);
        newX = clamped.x;
        newY = clamped.y;

        // If clamping moved x/y, reduce width/height to match
        if (affectsRight(s.handle) && newX + newW > config.width) {
          newW = config.width - newX;
        }
        if (affectsBottom(s.handle) && newY + newH > config.height) {
          newH = config.height - newY;
        }

        newW = Math.round(newW);
        newH = Math.round(newH);
        newX = Math.round(newX);
        newY = Math.round(newY);

        updateElementRef.current(s.elementId, { x: newX, y: newY, width: newW, height: newH });
      };

      const handleMouseUp = () => {
        detachListeners();

        stateRef.current = null;
        setIsResizing(false);
        setResizingElementId(null);

        if (onResizeEndRef.current) {
          onResizeEndRef.current();
        }
      };

      activeListenersRef.current = { mousemove: handleMouseMove, mouseup: handleMouseUp };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [detachListeners],
  );

  // Cleanup on unmount only. detachListeners is stable so this effect
  // never re-runs during an interaction.
  useEffect(() => {
    return () => {
      detachListeners();
    };
  }, [detachListeners]);

  return { startResize, isResizing, resizingElementId } as const;
}
