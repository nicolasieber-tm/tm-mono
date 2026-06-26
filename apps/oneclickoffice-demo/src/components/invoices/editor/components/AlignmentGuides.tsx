import React from 'react';
import type { AlignmentGuide, CanvasConfig } from '../types';

interface AlignmentGuidesProps {
  guides: AlignmentGuide[];
  canvasConfig: CanvasConfig;
}

/**
 * Renders blue snap-alignment guides over the canvas while dragging.
 * Vertical guides span the full canvas height; horizontal guides span full width.
 */
export default function AlignmentGuides({ guides, canvasConfig }: AlignmentGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, index) => (
        <div
          key={`guide-${index}`}
          style={{
            position: 'absolute',
            ...(guide.type === 'vertical'
              ? {
                  left: `${guide.position}px`,
                  top: 0,
                  width: '1px',
                  height: `${canvasConfig.height}px`,
                }
              : {
                  left: 0,
                  top: `${guide.position}px`,
                  width: `${canvasConfig.width}px`,
                  height: '1px',
                }),
            backgroundColor: '#2563eb',
            pointerEvents: 'none' as const,
            zIndex: 1000,
            opacity: 0.7,
            boxShadow: '0 0 2px rgba(37, 99, 235, 0.5)',
          }}
        >
          {guide.label && (
            <span
              style={{
                position: 'absolute',
                ...(guide.type === 'vertical'
                  ? { top: '4px', left: '4px' }
                  : { left: '4px', top: '-14px' }),
                fontSize: '9px',
                color: '#2563eb',
                background: 'rgba(219, 234, 254, 0.9)',
                padding: '1px 4px',
                borderRadius: '2px',
                whiteSpace: 'nowrap',
                pointerEvents: 'none' as const,
              }}
            >
              {guide.label}
            </span>
          )}
        </div>
      ))}
    </>
  );
}
