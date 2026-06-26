// =============================================================================
// Geometry Utilities
// Pure coordinate-transform and geometric test functions for the template editor.
// =============================================================================

/**
 * Convert screen (mouse) coordinates to canvas coordinates.
 *
 * @param screenX - Mouse X in viewport pixels
 * @param screenY - Mouse Y in viewport pixels
 * @param zoom    - Current canvas zoom factor (1 = 100%)
 * @param offsetX - Canvas element's left offset from viewport (e.g. getBoundingClientRect().left)
 * @param offsetY - Canvas element's top offset from viewport
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: (screenX - offsetX) / zoom,
    y: (screenY - offsetY) / zoom,
  };
}

/**
 * Convert canvas coordinates back to screen (viewport) coordinates.
 */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  zoom: number,
  offsetX: number,
  offsetY: number
): { x: number; y: number } {
  return {
    x: canvasX * zoom + offsetX,
    y: canvasY * zoom + offsetY,
  };
}

/**
 * Calculate the length of a line segment.
 */
export function lineLength(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle of a line segment in degrees (0-360).
 * 0 degrees points right, 90 degrees points down.
 */
export function lineAngle(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const radians = Math.atan2(y2 - y1, x2 - x1);
  const degrees = (radians * 180) / Math.PI;
  // Normalize to 0-360
  return ((degrees % 360) + 360) % 360;
}

/**
 * Check if a point lies inside a rectangle.
 *
 * @param px, py - Point coordinates
 * @param rx, ry - Rectangle top-left corner
 * @param rw, rh - Rectangle width and height
 */
export function pointInRect(
  px: number,
  py: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Check if two rectangles overlap (share any area).
 * Used for lasso/marquee selection.
 */
export function rectsOverlap(
  r1: { x: number; y: number; w: number; h: number },
  r2: { x: number; y: number; w: number; h: number }
): boolean {
  // Two rects do NOT overlap if one is entirely to the left, right,
  // above, or below the other.
  if (r1.x + r1.w <= r2.x) return false;
  if (r2.x + r2.w <= r1.x) return false;
  if (r1.y + r1.h <= r2.y) return false;
  if (r2.y + r2.h <= r1.y) return false;
  return true;
}
