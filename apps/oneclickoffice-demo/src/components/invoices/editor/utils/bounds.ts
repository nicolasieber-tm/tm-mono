// =============================================================================
// Canvas Bounds Utilities
// Pure functions for clamping elements within canvas boundaries.
// =============================================================================

/**
 * Clamp an element's position so it stays fully within the canvas.
 * The element's top-left corner is adjusted so that the entire rectangle
 * (x, y, width, height) fits inside (0, 0, canvasWidth, canvasHeight).
 */
export function clampToCanvas(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(x, canvasWidth - width)),
    y: Math.max(0, Math.min(y, canvasHeight - height)),
  };
}

/**
 * Check whether any part of the element extends outside the canvas.
 * Returns true if the element is partially or fully out of bounds.
 */
export function isOutOfBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number
): boolean {
  return x < 0 || y < 0 || x + width > canvasWidth || y + height > canvasHeight;
}

/**
 * Clamp a resize operation so the resulting rectangle stays within the canvas
 * and respects minimum dimensions.
 *
 * Unlike clampToCanvas (which only moves position), this also constrains the
 * width and height, ensuring the element does not shrink below minimums.
 */
export function clampResize(
  x: number,
  y: number,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
  minWidth: number = 10,
  minHeight: number = 10
): { x: number; y: number; width: number; height: number } {
  // Enforce minimum dimensions first
  let clampedWidth = Math.max(width, minWidth);
  let clampedHeight = Math.max(height, minHeight);

  // Clamp position so top-left doesn't go negative
  let clampedX = Math.max(0, x);
  let clampedY = Math.max(0, y);

  // If moving x rightward due to clamping, shrink width to compensate
  // (preserves the right edge when left edge was out of bounds)
  if (clampedX !== x) {
    clampedWidth = clampedWidth - (clampedX - x);
    clampedWidth = Math.max(clampedWidth, minWidth);
  }
  if (clampedY !== y) {
    clampedHeight = clampedHeight - (clampedY - y);
    clampedHeight = Math.max(clampedHeight, minHeight);
  }

  // Clamp right/bottom edges to canvas
  if (clampedX + clampedWidth > canvasWidth) {
    clampedWidth = canvasWidth - clampedX;
    clampedWidth = Math.max(clampedWidth, minWidth);
  }
  if (clampedY + clampedHeight > canvasHeight) {
    clampedHeight = canvasHeight - clampedY;
    clampedHeight = Math.max(clampedHeight, minHeight);
  }

  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight,
  };
}
