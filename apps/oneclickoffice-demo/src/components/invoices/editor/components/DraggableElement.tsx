import React, { useRef, useState, useEffect } from 'react';
import type { Element } from '../types';

// ── Caret helpers (preserve cursor while typing in contentEditable) ──────────

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

// ── Resize handle definitions ────────────────────────────────────────────────

const RESIZE_HANDLES: Array<{
  position: string;
  cursor: string;
  style: React.CSSProperties;
}> = [
  // Corners (8x8 squares)
  { position: 'nw', cursor: 'nw-resize', style: { top: -4, left: -4, width: 8, height: 8 } },
  { position: 'ne', cursor: 'ne-resize', style: { top: -4, right: -4, width: 8, height: 8 } },
  { position: 'sw', cursor: 'sw-resize', style: { bottom: -4, left: -4, width: 8, height: 8 } },
  { position: 'se', cursor: 'se-resize', style: { bottom: -4, right: -4, width: 8, height: 8 } },
  // Edge midpoints
  { position: 'n', cursor: 'n-resize', style: { top: -3, left: '50%', marginLeft: -8, width: 16, height: 6 } },
  { position: 's', cursor: 's-resize', style: { bottom: -3, left: '50%', marginLeft: -8, width: 16, height: 6 } },
  { position: 'w', cursor: 'w-resize', style: { top: '50%', left: -3, marginTop: -8, width: 6, height: 16 } },
  { position: 'e', cursor: 'e-resize', style: { top: '50%', right: -3, marginTop: -8, width: 6, height: 16 } },
];

// ── Props ────────────────────────────────────────────────────────────────────

