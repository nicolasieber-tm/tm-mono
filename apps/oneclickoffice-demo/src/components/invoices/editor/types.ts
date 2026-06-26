// =============================================================================
// Template Editor Types
// Extracted from ModernTemplateEditor.tsx and improved for modularity.
// =============================================================================

/** Canvas element that can be placed and manipulated on the template editor. */
export interface Element {
  id: string;
  type: 'text' | 'graphic' | 'placeholder' | 'image' | 'line' | 'rectangle' | 'circle';
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  imageUrl?: string;
  /** Alternative image source (used by DraggableElement for backwards compat) */
  src?: string;
  /** Explicit z-index layer ordering */
  zIndex?: number;
  // Line endpoints
  x2?: number;
  y2?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  // Positions table
  isPositionsTable?: boolean;
  tableGroupId?: string;
  tableColumn?: 'header' | 'beschreibung' | 'menge' | 'einzelpreis' | 'gesamtpreis';
  rowSpacing?: number;
  columnSpacing?: number;
  titleSpacing?: number;
  alternatingRows?: boolean;
  alternateRowColor?: string;
  // Advanced table styling
  tableBorderColor?: string;
  tableBorderWidth?: number;
  tableBorderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  tableTextAlign?: 'left' | 'center' | 'right';
  tableVerticalAlign?: 'top' | 'middle' | 'bottom';
  tablePadding?: number;
  tableLineHeight?: number;
  // Table grid lines (stored on first element of group)
  showVerticalGridLines?: boolean;
  showHorizontalGridLines?: boolean;
  gridLineColor?: string;
  gridLineWidth?: number;
  gridLineStyle?: 'solid' | 'dashed' | 'dotted';
  // v0.7.0: Zonen-Modell fuer Mehrseiten-Rechnungen
  // - 'header': absolut oben, erscheint nur auf Seite 1 (ausser repeatOnEveryPage=true)
  // - 'body' (default): fliesst mit der Positions-Tabelle mit
  // - 'footer': absolut am Seitenende, erscheint nur auf letzter Seite
  anchor?: 'header' | 'body' | 'footer';
  /** Wenn true, erscheint ein Header-Element auch auf Folgeseiten (z.B. Logo). */
  repeatOnEveryPage?: boolean;
}

/** Configuration for the editor canvas (A4 at 96 DPI by default). */
export interface CanvasConfig {
  width: number;
  height: number;
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  snapToElements: boolean;
  snapThreshold: number;
}

/** A visual alignment guide rendered during drag/resize operations. */
export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  label?: string;
}

/** A snapshot of element state for undo/redo history. */
export interface HistoryEntry {
  elements: Element[];
  timestamp: number;
}

/** Tracks current drag operation state. */
export interface DragState {
  isDragging: boolean;
  elementId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

/** Resize handle definition for element selection box. */
export interface ResizeHandle {
  position: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';
  cursor: string;
}

export const RESIZE_HANDLES: ResizeHandle[] = [
  { position: 'n', cursor: 'n-resize' },
  { position: 'ne', cursor: 'ne-resize' },
  { position: 'e', cursor: 'e-resize' },
  { position: 'se', cursor: 'se-resize' },
  { position: 's', cursor: 's-resize' },
  { position: 'sw', cursor: 'sw-resize' },
  { position: 'w', cursor: 'w-resize' },
  { position: 'nw', cursor: 'nw-resize' },
];

/** Default A4 canvas at 96 DPI. */
export const DEFAULT_CANVAS: CanvasConfig = {
  width: 794,
  height: 1123,
  zoom: 1,
  gridSize: 20,
  showGrid: true,
  showRulers: true,
  snapToGrid: true,
  snapToElements: true,
  snapThreshold: 5,
};
