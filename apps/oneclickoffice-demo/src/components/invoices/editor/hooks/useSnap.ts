import { useState, useCallback, useRef } from 'react';
import type { CanvasConfig, AlignmentGuide } from '../types';
import { findSnapTargets } from '../utils/snapEngine';

interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

/**
 * React wrapper around the pure `snapEngine` utility.
 *
 * Manages the toggle state for grid-snap and element-snap and exposes a
 * `calculateSnap` function that delegates to the engine.  The hook itself
 * does *not* own alignment-guide rendering state -- that lives in `useDrag`
 * where the guides need to be displayed.
 */
export function useSnap(canvasConfig: CanvasConfig) {
  const [snapToGrid, setSnapToGrid] = useState(canvasConfig.snapToGrid);
  const [snapToElements, setSnapToElements] = useState(canvasConfig.snapToElements);
  const [threshold, setThreshold] = useState(canvasConfig.snapThreshold);

  const configRef = useRef(canvasConfig);
  configRef.current = canvasConfig;

  const toggleGridSnap = useCallback(() => {
    setSnapToGrid(prev => !prev);
  }, []);

  const toggleElementSnap = useCallback(() => {
    setSnapToElements(prev => !prev);
  }, []);

  /**
   * Calculate snapped position for a dragging element.
   *
   * @param dragging - The bounding box of the element being dragged
   * @param allElements - All *other* elements on the canvas (excluding the
   *                      dragged one)
   */
  const calculateSnap = useCallback(
    (
      dragging: { x: number; y: number; width: number; height: number },
      allElements: Array<{ x: number; y: number; width?: number; height?: number }>,
    ): SnapResult => {
      const config = configRef.current;

      return findSnapTargets(dragging, allElements, {
        snapToGrid,
        snapToElements,
        gridSize: config.gridSize,
        threshold,
        canvasWidth: config.width,
        canvasHeight: config.height,
      });
    },
    [snapToGrid, snapToElements, threshold],
  );

  return {
    snapToGrid,
    snapToElements,
    toggleGridSnap,
    toggleElementSnap,
    calculateSnap,
    threshold,
    setThreshold,
  } as const;
}