interface DraggableElementProps {
  element: Element;
  isSelected: boolean;
  isEditing: boolean;
  isDragging: boolean;
  onSelect: (id: string, shiftKey: boolean) => void;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, handle: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
  onContentChange: (id: string, content: string) => void;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function DraggableElement({
  element,
  isSelected,
  isEditing,
  isDragging,
  onSelect,
  onDragStart,
  onResizeStart,
  onDoubleClick,
  onContentChange,
}: DraggableElementProps) {
  const textareaRef = useRef<HTMLElement | null>(null);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    if (!isEditing) {
      hasFocusedRef.current = false;
    }
  }, [isEditing]);

  // ── Line rendering ──────────────────────────────────────────────────────

  if (element.type === 'line') {
    const x2 = element.x2 ?? element.x;
    const y2 = element.y2 ?? element.y;
    const length = Math.sqrt(Math.pow(x2 - element.x, 2) + Math.pow(y2 - element.y, 2));
    const angle = (Math.atan2(y2 - element.y, x2 - element.x) * 180) / Math.PI;
    const HANDLE_SIZE = 8;

    const isHorizontal = Math.abs(element.y - y2) < 0.5;
    const isVertical = Math.abs(element.x - x2) < 0.5;
    const isPerfectlyAligned = isHorizontal || isVertical;

    return (
      <>
        {/* Line body */}
        <div
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          style={{
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${length}px`,
            height: `${element.borderWidth || 2}px`,
            backgroundColor: element.color || '#000000',
            transformOrigin: '0 50%',
            transform: `rotate(${angle}deg)`,
            cursor: isDragging ? 'grabbing' : 'grab',
            outline: isSelected ? '2px solid #2563eb' : 'none',
            outlineOffset: '2px',
            pointerEvents: 'auto',
            opacity: element.opacity !== undefined ? element.opacity : 1,
          }}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            e.stopPropagation();
            e.preventDefault();
            onSelect(element.id, e.shiftKey);
            onDragStart(element.id, e);
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(element.id, e.shiftKey);
          }}
        />

        {/* Alignment badge */}
        {isSelected && isPerfectlyAligned && (
          <div
            style={{
              position: 'absolute',
              left: `${(element.x + x2) / 2}px`,
              top: `${(element.y + y2) / 2 - 15}px`,
              transform: 'translateX(-50%)',
              backgroundColor: '#10b981',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 'bold',
              pointerEvents: 'none',
              zIndex: 15,
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
          >
            {isHorizontal ? '\u2194 Horizontal' : '\u2195 Vertikal'}
          </div>
        )}

        {/* Endpoint handles */}
        {isSelected && (
          <>
            <div
              style={{
                position: 'absolute',
                left: `${element.x - HANDLE_SIZE / 2}px`,
                top: `${element.y - HANDLE_SIZE / 2}px`,
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
                backgroundColor: '#2563eb',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'move',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(element.id, 'line-start', e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <div
              style={{
                position: 'absolute',
                left: `${x2 - HANDLE_SIZE / 2}px`,
                top: `${y2 - HANDLE_SIZE / 2}px`,
                width: `${HANDLE_SIZE}px`,
                height: `${HANDLE_SIZE}px`,
                backgroundColor: '#2563eb',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'move',
                pointerEvents: 'auto',
                zIndex: 10,
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(element.id, 'line-end', e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </>
        )}
      </>
    );
  }

  // ── Standard element rendering ──────────────────────────────────────────

  // Border computation
  let borderStyle: string =
    element.type === 'image'
      ? 'none'
      : element.borderColor
        ? `${element.borderWidth || 1}px ${element.borderStyle || 'solid'} ${element.borderColor}`
        : 'none';

  if (element.tableGroupId && (element.showVerticalGridLines || element.showHorizontalGridLines)) {
    const gridColor = element.gridLineColor || element.tableBorderColor || '#e5e7eb';
    const gridWidth = element.gridLineWidth || element.tableBorderWidth || 1;
    const gridLineStyle = element.gridLineStyle || element.tableBorderStyle || 'solid';
    borderStyle = `${gridWidth}px ${gridLineStyle} ${gridColor}`;
  }

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x}px`,
    top: `${element.y}px`,
    width: element.width ? `${element.width}px` : 'auto',
    height: element.height ? `${element.height}px` : 'auto',
    fontSize: element.fontSize ? `${element.fontSize}px` : '14px',
    color: element.color || '#000000',
    backgroundColor: element.backgroundColor || 'transparent',
    fontFamily: element.fontFamily || 'Arial',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textAlign: (element.textAlign as React.CSSProperties['textAlign']) || 'left',
    border: borderStyle,
    borderRadius: element.type === 'circle' ? '50%' : element.borderRadius ? `${element.borderRadius}px` : '0',
    transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
    opacity: element.opacity !== undefined ? element.opacity : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    userSelect: 'none',
    padding:
      element.type === 'rectangle' || element.type === 'circle'
        ? '0'
        : element.tableGroupId
          ? `${element.tablePadding || 8}px`
          : '4px',
    outline: isSelected ? '2px solid #2563eb' : 'none',
    outlineOffset: '2px',
    transition: isDragging ? 'none' : 'all 0.1s',
    display: element.tableGroupId ? 'flex' : 'block',
    flexDirection: element.tableGroupId ? 'column' : undefined,
    zIndex: element.zIndex ?? undefined,
  };

  // ── Content by type ─────────────────────────────────────────────────────

  const renderContent = () => {
    // Shapes
    if (element.type === 'rectangle' || element.type === 'circle') {
      return <div style={{ width: '100%', height: '100%' }} />;
    }

    // Image
    if (element.type === 'image') {
      if (element.imageUrl || element.src) {
        return (
          <img
            src={element.imageUrl || element.src}
            alt={element.content || ''}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
        );
      }
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
          }}
        >
          <span style={{ fontSize: '12px', color: '#666', fontWeight: 'bold' }}>
            {element.content}
          </span>
        </div>
      );
    }

    // Editable text / placeholder
    if (isEditing && (element.type === 'text' || element.type === 'placeholder')) {
      return (
        <div
          ref={(ref) => {
            if (ref) {
              textareaRef.current = ref;
              if (!hasFocusedRef.current) {
                hasFocusedRef.current = true;
                setTimeout(() => {
                  ref.focus();
                  const range = document.createRange();
                  const sel = window.getSelection();
                  if (ref.childNodes.length > 0) {
                    range.selectNodeContents(ref);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                  }
                }, 0);
              }
            }
          }}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: element.content || '' }}
          onInput={(e) => {
            const target = e.currentTarget;
            const caret = getCaretOffset(target);
            onContentChange(element.id, target.innerHTML);
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                setCaretOffset(textareaRef.current, caret);
              }
            });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              onDoubleClick(element.id); // toggle editing off
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 'inherit',
            color: 'inherit',
            fontFamily: 'inherit',
            fontWeight: 'inherit',
            fontStyle: 'inherit',
            textAlign: 'inherit',
            width: '100%',
            minHeight: '1em',
            cursor: 'text',
          }}
        />
      );
    }

    // Placeholder (view mode)
    if (element.type === 'placeholder') {
      return (
        <div
          style={{
            border: '1px dashed #9ca3af',
            padding: '2px 4px',
            borderRadius: '4px',
            background: 'rgba(229, 231, 235, 0.3)',
            minWidth: '40px',
            minHeight: '1em',
          }}
          dangerouslySetInnerHTML={{ __html: element.content || '' }}
        />
      );
    }

    // Text (view mode)
    return (
      <div
        style={{ minWidth: '20px', minHeight: '1em' }}
        dangerouslySetInnerHTML={{ __html: element.content || '' }}
      />
    );
  };

  return (
    <div
      // draggable=false + dragstart preventDefault stops the native HTML5
      // drag that the browser would otherwise start on children containing
      // <img> or rich text nodes. Without this the native drag hijacks the
      // mousedown and useDrag's document-level mousemove listener never fires,
      // which is why placed template elements could not be moved on the
      // canvas. Mouse events still flow normally to the React handlers below.
      draggable={false}
      onDragStart={(e) => e.preventDefault()}
      style={containerStyle}
      onMouseDown={(e) => {
        if (isEditing || e.button !== 0) return;
        e.stopPropagation();
        e.preventDefault();
        onSelect(element.id, e.shiftKey);
        onDragStart(element.id, e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(element.id, e.shiftKey);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (element.type === 'text' || element.type === 'placeholder') {
          onDoubleClick(element.id);
        }
      }}
    >
      {/* Table group badge */}
      {element.tableGroupId && (
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '0',
            backgroundColor: '#6366f1',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px 4px 0 0',
            fontSize: '9px',
            fontWeight: 'bold',
            pointerEvents: 'none',
            zIndex: 10,
            whiteSpace: 'nowrap',
          }}
        >
          {element.tableColumn === 'header' ? 'Kopfzeile' : element.tableColumn}
        </div>
      )}

      {renderContent()}

      {/* Resize handles (only when selected, not for lines) */}
      {isSelected && !isEditing && (
        <>
          {RESIZE_HANDLES.map((handle) => (
            <div
              key={handle.position}
              style={{
                position: 'absolute',
                ...handle.style,
                background: 'white',
                border: '1px solid #2563eb',
                cursor: handle.cursor,
                zIndex: 20,
                boxSizing: 'border-box',
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onResizeStart(element.id, handle.position, e);
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ))}
        </>
      )}
    </div>
  );
}
