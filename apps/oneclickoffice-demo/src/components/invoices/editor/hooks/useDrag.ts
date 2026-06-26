import { useState, useCallback, useRef, useEffect } from 'react';
import type { Element, CanvasConfig, AlignmentGuide } from '../types';
import { clampToCanvas } from '../utils/bounds';
import { findSnapTargets } from '../utils/snapEngine';

interface DragState {
  elementId: string;
  startMouseX: number;
  startMouseY: number;
  startElementX: number;
  startElementY: number;
  /** For line elements: original x2/y2 so the whole line moves together */
  startX2: number | undefined;
  startY2: number | undefined;
  hasMovedPastThreshold: boolean;
}

const DRAG_THRESHOLD = 3; // px of mouse movement before we consider it a drag
const GUIDE_LINGER_MS = 200; // how long alignment guides stay visible after drop

/**
 * Manages element dragging with zoom-corrected deltas, snap-to-grid /
 * snap-to-element support, and canvas bounds clamping.
 *
 * Implementation note: the document-level mousemove/mouseup listeners are
 * attached **inside `startDrag`** for each interaction, so the handler
 * closures are local to one drag operation. An earlier implementation kept
 * them in stable refs with a cleanup useEffect; that broke as soon as the
 * parent passed an unstable `onDragEnd` (e.g. a `pushHistory` callback that
 * depends on `elements`), because every element update re-rendered the
 * parent, churned `onDragEnd`, and triggered the cleanup useEffect to
 * remove the listeners mid-drag. Moving the listeners into the startDrag
 * closure decouples them from React re-renders entirely.
 */
export function useDrag(
  elements: Element[],
  updateElement: (id: string, updates: Partial<Element>) => void,
  canvasConfig: CanvasConfig,
  onDragEnd?: () => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCoordinates, setDragCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);

  // Refs hold the latest values so the drag closure always sees fresh data
  // without having to be re-created on every render.
  const elementsRef = useRef(elements);
  elementsRef.current = elements;
  const configRef = useRef(canvasConfig);
  configRef.current = canvasConfig;
  const updateElementRef = useRef(updateElement);
  updateElementRef.current = updateElement;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const dragStateRef = useRef<DragState | null>(null);
  const guideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track the currently-attached listeners so we can clean them up on
  // unmount or if startDrag is called a second time mid-interaction.
  const activeListenersRef = useRef<{
    mousemove: (e: MouseEvent) => void;
    mouseup: (e: MouseEvent) => void;
  } | null>(null);

  const detachListeners = useCallback(() => {
    const active = activeListenersRef.current;
    if (!active) return;
    document.removeEventListener('mousemove', active.mousemove);
    document.removeEventListener('mouseup', active.mouseup);
    activeListenersRef.current = null;
  }, []);

  // ---- Public API ----

  const startDrag = useCallback(
    (elementId: string, e: React.MouseEvent) => {
      const el = elementsRef.current.find(el => el.id === elementId);
      if (!el) return;

      e.stopPropagation();

      // If a previous drag is somehow still attached (shouldn't happen under
      // normal mouse event flow, but be defensive), tear it down first.
      detachListeners();

      dragStateRef.current = {
        elementId,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startElementX: el.x,
        startElementY: el.y,
        startX2: el.x2,
        startY2: el.y2,
        hasMovedPastThreshold: false,
      };

      const handleMouseMove = (ev: MouseEvent) => {
        const state = dragStateRef.current;
        if (!state) return;

        const config = configRef.current;
        const zoom = config.zoom;

        const deltaX = (ev.clientX - state.startMouseX) / zoom;
        const deltaY = (ev.clientY - state.startMouseY) / zoom;

        if (!state.hasMovedPastThreshold) {
          if (Math.abs(deltaX * zoom) <= DRAG_THRESHOLD && Math.abs(deltaY * zoom) <= DRAG_THRESHOLD) {
            return; // haven't moved enough yet
          }
          state.hasMovedPastThreshold = true;
          setIsDragging(true);
        }

        let newX = Math.round(state.startElementX + deltaX);
        let newY = Math.round(state.startElementY + deltaY);

        const currentEl = elementsRef.current.find(x => x.id === state.elementId);
        if (!currentEl) return;

        const elWidth = currentEl.width || 0;
        const elHeight = currentEl.height || 0;

        // Snap (element-to-element + grid).
        // snapEngine divides threshold by zoom, and SnapRect requires an id —
        // both were missing in the modular rebuild's call site, so effective
        // threshold was NaN and snapping was a silent no-op. Both fixed here.
        if (config.snapToElements || config.snapToGrid) {
          const others = elementsRef.current
            .filter(o => o.id !== state.elementId)
            .map(o => ({
              id: o.id,
              x: o.x,
              y: o.y,
              width: o.width || 0,
              height: o.height || 0,
            }));
          const snap = findSnapTargets(
            { id: state.elementId, x: newX, y: newY, width: elWidth, height: elHeight },
            others,
            {
              snapToGrid: config.snapToGrid,
              snapToElements: config.snapToElements,
              gridSize: config.gridSize,
              threshold: config.snapThreshold,
              zoom: config.zoom,
              canvasWidth: config.width,
              canvasHeight: config.height,
            },
          );
          newX = snap.x;
          newY = snap.y;
          setAlignmentGuides(snap.guides);
        } else {
          setAlignmentGuides([]);
        }

        // Clamp to canvas bounds
        const clamped = clampToCanvas(newX, newY, elWidth, elHeight, config.width, config.height);
        newX = clamped.x;
        newY = clamped.y;

        // Build updates
        const updates: Partial<Element> = { x: newX, y: newY };

        // For lines, move both endpoints together
        if (currentEl.type === 'line' && state.startX2 !== undefined && state.startY2 !== undefined) {
          updates.x2 = state.startX2 + (newX - state.startElementX);
          updates.y2 = state.startY2 + (newY - state.startElementY);
        }

        updateElementRef.current(state.elementId, updates);
        setDragCoordinates({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        detachListeners();

        const wasDragging = dragStateRef.current?.hasMovedPastThreshold ?? false;
        dragStateRef.current = null;
        setIsDragging(false);
        setDragCoordinates(null);

        // Linger guides briefly, then clear
        if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
        guideTimerRef.current = setTimeout(() => {
          setAlignmentGuides([]);
          guideTimerRef.current = null;
        }, GUIDE_LINGER_MS);

        if (wasDragging && onDragEndRef.current) {
          onDragEndRef.current();
        }
      };

      activeListenersRef.current = { mousemove: handleMouseMove, mouseup: handleMouseUp };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [detachListeners],
  );

  // Cleanup on unmount — remove any still-attached listeners from an
  // in-progress drag. Deps are stable (detachListeners is stable), so this
  // effect never re-runs during a drag.
  useEffect(() => {
    return () => {
      detachListeners();
      if (guideTimerRef.current) clearTimeout(guideTimerRef.current);
    };
  }, [detachListeners]);

  return { startDrag, isDragging, dragCoordinates, alignmentGuides } as const;
}
