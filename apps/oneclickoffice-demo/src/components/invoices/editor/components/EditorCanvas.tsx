import React, { useRef, useCallback } from 'react';
import type { CanvasConfig } from '../types';

interface EditorCanvasProps {
  canvasConfig: CanvasConfig;
  canvasRef?: React.RefObject<HTMLDivElement>;
  onCanvasClick: () => void;
  onDrop: (x: number, y: number, elementType: string) => void;
  children: React.ReactNode;
}

/** Ruler tick marks rendered every 50px with numeric labels on even ticks. */
function HorizontalRuler({ width, zoom }: { width: number; zoom: number }) {
  const tickCount = Math.ceil(width / 50) + 1;
  return (
    <div
      style={{
        position: 'absolute',
        top: '-30px',
        left: '30px',
        width: `${width}px`,
        height: '30px',
        background: '#f3f4f6',
        borderBottom: '1px solid #d1d5db',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        zIndex: 10,
      }}
    >
      {Array.from({ length: tickCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${i * 50}px`,
            top: 0,
            width: '1px',
            height: i % 2 === 0 ? '15px' : '10px',
            background: '#9ca3af',
          }}
        >
          {i % 2 === 0 && (
            <span
              style={{
                position: 'absolute',
                top: '16px',
                left: '-10px',
                fontSize: '9px',
                color: '#6b7280',
              }}
            >
              {i * 50}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function VerticalRuler({ height, zoom }: { height: number; zoom: number }) {
  const tickCount = Math.ceil(height / 50) + 1;
  return (
    <div
      style={{
        position: 'absolute',
        top: '30px',
        left: '-30px',
        width: '30px',
        height: `${height}px`,
        background: '#f3f4f6',
        borderRight: '1px solid #d1d5db',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        zIndex: 10,
      }}
    >
      {Array.from({ length: tickCount }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 50}px`,
            left: 0,
            height: '1px',
            width: i % 2 === 0 ? '15px' : '10px',
            background: '#9ca3af',
          }}
        >
          {i % 2 === 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                left: '16px',
                fontSize: '9px',
                color: '#6b7280',
                transform: 'rotate(-90deg)',
                transformOrigin: 'left',
                whiteSpace: 'nowrap',
              }}
            >
              {i * 50}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function RulerCorner({ zoom }: { zoom: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-30px',
        left: '-30px',
        width: '30px',
        height: '30px',
        background: '#e5e7eb',
        border: '1px solid #d1d5db',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        zIndex: 11,
      }}
    />
  );
}

export default function EditorCanvas({
  canvasConfig,
  canvasRef: externalCanvasRef,
  onCanvasClick,
  onDrop,
  children,
}: EditorCanvasProps) {
  const internalRef = useRef<HTMLDivElement>(null);
  const canvasRef = externalCanvasRef || internalRef;

  const { width, height, zoom, gridSize, showGrid, showRulers } = canvasConfig;

  const handleCanvasDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const elementType = e.dataTransfer.getData('elementType');
      if (!elementType) return;

      const rect = (canvasRef as React.RefObject<HTMLDivElement>).current?.getBoundingClientRect();
      if (!rect) return;

      const x = Math.round((e.clientX - rect.left) / zoom);
      const y = Math.round((e.clientY - rect.top) / zoom);
      onDrop(x, y, elementType);
    },
    [canvasRef, zoom, onDrop],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const gridBackground = showGrid
    ? `linear-gradient(to right, #d1d5db 1px, transparent 1px),
       linear-gradient(to bottom, #d1d5db 1px, transparent 1px)`
    : 'none';

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto' }}>
        {/* Rulers */}
        {showRulers && (
          <>
            <HorizontalRuler width={width} zoom={zoom} />
            <VerticalRuler height={height} zoom={zoom} />
            <RulerCorner zoom={zoom} />
          </>
        )}

        {/* Canvas surface */}
        <div
          ref={canvasRef as React.RefObject<HTMLDivElement>}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            margin: showRulers ? '30px 0 0 30px' : '0 auto',
            background: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'relative',
            backgroundImage: gridBackground,
            backgroundSize: showGrid ? `${gridSize}px ${gridSize}px` : 'auto',
          }}
          onClick={onCanvasClick}
          onDrop={handleCanvasDrop}
          onDragOver={handleDragOver}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
