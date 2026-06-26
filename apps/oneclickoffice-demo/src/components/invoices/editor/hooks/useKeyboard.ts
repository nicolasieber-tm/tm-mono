import { useEffect, useRef } from 'react';
import type { Element, CanvasConfig } from '../types';

interface UseKeyboardOptions {
  /** Current elements array, needed to read positions for arrow-key nudge */
  elements: Element[];
  selectedElementIds: Set<string>;
  updateElement: (id: string, updates: Partial<Element>) => void;
  deleteElements: (ids: string[]) => void;
  selectAll: () => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  canvasConfig: CanvasConfig;
}

/**
 * Registers global keyboard shortcuts for the template editor.
 *
 * Shortcuts:
 * - Arrow keys: nudge selected elements 1px (or gridSize when snap-to-grid)
 * - Shift+Arrow: nudge 10px
 * - Delete / Backspace: delete selected elements
 * - Ctrl/Cmd+Z: undo
 * - Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z: redo
 * - Ctrl/Cmd+A: select all
 * - Escape: clear selection
 *
 * All shortcuts are suppressed when the focus is inside an input, textarea,
 * or contentEditable element (except undo/redo which always work).
 */
export function useKeyboard(options: UseKeyboardOptions): void {
  // Use a ref so the handler always sees the latest options without
  // needing them in the effect dependency array (which would re-register
  // the listener on every render).
  const optRef = useRef(options);
  optRef.current = options;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const opts = optRef.current;
      const target = e.target as HTMLElement;

      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.isContentEditable;

      const isModifier = e.ctrlKey || e.metaKey;

      // ---- Undo / Redo (always active, even in inputs) ----

      if (isModifier && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        opts.undo();
        return;
      }

      if (isModifier && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        opts.redo();
        return;
      }

      // ---- Everything below is suppressed in input fields ----

      if (isInputField) return;

      // ---- Select all ----

      if (isModifier && e.key === 'a') {
        e.preventDefault();
        opts.selectAll();
        return;
      }

      // ---- Escape ----

      if (e.key === 'Escape') {
        e.preventDefault();
        opts.clearSelection();
        return;
      }

      // ---- Delete / Backspace ----

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (opts.selectedElementIds.size > 0) {
          e.preventDefault();
          opts.deleteElements([...opts.selectedElementIds]);
        }
        return;
      }

      // ---- Arrow key nudge ----

      const arrowMap: Record<string, { dx: number; dy: number }> = {
        ArrowUp: { dx: 0, dy: -1 },
        ArrowDown: { dx: 0, dy: 1 },
        ArrowLeft: { dx: -1, dy: 0 },
        ArrowRight: { dx: 1, dy: 0 },
      };

      const arrow = arrowMap[e.key];
      if (arrow && opts.selectedElementIds.size > 0) {
        e.preventDefault();

        let step: number;
        if (e.shiftKey) {
          step = 10;
        } else if (opts.canvasConfig.snapToGrid) {
          step = opts.canvasConfig.gridSize;
        } else {
          step = 1;
        }

        const dx = arrow.dx * step;
        const dy = arrow.dy * step;

        for (const id of opts.selectedElementIds) {
          const el = opts.elements.find(e => e.id === id);
          if (!el) continue;

          opts.updateElement(id, {
            x: Math.max(0, el.x + dx),
            y: Math.max(0, el.y + dy),
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
