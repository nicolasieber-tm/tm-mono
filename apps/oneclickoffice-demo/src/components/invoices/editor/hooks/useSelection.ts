import { useState, useCallback, useRef } from 'react';
import type { Element } from '../types';

interface LassoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Manages element selection: single-click, Shift+click multi-select,
 * lasso (rubber-band) selection, select-all, and clear.
 */
export function useSelection(elements: Element[]) {
  const [selectedElementIds, setSelectedElementIds] = useState<Set<string>>(new Set());
  const [lassoRect, setLassoRect] = useState<LassoRect | null>(null);

  // Mutable ref for the lasso origin so we don't recreate mouse handlers
  const lassoOriginRef = useRef<{ x: number; y: number } | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // ---- Single select ----

  const selectElement = useCallback((id: string) => {
    setSelectedElementIds(new Set([id]));
  }, []);

  const selectElements = useCallback((ids: string[]) => {
    setSelectedElementIds(new Set(ids));
  }, []);

  // ---- Multi-select (Shift+Click) ----

  const toggleSelection = useCallback((id: string) => {
    setSelectedElementIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ---- Clear ----

  const clearSelection = useCallback(() => {
    setSelectedElementIds(new Set());
  }, []);

  // ---- Select all ----

  const selectAll = useCallback(() => {
    setSelectedElementIds(new Set(elements.map(el => el.id)));
  }, [elements]);

  // ---- Lasso selection ----

  /**
   * Call from the canvas onMouseDown (when clicking empty space).
   * Coordinates should already be in canvas-space (screen-to-canvas converted).
   */
  const startLasso = useCallback((canvasX: number, canvasY: number) => {
    lassoOriginRef.current = { x: canvasX, y: canvasY };
    setLassoRect({ x: canvasX, y: canvasY, width: 0, height: 0 });
  }, []);

  /**
   * Call from mousemove during lasso. Coordinates in canvas-space.
   */
  const updateLasso = useCallback((canvasX: number, canvasY: number) => {
    const origin = lassoOriginRef.current;
    if (!origin) return;

    setLassoRect({
      x: Math.min(origin.x, canvasX),
      y: Math.min(origin.y, canvasY),
      width: Math.abs(canvasX - origin.x),
      height: Math.abs(canvasY - origin.y),
    });
  }, []);

  /**
   * Call from mouseup to finalize lasso selection.
   * Uses the current `elements` to determine which are inside the rect.
   */
  const endLasso = useCallback(() => {
    const rect = lassoRect;
    if (!rect || (rect.width < 3 && rect.height < 3)) {
      // Tiny rect = accidental click, just clear
      setLassoRect(null);
      lassoOriginRef.current = null;
      return;
    }

    const ids = new Set<string>();
    for (const el of elements) {
      const elRight = el.x + (el.width || 100);
      const elBottom = el.y + (el.height || 20);

      // Intersection test (AABB overlap)
      const overlaps =
        el.x < rect.x + rect.width &&
        elRight > rect.x &&
        el.y < rect.y + rect.height &&
        elBottom > rect.y;

      if (overlaps) {
        ids.add(el.id);
      }
    }

    setSelectedElementIds(ids);
    setLassoRect(null);
    lassoOriginRef.current = null;
  }, [elements, lassoRect]);

  // ---- Convenience getters ----

  const isSelected = useCallback(
    (id: string) => selectedElementIds.has(id),
    [selectedElementIds],
  );

  // For backwards compat: the "primary" selected element (first in set, or
  // the single element when only one is selected).
  const selectedElement: Element | null =
    selectedElementIds.size === 1
      ? elements.find(el => el.id === [...selectedElementIds][0]) ?? null
      : null;

  return {
    selectedElement,
    selectedElementIds,
    selectElement,
    selectElements,
    toggleSelection,
    clearSelection,
    selectAll,
    startLasso,
    updateLasso,
    endLasso,
    lassoRect,
    isSelected,
  } as const;
}
