// =============================================================================
// Snap Engine
// Pure snap-to-grid and snap-to-element logic extracted from
// ModernTemplateEditor.tsx with two bug fixes:
//   1. Zoom correction: threshold is now in screen pixels, divided by zoom
//      so snapping feels consistent regardless of zoom level.
//   2. Canvas center is derived from canvasWidth/canvasHeight parameters
//      instead of hardcoded 794/1123.
// =============================================================================

import type { AlignmentGuide } from '../types';

/** Minimal rectangle used for snap calculations. */
export interface SnapRect {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
}

export interface SnapResult {
  x: number;
  y: number;
  guides: AlignmentGuide[];
}

export interface ResizeSnapResult extends SnapResult {
  width: number;
  height: number;
}

export interface SnapOptions {
  snapToGrid: boolean;
  snapToElements: boolean;
  gridSize: number;
  threshold: number;
  zoom: number;
  canvasWidth: number;
  canvasHeight: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

interface SnapCandidate {
  distance: number;
  snappedPosition: number;
  guidePosition: number;
  guideType: 'vertical' | 'horizontal';
}

function bestCandidate(
  current: SnapCandidate | null,
  candidate: SnapCandidate
): SnapCandidate {
  if (!current || candidate.distance < current.distance) {
    return candidate;
  }
  return current;
}

/**
 * The effective threshold in canvas coordinates.
 * Because the user interacts in screen pixels, we divide by zoom so that a
 * 5-screen-pixel threshold remains 5 screen pixels regardless of zoom.
 */
function effectiveThreshold(options: SnapOptions): number {
  return options.threshold / options.zoom;
}

// ---------------------------------------------------------------------------
// Grid snapping
// ---------------------------------------------------------------------------

function snapToGrid(
  value: number,
  gridSize: number,
  threshold: number
): { snapped: number; didSnap: boolean } {
  const nearest = Math.round(value / gridSize) * gridSize;
  if (Math.abs(value - nearest) <= threshold) {
    return { snapped: nearest, didSnap: true };
  }
  return { snapped: value, didSnap: false };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Find snap targets while dragging an element.
 *
 * Checks (in priority order):
 *   1. Other element edges: left-left, right-right, center-center
 *   2. Equal spacing between three elements
 *   3. Canvas center lines
 *   4. Grid intersections (if enabled)
 *
 * Returns the snapped position and any alignment guides to render.
 */
export function findSnapTargets(
  dragging: SnapRect,
  allElements: SnapRect[],
  options: SnapOptions
): SnapResult {
  const thresh = effectiveThreshold(options);
  const others = allElements.filter((el) => el.id !== dragging.id);

  let newX = dragging.x;
  let newY = dragging.y;
  const guides: AlignmentGuide[] = [];

  let bestX: SnapCandidate | null = null;
  let bestY: SnapCandidate | null = null;

  const dragRight = dragging.x + dragging.width;
  const dragBottom = dragging.y + dragging.height;
  const dragCenterX = dragging.x + dragging.width / 2;
  const dragCenterY = dragging.y + dragging.height / 2;

  // --- Canvas center snapping ---
  if (options.snapToElements) {
    const canvasCenterX = options.canvasWidth / 2;
    const canvasCenterY = options.canvasHeight / 2;

    const dxCenter = Math.abs(dragCenterX - canvasCenterX);
    if (dxCenter <= thresh) {
      bestX = bestCandidate(bestX, {
        distance: dxCenter,
        snappedPosition: canvasCenterX - dragging.width / 2,
        guidePosition: canvasCenterX,
        guideType: 'vertical',
      });
    }

    const dyCenter = Math.abs(dragCenterY - canvasCenterY);
    if (dyCenter <= thresh) {
      bestY = bestCandidate(bestY, {
        distance: dyCenter,
        snappedPosition: canvasCenterY - dragging.height / 2,
        guidePosition: canvasCenterY,
        guideType: 'horizontal',
      });
    }
  }

  // --- Element edge snapping ---
  if (options.snapToElements) {
    for (const other of others) {
      const otherRight = other.x + other.width;
      const otherBottom = other.y + other.height;
      const otherCenterX = other.x + other.width / 2;
      const otherCenterY = other.y + other.height / 2;

      // X-axis candidates
      const xCandidates: SnapCandidate[] = [
        // left-to-left
        {
          distance: Math.abs(dragging.x - other.x),
          snappedPosition: other.x,
          guidePosition: other.x,
          guideType: 'vertical',
        },
        // right-to-right
        {
          distance: Math.abs(dragRight - otherRight),
          snappedPosition: otherRight - dragging.width,
          guidePosition: otherRight,
          guideType: 'vertical',
        },
        // center-to-center
        {
          distance: Math.abs(dragCenterX - otherCenterX),
          snappedPosition: otherCenterX - dragging.width / 2,
          guidePosition: otherCenterX,
          guideType: 'vertical',
        },
        // left-to-right (adjacent snap)
        {
          distance: Math.abs(dragging.x - otherRight),
          snappedPosition: otherRight,
          guidePosition: otherRight,
          guideType: 'vertical',
        },
        // right-to-left (adjacent snap)
        {
          distance: Math.abs(dragRight - other.x),
          snappedPosition: other.x - dragging.width,
          guidePosition: other.x,
          guideType: 'vertical',
        },
      ];

      for (const c of xCandidates) {
        if (c.distance <= thresh) {
          bestX = bestCandidate(bestX, c);
        }
      }

      // Y-axis candidates
      const yCandidates: SnapCandidate[] = [
        // top-to-top
        {
          distance: Math.abs(dragging.y - other.y),
          snappedPosition: other.y,
          guidePosition: other.y,
          guideType: 'horizontal',
        },
        // bottom-to-bottom
        {
          distance: Math.abs(dragBottom - otherBottom),
          snappedPosition: otherBottom - dragging.height,
          guidePosition: otherBottom,
          guideType: 'horizontal',
        },
        // center-to-center
        {
          distance: Math.abs(dragCenterY - otherCenterY),
          snappedPosition: otherCenterY - dragging.height / 2,
          guidePosition: otherCenterY,
          guideType: 'horizontal',
        },
        // top-to-bottom (adjacent snap)
        {
          distance: Math.abs(dragging.y - otherBottom),
          snappedPosition: otherBottom,
          guidePosition: otherBottom,
          guideType: 'horizontal',
        },
        // bottom-to-top (adjacent snap)
        {
          distance: Math.abs(dragBottom - other.y),
          snappedPosition: other.y - dragging.height,
          guidePosition: other.y,
          guideType: 'horizontal',
        },
      ];

      for (const c of yCandidates) {
        if (c.distance <= thresh) {
          bestY = bestCandidate(bestY, c);
        }
      }

      // --- Equal spacing snapping ---
      for (const third of others) {
        if (third.id === other.id) continue;

        // Vertical equal spacing
        const vGap = Math.abs(third.y - (other.y + other.height));
        if (vGap > 0) {
          const targetY = other.y + other.height + vGap;
          const d = Math.abs(dragging.y - targetY);
          if (d <= thresh) {
            bestY = bestCandidate(bestY, {
              distance: d,
              snappedPosition: targetY,
              guidePosition: targetY,
              guideType: 'horizontal',
            });
          }
        }

        // Horizontal equal spacing
        const hGap = Math.abs(third.x - (other.x + other.width));
        if (hGap > 0) {
          const targetX = other.x + other.width + hGap;
          const d = Math.abs(dragging.x - targetX);
          if (d <= thresh) {
            bestX = bestCandidate(bestX, {
              distance: d,
              snappedPosition: targetX,
              guidePosition: targetX,
              guideType: 'vertical',
            });
          }
        }
      }
    }
  }

  // --- Grid snapping (lowest priority - only if no element snap found) ---
  if (options.snapToGrid) {
    if (!bestX) {
      const gridSnap = snapToGrid(dragging.x, options.gridSize, thresh);
      if (gridSnap.didSnap) {
        newX = gridSnap.snapped;
      }
    }
    if (!bestY) {
      const gridSnap = snapToGrid(dragging.y, options.gridSize, thresh);
      if (gridSnap.didSnap) {
        newY = gridSnap.snapped;
      }
    }
  }

  // Apply element snap results (override grid)
  if (bestX) {
    newX = bestX.snappedPosition;
    guides.push({ type: bestX.guideType, position: bestX.guidePosition });
  }
  if (bestY) {
    newY = bestY.snappedPosition;
    guides.push({ type: bestY.guideType, position: bestY.guidePosition });
  }

  return { x: newX, y: newY, guides };
}

/**
 * Find snap targets during a resize operation.
 *
 * During resize the element's edges move but only certain edges are "active"
 * (depending on which handle is dragged). This function snaps all four edges
 * against other elements and returns the adjusted rectangle.
 */
export function findResizeSnapTargets(
  resizingRect: { x: number; y: number; width: number; height: number },
  allElements: SnapRect[],
  options: SnapOptions
): ResizeSnapResult {
  const thresh = effectiveThreshold(options);
  const guides: AlignmentGuide[] = [];

  let { x, y, width, height } = resizingRect;
  const right = x + width;
  const bottom = y + height;

  let bestLeft: SnapCandidate | null = null;
  let bestRight: SnapCandidate | null = null;
  let bestTop: SnapCandidate | null = null;
  let bestBottom: SnapCandidate | null = null;

  if (options.snapToElements) {
    for (const other of allElements) {
      const otherRight = other.x + other.width;
      const otherBottom = other.y + other.height;

      // Snap left edge
      const dLeft = Math.abs(x - other.x);
      if (dLeft <= thresh) {
        bestLeft = bestCandidate(bestLeft, {
          distance: dLeft,
          snappedPosition: other.x,
          guidePosition: other.x,
          guideType: 'vertical',
        });
      }
      const dLeftToRight = Math.abs(x - otherRight);
      if (dLeftToRight <= thresh) {
        bestLeft = bestCandidate(bestLeft, {
          distance: dLeftToRight,
          snappedPosition: otherRight,
          guidePosition: otherRight,
          guideType: 'vertical',
        });
      }

      // Snap right edge
      const dRight = Math.abs(right - otherRight);
      if (dRight <= thresh) {
        bestRight = bestCandidate(bestRight, {
          distance: dRight,
          snappedPosition: otherRight,
          guidePosition: otherRight,
          guideType: 'vertical',
        });
      }
      const dRightToLeft = Math.abs(right - other.x);
      if (dRightToLeft <= thresh) {
        bestRight = bestCandidate(bestRight, {
          distance: dRightToLeft,
          snappedPosition: other.x,
          guidePosition: other.x,
          guideType: 'vertical',
        });
      }

      // Snap top edge
      const dTop = Math.abs(y - other.y);
      if (dTop <= thresh) {
        bestTop = bestCandidate(bestTop, {
          distance: dTop,
          snappedPosition: other.y,
          guidePosition: other.y,
          guideType: 'horizontal',
        });
      }
      const dTopToBottom = Math.abs(y - otherBottom);
      if (dTopToBottom <= thresh) {
        bestTop = bestCandidate(bestTop, {
          distance: dTopToBottom,
          snappedPosition: otherBottom,
          guidePosition: otherBottom,
          guideType: 'horizontal',
        });
      }

      // Snap bottom edge
      const dBottom = Math.abs(bottom - otherBottom);
      if (dBottom <= thresh) {
        bestBottom = bestCandidate(bestBottom, {
          distance: dBottom,
          snappedPosition: otherBottom,
          guidePosition: otherBottom,
          guideType: 'horizontal',
        });
      }
      const dBottomToTop = Math.abs(bottom - other.y);
      if (dBottomToTop <= thresh) {
        bestBottom = bestCandidate(bestBottom, {
          distance: dBottomToTop,
          snappedPosition: other.y,
          guidePosition: other.y,
          guideType: 'horizontal',
        });
      }
    }
  }

  // Apply snaps - prefer whichever edge had the closer match
  if (bestLeft && (!bestRight || bestLeft.distance <= bestRight.distance)) {
    const delta = bestLeft.snappedPosition - x;
    x = bestLeft.snappedPosition;
    width -= delta;
    guides.push({ type: bestLeft.guideType, position: bestLeft.guidePosition });
  } else if (bestRight) {
    width = bestRight.snappedPosition - x;
    guides.push({ type: bestRight.guideType, position: bestRight.guidePosition });
  }

  if (bestTop && (!bestBottom || bestTop.distance <= bestBottom.distance)) {
    const delta = bestTop.snappedPosition - y;
    y = bestTop.snappedPosition;
    height -= delta;
    guides.push({ type: bestTop.guideType, position: bestTop.guidePosition });
  } else if (bestBottom) {
    height = bestBottom.snappedPosition - y;
    guides.push({ type: bestBottom.guideType, position: bestBottom.guidePosition });
  }

  // Grid snapping for resize
  if (options.snapToGrid) {
    if (!bestLeft && !bestRight) {
      const gridSnap = snapToGrid(x + width, options.gridSize, thresh);
      if (gridSnap.didSnap) {
        width = gridSnap.snapped - x;
      }
    }
    if (!bestTop && !bestBottom) {
      const gridSnap = snapToGrid(y + height, options.gridSize, thresh);
      if (gridSnap.didSnap) {
        height = gridSnap.snapped - y;
      }
    }
  }

  return { x, y, width, height, guides };
}
