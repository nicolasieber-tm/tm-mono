import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Copy, RotateCw } from 'lucide-react';
import type { Element, CanvasConfig } from '../types';

interface PropertiesPanelProps {
  selectedElement: Element | null;
  selectedCount: number;
  canvasConfig: CanvasConfig;
  onUpdateElement: (id: string, updates: Partial<Element>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ELEMENT_LABELS: Record<string, string> = {
  text: 'Text',
  line: 'Linie',
  rectangle: 'Rechteck',
  circle: 'Kreis',
  image: 'Bild',
  placeholder: 'Platzhalter',
};

const FONT_FAMILIES = ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Numeric input with validation. Shows red border when the raw input is invalid. */
function ValidatedNumberInput({
  value,
  onChange,
  min = 0,
  max = 9999,
  label,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  label: string;
  step?: number;
}) {
  const [raw, setRaw] = useState<string>(String(value));
  const [invalid, setInvalid] = useState(false);

  // Sync external value changes
  React.useEffect(() => {
    setRaw(String(value));
    setInvalid(false);
  }, [value]);

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{label}</label>
      <Input
        type="number"
        value={raw}
        min={min}
        max={max}
        step={step}
        className={invalid ? 'border-red-400 focus:ring-red-400' : ''}
        onChange={(e) => {
          const text = e.target.value;
          setRaw(text);
          const parsed = step && step < 1 ? parseFloat(text) : parseInt(text, 10);
          if (isNaN(parsed)) {
            setInvalid(true);
          } else {
            setInvalid(false);
            onChange(clamp(parsed, min, max));
          }
        }}
      />
    </div>
  );
}

// ── Alignment buttons ────────────────────────────────────────────────────────

function AlignmentButtons({
  element,
  canvasConfig,
  onUpdate,
}: {
  element: Element;
  canvasConfig: CanvasConfig;
  onUpdate: (updates: Partial<Element>) => void;
}) {
  const w = element.width || 100;
  const h = element.height || 20;

  const alignActions: Array<{ label: string; title: string; action: () => void }> = [
    { label: '\u2B05', title: 'Links ausrichten', action: () => onUpdate({ x: 0 }) },
    {
      label: '\u2194',
      title: 'Horizontal zentrieren',
      action: () => onUpdate({ x: Math.round((canvasConfig.width - w) / 2) }),
    },
    { label: '\u27A1', title: 'Rechts ausrichten', action: () => onUpdate({ x: canvasConfig.width - w }) },
    { label: '\u2B06', title: 'Oben ausrichten', action: () => onUpdate({ y: 0 }) },
    {
      label: '\u2195',
      title: 'Vertikal zentrieren',
      action: () => onUpdate({ y: Math.round((canvasConfig.height - h) / 2) }),
    },
    { label: '\u2B07', title: 'Unten ausrichten', action: () => onUpdate({ y: canvasConfig.height - h }) },
  ];

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">Ausrichtung</label>
      <div className="grid grid-cols-3 gap-1">
        {alignActions.map((a) => (
          <button
            key={a.title}
            onClick={a.action}
            title={a.title}
            className="p-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Text alignment row ───────────────────────────────────────────────────────

function TextAlignmentButtons({
  current,
  onChange,
}: {
  current: string;
  onChange: (val: string) => void;
}) {
  const options: Array<{ value: string; label: string; title: string }> = [
    { value: 'left', label: '\u2B05\uFE0E', title: 'Linksbündig' },
    { value: 'center', label: '\u2194\uFE0E', title: 'Zentriert' },
    { value: 'right', label: '\u2B95', title: 'Rechtsbündig' },
    { value: 'justify', label: '\u2B0C', title: 'Blocksatz' },
  ];

  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-2">Textausrichtung</label>
      <div className="grid grid-cols-4 gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            title={opt.title}
            className={`p-2 border rounded text-xs font-medium ${
              current === opt.value
                ? 'bg-blue-500 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Color input pair ─────────────────────────────────────────────────────────

function ColorInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700 block mb-1">{label}</label>
      <div className="flex gap-2">
        <Input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-16" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-mono text-xs"
        />
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function PropertiesPanel({
  selectedElement,
  selectedCount,
  canvasConfig,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}: PropertiesPanelProps) {
  const update = useCallback(
    (updates: Partial<Element>) => {
      if (selectedElement) onUpdateElement(selectedElement.id, updates);
    },
    [selectedElement, onUpdateElement],
  );

  if (!selectedElement) {
    return (
      <div className="w-full lg:w-64 h-full bg-white lg:border-l p-4 overflow-y-auto">
        <h3 className="font-semibold mb-4">Eigenschaften</h3>
        <p className="text-sm text-gray-500">
          {selectedCount > 1
            ? `${selectedCount} Elemente ausgewählt`
            : 'Kein Element ausgewählt'}
        </p>
      </div>
    );
  }

  const isText = selectedElement.type === 'text' || selectedElement.type === 'placeholder';
  const isShape = selectedElement.type === 'rectangle' || selectedElement.type === 'circle';
  const isLine = selectedElement.type === 'line';

  return (
    <div className="w-full lg:w-64 h-full bg-white lg:border-l p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Eigenschaften</h3>

      <div className="space-y-4">
        {/* Type badge */}
        <div className="p-2 bg-gray-100 rounded text-xs font-medium">
          {ELEMENT_LABELS[selectedElement.type] || selectedElement.type}
        </div>

        {/* v0.7.0: Zonen-Selector - steuert Verhalten bei mehrseitigen Rechnungen */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">
            Bereich
          </label>
          <div className="grid grid-cols-3 gap-1">
            {(['header', 'body', 'footer'] as const).map((zone) => {
              const current = selectedElement.anchor ?? 'header';
              const labels = { header: 'Kopf', body: 'Fliess', footer: 'Fuss' };
              return (
                <button
                  key={zone}
                  onClick={() => update({ anchor: zone })}
                  className={`p-1.5 border rounded text-xs font-medium transition-colors ${
                    current === zone
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={
                    zone === 'header'
                      ? 'Kopfbereich: erscheint nur auf Seite 1 (ausser Wiederholen aktiv)'
                      : zone === 'body'
                      ? 'Fliessbereich: waechst mit der Positions-Tabelle ueber mehrere Seiten'
                      : 'Fussbereich: erscheint nur auf der letzten Seite (z.B. Total, IBAN)'
                  }
                >
                  {labels[zone]}
                </button>
              );
            })}
          </div>
          <p className="mt-1 text-[10px] leading-tight text-gray-500">
            {(selectedElement.anchor ?? 'header') === 'header' &&
              'Kopfbereich - nur Seite 1 (ausser Wiederholen).'}
            {(selectedElement.anchor ?? 'header') === 'body' &&
              'Fliesst mit der Tabelle ueber alle Seiten.'}
            {(selectedElement.anchor ?? 'header') === 'footer' &&
              'Nur letzte Seite (Total, QR, IBAN).'}
          </p>
          {(selectedElement.anchor ?? 'header') === 'header' && (
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={!!selectedElement.repeatOnEveryPage}
                onChange={(e) => update({ repeatOnEveryPage: e.target.checked })}
                className="rounded"
              />
              Auf jeder Seite wiederholen
            </label>
          )}
        </div>

        {/* Position */}
        <div className="grid grid-cols-2 gap-2">
          <ValidatedNumberInput
            label="X"
            value={selectedElement.x}
            min={0}
            max={canvasConfig.width}
            onChange={(v) => update({ x: v })}
          />
          <ValidatedNumberInput
            label="Y"
            value={selectedElement.y}
            min={0}
            max={canvasConfig.height}
            onChange={(v) => update({ y: v })}
          />
        </div>

        {/* Size (non-line) */}
        {!isLine && (
          <div className="grid grid-cols-2 gap-2">
            <ValidatedNumberInput
              label="Breite"
              value={selectedElement.width || 0}
              min={20}
              max={canvasConfig.width}
              onChange={(v) => update({ width: v })}
            />
            <ValidatedNumberInput
              label="Höhe"
              value={selectedElement.height || 0}
              min={20}
              max={canvasConfig.height}
              onChange={(v) => update({ height: v })}
            />
          </div>
        )}

        {/* Line endpoints */}
        {isLine && (
          <div className="grid grid-cols-2 gap-2">
            <ValidatedNumberInput
              label="X2"
              value={selectedElement.x2 ?? selectedElement.x}
              min={0}
              max={canvasConfig.width}
              onChange={(v) => update({ x2: v })}
            />
            <ValidatedNumberInput
              label="Y2"
              value={selectedElement.y2 ?? selectedElement.y}
              min={0}
              max={canvasConfig.height}
              onChange={(v) => update({ y2: v })}
            />
          </div>
        )}

        {/* Alignment helpers */}
        {!isLine && (
          <AlignmentButtons element={selectedElement} canvasConfig={canvasConfig} onUpdate={update} />
        )}

        {/* ── Text styling ─────────────────────────────────────────────────── */}
        {isText && (
          <>
            {/* Font size */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">Schriftgrösse</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update({ fontSize: Math.max(8, (selectedElement.fontSize || 14) - 2) })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-bold hover:bg-gray-50"
                  title="Schrift verkleinern"
                >
                  A-
                </button>
                <Input
                  type="number"
                  value={selectedElement.fontSize || 14}
                  min={8}
                  max={72}
                  onChange={(e) => update({ fontSize: parseInt(e.target.value) || 14 })}
                  className="flex-1 text-center"
                />
                <button
                  onClick={() => update({ fontSize: Math.min(72, (selectedElement.fontSize || 14) + 2) })}
                  className="px-3 py-1 border border-gray-300 rounded text-sm font-bold hover:bg-gray-50"
                  title="Schrift vergrössern"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Font family */}
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Schriftart</label>
              <select
                className="w-full border rounded px-2 py-1 text-sm"
                value={selectedElement.fontFamily || 'Arial'}
                onChange={(e) => update({ fontFamily: e.target.value })}
              >
                {FONT_FAMILIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Bold / Italic */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Fett</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={selectedElement.fontWeight || 'normal'}
                  onChange={(e) => update({ fontWeight: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Fett</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Kursiv</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={selectedElement.fontStyle || 'normal'}
                  onChange={(e) => update({ fontStyle: e.target.value })}
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Kursiv</option>
                </select>
              </div>
            </div>

            {/* Text alignment */}
            <TextAlignmentButtons
              current={selectedElement.textAlign || 'left'}
              onChange={(val) => update({ textAlign: val as Element['textAlign'] })}
            />
          </>
        )}

        {/* ── Color ────────────────────────────────────────────────────────── */}
        <ColorInput
          label={isLine ? 'Linienfarbe' : 'Textfarbe'}
          value={selectedElement.color || '#000000'}
          onChange={(v) => update({ color: v })}
        />

        {/* Background color (shapes + text) */}
        {(isShape || selectedElement.type === 'text') && (
          <ColorInput
            label="Hintergrundfarbe"
            value={selectedElement.backgroundColor || '#ffffff'}
            onChange={(v) => update({ backgroundColor: v })}
            placeholder="transparent"
          />
        )}

        {/* ── Border (shapes) ──────────────────────────────────────────────── */}
        {isShape && (
          <>
            <ColorInput
              label="Rahmenfarbe"
              value={selectedElement.borderColor || '#000000'}
              onChange={(v) => update({ borderColor: v })}
            />
            <div className="grid grid-cols-2 gap-2">
              <ValidatedNumberInput
                label="Rahmenstärke"
                value={selectedElement.borderWidth || 1}
                min={0}
                max={20}
                onChange={(v) => update({ borderWidth: v })}
              />
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Rahmenstil</label>
                <select
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={selectedElement.borderStyle || 'solid'}
                  onChange={(e) => update({ borderStyle: e.target.value })}
                >
                  <option value="solid">Durchgezogen</option>
                  <option value="dashed">Gestrichelt</option>
                  <option value="dotted">Gepunktet</option>
                </select>
              </div>
            </div>
            {selectedElement.type === 'rectangle' && (
              <ValidatedNumberInput
                label="Eckenradius"
                value={selectedElement.borderRadius || 0}
                min={0}
                max={200}
                onChange={(v) => update({ borderRadius: v })}
              />
            )}
          </>
        )}

        {/* Line width */}
        {isLine && (
          <ValidatedNumberInput
            label="Linienstärke"
            value={selectedElement.borderWidth || 2}
            min={1}
            max={20}
            onChange={(v) => update({ borderWidth: v })}
          />
        )}

        {/* ── Rotation (non-line) ──────────────────────────────────────────── */}
        {!isLine && (
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Rotation (Grad)</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={selectedElement.rotation || 0}
                onChange={(e) => update({ rotation: parseInt(e.target.value) || 0 })}
                className="flex-1"
              />
              <Button size="sm" variant="outline" onClick={() => update({ rotation: 0 })}>
                <RotateCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Opacity ──────────────────────────────────────────────────────── */}
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-1">Deckkraft</label>
          <Input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedElement.opacity !== undefined ? selectedElement.opacity : 1}
            onChange={(e) => update({ opacity: parseFloat(e.target.value) })}
          />
          <div className="text-xs text-gray-500 text-center">
            {Math.round((selectedElement.opacity !== undefined ? selectedElement.opacity : 1) * 100)}%
          </div>
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="pt-4 border-t space-y-2">
          <Button
            onClick={() => onDuplicateElement(selectedElement.id)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplizieren
          </Button>
          <Button
            onClick={() => onDeleteElement(selectedElement.id)}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Löschen
          </Button>
        </div>
      </div>
    </div>
  );
}
