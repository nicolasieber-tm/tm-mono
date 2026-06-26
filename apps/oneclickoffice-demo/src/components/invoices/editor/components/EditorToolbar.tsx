import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Undo,
  Redo,
  Grid3x3,
  Ruler,
  Magnet,
  Eye,
  Save,
  PanelLeft,
  PanelRight,
} from 'lucide-react';
import type { CanvasConfig } from '../types';

interface EditorToolbarProps {
  canvasConfig: CanvasConfig;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleRulers: () => void;
  onToggleSnapToGrid: () => void;
  onToggleSnapToElements: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onPreview: () => void;
  onSave: () => void;
  isSaving: boolean;
  lastSaved?: Date | null;
  /** Only used on small screens — opens the left sidebar drawer. */
  onOpenLeftDrawer?: () => void;
  /** Only used on small screens — opens the right properties drawer. */
  onOpenRightDrawer?: () => void;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;

/** Toggle pill helper: shows "An"/"Aus" state with blue active styling. */
function ToggleButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-100 text-blue-800 border border-blue-300'
          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
      }`}
    >
      {children}
      {/* "An"/"Aus" label only visible on md+ to save space on phones */}
      <span className="hidden md:inline text-[10px]">{active ? 'An' : 'Aus'}</span>
    </button>
  );
}

export default function EditorToolbar({
  canvasConfig,
  onZoomChange,
  onToggleGrid,
  onToggleRulers,
  onToggleSnapToGrid,
  onToggleSnapToElements,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  onSave,
  isSaving,
  lastSaved,
  onOpenLeftDrawer,
  onOpenRightDrawer,
}: EditorToolbarProps) {
  const { zoom, showGrid, showRulers, snapToGrid, snapToElements } = canvasConfig;
  const zoomPercent = Math.round(zoom * 100);

  const clampZoom = (value: number) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));

  return (
    <div className="bg-white border-b px-2 py-2 sm:px-3 sm:py-3 flex flex-wrap items-center gap-y-2 gap-x-2 sm:gap-x-3 justify-between">
      {/* Left cluster: mobile drawer trigger + Undo/Redo + Zoom */}
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        {/* Mobile: open elements drawer */}
        {onOpenLeftDrawer && (
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenLeftDrawer}
            title="Elemente"
            className="lg:hidden"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}

        <div className="flex items-center gap-1 sm:border-r sm:pr-4">
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={!canUndo}
            title="Rückgängig (Strg+Z)"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onRedo}
            disabled={!canRedo}
            title="Wiederherstellen (Strg+Y)"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Center: Zoom */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline text-sm text-gray-600">Zoom:</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onZoomChange(clampZoom(zoom - 0.1))}
            disabled={zoom <= MIN_ZOOM}
          >
            -
          </Button>
          <Input
            type="number"
            value={zoomPercent}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!isNaN(parsed)) {
                onZoomChange(clampZoom(parsed / 100));
              }
            }}
            min={MIN_ZOOM * 100}
            max={MAX_ZOOM * 100}
            className="w-14 sm:w-16 text-center text-sm px-1"
          />
          <span className="text-sm text-gray-500">%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onZoomChange(clampZoom(zoom + 0.1))}
            disabled={zoom >= MAX_ZOOM}
          >
            +
          </Button>
        </div>
      </div>

      {/* Right cluster: view toggles + actions + mobile properties trigger */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {/* Save timestamp — hidden on narrow to avoid overflow */}
        {lastSaved && (
          <span className="hidden xl:inline text-xs text-gray-500">
            Zuletzt gespeichert: {lastSaved.toLocaleTimeString('de-CH')}
          </span>
        )}

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          {/* View toggles */}
          <ToggleButton active={showGrid} onClick={onToggleGrid} title="Gitter ein/aus">
            <Grid3x3 className="w-3.5 h-3.5" />
          </ToggleButton>

          <ToggleButton active={showRulers} onClick={onToggleRulers} title="Lineal ein/aus">
            <Ruler className="w-3.5 h-3.5" />
          </ToggleButton>

          {/* Snap toggles — labels hidden below md */}
          <ToggleButton active={snapToGrid} onClick={onToggleSnapToGrid} title="Am Gitter ausrichten">
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px]">Gitter</span>
          </ToggleButton>

          <ToggleButton
            active={snapToElements}
            onClick={onToggleSnapToElements}
            title="An Elementen ausrichten"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[10px]">Elemente</span>
          </ToggleButton>

          <div className="hidden sm:block border-l mx-1 h-6" />

          {/* Actions — label hidden below sm */}
          <Button onClick={onPreview} variant="outline" size="sm" title="Vorschau">
            <Eye className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Vorschau</span>
          </Button>
          <Button onClick={onSave} size="sm" disabled={isSaving} title="Speichern">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{isSaving ? 'Speichert...' : 'Speichern'}</span>
          </Button>

          {/* Mobile: open properties drawer */}
          {onOpenRightDrawer && (
            <Button
              size="sm"
              variant="outline"
              onClick={onOpenRightDrawer}
              title="Eigenschaften"
              className="lg:hidden"
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
