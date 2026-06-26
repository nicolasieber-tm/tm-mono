import React, { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Type, Square, Minus, Circle, Copy, X, ArrowRightLeft } from 'lucide-react';
import { useIsSingleLevel } from '@/hooks/useClientHierarchyMode';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// ── Editor modules ──────────────────────────────────────────────────────────
import type { Element, CanvasConfig } from './editor/types';
import { DEFAULT_CANVAS } from './editor/types';
import { useHistory, useSelection, useDrag, useResize, useKeyboard } from './editor/hooks';
import {
  EditorCanvas,
  DraggableElement,
  AlignmentGuides,
  EditorToolbar,
  PropertiesPanel,
} from './editor/components';

// ── Caret helpers (needed for inline placeholder insertion) ─────────────────
const getCaretOffset = (element: HTMLElement): number | null => {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    return element.selectionStart ?? null;
  }
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!element.contains(range.startContainer)) return null;
  const preRange = range.cloneRange();
  preRange.selectNodeContents(element);
  preRange.setEnd(range.startContainer, range.startOffset);
  return preRange.toString().length;
};

const setCaretOffset = (element: HTMLElement, offset: number | null) => {
  if (offset == null) return;
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    element.setSelectionRange(offset, offset);
    return;
  }
  const selection = window.getSelection();
  if (!selection) return;
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);
  let currentNode: Node | null = walker.nextNode();
  let remaining = offset;
  while (currentNode) {
    const textLength = currentNode.textContent?.length ?? 0;
    if (remaining <= textLength) {
      const range = document.createRange();
      range.setStart(currentNode, remaining);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    remaining -= textLength;
    currentNode = walker.nextNode();
  }
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

// ── Props ───────────────────────────────────────────────────────────────────
interface ModernTemplateEditorProps {
  templateId: string;
  initialHtml?: string;
  initialCss?: string;
  initialDeckblattEnabled?: boolean;
  initialDeckblattHtml?: string;
  initialDeckblattCss?: string;
  onSave?: () => void;
}

// ── Placeholder constants ───────────────────────────────────────────────────
const PLACEHOLDERS = [
  { key: 'logo', label: 'Firmen-Logo', type: 'image', color: '#7c3aed', bgColor: '#f3e8ff' },
  { key: 'firma', label: 'Firma', type: 'text', color: '#2563eb', bgColor: '#dbeafe' },
  { key: 'kundeAnrede', label: 'Kunde Anrede', type: 'text', color: '#2563eb', bgColor: '#dbeafe' },
  { key: 'kundeAnredeBrief', label: 'Kunde Höflichkeitsanrede ohne Name', type: 'text', color: '#2563eb', bgColor: '#dbeafe' },
  { key: 'kundeHoeflichkeitsanrede', label: 'Kunde Höflichkeitsanrede', type: 'text', color: '#2563eb', bgColor: '#dbeafe' },
  { key: 'ansprechperson', label: 'Ansprechperson Name', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonName', label: 'Ansprechperson Name', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonVorname', label: 'Ansprechperson Vorname', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonNachname', label: 'Ansprechperson Nachname', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonAnrede', label: 'Ansprechperson Anrede', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonAnredeBrief', label: 'Ansprechperson Höflichkeitsanrede ohne Name', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'ansprechpersonHoeflichkeitsanrede', label: 'Ansprechperson Höflichkeitsanrede', type: 'text', color: '#6366f1', bgColor: '#e0e7ff' },
  { key: 'mitarbeiterName', label: 'Zustaendiger Mitarbeiter', type: 'text', color: '#10b981', bgColor: '#d1fae5' },
  { key: 'mitarbeiterStundensatz', label: 'Mitarbeiter Stundensatz', type: 'text', color: '#10b981', bgColor: '#d1fae5' },
  { key: 'klientAnrede', label: 'Klient Anrede', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientAnredeBrief', label: 'Klient Höflichkeitsanrede ohne Name', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientHoeflichkeitsanrede', label: 'Klient Höflichkeitsanrede', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientVorname', label: 'Klient Vorname', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientNachname', label: 'Klient Nachname', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientAdresse', label: 'Klient Adresse', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientPlz', label: 'Klient PLZ', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientOrt', label: 'Klient Stadt', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientGeburtstag', label: 'Klient Geburtstag', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientStunden', label: 'Klient Stunden', type: 'text', color: '#8b5cf6', bgColor: '#f3e8ff' },
  { key: 'klientUnternehmenName', label: 'Klient Unternehmen Name', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenAdresse', label: 'Klient Unternehmen Adresse', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenPlz', label: 'Klient Unternehmen PLZ', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenOrt', label: 'Klient Unternehmen Stadt', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenAnsprechperson', label: 'Klient Unternehmen Ansprechperson', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenAnsprechpersonAnrede', label: 'Klient Unternehmen Ansprechperson Anrede', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'klientUnternehmenAnsprechpersonAnredeBrief', label: 'Klient Unternehmen Ansprechperson Höflichkeitsanrede ohne Name', type: 'text', color: '#a855f7', bgColor: '#fae8ff' },
  { key: 'datum', label: 'Datum', type: 'text', color: '#059669', bgColor: '#d1fae5' },
  { key: 'monat', label: 'Monat', type: 'text', color: '#0d9488', bgColor: '#ccfbf1' },
  { key: 'jahr', label: 'Jahr', type: 'text', color: '#0891b2', bgColor: '#cffafe' },
  { key: 'rechnungsnummer', label: 'Rechnungsnummer', type: 'text', color: '#dc2626', bgColor: '#fee2e2' },
  { key: 'betrag', label: 'Betrag', type: 'text', color: '#ea580c', bgColor: '#ffedd5' },
  { key: 'mwst', label: 'MwSt.', type: 'text', color: '#ca8a04', bgColor: '#fef3c7' },
  { key: 'zwischensumme', label: 'Zwischensumme', type: 'text', color: '#0891b2', bgColor: '#cffafe' },
  { key: 'iban', label: 'IBAN', type: 'text', color: '#4f46e5', bgColor: '#e0e7ff' },
  { key: 'qr-code', label: 'QR-Code', type: 'qr', color: '#0891b2', bgColor: '#ecfeff' },
];

const POSITION_PLACEHOLDERS = [
  { key: 'positionen-table', label: 'Positionen Tabelle (komplett)', type: 'table', color: '#6366f1', bgColor: '#eef2ff' },
  { key: 'beschreibung', label: 'Beschreibung', type: 'position-field', color: '#059669', bgColor: '#d1fae5' },
  { key: 'menge', label: 'Menge', type: 'position-field', color: '#0891b2', bgColor: '#cffafe' },
  { key: 'einzelpreis', label: 'Einzelpreis', type: 'position-field', color: '#ea580c', bgColor: '#ffedd5' },
  { key: 'gesamtpreis', label: 'Gesamtpreis', type: 'position-field', color: '#dc2626', bgColor: '#fee2e2' },
];

// ═════════════════════════════════════════════════════════════════════════════
// v0.7.0: Zonen-Modell Visualisierung
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Findet die Positionstabelle und liefert deren Start- und Ende-Y.
 */
function getTableBounds(elements: Element[]): { startY: number; endY: number; rowHeight: number } | null {
  const tableElements = elements.filter((e) => e.isPositionsTable);
  if (tableElements.length === 0) return null;
  const headers = tableElements.filter((e) => e.tableColumn === 'header');
  if (headers.length === 0) return null;
  const startY = Math.min(...headers.map((h) => h.y));
  // Durchschnittliche Zeilenhoehe aus den Data-Columns schaetzen
  const dataCols = tableElements.filter((e) => e.tableColumn !== 'header');
  const rowSpacing = dataCols[0]?.rowSpacing ?? 8;
  const fontSize = dataCols[0]?.fontSize ?? 11;
  const lineHeight = dataCols[0]?.tableLineHeight ?? 1.5;
  const rowHeight = fontSize * lineHeight + rowSpacing * 2;
  // Ende der Tabelle bei Header + 1 Daten-Zeile ist die Designposition.
  // Tatsaechliche Laenge haengt von Daten ab - wir zeigen 1 Zeile unter Header.
  const headerHeight = headers[0]?.height ?? 30;
  const endY = startY + headerHeight + rowHeight;
  return { startY, endY, rowHeight };
}

/**
 * Ankerlinien: gestrichelte horizontale Linien an den Zonen-Grenzen.
 * Blau = Header-Ende / Tabellen-Start
 * Orange = Footer-Anfang (geschaetzt bei bei 15 Positionen)
 */
function ZoneGuides({ elements, canvasWidth }: { elements: Element[]; canvasWidth: number }) {
  const bounds = getTableBounds(elements);
  if (!bounds) return null;

  const { startY, rowHeight } = bounds;
  // Schaetze Footer-Anfang: Tabelle mit 15 Zeilen als "typisch"
  const estimatedFooterY = startY + 30 + 15 * rowHeight + 20;

  const lineStyle = (color: string, y: number, label: string) => (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: `${y}px`,
          width: `${canvasWidth}px`,
          borderTop: `1px dashed ${color}`,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '8px',
          top: `${y - 14}px`,
          fontSize: '9px',
          color,
          background: 'rgba(255,255,255,0.9)',
          padding: '1px 6px',
          borderRadius: '3px',
          pointerEvents: 'none',
          zIndex: 6,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </>
  );

  return (
    <>
      {lineStyle('#3b82f6', startY, 'Kopf-Ende / Tabellen-Start')}
      {estimatedFooterY < 1123 &&
        lineStyle('#f59e0b', estimatedFooterY, 'Geschaetzter Fuss-Start (bei 15 Positionen)')}
    </>
  );
}

/**
 * Zeigt einen Warn-Badge unten rechts wenn Elemente ueberlappen koennten.
 * Die Heuristik: Elemente mit anchor!=footer UND y > (table bottom at 15 rows).
 */
function PageBreakIndicator({ elements }: { elements: Element[] }) {
  const bounds = getTableBounds(elements);
  if (!bounds) return null;

  // Konfliktelemente: Elemente die unterhalb der Tabelle beginnen und NICHT
  // als footer markiert sind - werden bei echten Rechnungen ueberlappt.
  const { startY, rowHeight } = bounds;
  const tableAt15Rows = startY + 30 + 15 * rowHeight + 20;

  const conflicts = elements.filter((el) => {
    if (el.isPositionsTable) return false;
    if (el.anchor === 'footer') return false;
    if (el.anchor === 'body') return false;
    if (el.y < startY) return false;
    return el.y >= startY && el.y < tableAt15Rows + 50;
  });

  if (conflicts.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        right: '12px',
        bottom: '12px',
        background: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '6px',
        padding: '8px 12px',
        fontSize: '11px',
        color: '#92400e',
        maxWidth: '240px',
        zIndex: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px' }}>
        &#9888;&#65039; {conflicts.length} Layout-Konflikt{conflicts.length === 1 ? '' : 'e'}
      </div>
      <div style={{ lineHeight: 1.4 }}>
        Bei ca. 15+ Positionen ueberlappt die Tabelle diese Elemente.
        <br />
        Empfehlung: als <strong>Fuss</strong> markieren.
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Component
// ═════════════════════════════════════════════════════════════════════════════

export default function ModernTemplateEditor({
  templateId,
  initialHtml = '',
  initialCss = '',
  initialDeckblattEnabled = false,
  initialDeckblattHtml = '',
  initialDeckblattCss = '',
  onSave,
}: ModernTemplateEditorProps) {
  // ── Core element state ──────────────────────────────────────────────────
  const [elements, setElements] = useState<Element[]>([]);
  const [editingElementId, setEditingElementId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // ── Mobile drawer state ─────────────────────────────────────────────────
  // Below Tailwind's `lg` breakpoint (1024px) the tools sidebar and the
  // properties panel render as off-canvas drawers. These flags drive the
  // slide-in transform. On `lg+` they are ignored (the panels are static).
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = useState(false);
  const { toast } = useToast();
  const isSingleLevel = useIsSingleLevel();
  const visiblePlaceholders = isSingleLevel
    ? PLACEHOLDERS.filter((p) => !p.key.startsWith('klient') && !p.key.startsWith('ansprechperson'))
    : PLACEHOLDERS.filter((p) => !p.key.startsWith('kunde'));
  const canvasRef = useRef<HTMLDivElement>(null);
  const activeTextareaRef = useRef<HTMLElement | null>(null);
  const autoSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveInternalRef = useRef<((isAutoSave: boolean) => Promise<void>) | null>(null);

  // ── Deckblatt (cover page) state ────────────────────────────────────────
  const [deckblattEnabled, setDeckblattEnabled] = useState(initialDeckblattEnabled);
  const [activePage, setActivePage] = useState<'invoice' | 'deckblatt'>('invoice');
  // Caches: the active page's elements live in `elements`; the other page's
  // elements are stored in the matching ref so both pages survive tab switches.
  const invoiceElementsRef = useRef<Element[]>([]);
  const deckblattElementsRef = useRef<Element[]>([]);
  const activePageRef = useRef<'invoice' | 'deckblatt'>('invoice');
  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  // ── Canvas config ───────────────────────────────────────────────────────
  // On small screens the 794px A4 canvas is wider than the viewport, so we
  // start at a zoom level that fits the full page. Desktop (lg+) keeps 100%.
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_CANVAS };
    if (window.innerWidth >= 1024) return { ...DEFAULT_CANVAS };
    // Approximate available canvas width: viewport minus canvas padding
    // (p-3 on mobile => 24px) with a small safety margin.
    const availableWidth = Math.max(200, window.innerWidth - 40);
    const fitZoom = Math.min(1, availableWidth / DEFAULT_CANVAS.width);
    return { ...DEFAULT_CANVAS, zoom: Math.max(0.25, Math.round(fitZoom * 100) / 100) };
  });

  // ── Modular hooks ───────────────────────────────────────────────────────
  const history = useHistory(elements);

  const selection = useSelection(elements);

  const updateElement = useCallback((id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const pushHistory = useCallback(() => {
    history.pushState(elements);
  }, [elements, history]);

  const drag = useDrag(elements, updateElement, canvasConfig, pushHistory);
  const resize = useResize(elements, updateElement, canvasConfig, pushHistory);

  const deleteElements = useCallback(
    (ids: string[]) => {
      setElements(prev => prev.filter(el => !ids.includes(el.id)));
      selection.clearSelection();
      history.pushState(elements.filter(el => !ids.includes(el.id)));
      toast({
        title: ids.length > 1 ? `${ids.length} Elemente geloescht` : 'Element geloescht',
        description: 'Die ausgewaehlten Elemente wurden entfernt',
      });
    },
    [elements, selection, history, toast],
  );

  const handleUndo = useCallback(() => {
    const restored = history.undo();
    if (restored) {
      setElements(restored);
      toast({ title: 'Rueckgaengig', description: 'Aenderung wurde rueckgaengig gemacht' });
    }
  }, [history, toast]);

  const handleRedo = useCallback(() => {
    const restored = history.redo();
    if (restored) {
      setElements(restored);
      toast({ title: 'Wiederherstellen', description: 'Aenderung wurde wiederhergestellt' });
    }
  }, [history, toast]);

  useKeyboard({
    elements,
    selectedElementIds: selection.selectedElementIds,
    updateElement,
    deleteElements,
    selectAll: selection.selectAll,
    clearSelection: selection.clearSelection,
    undo: handleUndo,
    redo: handleRedo,
    canvasConfig,
  });

  // ── Parse initial HTML/CSS to elements ──────────────────────────────────
  // Track whether the Deckblatt cache has been primed from the initial
  // `initialDeckblattHtml` props. On first switch to the deckblatt tab we
  // parse the HTML (reusing the full `parseHtmlToElements` function) and
  // flag this as done so subsequent switches use the in-memory cache.
  const deckblattHydratedRef = useRef(false);

  // v0.7.0: Migration-Wizard State
  // Zeige beim Oeffnen alter Templates (ohne anchor-Attribute) einen Dialog
  // mit automatischer Zuordnung zu Header/Body/Footer-Zonen.
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
  const [migrationPreview, setMigrationPreview] = useState<{
    header: number;
    body: number;
    footer: number;
  } | null>(null);

  useEffect(() => {
    if (initialHtml && initialCss) {
      parseHtmlToElements(initialHtml, initialCss);
    }
  }, [initialHtml, initialCss]);

  // v0.7.0: Nach dem Parsen pruefen ob Template migriert werden sollte
  useEffect(() => {
    if (elements.length === 0) return;
    // Wenn mindestens ein Element einen anchor hat -> bereits migriert
    const hasAnchors = elements.some((e) => e.anchor !== undefined);
    if (hasAnchors) return;

    // "Spaeter erinnern" check via localStorage
    const dismissKey = `migration_wizard_dismissed_${templateId}`;
    const dismissedUntil = localStorage.getItem(dismissKey);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) return;

    // Heuristik: berechne Vorschau
    const preview = computeMigrationPreview(elements);
    setMigrationPreview(preview);
    setShowMigrationWizard(true);
  }, [elements, templateId]);

  // Heuristik: Elemente in Zonen zuordnen basierend auf y-Position relativ zur Tabelle
  const computeMigrationPreview = (els: Element[]): { header: number; body: number; footer: number } => {
    const bounds = getTableBounds(els);
    const preview = { header: 0, body: 0, footer: 0 };

    els.forEach((el) => {
      if (el.isPositionsTable) {
        preview.body++;
        return;
      }
      if (!bounds) {
        // Kein Tabellen-Element: nutze y < 300 Heuristik
        if (el.y < 300) preview.header++;
        else if (el.y > 900) preview.footer++;
        else preview.body++;
        return;
      }
      const { startY, endY } = bounds;
      const elBottom = el.y + (el.height ?? 0);
      if (elBottom <= startY) preview.header++;
      else if (el.y >= endY + 40) preview.footer++;
      else preview.body++;
    });

    return preview;
  };

  const applyMigration = () => {
    const bounds = getTableBounds(elements);
    const migratedElements = elements.map((el): Element => {
      if (el.anchor) return el;
      if (el.isPositionsTable) return { ...el, anchor: 'body' };
      if (!bounds) {
        if (el.y < 300) return { ...el, anchor: 'header' };
        if (el.y > 900) return { ...el, anchor: 'footer' };
        return { ...el, anchor: 'body' };
      }
      const { startY, endY } = bounds;
      const elBottom = el.y + (el.height ?? 0);
      if (elBottom <= startY) return { ...el, anchor: 'header' };
      if (el.y >= endY + 40) return { ...el, anchor: 'footer' };
      return { ...el, anchor: 'body' };
    });
    setElements(migratedElements);
    history.pushState(migratedElements);
    setShowMigrationWizard(false);
    toast({
      title: 'Template migriert',
      description: `${migrationPreview?.header ?? 0} Kopf, ${migrationPreview?.body ?? 0} Fliess, ${migrationPreview?.footer ?? 0} Fuss zugeordnet. Bitte manuell pruefen und speichern.`,
    });
  };

  const dismissMigrationLater = () => {
    // 14 Tage "Spaeter erinnern"
    const until = Date.now() + 14 * 24 * 60 * 60 * 1000;
    localStorage.setItem(`migration_wizard_dismissed_${templateId}`, String(until));
    setShowMigrationWizard(false);
  };

  const dismissMigrationManual = () => {
    // User waehlt "manuell pruefen" - wir schliessen den Wizard, markieren
    // aber nicht dauerhaft. User kann ueber das neue Property-Panel jedes
    // Element einzeln zuordnen.
    setShowMigrationWizard(false);
  };

  // Switch between invoice and deckblatt pages. Saves the current canvas
  // elements to the outgoing page's ref, then loads the incoming page's
  // cached elements. First time the user opens the deckblatt tab, we parse
  // `initialDeckblattHtml` using the existing parser.
  const handleSwitchPage = useCallback(
    (nextPage: 'invoice' | 'deckblatt') => {
      if (nextPage === activePage) return;

      // Snapshot current elements into the outgoing page's ref
      if (activePage === 'invoice') {
        invoiceElementsRef.current = elements;
      } else {
        deckblattElementsRef.current = elements;
      }

      // Clear UI-level state tied to the old page
      selection.clearSelection();
      setEditingElementId(null);

      if (nextPage === 'deckblatt') {
        if (!deckblattHydratedRef.current && initialDeckblattHtml && initialDeckblattCss) {
          // First visit to the deckblatt tab: parse the stored HTML
          parseHtmlToElements(initialDeckblattHtml, initialDeckblattCss);
          deckblattHydratedRef.current = true;
          // parseHtmlToElements synchronously updates `elements` via setState,
          // so the deckblattElementsRef is populated on the next snapshot.
        } else {
          setElements(deckblattElementsRef.current);
          history.reset(deckblattElementsRef.current);
        }
      } else {
        setElements(invoiceElementsRef.current);
        history.reset(invoiceElementsRef.current);
      }

      setActivePage(nextPage);
    },
    [activePage, elements, initialDeckblattHtml, initialDeckblattCss, selection, history],
  );

  const parseHtmlToElements = (html: string, css: string, applyToCanvas: boolean = true): Element[] => {
    const currentEditingId = editingElementId;
    const currentEditingElement = elements.find(el => el.id === currentEditingId);
    const currentCursorPos = activeTextareaRef.current
      ? getCaretOffset(activeTextareaRef.current)
      : null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const parsedElements: Element[] = [];

    // Parse new table structure
    const tables = doc.querySelectorAll('table[data-is-positions-table="true"]');
    tables.forEach((table, tableIndex) => {
      const tableGroupId = table.getAttribute('data-table-group-id') || `table-${Date.now()}-${tableIndex}`;
      const borderColor = table.getAttribute('data-table-border-color') || '#e5e7eb';
      const borderWidth = parseInt(table.getAttribute('data-table-border-width') || '1');
      const borderStyle = (table.getAttribute('data-table-border-style') as Element['tableBorderStyle']) || 'solid';
      const rowSpacing = parseInt(table.getAttribute('data-row-spacing') || '8');
      const columnSpacing = parseInt(table.getAttribute('data-column-spacing') || '8');
      const alternatingRows = table.getAttribute('data-alternating-rows') !== 'false';
      const alternateRowColor = table.getAttribute('data-alternate-row-color') || '#f9fafb';
      // v0.7.0: Tabellen-Anchor (Default body, weil Tabelle immer mit-fliesst)
      const tableAnchor = (table.getAttribute('data-anchor') as Element['anchor']) || 'body';

      const tableClassName = (table as HTMLElement).className;
      const tableCssMatch = css.match(new RegExp(`\\.${tableClassName}\\s*\\{([^}]+)\\}`, 's'));
      let tableX = 50;
      let tableY = 50;

      if (tableCssMatch) {
        const cssContent = tableCssMatch[1];
        const leftMatch = cssContent.match(/left:\s*([0-9.]+)px/);
        const topMatch = cssContent.match(/top:\s*([0-9.]+)px/);
        tableX = leftMatch ? parseFloat(leftMatch[1]) : 50;
        tableY = topMatch ? parseFloat(topMatch[1]) : 50;
      }

      // Parse headers
      const headers = table.querySelectorAll('thead th');
      let currentX = tableX;

      headers.forEach((th, colIndex) => {
        const content = th.textContent || '';
        const tableColumn = th.getAttribute('data-table-column') || 'header';
        const textAlign = th.getAttribute('data-table-text-align') || 'center';
        const padding = parseInt(th.getAttribute('data-table-padding') || '8');

        const thCssPattern = new RegExp(`\\.${tableClassName}\\s+th:nth-child\\(${colIndex + 1}\\)\\s*\\{([^}]+)\\}`, 's');
        const thCssMatch = css.match(thCssPattern);
        let width = 100;
        let fontSize = 12;
        let color = '#1f2937';
        let backgroundColor = '#f3f4f6';

        if (thCssMatch) {
          const cssContent = thCssMatch[1];
          const widthMatch = cssContent.match(/width:\s*([0-9.]+)px/);
          const fontSizeMatch = cssContent.match(/font-size:\s*([0-9.]+)px/);
          const colorMatch = cssContent.match(/color:\s*([^;]+)/);
          const bgColorMatch = cssContent.match(/background-color:\s*([^;]+)/);

          width = widthMatch ? parseFloat(widthMatch[1]) : 100;
          fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 12;
          color = colorMatch ? colorMatch[1].trim() : '#1f2937';
          backgroundColor = bgColorMatch ? bgColorMatch[1].trim() : '#f3f4f6';
        }

        const headerElement: Element = {
          id: `element-${Date.now()}-header-${colIndex}`,
          type: 'placeholder',
          content,
          x: currentX,
          y: tableY,
          width,
          height: 30,
          fontSize,
          color,
          backgroundColor,
          fontWeight: 'bold',
          tableGroupId,
          tableColumn: 'header',
          isPositionsTable: true,
          tableBorderColor: borderColor,
          tableBorderWidth: borderWidth,
          tableBorderStyle: borderStyle,
          tableTextAlign: textAlign as Element['tableTextAlign'],
          tablePadding: padding,
          showVerticalGridLines: true,
          showHorizontalGridLines: true,
          gridLineColor: borderColor,
          gridLineWidth: borderWidth,
          gridLineStyle: borderStyle,
          anchor: tableAnchor,
        };

        parsedElements.push(headerElement);
        currentX += width;
      });

      // Parse data columns
      const dataColumns = table.querySelectorAll('tbody tr:first-child td');
      currentX = tableX;

      dataColumns.forEach((td, colIndex) => {
        const tableColumn = td.getAttribute('data-table-column') || 'beschreibung';
        const textAlign = td.getAttribute('data-table-text-align') || 'left';

        const tdCssPattern = new RegExp(`\\.${tableClassName}\\s+td:nth-child\\(${colIndex + 1}\\)\\s*\\{([^}]+)\\}`, 's');
        const tdCssMatch = css.match(tdCssPattern);
        let width = 100;
        let fontSize = 11;
        let color = '#000000';
        let lineHeight = 1.5;

        if (tdCssMatch) {
          const cssContent = tdCssMatch[1];
          const widthMatch = cssContent.match(/width:\s*([0-9.]+)px/);
          const fontSizeMatch = cssContent.match(/font-size:\s*([0-9.]+)px/);
          const colorMatch = cssContent.match(/color:\s*([^;]+)/);
          const lineHeightMatch = cssContent.match(/line-height:\s*([0-9.]+)/);

          width = widthMatch ? parseFloat(widthMatch[1]) : 100;
          fontSize = fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 11;
          color = colorMatch ? colorMatch[1].trim() : '#000000';
          lineHeight = lineHeightMatch ? parseFloat(lineHeightMatch[1]) : 1.5;
        }

        const content = td.innerHTML || '';
        const placeholderMatch = content.match(/\{\{([^}]+)\}\}/);
        const fieldName = placeholderMatch ? placeholderMatch[1] : tableColumn;
        const dataContent = `{{#each positionen}}\n{{${fieldName}}}\n{{/each}}`;

        const dataElement: Element = {
          id: `element-${Date.now()}-data-${colIndex}`,
          type: 'placeholder',
          content: dataContent,
          x: currentX,
          y: tableY + 35,
          width,
          height: 120,
          fontSize,
          color,
          backgroundColor: 'transparent',
          tableGroupId,
          tableColumn: tableColumn as Element['tableColumn'],
          isPositionsTable: true,
          rowSpacing,
          columnSpacing,
          tableBorderColor: borderColor,
          tableBorderWidth: borderWidth,
          tableBorderStyle: borderStyle,
          tableTextAlign: textAlign as Element['tableTextAlign'],
          tablePadding: 8,
          tableLineHeight: lineHeight,
          alternatingRows,
          alternateRowColor,
          anchor: tableAnchor,
        };

        parsedElements.push(dataElement);
        currentX += width;
      });
    });

    // Extract all positioned elements
    const positionedDivs = doc.querySelectorAll('div[class^="element-"], div[class^="pdf-"]:not(.pdf-page), div[class^="table-header-"], div[class^="table-data-"]');

    positionedDivs.forEach((div, index) => {
      const className = div.className.split(' ')[0];
      const cssMatch = css.match(new RegExp(`\\.${className}\\s*\\{([^}]+)\\}`, 's'));

      if (cssMatch) {
        const cssContent = cssMatch[1];
        const leftMatch = cssContent.match(/left:\s*([0-9.]+)px/);
        const topMatch = cssContent.match(/top:\s*([0-9.]+)px/);
        const widthMatch = cssContent.match(/width:\s*([0-9.]+)px/);
        const heightMatch = cssContent.match(/height:\s*([0-9.]+)px/);
        const fontSizeMatch = cssContent.match(/font-size:\s*([0-9.]+)px/);
        const colorMatch = cssContent.match(/color:\s*([^;]+)/);
        const bgColorMatch = cssContent.match(/background(?:-color)?:\s*([^;]+)/);
        const borderMatch = cssContent.match(/border:\s*([0-9.]+)px\s+(\w+)\s+([^;]+)/);
        const borderRadiusMatch = cssContent.match(/border-radius:\s*([0-9.]+)(?:px|%)/);
        const transformMatch = cssContent.match(/transform:\s*rotate\(([0-9.]+)deg\)/);
        const opacityMatch = cssContent.match(/opacity:\s*([0-9.]+)/);
        const fontWeightMatch = cssContent.match(/font-weight:\s*([^;]+)/);
        const fontStyleMatch = cssContent.match(/font-style:\s*([^;]+)/);
        const fontFamilyMatch = cssContent.match(/font-family:\s*([^;]+)/);
        const textAlignMatch = cssContent.match(/text-align:\s*([^;]+)/);

        const isPositionsTable = div.getAttribute('data-is-positions-table') === 'true';
        const tableGroupId = div.getAttribute('data-table-group-id') || undefined;
        const tableColumn = (div.getAttribute('data-table-column') as Element['tableColumn']) || undefined;
        // v0.7.0: Zonen-Modell
        const anchor = (div.getAttribute('data-anchor') as Element['anchor']) || undefined;
        const repeatOnEveryPage = div.getAttribute('data-repeat-on-every-page') === 'true';
        const rowSpacing = div.getAttribute('data-row-spacing');
        const columnSpacing = div.getAttribute('data-column-spacing');
        const tableBorderColor = div.getAttribute('data-table-border-color');
        const tableBorderWidth = div.getAttribute('data-table-border-width');
        const tableBorderStyle = div.getAttribute('data-table-border-style') as Element['tableBorderStyle'];
        const tableTextAlign = div.getAttribute('data-table-text-align') as Element['tableTextAlign'];
        const tablePadding = div.getAttribute('data-table-padding');
        const tableLineHeight = div.getAttribute('data-table-line-height');
        const alternatingRows = div.getAttribute('data-alternating-rows') === 'true';
        const alternateRowColor = div.getAttribute('data-alternate-row-color');
        const showVerticalGridLines = div.getAttribute('data-show-vertical-grid-lines') === 'true';
        const showHorizontalGridLines = div.getAttribute('data-show-horizontal-grid-lines') === 'true';
        const gridLineColor = div.getAttribute('data-grid-line-color');
        const gridLineWidth = div.getAttribute('data-grid-line-width');
        const gridLineStyle = div.getAttribute('data-grid-line-style') as Element['gridLineStyle'];

        const lineX2 = div.getAttribute('data-line-x2');
        const lineY2 = div.getAttribute('data-line-y2');
        const lineBorderWidth = div.getAttribute('data-line-border-width');

        const isLine = cssContent.includes('transform-origin: 0 50%');
        const isCircle = borderRadiusMatch && (borderRadiusMatch[1] === '50' || cssContent.includes('border-radius: 50%'));

        const img = div.querySelector('img');
        const isImagePlaceholder = className.includes('pdf-image') ||
                                  div.textContent?.includes('{{logo}}') ||
                                  div.textContent?.includes('{{bild}}');

        let type: Element['type'] = 'text';
        if (isLine) {
          type = 'line';
        } else if (isCircle) {
          type = 'circle';
        } else if (img || isImagePlaceholder) {
          type = 'image';
        } else if (!div.textContent?.trim() && (widthMatch || heightMatch)) {
          type = 'rectangle';
        } else if (className.includes('graphic')) {
          type = 'graphic';
        } else if (div.innerHTML?.includes('{{')) {
          type = 'placeholder';
        }

        const imageUrl = img ? img.getAttribute('src') : undefined;

        let content = '';
        if (type === 'image') {
          content = img?.getAttribute('alt') || div.textContent || '';
        } else {
          const innerHTML = div.innerHTML || '';
          const wrapperDivMatch = innerHTML.match(/^<div[^>]*>([\s\S]*)<\/div>$/);
          if (wrapperDivMatch) {
            content = wrapperDivMatch[1];
          } else {
            content = innerHTML;
          }
        }

        const element: Element = {
          id: `element-${Date.now()}-${index}`,
          type,
          content,
          x: leftMatch ? parseFloat(leftMatch[1]) : 0,
          y: topMatch ? parseFloat(topMatch[1]) : 0,
          width: widthMatch ? parseFloat(widthMatch[1]) : undefined,
          height: heightMatch ? parseFloat(heightMatch[1]) : undefined,
          fontSize: fontSizeMatch ? parseFloat(fontSizeMatch[1]) : 14,
          color: colorMatch ? colorMatch[1].trim() : '#000000',
          backgroundColor: bgColorMatch ? bgColorMatch[1].trim() : undefined,
          fontFamily: fontFamilyMatch ? fontFamilyMatch[1].trim() : undefined,
          fontWeight: fontWeightMatch ? fontWeightMatch[1].trim() : undefined,
          fontStyle: fontStyleMatch ? fontStyleMatch[1].trim() : undefined,
          textAlign: textAlignMatch ? textAlignMatch[1].trim() as Element['textAlign'] : undefined,
          borderColor: borderMatch ? borderMatch[3].trim() : undefined,
          borderWidth: lineBorderWidth ? parseFloat(lineBorderWidth) : (isLine && heightMatch ? parseFloat(heightMatch[1]) : (borderMatch ? parseFloat(borderMatch[1]) : undefined)),
          borderStyle: borderMatch ? borderMatch[2].trim() : undefined,
          borderRadius: borderRadiusMatch && !isCircle ? parseFloat(borderRadiusMatch[1]) : undefined,
          rotation: transformMatch ? parseFloat(transformMatch[1]) : undefined,
          opacity: opacityMatch ? parseFloat(opacityMatch[1]) : undefined,
          imageUrl: imageUrl || undefined,
          x2: lineX2 ? parseFloat(lineX2) : undefined,
          y2: lineY2 ? parseFloat(lineY2) : undefined,
          isPositionsTable: isPositionsTable || undefined,
          tableGroupId: tableGroupId,
          tableColumn: tableColumn,
          rowSpacing: rowSpacing ? parseInt(rowSpacing) : undefined,
          columnSpacing: columnSpacing ? parseInt(columnSpacing) : undefined,
          tableBorderColor: tableBorderColor || undefined,
          tableBorderWidth: tableBorderWidth ? parseInt(tableBorderWidth) : undefined,
          tableBorderStyle: tableBorderStyle || undefined,
          tableTextAlign: tableTextAlign || undefined,
          tablePadding: tablePadding ? parseInt(tablePadding) : undefined,
          tableLineHeight: tableLineHeight ? parseFloat(tableLineHeight) : undefined,
          alternatingRows: alternatingRows || undefined,
          alternateRowColor: alternateRowColor || undefined,
          showVerticalGridLines: showVerticalGridLines || undefined,
          showHorizontalGridLines: showHorizontalGridLines || undefined,
          gridLineColor: gridLineColor || undefined,
          gridLineWidth: gridLineWidth ? parseInt(gridLineWidth) : undefined,
          gridLineStyle: gridLineStyle || undefined,
          anchor,
          repeatOnEveryPage: repeatOnEveryPage || undefined,
        };

        parsedElements.push(element);
      }
    });

    if (!applyToCanvas) {
      return parsedElements;
    }

    setElements(parsedElements);
    history.reset(parsedElements);

    // Restore editing state
    if (currentEditingElement) {
      setTimeout(() => {
        const matchingElement = parsedElements.find((el) => {
          const isSamePosition = Math.abs(el.x - currentEditingElement.x) < 5 && Math.abs(el.y - currentEditingElement.y) < 5;
          const isSameType = el.type === currentEditingElement.type;
          const isSameContent = el.content === currentEditingElement.content;
          return isSamePosition && isSameType && isSameContent;
        });

        if (matchingElement) {
          setEditingElementId(matchingElement.id);
          selection.selectElement(matchingElement.id);
          setTimeout(() => {
            if (activeTextareaRef.current && currentCursorPos !== null) {
              setCaretOffset(activeTextareaRef.current, currentCursorPos);
              activeTextareaRef.current.focus();
            }
          }, 50);
        }
      }, 100);
    }

    return parsedElements;
  };

  // ── Auto-save ─────────────────────────────────────────────────────────
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      if (saveInternalRef.current) {
        saveInternalRef.current(true);
      }
    }, 2000);
  }, []);

  // Push history and auto-save whenever elements change
  useEffect(() => {
    if (elements.length > 0) {
      triggerAutoSave();
    }
  }, [elements, triggerAutoSave]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (elements.length > 0 && (!lastSaved || Date.now() - lastSaved.getTime() > 5000)) {
        if (saveInternalRef.current) {
          saveInternalRef.current(true);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [elements, lastSaved]);

  // ── Element CRUD ────────────────────────────────────────────────────────
  const deleteElement = useCallback(
    (id: string) => {
      setElements(prev => prev.filter(el => el.id !== id));
      selection.clearSelection();
    },
    [selection],
  );

  const duplicateElement = useCallback(
    (id: string) => {
      const el = elements.find(e => e.id === id);
      if (!el) return;
      const newElement: Element = {
        ...el,
        id: `${el.type}-${Date.now()}`,
        x: el.x + 20,
        y: el.y + 20,
      };
      setElements(prev => [...prev, newElement]);
      selection.selectElement(newElement.id);
      toast({ title: 'Element dupliziert', description: 'Das Element wurde erfolgreich kopiert' });
    },
    [elements, selection, toast],
  );

  const copySelectedElementsToOtherPage = useCallback(() => {
    if (selection.selectedElementIds.size === 0) {
      toast({
        title: 'Keine Auswahl',
        description: 'Bitte zuerst ein oder mehrere Elemente auswählen',
      });
      return;
    }

    const sourcePage = activePageRef.current;
    const targetPage = sourcePage === 'invoice' ? 'deckblatt' : 'invoice';
    const selectedIds = new Set(selection.selectedElementIds);
    const selectedTableGroupIds = new Set(
      elements
        .filter(el => selectedIds.has(el.id) && el.tableGroupId)
        .map(el => el.tableGroupId!),
    );

    const sourceElements = elements;
    const elementsToCopy = sourceElements.filter(
      el => selectedIds.has(el.id) || (el.tableGroupId && selectedTableGroupIds.has(el.tableGroupId)),
    );

    if (elementsToCopy.length === 0) return;

    if (sourcePage === 'invoice') {
      invoiceElementsRef.current = sourceElements;
    } else {
      deckblattElementsRef.current = sourceElements;
    }

    let targetElements =
      targetPage === 'invoice' ? invoiceElementsRef.current : deckblattElementsRef.current;

    if (
      targetPage === 'deckblatt' &&
      !deckblattHydratedRef.current &&
      initialDeckblattHtml &&
      initialDeckblattCss
    ) {
      targetElements = parseHtmlToElements(initialDeckblattHtml, initialDeckblattCss, false);
      deckblattElementsRef.current = targetElements;
      deckblattHydratedRef.current = true;
    }

    const copyTimestamp = Date.now();
    const tableGroupIdMap = new Map<string, string>();

    const copiedElements = elementsToCopy.map((el, index): Element => {
      let tableGroupId = el.tableGroupId;
      if (tableGroupId) {
        if (!tableGroupIdMap.has(tableGroupId)) {
          tableGroupIdMap.set(tableGroupId, `table-group-${copyTimestamp}-${tableGroupIdMap.size}`);
        }
        tableGroupId = tableGroupIdMap.get(tableGroupId);
      }

      return {
        ...structuredClone(el),
        id: `${el.type}-${copyTimestamp}-${index}`,
        tableGroupId,
      };
    });

    const nextTargetElements = [...targetElements, ...copiedElements];
    const copiedIds = copiedElements.map(el => el.id);

    if (targetPage === 'invoice') {
      invoiceElementsRef.current = nextTargetElements;
    } else {
      deckblattElementsRef.current = nextTargetElements;
      deckblattHydratedRef.current = true;
      setDeckblattEnabled(true);
    }

    setElements(nextTargetElements);
    history.reset(nextTargetElements);
    setActivePage(targetPage);
    setEditingElementId(null);
    selection.selectElements(copiedIds);

    toast({
      title: targetPage === 'deckblatt' ? 'Auf Deckblatt kopiert' : 'Auf Rechnung kopiert',
      description: `${copiedElements.length} Element${copiedElements.length === 1 ? '' : 'e'} exakt an gleicher Position eingefügt`,
    });
  }, [elements, history, initialDeckblattCss, initialDeckblattHtml, parseHtmlToElements, selection, toast]);

  const addElement = useCallback(
    (newElement: Element) => {
      setElements(prev => [...prev, newElement]);
      selection.selectElement(newElement.id);
    },
    [selection],
  );

  const addTextElement = () => {
    addElement({
      id: `text-${Date.now()}`, type: 'text', content: 'Neuer Text',
      x: 100, y: 100, fontSize: 14, color: '#000000',
    });
  };

  const addLineElement = () => {
    addElement({
      id: `line-${Date.now()}`, type: 'line', content: '',
      x: 100, y: 100, x2: 300, y2: 100, color: '#000000', borderWidth: 2,
    });
  };

  const addRectangleElement = () => {
    addElement({
      id: `rectangle-${Date.now()}`, type: 'rectangle', content: '',
      x: 100, y: 100, width: 200, height: 100,
      backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 2, borderStyle: 'solid',
    });
  };

  const addCircleElement = () => {
    addElement({
      id: `circle-${Date.now()}`, type: 'circle', content: '',
      x: 100, y: 100, width: 100, height: 100,
      backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 2, borderStyle: 'solid',
    });
  };

  // ── Editing management ────────────────────────────────────────────────
  const handleStartEditing = (elementId: string, textareaRef: HTMLElement) => {
    setEditingElementId(elementId);
    activeTextareaRef.current = textareaRef;
  };

  const handleStopEditing = () => {
    setEditingElementId(null);
    activeTextareaRef.current = null;
  };

  const insertPlaceholderAtCursor = (placeholderKey: string): boolean => {
    if (!activeTextareaRef.current || !editingElementId) return false;

    const editableDiv = activeTextareaRef.current;
    const placeholder = `{{${placeholderKey}}}`;

    if (editableDiv.contentEditable === 'true') {
      editableDiv.focus();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) {
        const currentContent = editableDiv.innerHTML;
        updateElement(editingElementId, { content: currentContent + placeholder });
        setTimeout(() => {
          editableDiv.focus();
          const range = document.createRange();
          const s = window.getSelection();
          range.selectNodeContents(editableDiv);
          range.collapse(false);
          s?.removeAllRanges();
          s?.addRange(range);
        }, 10);
      } else {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(placeholder);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        updateElement(editingElementId, { content: editableDiv.innerHTML });
      }
    } else {
      const textarea = editableDiv as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = textarea.value;
      const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end);
      updateElement(editingElementId, { content: newValue });
      setTimeout(() => {
        const newCursorPos = start + placeholder.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        textarea.focus();
      }, 10);
    }

    return true;
  };

  // ── HTML/CSS generation helper (shared by invoice + deckblatt pages) ───
  const generateHtmlCssForElements = useCallback(
    (els: Element[]): { fullHtml: string; css: string } => {
      const canvasWidth = canvasConfig.width;
      const canvasHeight = canvasConfig.height;

      let html = `<div class="pdf-page" style="position: relative; width: ${canvasWidth}px; height: ${canvasHeight}px; margin: 0 auto; background: white;">`;
      let css = `
        .pdf-page {
          position: relative;
          width: ${canvasWidth}px;
          height: ${canvasHeight}px;
          margin: 20px auto;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
      `;

      const processedTableGroups = new Set<string>();

      // v0.7.0: Helper fuer Zonen-Attribute. Wird auf jedes HTML-Tag gesetzt,
      // damit die Edge Function beim Paginieren die Seitennummer pro Zone
      // korrekt behandeln kann (Header nur Seite 1, Footer nur letzte Seite).
      const anchorAttrs = (el: Element): string => {
        const parts: string[] = [];
        if (el.anchor) parts.push(`data-anchor="${el.anchor}"`);
        if (el.repeatOnEveryPage) parts.push('data-repeat-on-every-page="true"');
        return parts.length > 0 ? ' ' + parts.join(' ') : '';
      };

      els.forEach((el, index) => {
        const className = `element-${index}`;

        if (el.tableGroupId && processedTableGroups.has(el.tableGroupId)) return;

        if (el.tableGroupId && el.isPositionsTable) {
          processedTableGroups.add(el.tableGroupId);

          const tableElements = els.filter(e => e.tableGroupId === el.tableGroupId);
          const headers = tableElements.filter(e => e.tableColumn === 'header');
          const dataColumns = tableElements.filter(e => e.tableColumn !== 'header');
          const sortedHeaders = [...headers].sort((a, b) => a.x - b.x);
          const sortedDataColumns = [...dataColumns].sort((a, b) => a.x - b.x);

          const allCols = [...headers, ...dataColumns];
          const minX = Math.min(...allCols.map(c => c.x));
          const minY = Math.min(...allCols.map(c => c.y));
          const tableWidth = Math.max(...allCols.map(c => c.x + (c.width || 0))) - minX;

          const firstHeader = sortedHeaders[0];
          const borderColor = firstHeader?.tableBorderColor || '#e5e7eb';
          const borderWidth = firstHeader?.tableBorderWidth || 1;
          const borderStyle = firstHeader?.tableBorderStyle || 'solid';
          const showBorders = borderStyle !== 'none';
          const rowSpacing = sortedDataColumns[0]?.rowSpacing || 8;
          const columnSpacing = sortedDataColumns[0]?.columnSpacing || 8;
          const alternatingRows = sortedDataColumns[0]?.alternatingRows !== false;
          const alternateRowColor = sortedDataColumns[0]?.alternateRowColor || '#f9fafb';

          const tableClass = `positions-table-${firstHeader?.tableGroupId}`;

          css += `
            .${tableClass} {
              position: absolute;
              left: ${minX}px;
              top: ${minY}px;
              width: ${tableWidth}px;
              border-collapse: collapse;
              ${showBorders ? `border: ${borderWidth}px ${borderStyle} ${borderColor};` : ''}
            }
            .${tableClass} th {
              font-weight: bold;
              text-align: center;
              vertical-align: middle;
              padding: ${firstHeader?.tablePadding || 8}px;
              ${showBorders ? `border: ${borderWidth}px ${borderStyle} ${borderColor};` : ''}
            }
            .${tableClass} td {
              padding: ${rowSpacing}px ${columnSpacing}px;
              vertical-align: middle;
              ${showBorders ? `border: ${borderWidth}px ${borderStyle} ${borderColor};` : ''}
            }
            ${alternatingRows ? `
            .${tableClass} tbody tr:nth-child(even) {
              background-color: ${alternateRowColor};
            }
            ` : ''}
          `;

          sortedHeaders.forEach((header, idx) => {
            css += `
            .${tableClass} th:nth-child(${idx + 1}) {
              width: ${header.width}px;
              font-size: ${header.fontSize || 12}px;
              color: ${header.color};
              background-color: ${header.backgroundColor};
              text-align: ${header.tableTextAlign || 'center'};
            }
            `;
          });

          sortedDataColumns.forEach((dataCol, idx) => {
            css += `
            .${tableClass} td:nth-child(${idx + 1}) {
              width: ${dataCol.width}px;
              font-size: ${dataCol.fontSize || 11}px;
              color: ${dataCol.color};
              text-align: ${dataCol.tableTextAlign || 'left'};
              line-height: ${dataCol.tableLineHeight || 1.5};
            }
            `;
          });

          // Default-Anchor der Positions-Tabelle: body (fliesst ueber Seiten)
          const tableAnchor = firstHeader?.anchor ?? 'body';
          const containerDataAttrs = `data-table-group-id="${firstHeader?.tableGroupId}" data-is-positions-table="true" data-table-border-color="${borderColor}" data-table-border-width="${borderWidth}" data-table-border-style="${borderStyle}" data-row-spacing="${rowSpacing}" data-column-spacing="${columnSpacing}" data-alternating-rows="${alternatingRows}" data-alternate-row-color="${alternateRowColor}" data-anchor="${tableAnchor}"`;

          html += `<table class="${tableClass}" ${containerDataAttrs}>\n`;
          html += '  <thead>\n    <tr>\n';

          sortedHeaders.forEach(header => {
            const headerDataAttrs = `data-table-column="${header.tableColumn}" data-table-text-align="${header.tableTextAlign || 'center'}" data-table-padding="${header.tablePadding || 8}"`;
            html += `      <th ${headerDataAttrs}>${header.content}</th>\n`;
          });

          html += '    </tr>\n  </thead>\n';
          html += '  <tbody>\n';
          html += '    {{#each positionen}}\n    <tr>\n';

          sortedDataColumns.forEach(dataCol => {
            const fieldMatch = dataCol.content.match(/\{\{([^}#/]+)\}\}/);
            const fieldName = fieldMatch ? fieldMatch[1].trim() : 'beschreibung';
            const cellDataAttrs = `data-table-column="${dataCol.tableColumn}" data-table-text-align="${dataCol.tableTextAlign || 'left'}"`;
            html += `      <td ${cellDataAttrs}>{{${fieldName}}}</td>\n`;
          });

          html += '    </tr>\n    {{/each}}\n';
          html += '  </tbody>\n</table>\n';
          return;
        }

        if (el.type === 'line') {
          const length = Math.sqrt(
            Math.pow((el.x2 || el.x) - el.x, 2) + Math.pow((el.y2 || el.y) - el.y, 2),
          );
          const angle = (Math.atan2((el.y2 || el.y) - el.y, (el.x2 || el.x) - el.x) * 180) / Math.PI;

          css += `
            .${className} {
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              width: ${length}px;
              height: ${el.borderWidth || 2}px;
              background-color: ${el.color || '#000000'};
              transform-origin: 0 50%;
              transform: rotate(${angle}deg);
            }
          `;
          html += `<div class="${className}"${anchorAttrs(el)} data-line-x2="${el.x2 || el.x}" data-line-y2="${el.y2 || el.y}" data-line-border-width="${el.borderWidth || 2}"></div>\n`;
        } else {
          const isDataPlaceholder = el.type === 'placeholder' && /\{\{[^}]+\}\}/.test(el.content || '');
          const textColor = isDataPlaceholder ? '#000000' : el.color;
          const backgroundColor = isDataPlaceholder ? 'transparent' : el.backgroundColor;
          css += `
            .${className} {
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              ${el.width ? `width: ${el.width}px;` : ''}
              ${el.height ? `height: ${el.height}px;` : ''}
              ${el.fontSize ? `font-size: ${el.fontSize}px;` : ''}
              ${textColor ? `color: ${textColor};` : ''}
              ${backgroundColor ? `background-color: ${backgroundColor};` : ''}
              ${el.fontFamily ? `font-family: ${el.fontFamily};` : ''}
              ${el.fontWeight ? `font-weight: ${el.fontWeight};` : ''}
              ${el.fontStyle ? `font-style: ${el.fontStyle};` : ''}
              ${el.textAlign ? `text-align: ${el.textAlign};` : ''}
              white-space: pre-wrap;
              ${el.borderColor ? `border: ${el.borderWidth || 1}px ${el.borderStyle || 'solid'} ${el.borderColor};` : ''}
              ${el.borderRadius ? `border-radius: ${el.borderRadius}px;` : ''}
              ${el.rotation ? `transform: rotate(${el.rotation}deg);` : ''}
              ${el.opacity !== undefined ? `opacity: ${el.opacity};` : ''}
            }
          `;

          if (el.type === 'circle') {
            css += `
              .${className} {
                border-radius: 50%;
              }
            `;
          }

          if (el.type === 'image') {
            if (el.imageUrl) {
              html += `<div class="${className}"${anchorAttrs(el)}><img src="${el.imageUrl}" alt="${el.content}" style="width: 100%; height: 100%; object-fit: contain;" /></div>\n`;
            } else {
              html += `<div class="${className}"${anchorAttrs(el)}>${el.content}</div>\n`;
            }
          } else if (el.type === 'rectangle' || el.type === 'circle') {
            html += `<div class="${className}"${anchorAttrs(el)}></div>\n`;
          } else if (el.isPositionsTable) {
            const rowSpacing = el.rowSpacing || 8;
            const columnSpacing = el.columnSpacing || 12;
            const titleSpacing = el.titleSpacing || 16;
            const alternatingRows = el.alternatingRows !== false;
            const alternateColor = el.alternateRowColor || '#f9fafb';
            const primaryColor = el.backgroundColor || '#ffffff';

            html += `<div class="${className}"${anchorAttrs(el)}>
  <style>
    .${className} {
      padding-top: ${titleSpacing}px;
    }
    .${className} .position-row {
      padding: ${rowSpacing}px ${columnSpacing}px;
      margin-bottom: ${rowSpacing}px;
    }
    ${alternatingRows ? `
    .${className} .position-row:nth-child(odd) {
      background-color: ${primaryColor};
    }
    .${className} .position-row:nth-child(even) {
      background-color: ${alternateColor};
    }
    ` : ''}
  </style>
  {{#each positionen}}
  <div class="position-row">
    Pos: {{beschreibung}} - {{menge}} x CHF {{einzelpreis}} = CHF {{gesamtpreis}}
  </div>
  {{/each}}
</div>\n`;
          } else {
            const placeholderAttr = isDataPlaceholder ? ' data-placeholder-wrapper="true"' : '';
            html += `<div class="${className}"${placeholderAttr}${anchorAttrs(el)}>${el.content}</div>\n`;
          }
        }
      });

      html += '</div>';

      // v0.7.0: Body-Fragment speichern (kein verschachteltes <!DOCTYPE>).
      // Die Edge Function (wrapPage) laedt die Page-Wrapper-CSS selbst.
      // parseHtmlToElements nutzt DOMParser und ist resilient gegenueber
      // beiden Formaten (alte mit DOCTYPE / neue nur Body).
      return { fullHtml: html, css };
    },
    [canvasConfig],
  );

  // ── Save logic ─────────────────────────────────────────────────────────
  const handleSaveInternal = async (isAutoSave: boolean = false) => {
    try {
      if (!isAutoSave) setIsSaving(true);

      // Persist the active page's edits back into its cache before serialising
      if (activePageRef.current === 'invoice') {
        invoiceElementsRef.current = elements;
      } else {
        deckblattElementsRef.current = elements;
      }

      const { fullHtml: invoiceHtml, css: invoiceCss } = generateHtmlCssForElements(
        invoiceElementsRef.current,
      );

      const updatePayload: Record<string, unknown> = {
        editable_html: invoiceHtml,
        editable_css: invoiceCss,
        deckblatt_enabled: deckblattEnabled,
        updated_at: new Date().toISOString(),
      };

      if (deckblattEnabled && deckblattElementsRef.current.length > 0) {
        const { fullHtml: deckblattHtml, css: deckblattCss } = generateHtmlCssForElements(
          deckblattElementsRef.current,
        );
        updatePayload.deckblatt_html = deckblattHtml;
        updatePayload.deckblatt_css = deckblattCss;
      } else if (!deckblattEnabled) {
        // Clear stored deckblatt when user disables the feature
        updatePayload.deckblatt_html = null;
        updatePayload.deckblatt_css = null;
      }

      const { error } = await supabase
        .from('invoice_templates')
        .update(updatePayload)
        .eq('id', templateId);

      if (error) throw error;

      setLastSaved(new Date());

      if (!isAutoSave) {
        toast({ title: 'Gespeichert', description: 'Template wurde erfolgreich gespeichert' });
      }
      if (onSave && !isAutoSave) onSave();
    } catch {
      if (!isAutoSave) {
        toast({ title: 'Fehler', description: 'Template konnte nicht gespeichert werden', variant: 'destructive' });
      }
    } finally {
      if (!isAutoSave) setIsSaving(false);
    }
  };

  useEffect(() => {
    saveInternalRef.current = handleSaveInternal;
  }, [elements, canvasConfig, templateId]);

  const handleSave = async () => {
    await handleSaveInternal(false);
  };

  // ── Preview ───────────────────────────────────────────────────────────
  // v0.7.0: Preview nutzt jetzt DENSELBEN Serialisierer wie die Produktion
  // (generateHtmlCssForElements), damit Editor-Vorschau und tatsaechliche
  // Rechnung visuell uebereinstimmen. Realistische Positionsanzahl (15)
  // macht den Overlap-Bug bei fixen Footer-Elementen sofort sichtbar.
  const handlePreview = () => {
    // Merke: dieselben Keys wie die Edge Function (generate-invoice-pdf)
    const mockData: Record<string, string> = {
      firma: 'Musterfirma AG',
      kundeAnrede: 'Frau',
      kundeAnredeBrief: 'Sehr geehrte Frau',
      kundeHoeflichkeitsanrede: 'Sehr geehrte Frau Musterfirma AG',
      ansprechperson: 'Max Mueller',
      ansprechpersonName: 'Max Mueller',
      ansprechpersonVorname: 'Max',
      ansprechpersonNachname: 'Mueller',
      ansprechpersonAnrede: 'Herr',
      ansprechpersonAnredeBrief: 'Sehr geehrter Herr',
      ansprechpersonHoeflichkeitsanrede: 'Sehr geehrter Herr Mueller',
      firmenAdresse: 'Musterstrasse 123',
      firmenPLZ: '8000',
      firmenOrt: 'Zuerich',
      firmenTelefon: '+41 44 123 45 67',
      firmenEmail: 'info@musterfirma.ch',
      firmenWebsite: 'www.musterfirma.ch',
      mwstNummer: 'CHE-123.456.789 MWST',
      iban: 'CH93 0076 2011 6238 5295 7',
      klientAnrede: 'Frau',
      klientAnredeBrief: 'Sehr geehrte Frau',
      klientHoeflichkeitsanrede: 'Sehr geehrte Frau Meier',
      klientVorname: 'Anna',
      klientNachname: 'Meier',
      klientAdresse: 'Bergstrasse 45',
      klientPlz: '3000',
      klientOrt: 'Bern',
      klientGeburtstag: '15.03.1985',
      klientStunden: '42.5',
      klientUnternehmenName: 'Meier Consulting GmbH',
      klientUnternehmenAdresse: 'Bahnhofplatz 10',
      klientUnternehmenPlz: '3011',
      klientUnternehmenOrt: 'Bern',
      klientUnternehmenAnsprechperson: 'Frau Julia Meier',
      klientUnternehmenAnsprechpersonAnrede: 'Frau',
      klientUnternehmenAnsprechpersonAnredeBrief: 'Sehr geehrte Frau',
      mitarbeiterName: 'Thomas Schneider',
      mitarbeiterStundensatz: '120.00 CHF',
      datum: new Date().toLocaleDateString('de-CH'),
      monat: new Date().toLocaleDateString('de-CH', { month: 'long' }),
      jahr: String(new Date().getFullYear()),
      rechnungsnummer: 'RE-2024-0123',
      faelligkeitsdatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('de-CH'),
      zahlungsziel: '30 Tage',
      zwischensumme: "1'850.00 CHF",
      mwst: '143.65 CHF',
      mwstSatz: '7.7%',
      betrag: "1'993.65 CHF",
      bemerkung: 'Vielen Dank fuer Ihr Vertrauen!',
      zahlungsbedingungen: 'Zahlbar innerhalb von 30 Tagen netto.',
    };

    // 15 repraesentative Mock-Positionen - deckt den Realfall besser ab
    // als die bisherigen 2 Zeilen und macht Tabellen-Overlap sofort sichtbar.
    const mockPositionen = [
      { beschreibung: 'Webdesign und Entwicklung', menge: '20', einzelpreis: '85.00 CHF', gesamtpreis: "1'700.00 CHF" },
      { beschreibung: 'Content Management System', menge: '1', einzelpreis: '150.00 CHF', gesamtpreis: '150.00 CHF' },
      { beschreibung: 'SEO-Optimierung', menge: '5', einzelpreis: '120.00 CHF', gesamtpreis: '600.00 CHF' },
      { beschreibung: 'Support (Stunden)', menge: '8', einzelpreis: '110.00 CHF', gesamtpreis: '880.00 CHF' },
      { beschreibung: 'Beratung Strategie', menge: '3', einzelpreis: '180.00 CHF', gesamtpreis: '540.00 CHF' },
      { beschreibung: 'Grafikdesign Logo', menge: '1', einzelpreis: '450.00 CHF', gesamtpreis: '450.00 CHF' },
      { beschreibung: 'Hosting (Jahresgebuehr)', menge: '1', einzelpreis: '240.00 CHF', gesamtpreis: '240.00 CHF' },
      { beschreibung: 'Domain-Registrierung', menge: '2', einzelpreis: '25.00 CHF', gesamtpreis: '50.00 CHF' },
      { beschreibung: 'E-Mail-Setup', menge: '4', einzelpreis: '45.00 CHF', gesamtpreis: '180.00 CHF' },
      { beschreibung: 'Schulung Mitarbeiter', menge: '2', einzelpreis: '320.00 CHF', gesamtpreis: '640.00 CHF' },
      { beschreibung: 'Datenmigration', menge: '1', einzelpreis: '750.00 CHF', gesamtpreis: '750.00 CHF' },
      { beschreibung: 'Testing und QA', menge: '6', einzelpreis: '95.00 CHF', gesamtpreis: '570.00 CHF' },
      { beschreibung: 'Projektmanagement', menge: '10', einzelpreis: '125.00 CHF', gesamtpreis: "1'250.00 CHF" },
      { beschreibung: 'Dokumentation', menge: '4', einzelpreis: '85.00 CHF', gesamtpreis: '340.00 CHF' },
      { beschreibung: 'Backup-Einrichtung', menge: '1', einzelpreis: '180.00 CHF', gesamtpreis: '180.00 CHF' },
    ];

    // Aktives Seiten-Modell behalten - wir rendern die gerade sichtbare Seite.
    // Stelle sicher, dass der aktuelle State im Ref synchronisiert ist.
    if (activePageRef.current === 'invoice') {
      invoiceElementsRef.current = elements;
    } else {
      deckblattElementsRef.current = elements;
    }

    // Produktions-Renderer verwenden (exakt derselbe wie beim Speichern)
    const { fullHtml: bodyHtml, css } = generateHtmlCssForElements(elements);

    // Platzhalter-Ersetzung (gleiches Verhalten wie Edge Function replacePlaceholders)
    const replaceSimple = (content: string): string => {
      let result = content;
      Object.entries(mockData).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'gi'), value);
      });
      return result;
    };

    // Positionen-Loop
    const processPositionLoop = (content: string): string => {
      return content.replace(
        /\{\{#each positionen\}\}([\s\S]*?)\{\{\/each\}\}/g,
        (_, template) => {
          return mockPositionen.map(pos => {
            let row = template as string;
            Object.entries(pos).forEach(([k, v]) => {
              row = row.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'gi'), v);
            });
            return row;
          }).join('');
        },
      );
    };

    // QR-Code-Platzhalter: In der Preview zeigen wir einen gestrichelten
    // Rahmen statt eines echten QR (der wird erst bei der Rechnungs-Generierung
    // clientseitig erzeugt).
    const replaceQrPlaceholder = (content: string): string => {
      const qrStub = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border:2px dashed #9ca3af;background:#f9fafb;color:#6b7280;font-size:14px;">QR-Rechnung (Platzhalter)</div>`;
      return content.replace(/\{\{qr-code\}\}/gi, qrStub).replace(/\{\{qrCodeDataUrl\}\}/gi, qrStub);
    };

    // Logo-Platzhalter durch sichtbaren grauen Stub ersetzen
    const replaceLogoPlaceholder = (content: string): string => {
      const logoStub = `<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border:1px dashed #cbd5e1;background:#f1f5f9;color:#64748b;font-size:12px;">Logo</div>`;
      return content.replace(/\{\{logo\}\}/gi, logoStub).replace(/\{\{logoUrl\}\}/gi, logoStub);
    };

    let rendered = bodyHtml;
    rendered = replaceLogoPlaceholder(rendered);
    rendered = replaceQrPlaceholder(rendered);
    rendered = processPositionLoop(rendered);
    rendered = replaceSimple(rendered);
    // Verbleibende unersetzte Platzhalter entfernen, damit die Vorschau sauber wirkt
    rendered = rendered.replace(/\{\{[^}]+\}\}/g, '');

    const previewWindow = window.open('', '_blank');
    if (!previewWindow) return;
    previewWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rechnungsvorschau</title>
  <style>
    ${css}
    body { margin: 0; padding: 20px; background: #f3f4f6; }
    .pdf-page { margin: 20px auto; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    /* Visualisiere Seitengrenze bei y=1123 (A4 @96DPI) */
    .preview-page-break {
      position: absolute; left: 0; right: 0; height: 0;
      border-top: 1px dashed #ef4444;
      pointer-events: none;
    }
  </style>
</head>
<body>
  ${rendered}
</body>
</html>`);
    previewWindow.document.close();
  };

  // ── Canvas drop handler ───────────────────────────────────────────────
  const handleCanvasDrop = useCallback(
    (x: number, y: number, elementType: string) => {
      // First check if it's a tool type
      switch (elementType) {
        case 'text':
          addElement({ id: `text-${Date.now()}`, type: 'text', content: 'Neuer Text', x, y, fontSize: 14, color: '#000000' });
          return;
        case 'line':
          addElement({ id: `line-${Date.now()}`, type: 'line', content: '', x, y, x2: x + 200, y2: y, color: '#000000', borderWidth: 2 });
          return;
        case 'rectangle':
          addElement({ id: `rectangle-${Date.now()}`, type: 'rectangle', content: '', x, y, width: 200, height: 100, backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 2, borderStyle: 'solid' });
          return;
        case 'circle':
          addElement({ id: `circle-${Date.now()}`, type: 'circle', content: '', x, y, width: 100, height: 100, backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 2, borderStyle: 'solid' });
          return;
      }
    },
    [addElement],
  );

  // Extended drop handler for sidebar items (placeholders)
  const handleCanvasDropRaw = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.round((e.clientX - rect.left) / canvasConfig.zoom);
      const y = Math.round((e.clientY - rect.top) / canvasConfig.zoom);

      // Check tool data first
      const toolData = e.dataTransfer.getData('tool');
      if (toolData) {
        handleCanvasDrop(x, y, toolData);
        return;
      }

      // Check for elementType (from EditorCanvas)
      const elementType = e.dataTransfer.getData('elementType');
      if (elementType) {
        handleCanvasDrop(x, y, elementType);
        return;
      }

      // Check for sidebar placeholder item
      const itemData = e.dataTransfer.getData('item');
      if (!itemData) return;

      const item = JSON.parse(itemData);

      if (item.type === 'image') {
        addElement({ id: `image-${Date.now()}`, type: 'image', content: `{{${item.key}}}`, x, y, width: 150, height: 80 });
      } else if (item.type === 'qr') {
        addElement({
          id: `qr-${Date.now()}`, type: 'placeholder', content: '{{qr-code}}',
          x, y, width: 150, height: 150, color: item.color || '#0891b2', backgroundColor: item.bgColor || '#ecfeff', fontSize: 12,
        });
      } else if (item.type === 'table') {
        const tableGroupId = `table-group-${Date.now()}`;
        const headerHeight = 30;
        const tableColumns = [
          { key: 'beschreibung', label: 'Beschreibung', width: 200 },
          { key: 'menge', label: 'Menge', width: 80 },
          { key: 'einzelpreis', label: 'Einzelpreis', width: 100 },
          { key: 'gesamtpreis', label: 'Gesamtpreis', width: 100 },
        ];

        const newElements: Element[] = [];
        let currentX = x;
        const columnSpacing = 10;

        tableColumns.forEach((col) => {
          const headerId = `table-header-${tableGroupId}-${col.key}`;
          const headerElement: Element = {
            id: headerId, type: 'placeholder', content: col.label,
            x: currentX, y, width: col.width, height: headerHeight,
            fontSize: 12, color: '#1f2937', backgroundColor: '#f3f4f6', fontWeight: 'bold',
            tableGroupId, tableColumn: 'header', isPositionsTable: true,
            tableBorderColor: '#e5e7eb', tableBorderWidth: 1, tableBorderStyle: 'solid',
            tableTextAlign: 'center', tableVerticalAlign: 'middle', tablePadding: 8, tableLineHeight: 1.5,
            showVerticalGridLines: true, showHorizontalGridLines: true,
            gridLineColor: '#e5e7eb', gridLineWidth: 1, gridLineStyle: 'solid',
          };

          const dataId = `table-data-${tableGroupId}-${col.key}`;
          const dataElement: Element = {
            id: dataId, type: 'placeholder', content: `{{#each positionen}}\n{{${col.key}}}\n{{/each}}`,
            x: currentX, y: y + headerHeight + 5, width: col.width, height: 120,
            fontSize: 11, color: '#000000', backgroundColor: 'transparent',
            tableGroupId, tableColumn: col.key as Element['tableColumn'], isPositionsTable: true,
            rowSpacing: 8, columnSpacing: 8,
            tableBorderColor: '#e5e7eb', tableBorderWidth: 1, tableBorderStyle: 'solid',
            tableTextAlign: col.key === 'menge' || col.key === 'einzelpreis' || col.key === 'gesamtpreis' ? 'right' : 'left',
            tableVerticalAlign: 'middle', tablePadding: 8, tableLineHeight: 1.5,
            alternatingRows: true, alternateRowColor: '#f9fafb',
            showVerticalGridLines: true, showHorizontalGridLines: true,
            gridLineColor: '#e5e7eb', gridLineWidth: 1, gridLineStyle: 'solid',
          };

          newElements.push(headerElement, dataElement);
          currentX += col.width + columnSpacing;
        });

        setElements(prev => [...prev, ...newElements]);
        selection.selectElement(newElements[0].id);
        toast({ title: 'Tabelle eingefuegt', description: 'Sie koennen nun jede Spalte einzeln positionieren' });
      } else if (item.type === 'position-field') {
        addElement({
          id: `position-field-${Date.now()}`, type: 'placeholder', content: `{{${item.key}}}`,
          x, y, fontSize: 12, color: item.color || '#059669', backgroundColor: item.bgColor || '#d1fae5',
        });
      } else {
        addElement({
          id: `placeholder-${Date.now()}`, type: 'placeholder', content: `{{${item.key}}}`,
          x, y, fontSize: 14, color: item.color || '#2563eb', backgroundColor: item.bgColor || '#dbeafe',
        });
      }
    },
    [canvasConfig.zoom, handleCanvasDrop, addElement, selection, toast],
  );

  // ── Canvas config helpers ─────────────────────────────────────────────
  const handleZoomChange = useCallback((zoom: number) => {
    setCanvasConfig(prev => ({ ...prev, zoom }));
  }, []);

  const handleToggleGrid = useCallback(() => {
    setCanvasConfig(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const handleToggleRulers = useCallback(() => {
    setCanvasConfig(prev => ({ ...prev, showRulers: !prev.showRulers }));
  }, []);

  const handleToggleSnapToGrid = useCallback(() => {
    setCanvasConfig(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const handleToggleSnapToElements = useCallback(() => {
    setCanvasConfig(prev => ({ ...prev, snapToElements: !prev.snapToElements }));
  }, []);

  // ── Element interaction callbacks ─────────────────────────────────────
  const handleElementSelect = useCallback(
    (id: string, shiftKey: boolean) => {
      if (shiftKey) {
        selection.toggleSelection(id);
      } else {
        selection.selectElement(id);
      }
    },
    [selection],
  );

  const handleElementDoubleClick = useCallback(
    (id: string) => {
      setEditingElementId(prev => (prev === id ? null : id));
    },
    [],
  );

  const handleElementContentChange = useCallback(
    (id: string, content: string) => {
      updateElement(id, { content });
    },
    [updateElement],
  );

  const handleResizeStart = useCallback(
    (id: string, handle: string, e: React.MouseEvent) => {
      resize.startResize(id, handle as import('./editor/hooks').ResizeHandle, e);
    },
    [resize],
  );

  // ── Sidebar components ────────────────────────────────────────────────
  const selectedElementId = selection.selectedElementIds.size === 1
    ? [...selection.selectedElementIds][0]
    : null;

  const selectedElement = selectedElementId
    ? elements.find(el => el.id === selectedElementId) || null
    : null;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    // h-full min-h-0 lets the cascade from MainLayout (h-[100dvh]) →
    // AdvancedTemplateEditor (h-full) → here flow through without nested
    // h-screen containers that would otherwise produce doubled scrollbars.
    <div className="relative flex h-full min-h-0 bg-gray-50 overflow-hidden">
      {/* ── Mobile backdrop overlay ─────────────────────────────────────── */}
      {/* Covers the canvas when either drawer is open below lg, absorbing
          taps to close the drawer. Hidden on lg+ where panels are static. */}
      {(leftDrawerOpen || rightDrawerOpen) && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => {
            setLeftDrawerOpen(false);
            setRightDrawerOpen(false);
          }}
          aria-hidden="true"
        />
      )}

      {/* ── Left Sidebar - Tools ─────────────────────────────────────────
         Off-canvas drawer below lg, static column on lg+. `fixed` gives it
         its own stacking context above the backdrop; `lg:static` + `lg:translate-x-0`
         puts it back in flow on desktop. */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 sm:w-64 bg-white border-r p-4 overflow-y-auto transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          leftDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Elemente</h3>
          <button
            type="button"
            onClick={() => setLeftDrawerOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-gray-100"
            aria-label="Schliessen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
          Ziehen Sie Elemente auf das Canvas oder fuegen Sie neue hinzu
        </div>

        <div className="space-y-2 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Werkzeuge</h4>
          <p className="text-xs text-gray-500 mb-3">Ziehen oder klicken zum Hinzufuegen</p>

          <DraggableToolItem tool="text" icon={<Type className="w-4 h-4 mr-2" />} label="Text hinzufuegen" onClick={addTextElement} />
          <DraggableToolItem tool="line" icon={<Minus className="w-4 h-4 mr-2" />} label="Linie hinzufuegen" onClick={addLineElement} />
          <DraggableToolItem tool="rectangle" icon={<Square className="w-4 h-4 mr-2" />} label="Rechteck hinzufuegen" onClick={addRectangleElement} />
          <DraggableToolItem tool="circle" icon={<Circle className="w-4 h-4 mr-2" />} label="Kreis hinzufuegen" onClick={addCircleElement} />

          {selectedElement && (
            <Button onClick={() => duplicateElement(selectedElement.id)} className="w-full justify-start" variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Element duplizieren
            </Button>
          )}
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Platzhalter</h4>
          <p className="text-xs text-gray-500 mb-3">Ziehen Sie die Platzhalter auf das Canvas</p>
          {visiblePlaceholders.map(p => (
            <DraggableSidebarItem
              key={p.key}
              item={p}
              selectedElementId={selectedElementId}
              elements={elements}
              editingElementId={editingElementId}
              insertPlaceholderAtCursor={insertPlaceholderAtCursor}
              setElements={setElements}
              toast={toast}
            />
          ))}
        </div>

        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Positionen</h4>
          <p className="text-xs text-gray-500 mb-3">Fuer Rechnungspositionen</p>
          {POSITION_PLACEHOLDERS.map(p => (
            <DraggableSidebarItem
              key={p.key}
              item={p}
              selectedElementId={selectedElementId}
              elements={elements}
              editingElementId={editingElementId}
              insertPlaceholderAtCursor={insertPlaceholderAtCursor}
              setElements={setElements}
              toast={toast}
            />
          ))}
        </div>
      </aside>

      {/* Center - Canvas Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        <EditorToolbar
          canvasConfig={canvasConfig}
          onZoomChange={handleZoomChange}
          onToggleGrid={handleToggleGrid}
          onToggleRulers={handleToggleRulers}
          onToggleSnapToGrid={handleToggleSnapToGrid}
          onToggleSnapToElements={handleToggleSnapToElements}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={history.canUndo}
          canRedo={history.canRedo}
          onPreview={handlePreview}
          onSave={handleSave}
          isSaving={isSaving}
          lastSaved={lastSaved}
          onOpenLeftDrawer={() => setLeftDrawerOpen(true)}
          onOpenRightDrawer={() => setRightDrawerOpen(true)}
        />

        {/* Deckblatt enable toggle + page tabs */}
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 sm:px-4 py-2 bg-gray-50 border-b">
          <div className="flex items-center gap-1">
            {deckblattEnabled && (
              <>
                <button
                  type="button"
                  onClick={() => handleSwitchPage('invoice')}
                  className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
                    activePage === 'invoice'
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Rechnung
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPage('deckblatt')}
                  className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-t border-b-2 transition-colors ${
                    activePage === 'deckblatt'
                      ? 'bg-white border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Deckblatt
                </button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={copySelectedElementsToOtherPage}
              disabled={selection.selectedElementIds.size === 0}
              title={
                activePage === 'invoice'
                  ? 'Ausgewählte Elemente exakt auf das Deckblatt kopieren'
                  : 'Ausgewählte Elemente exakt auf die Rechnung kopieren'
              }
            >
              <ArrowRightLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {activePage === 'invoice' ? 'Auf Deckblatt kopieren' : 'Auf Rechnung kopieren'}
              </span>
              <span className="sm:hidden">Kopieren</span>
            </Button>

            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={deckblattEnabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setDeckblattEnabled(enabled);
                  if (!enabled && activePage === 'deckblatt') {
                    // When disabling while on the deckblatt tab, jump back to invoice
                    handleSwitchPage('invoice');
                  }
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="hidden sm:inline">Deckblatt aktivieren</span>
              <span className="sm:hidden">Deckblatt</span>
            </label>
          </div>
        </div>

        <div
          className="flex-1 overflow-auto bg-gray-100 p-3 sm:p-6 lg:p-8"
          onDrop={handleCanvasDropRaw}
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        >
          <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
            <EditorCanvas
              canvasConfig={canvasConfig}
              canvasRef={canvasRef as React.RefObject<HTMLDivElement>}
              onCanvasClick={() => {
                selection.clearSelection();
                setEditingElementId(null);
              }}
              onDrop={handleCanvasDrop}
            >
              {/* Alignment guides */}
              <AlignmentGuides guides={drag.alignmentGuides} canvasConfig={canvasConfig} />

              {/* Table vertical grid lines */}
              {renderTableGridLines(elements)}

              {/* v0.7.0: Ankerlinien fuer Zonen-Modell */}
              <ZoneGuides elements={elements} canvasWidth={canvasConfig.width} />

              {/* v0.7.0: Overlap-Warnung unten rechts wenn Elemente ueberlappen koennten */}
              <PageBreakIndicator elements={elements} />

              {/* Elements */}
              {elements.map(element => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  isSelected={selection.isSelected(element.id)}
                  isEditing={editingElementId === element.id}
                  isDragging={drag.isDragging}
                  onSelect={handleElementSelect}
                  onDragStart={drag.startDrag}
                  onResizeStart={handleResizeStart}
                  onDoubleClick={handleElementDoubleClick}
                  onContentChange={handleElementContentChange}
                />
              ))}

              {/* Lasso selection box */}
              {selection.lassoRect && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${selection.lassoRect.x}px`,
                    top: `${selection.lassoRect.y}px`,
                    width: `${selection.lassoRect.width}px`,
                    height: `${selection.lassoRect.height}px`,
                    border: '2px dashed #3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    pointerEvents: 'none',
                    zIndex: 10000,
                  }}
                />
              )}

              {/* Coordinate display during drag */}
              {drag.dragCoordinates && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${drag.dragCoordinates.x}px`,
                    top: `${drag.dragCoordinates.y - 30}px`,
                    background: 'rgba(37, 99, 235, 0.95)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 10001,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  X: {drag.dragCoordinates.x}px | Y: {drag.dragCoordinates.y}px
                </div>
              )}
            </EditorCanvas>
          </div>
        </div>
      </div>

      {/* ── Right Sidebar - Properties ─────────────────────────────────
         Off-canvas drawer below lg, static column on lg+. Mirrors the
         left sidebar pattern but slides in from the right. */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-40 w-72 sm:w-64 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
          rightDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="relative h-full">
          {/* Close button - mobile only */}
          <button
            type="button"
            onClick={() => setRightDrawerOpen(false)}
            className="lg:hidden absolute top-3 right-3 z-10 p-1 rounded hover:bg-gray-100 bg-white/80"
            aria-label="Schliessen"
          >
            <X className="w-4 h-4" />
          </button>

          <PropertiesPanel
            selectedElement={selectedElement}
            selectedCount={selection.selectedElementIds.size}
            canvasConfig={canvasConfig}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
          />
        </div>
      </aside>

      {/* v0.7.0: Migrations-Wizard fuer alte Templates ohne Zonen-Modell */}
      <AlertDialog open={showMigrationWizard} onOpenChange={setShowMigrationWizard}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Template auf neues Layout-Modell aktualisieren?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Wir haben das Rechnungs-Rendering verbessert: mehrseitige
                  Rechnungen sind nun moeglich und Elemente wissen, ob sie im
                  <strong> Kopf</strong>, <strong>Fliesstext</strong> oder
                  <strong> Fuss</strong> der Rechnung stehen.
                </p>
                <p>
                  Dieses Template wurde noch nicht zugeordnet. Vorschlag basiert auf der
                  Tabellen-Position:
                </p>
                {migrationPreview && (
                  <div className="bg-gray-50 rounded p-3 text-xs border border-gray-200">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">{migrationPreview.header}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Kopf</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-emerald-600">{migrationPreview.body}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Fliess</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-amber-600">{migrationPreview.footer}</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Fuss</div>
                      </div>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  Nach der Zuordnung kannst du jedes Element im Eigenschaften-Panel
                  nachjustieren. Speichern nicht vergessen!
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={dismissMigrationLater} className="sm:mr-auto">
              Spaeter erinnern
            </AlertDialogCancel>
            <Button variant="outline" onClick={dismissMigrationManual}>
              Manuell zuordnen
            </Button>
            <AlertDialogAction onClick={applyMigration}>
              Automatisch zuordnen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Helper components extracted from JSX
// ═════════════════════════════════════════════════════════════════════════════

/** Draggable sidebar placeholder item */
function DraggableSidebarItem({
  item,
  selectedElementId,
  elements,
  editingElementId,
  insertPlaceholderAtCursor,
  setElements,
  toast,
}: {
  item: { key: string; label: string; type: string; color: string; bgColor: string };
  selectedElementId: string | null;
  elements: Element[];
  editingElementId: string | null;
  insertPlaceholderAtCursor: (key: string) => boolean;
  setElements: React.Dispatch<React.SetStateAction<Element[]>>;
  toast: ReturnType<typeof import('@/hooks/use-toast').useToast>['toast'];
}) {
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartTimeRef = React.useRef<number>(0);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    dragStartTimeRef.current = Date.now();
    e.dataTransfer.setData('item', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (isDragging || Date.now() - dragStartTimeRef.current < 200) return;

    const inserted = insertPlaceholderAtCursor(item.key);
    if (inserted) {
      toast({ title: 'Platzhalter eingefuegt', description: `{{${item.key}}} wurde an Cursor-Position eingefuegt` });
      return;
    }

    if (selectedElementId) {
      const element = elements.find(el => el.id === selectedElementId);
      if (element && (element.type === 'text' || element.type === 'placeholder')) {
        const placeholder = `{{${item.key}}}`;
        setElements(prev =>
          prev.map(el =>
            el.id === selectedElementId ? { ...el, content: (el.content || '') + placeholder } : el,
          ),
        );
        toast({ title: 'Platzhalter eingefuegt', description: `{{${item.key}}} wurde am Ende des Textes hinzugefuegt` });
      } else {
        toast({ title: 'Hinweis', description: 'Bitte waehlen Sie zuerst ein Text-Element aus', variant: 'default' });
      }
    } else {
      toast({ title: 'Hinweis', description: 'Bitte doppelklicken Sie auf ein Text-Element und klicken Sie dann auf den Platzhalter', variant: 'default' });
    }
  };

  const getIcon = () => {
    if (item.type === 'image') return 'IMG';
    if (item.type === 'qr') return 'QR';
    if (item.type === 'table') return 'TBL';
    if (item.type === 'position-field') return 'POS';
    return 'TXT';
  };

  const getBgColor = () => {
    if (item.type === 'image') return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
    if (item.type === 'position-field') return 'bg-green-50 hover:bg-green-100 border-green-200';
    if (item.type === 'table') return 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200';
    if (item.type === 'qr') return 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200';
    return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`px-3 py-2 text-sm ${getBgColor()} border rounded mb-2 cursor-move flex items-center gap-2 transition-all hover:shadow-md`}
      title="Ziehen zum Hinzufuegen auf Canvas oder klicken um in ausgewaehltes Text-Element einzufuegen"
    >
      <span className="text-xs font-mono">{getIcon()}</span>
      <span className="font-medium">{item.label}</span>
    </div>
  );
}

/** Draggable tool item for shapes/text/lines */
function DraggableToolItem({
  tool,
  icon,
  label,
  onClick,
}: {
  tool: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('tool', tool);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <Button
      draggable
      onDragStart={handleDragStart}
      onClick={onClick}
      className="w-full justify-start cursor-move"
      variant="outline"
      size="sm"
    >
      {icon}
      {label}
    </Button>
  );
}

/** Render vertical grid lines between table columns */
function renderTableGridLines(elements: Element[]) {
  const processedGroups = new Set<string>();
  return elements
    .filter(el => el.tableGroupId && !processedGroups.has(el.tableGroupId))
    .map(el => {
      processedGroups.add(el.tableGroupId!);
      const groupElements = elements.filter(e => e.tableGroupId === el.tableGroupId);
      const headers = groupElements.filter(e => e.tableColumn === 'header');
      const dataColumns = groupElements.filter(e => e.tableColumn !== 'header');

      const gridSettings = headers[0] || dataColumns[0];
      if (!gridSettings || !gridSettings.showVerticalGridLines) return null;

      const allCols = [...headers, ...dataColumns];
      const minX = Math.min(...allCols.map(c => c.x));
      const maxX = Math.max(...allCols.map(c => c.x + (c.width || 0)));
      const minY = Math.min(...allCols.map(c => c.y));
      const maxY = Math.max(...allCols.map(c => c.y + (c.height || 100)));

      const gridColor = gridSettings.gridLineColor || '#e5e7eb';
      const gridWidth = gridSettings.gridLineWidth || 1;
      const gridStyle = gridSettings.gridLineStyle || 'solid';

      const sortedHeaders = [...headers].sort((a, b) => a.x - b.x);

      return (
        <div
          key={`table-grid-${el.tableGroupId}`}
          style={{
            position: 'absolute',
            left: `${minX}px`,
            top: `${minY}px`,
            width: `${maxX - minX}px`,
            height: `${maxY - minY}px`,
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {sortedHeaders.map((header, idx) => {
            if (idx === 0) return null;
            const lineX = header.x - minX;
            return (
              <div
                key={`vline-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${lineX}px`,
                  top: 0,
                  width: `${gridWidth}px`,
                  height: '100%',
                  backgroundColor: gridStyle === 'solid' ? gridColor : 'transparent',
                  borderLeft: gridStyle !== 'solid' ? `${gridWidth}px ${gridStyle} ${gridColor}` : undefined,
                }}
              />
            );
          })}
        </div>
      );
    });
}
