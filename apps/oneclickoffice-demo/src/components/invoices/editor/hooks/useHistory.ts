import { useState, useCallback, useRef } from 'react';
import type { Element } from '../types';

const MAX_HISTORY = 50;

interface HistoryState {
  entries: Element[][];
  index: number;
}

/**
 * Command-pattern undo/redo history.
 *
 * Unlike the old implementation which recorded every intermediate drag frame
 * via a useEffect on `elements`, this hook only records snapshots when the
 * caller explicitly calls `pushState` (e.g. on drag-end, resize-end,
 * property change, add, or delete).
 */
export function useHistory(initialElements: Element[]) {
  const [state, setState] = useState<HistoryState>(() => ({
    entries: [structuredClone(initialElements)],
    index: 0,
  }));

  // Keep a ref so callbacks always see the latest state without needing it
  // in their dependency arrays (avoids re-creating stable callbacks).
  const stateRef = useRef(state);
  stateRef.current = state;

  /**
   * Record a new snapshot.  Truncates any future entries (redo stack) and
   * enforces the MAX_HISTORY cap without the off-by-one that plagued the
   * old code (which could exceed 50 due to `Math.min(prev + 1, 49)`
   * running *after* the push).
   */
  const pushState = useCallback((elements: Element[]) => {
    setState(prev => {
      // Discard anything after the current position (kills redo branch)
      const truncated = prev.entries.slice(0, prev.index + 1);
      truncated.push(structuredClone(elements));

      // If we exceed the cap, drop the oldest entry
      if (truncated.length > MAX_HISTORY) {
        truncated.shift();
        return { entries: truncated, index: truncated.length - 1 };
      }

      return { entries: truncated, index: truncated.length - 1 };
    });
  }, []);

  /**
   * Step backward.  Returns the restored elements or `null` if nothing to undo.
   */
  const undo = useCallback((): Element[] | null => {
    const { entries, index } = stateRef.current;
    if (index <= 0) return null;

    const newIndex = index - 1;
    const restored = structuredClone(entries[newIndex]);
    setState({ entries, index: newIndex });
    return restored;
  }, []);

  /**
   * Step forward.  Returns the restored elements or `null` if nothing to redo.
   */
  const redo = useCallback((): Element[] | null => {
    const { entries, index } = stateRef.current;
    if (index >= entries.length - 1) return null;

    const newIndex = index + 1;
    const restored = structuredClone(entries[newIndex]);
    setState({ entries, index: newIndex });
    return restored;
  }, []);

  /**
   * Replace the full history (useful when loading a template from DB).
   */
  const reset = useCallback((elements: Element[]) => {
    setState({
      entries: [structuredClone(elements)],
      index: 0,
    });
  }, []);

  const canUndo = state.index > 0;
  const canRedo = state.index < state.entries.length - 1;
  const currentElements = state.entries[state.index];

  return { pushState, undo, redo, canUndo, canRedo, currentElements, reset } as const;
}
