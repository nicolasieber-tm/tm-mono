/**
 * PDF to HTML Conversion Utilities
 * Supports multiple conversion services for 1:1 PDF-to-HTML conversion
 */

import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - use local copy
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';

interface ConversionResult {
  html: string;
  css: string;
  success: boolean;
  error?: string;
}

/**
 * Convert PDF to HTML using PDFix API
 * Preserves exact layout, colors, spacing, fonts
 */
export async function convertPdfWithPDFix(pdfFile: File): Promise<ConversionResult> {
  const apiKey = import.meta.env.VITE_PDFIX_API_KEY;

  if (!apiKey) {
    return getFallbackTemplate();
  }

  try {
    const formData = new FormData();
    formData.append('file', pdfFile);
    formData.append('format', 'html');
    formData.append('preserve_layout', 'true');
    formData.append('embed_fonts', 'true');
    formData.append('embed_images', 'true');

    const response = await fetch('https://api.pdfix.net/v1/convert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`PDFix API error: ${response.statusText}`);
    }

    const result = await response.json();

    // Extract HTML and CSS from PDFix response
    const html = result.html || '';
    const css = result.css || '';

    return {
      html,
      css,
      success: true,
    };

  } catch (error) {
    return {
      ...getFallbackTemplate(),
      error: error instanceof Error ? error.message : 'Conversion failed',
    };
  }
}

/**
 * Convert PDF to HTML using PDF.js (client-side)
 * Extracts text, fonts, colors, AND graphic elements (lines, rectangles, borders)
 * Creates true HTML/CSS structure that matches PDF layout 1:1
 * All elements are editable in GrapesJS visual editor
 */
export async function convertPdfWithPdfJs(pdfFile: File): Promise<ConversionResult> {
  try {
    // Read PDF file
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Process first page only (for invoice templates)
    const page = await pdf.getPage(1);

    // Calculate scale to match A4 width (210mm = 794px at 96dpi)
    // Use higher precision for better layout accuracy
    const A4_WIDTH_PX = 794;
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    const scale = A4_WIDTH_PX / unscaledViewport.width;

    // Round viewport dimensions to avoid sub-pixel rendering issues
    const viewport = page.getViewport({ scale });
    const viewportWidth = Math.round(viewport.width);
    const viewportHeight = Math.round(viewport.height);

    // Extract graphics operations (lines, rectangles, colors)
    const operatorList = await page.getOperatorList();

    // Parse graphics operations to extract visual elements
    interface GraphicElement {
      type: 'line' | 'rect' | 'fill' | 'image';
      x: number;
      y: number;
      width?: number;
      height?: number;
      x2?: number;
      y2?: number;
      color?: string;
      strokeWidth?: number;
      fillColor?: string;
      isLogo?: boolean;
    }

    const graphicElements: GraphicElement[] = [];
    const imageElements: GraphicElement[] = [];
    let currentStrokeColor = '#000000';
    let currentFillColor = '#000000';
    let currentStrokeWidth = 1;
    let currentPath: { x: number; y: number; w: number; h: number } | null = null;
    let currentTransform: number[] = [1, 0, 0, 1, 0, 0]; // Identity matrix
    const transformStack: number[][] = []; // Stack for save/restore operations
    let pathCommands: Array<{ type: 'moveTo'; x: number; y: number } | { type: 'lineTo'; x: number; y: number; x2: number; y2: number } | { type: 'fill'; x: number; y: number; width: number; height: number; fillColor: string }> = [];
    let currentX = 0, currentY = 0; // Track current position for path operations

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const fn = operatorList.fnArray[i];
      const args = operatorList.argsArray[i];

      // Track transformations for accurate positioning
      if (fn === pdfjsLib.OPS.transform) {
        const [a, b, c, d, e, f] = args;
        // Update current transform matrix
        currentTransform = [a, b, c, d, e, f];
      }

      // Save/restore graphics state
      if (fn === pdfjsLib.OPS.save) {
        // Save current transform to stack
        transformStack.push([...currentTransform]);
      }

      if (fn === pdfjsLib.OPS.restore) {
        // Restore previous transform from stack
        if (transformStack.length > 0) {
          currentTransform = transformStack.pop()!;
        } else {
          currentTransform = [1, 0, 0, 1, 0, 0]; // Reset to identity if stack is empty
        }
      }

      // Detect images (logos, graphics)
      if (fn === pdfjsLib.OPS.paintImageXObject) {
        const imageName = args[0];

        // Calculate image position and size from current transform
        // Transform matrix: [a, b, c, d, e, f]
        // a,d = scale x,y; e,f = translate x,y
        const imageX = currentTransform[4] * scale;
        const imageWidth = Math.abs(currentTransform[0]) * scale;
        const imageHeight = Math.abs(currentTransform[3]) * scale;

        // PDF coordinates start from bottom-left, HTML from top-left
        // currentTransform[5] is the Y position in PDF coordinates (from bottom)
        // We need to convert to HTML coordinates (from top)
        const pdfBottomY = currentTransform[5] * scale;
        // In PDF, the image position is at the bottom-left of the image
        // Convert to top-left position for HTML
        const imageTopY = viewportHeight - pdfBottomY - imageHeight;

        // Heuristic: Images in the top portion of the page are likely logos
        const isLikelyLogo = imageTopY < viewportHeight * 0.3 && imageWidth < viewportWidth * 0.5;

        imageElements.push({
          type: 'image',
          x: Math.round(imageX * 100) / 100,
          y: Math.round(imageTopY * 100) / 100,
          width: Math.round(imageWidth * 100) / 100,
          height: Math.round(imageHeight * 100) / 100,
          isLogo: isLikelyLogo,
        });
      }

      // Set stroke color (RGB)
      if (fn === pdfjsLib.OPS.setStrokeRGBColor) {
        const [r, g, b] = args;
        currentStrokeColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      }

      // Set fill color (RGB)
      if (fn === pdfjsLib.OPS.setFillRGBColor) {
        const [r, g, b] = args;
        currentFillColor = `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
      }

      // Set stroke color (Gray)
      if (fn === pdfjsLib.OPS.setStrokeGray) {
        const gray = Math.round(args[0] * 255);
        currentStrokeColor = `rgb(${gray}, ${gray}, ${gray})`;
      }

      // Set fill color (Gray)
      if (fn === pdfjsLib.OPS.setFillGray) {
        const gray = Math.round(args[0] * 255);
        currentFillColor = `rgb(${gray}, ${gray}, ${gray})`;
      }

      // Set stroke color (CMYK - approximate to RGB)
      if (fn === pdfjsLib.OPS.setStrokeCMYKColor) {
        const [c, m, y, k] = args;
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));
        currentStrokeColor = `rgb(${r}, ${g}, ${b})`;
      }

      // Set fill color (CMYK - approximate to RGB)
      if (fn === pdfjsLib.OPS.setFillCMYKColor) {
        const [c, m, y, k] = args;
        const r = Math.round(255 * (1 - c) * (1 - k));
        const g = Math.round(255 * (1 - m) * (1 - k));
        const b = Math.round(255 * (1 - y) * (1 - k));
        currentFillColor = `rgb(${r}, ${g}, ${b})`;
      }

      // Set line width
      if (fn === pdfjsLib.OPS.setLineWidth) {
        currentStrokeWidth = Math.max(0.5, args[0] * scale); // Minimum 0.5px for visibility
      }

      // Set line cap style
      if (fn === pdfjsLib.OPS.setLineCap) {
        // Store line cap style if needed
      }

      // Set line join style
      if (fn === pdfjsLib.OPS.setLineJoin) {
        // Store line join style if needed
      }

      // Begin new path
      if (fn === pdfjsLib.OPS.beginPath) {
        pathCommands = [];
        currentPath = null;
      }

      // Close path - add line back to start to pathCommands
      if (fn === pdfjsLib.OPS.closePath) {
        if (pathCommands.length > 0) {
          const firstCmd = pathCommands.find(cmd => cmd.type === 'moveTo');
          if (firstCmd && (currentX !== firstCmd.x || currentY !== firstCmd.y)) {
            // Store line back to start - will be rendered when stroke() is called
            pathCommands.push({
              type: 'lineTo',
              x: currentX,
              y: currentY,
              x2: firstCmd.x,
              y2: firstCmd.y,
            });
          }
        }
      }

      // Move to position (start of line or path)
      if (fn === pdfjsLib.OPS.moveTo) {
        const [x, y] = args;
        currentX = x * scale;
        currentY = viewportHeight - (y * scale);
        pathCommands.push({ type: 'moveTo', x: currentX, y: currentY });
      }

      // Line to position
      if (fn === pdfjsLib.OPS.lineTo) {
        const [x, y] = args;
        const newX = x * scale;
        const newY = viewportHeight - (y * scale);

        // Store line command but don't add to graphicElements yet
        // Will be added when stroke() is called
        pathCommands.push({
          type: 'lineTo',
          x: currentX,
          y: currentY,
          x2: newX,
          y2: newY,
        });

        currentX = newX;
        currentY = newY;
      }

      // Rectangle (store for next operation)
      if (fn === pdfjsLib.OPS.rectangle) {
        const [x, y, w, h] = args;
        currentPath = {
          x: Math.round(x * scale * 100) / 100, // Round to 2 decimal places
          y: Math.round((viewportHeight - (y * scale) - (h * scale)) * 100) / 100,
          w: Math.round(w * scale * 100) / 100,
          h: Math.round(h * scale * 100) / 100,
        };
      }

      // Fill operation - creates filled rectangle with background color
      if (fn === pdfjsLib.OPS.fill || fn === pdfjsLib.OPS.eoFill) {
        if (currentPath) {
          graphicElements.push({
            type: 'fill',
            x: currentPath.x,
            y: currentPath.y,
            width: currentPath.w,
            height: currentPath.h,
            fillColor: currentFillColor,
          });
          currentPath = null;
        }
      }

      // Stroke operation - creates rectangle border OR strokes lines
      if (fn === pdfjsLib.OPS.stroke) {
        if (currentPath) {
          // Stroke rectangle
          graphicElements.push({
            type: 'rect',
            x: currentPath.x,
            y: currentPath.y,
            width: currentPath.w,
            height: currentPath.h,
            color: currentStrokeColor,
            strokeWidth: currentStrokeWidth,
          });
          currentPath = null;
        } else if (pathCommands.length > 0) {
          // Stroke lines from pathCommands
          for (const cmd of pathCommands) {
            if (cmd.type === 'lineTo') {
              graphicElements.push({
                type: 'line',
                x: Math.round(cmd.x * 100) / 100,
                y: Math.round(cmd.y * 100) / 100,
                x2: Math.round(cmd.x2 * 100) / 100,
                y2: Math.round(cmd.y2 * 100) / 100,
                color: currentStrokeColor,
                strokeWidth: Math.round(currentStrokeWidth * 100) / 100,
              });
            }
          }
          pathCommands = []; // Clear after stroking
        }
      }

      // Fill and stroke - creates rectangle with both fill and border
      if (fn === pdfjsLib.OPS.fillStroke || fn === pdfjsLib.OPS.eoFillStroke) {
        if (currentPath) {
          // Add filled rectangle
          graphicElements.push({
            type: 'fill',
            x: currentPath.x,
            y: currentPath.y,
            width: currentPath.w,
            height: currentPath.h,
            fillColor: currentFillColor,
          });
          // Add border
          graphicElements.push({
            type: 'rect',
            x: currentPath.x,
            y: currentPath.y,
            width: currentPath.w,
            height: currentPath.h,
            color: currentStrokeColor,
            strokeWidth: currentStrokeWidth,
          });
          currentPath = null;
        }
      }

      // Construct path from operations
      if (fn === pdfjsLib.OPS.constructPath) {
        const ops = args[0];
        const coords = args[1];
        let coordIndex = 0;
        let pathStartX = 0, pathStartY = 0;

        for (let opIndex = 0; opIndex < ops.length; opIndex++) {
          const op = ops[opIndex];

          if (op === pdfjsLib.OPS.moveTo) {
            currentX = coords[coordIndex] * scale;
            currentY = viewportHeight - (coords[coordIndex + 1] * scale);
            pathStartX = currentX;
            pathStartY = currentY;
            coordIndex += 2;
          } else if (op === pdfjsLib.OPS.lineTo) {
            const newX = coords[coordIndex] * scale;
            const newY = viewportHeight - (coords[coordIndex + 1] * scale);

            // Store line command - will be rendered when stroke() is called
            pathCommands.push({
              type: 'lineTo',
              x: currentX,
              y: currentY,
              x2: newX,
              y2: newY,
            });

            currentX = newX;
            currentY = newY;
            coordIndex += 2;
          } else if (op === pdfjsLib.OPS.curveTo) {
            // Bezier curve - store as line approximation
            const endX = coords[coordIndex + 4] * scale;
            const endY = viewportHeight - (coords[coordIndex + 5] * scale);

            pathCommands.push({
              type: 'lineTo',
              x: currentX,
              y: currentY,
              x2: endX,
              y2: endY,
            });

            currentX = endX;
            currentY = endY;
            coordIndex += 6;
          } else if (op === pdfjsLib.OPS.rectangle) {
            const x = coords[coordIndex] * scale;
            const y = coords[coordIndex + 1] * scale;
            const w = coords[coordIndex + 2] * scale;
            const h = coords[coordIndex + 3] * scale;

            currentPath = {
              x: Math.round(x * 100) / 100,
              y: Math.round((viewportHeight - y - h) * 100) / 100,
              w: Math.round(w * 100) / 100,
              h: Math.round(h * 100) / 100,
            };
            coordIndex += 4;
          } else if (op === pdfjsLib.OPS.closePath) {
            // Close path by adding line back to start to pathCommands
            if (currentX !== pathStartX || currentY !== pathStartY) {
              pathCommands.push({
                type: 'lineTo',
                x: currentX,
                y: currentY,
                x2: pathStartX,
                y2: pathStartY,
              });
            }
          }
        }
      }
    }

    let htmlContent = '';
    let cssStyles = `
      @page {
        size: A4;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background: #f5f5f5;
      }
      .pdf-page {
        position: relative;
        width: ${viewportWidth}px;
        height: ${viewportHeight}px;
        margin: 20px auto;
        background: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        overflow: visible;
      }
      .pdf-graphics-layer {
        position: absolute;
        left: 0;
        top: 0;
        pointer-events: none;
        z-index: 1;
      }
      .pdf-image {
        position: absolute;
        box-sizing: border-box;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9f9f9;
        color: #666;
        font-size: 14px;
        z-index: 2;
      }
    `;

    const textContent = await page.getTextContent();

    // Group text items by approximate Y position (to detect rows)
    interface TextItem {
      str: string;
      x: number;
      y: number;
      fontSize: number;
      fontFamily: string;
      fontWeight: string;
      fontStyle: string;
    }

    const textItems: TextItem[] = [];

    for (const item of textContent.items) {
      if ('str' in item && item.str.trim()) {
        const transform = item.transform;
        const x = Math.round(transform[4] * scale * 100) / 100;
        const y = Math.round((viewportHeight - (transform[5] * scale)) * 100) / 100; // Flip Y coordinate
        // Font size calculation: Use the scale from transform matrix and apply viewport scale
        const fontSize = Math.round(Math.sqrt(transform[0] * transform[0] + transform[1] * transform[1]) * scale * 100) / 100;

        // Extract font name and detect bold/italic from font name
        const fontName = item.fontName || 'Arial';
        // Improved bold detection: Also check for Semibold, Demi, and numeric weight indicators
        const isBold = /bold/i.test(fontName) ||
                      /black/i.test(fontName) ||
                      /heavy/i.test(fontName) ||
                      /semibold/i.test(fontName) ||
                      /demi/i.test(fontName) ||
                      /\b[6-9]00\b/.test(fontName); // Font weights 600-900 are bold
        const isItalic = /italic/i.test(fontName) || /oblique/i.test(fontName);

        // Clean font family name (remove bold/italic suffixes)
        let fontFamily = fontName
          .replace(/[-,+]/g, ' ')
          .replace(/\b(Bold|Italic|Regular|Medium|Light|Black|Heavy|Oblique)\b/gi, '')
          .trim() || 'Arial';

        textItems.push({
          str: item.str,
          x,
          y,
          fontSize,
          fontFamily,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal',
        });
      }
    }

    // Sort by Y position (top to bottom) then X position (left to right)
    textItems.sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y);
      if (yDiff < 3) { // Same line (reduced tolerance for better precision)
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    // Group text items into rows for table detection
    interface TextRow {
      items: TextItem[];
      y: number;
      minX: number;
      maxX: number;
      isTableRow?: boolean;
    }

    const textRows: TextRow[] = [];
    let currentRow: TextRow | null = null;

    for (const item of textItems) {
      if (!currentRow || Math.abs(item.y - currentRow.y) > 3) {
        // New row
        currentRow = {
          items: [item],
          y: item.y,
          minX: item.x,
          maxX: item.x + (item.str.length * item.fontSize * 0.5), // Approximate width
        };
        textRows.push(currentRow);
      } else {
        // Add to current row
        currentRow.items.push(item);
        currentRow.minX = Math.min(currentRow.minX, item.x);
        currentRow.maxX = Math.max(currentRow.maxX, item.x + (item.str.length * item.fontSize * 0.5));
      }
    }

    // Detect table rows (multiple items aligned horizontally)
    for (const row of textRows) {
      if (row.items.length >= 3) {
        // Check if items are evenly spaced (likely a table row)
        const gaps: number[] = [];
        for (let i = 1; i < row.items.length; i++) {
          gaps.push(row.items[i].x - row.items[i-1].x);
        }

        // If gaps are relatively consistent, it's likely a table row
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const isTable = gaps.every(gap => Math.abs(gap - avgGap) < avgGap * 0.5);
        row.isTableRow = isTable;
      }
    }

    // Build HTML with graphics first, then images, then text on top
    let pageHtml = `<div class="pdf-page" style="position: relative; width: ${viewportWidth}px; height: ${viewportHeight}px; margin: 0 auto; background: white;">`;

    // Add SVG layer for all graphics (lines, rectangles) for perfect rendering
    let svgContent = `<svg class="pdf-graphics-layer" style="position: absolute; left: 0; top: 0; width: ${viewportWidth}px; height: ${viewportHeight}px; pointer-events: none;" xmlns="http://www.w3.org/2000/svg">`;

    // Add graphic elements first (lines, rectangles, backgrounds)
    let graphicIndex = 0;
    for (const graphic of graphicElements) {
      if (graphic.type === 'line') {
        // Use SVG line for perfect rendering
        const x1 = graphic.x;
        const y1 = graphic.y;
        const x2 = graphic.x2 || graphic.x;
        const y2 = graphic.y2 || graphic.y;
        const strokeWidth = graphic.strokeWidth || 1;
        const color = graphic.color || '#000000';

        svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="square" />\n`;

      } else if (graphic.type === 'rect') {
        // Use SVG rect for perfect rendering
        const x = graphic.x;
        const y = graphic.y;
        const width = graphic.width || 0;
        const height = graphic.height || 0;
        const strokeWidth = graphic.strokeWidth || 1;
        const color = graphic.color || '#000000';

        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" />\n`;

      } else if (graphic.type === 'fill') {
        // Use SVG rect for filled rectangles
        const x = graphic.x;
        const y = graphic.y;
        const width = graphic.width || 0;
        const height = graphic.height || 0;
        const fillColor = graphic.fillColor || '#ffffff';

        svgContent += `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fillColor}" stroke="none" />\n`;
      }

      graphicIndex++;
    }

    // Close SVG and add to page
    svgContent += `</svg>\n`;
    pageHtml += svgContent;

    // Add image elements (logos, graphics)
    let imageIndex = 0;
    for (const image of imageElements) {
      const imageClass = `pdf-image-${imageIndex}`;

      cssStyles += `
      .${imageClass} {
        position: absolute;
        left: ${image.x}px;
        top: ${image.y}px;
        width: ${image.width}px;
        height: ${image.height}px;
        border: 1px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f9f9f9;
        color: #666;
        font-size: 14px;
      }
      `;

      // Insert {{logo}} placeholder for logo images, or generic image placeholder
      const placeholderContent = image.isLogo ? '{{logo}}' : '{{bild}}';
      pageHtml += `<div class="${imageClass} pdf-image">${placeholderContent}</div>\n`;

      imageIndex++;
    }

    // Now add text elements on top, processing by rows
    let itemIndex = 0;
    cssStyles += '\n';

    // Track if we're in a table section
    let inTableSection = false;
    let tableRowIndex = 0;

    for (const row of textRows) {
      // Check if this row starts a table section
      if (row.isTableRow && !inTableSection) {
        inTableSection = true;
        tableRowIndex = 0;
      } else if (!row.isTableRow && inTableSection) {
        inTableSection = false;
      }

      for (const item of row.items) {
        const className = `pdf-item-${itemIndex}`;

        // Check if text might be a placeholder field
        let content = item.str;
        const isNumeric = /^\d+([.,]\d+)?$/.test(content.trim());
        const isDate = /^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/.test(content.trim());

        // Handle table rows specially for invoice positions
        if (inTableSection && tableRowIndex > 0) {
          // This is likely an invoice position row
          const colIndex = row.items.indexOf(item);

          if (colIndex === 0) {
            // First column - usually description
            content = '{{beschreibung}}';
          } else if (colIndex === 1 && row.items.length >= 4) {
            // Second column - usually quantity
            content = '{{menge}}';
          } else if (colIndex === 2 && row.items.length >= 4) {
            // Third column - usually unit price
            content = '{{einzelpreis}}';
          } else if (colIndex === row.items.length - 1) {
            // Last column - usually total
            content = '{{gesamtpreis}}';
          }
        } else {
          // Replace common invoice fields with placeholders
          if (content.toLowerCase().includes('rechnung') && !content.match(/\d/)) {
            // Keep "RECHNUNG" header as is
          } else if (content.toLowerCase().includes('nr') || content.toLowerCase().includes('nummer')) {
            content = '{{rechnungsnummer}}';
          } else if (isDate) {
            content = '{{datum}}';
          } else if (content.toLowerCase().includes('ag') || content.toLowerCase().includes('gmbh')) {
            content = '{{firma}}';
          } else if (isNumeric && parseFloat(content.replace(',', '.')) > 100) {
            content = '{{betrag}}';
          }
        }

        // Add CSS class for this item with higher precision
        cssStyles += `
        .${className} {
          position: absolute;
          left: ${item.x}px;
          top: ${item.y}px;
          font-size: ${item.fontSize}px;
          font-family: ${item.fontFamily}, Arial, sans-serif;
          font-weight: ${item.fontWeight};
          font-style: ${item.fontStyle};
          white-space: nowrap;
          line-height: 1.2;
          z-index: 10;
        }
        `;

        pageHtml += `<div class="${className}">${content}</div>\n`;
        itemIndex++;
      }

      if (inTableSection) {
        tableRowIndex++;
      }
    }

    pageHtml += '</div>';

    htmlContent = pageHtml;

    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rechnung {{rechnungsnummer}}</title>
</head>
<body>
  ${htmlContent}
</body>
</html>`;

    return {
      html: fullHtml,
      css: cssStyles,
      success: true,
    };

  } catch (error) {
    return {
      ...getFallbackTemplate(),
      error: error instanceof Error ? error.message : 'PDF.js conversion failed',
    };
  }
}

/**
 * Fallback: Generate professional default HTML template
 * Used when API conversion fails or is not available
 */
export function getFallbackTemplate(): ConversionResult {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rechnung {{rechnungsnummer}}</title>
</head>
<body>
  <div style="padding: 40px; max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
    <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px;">
      <h1 style="color: #2563eb; font-size: 32px; margin: 0 0 10px 0;">RECHNUNG</h1>
      <div style="font-size: 16px; color: #666;">Nr. {{rechnungsnummer}}</div>
      <div style="font-size: 14px; color: #666;">Datum: {{datum}}</div>
    </div>

    <div style="margin-bottom: 30px;">
      <h2 style="color: #333; font-size: 24px; margin: 0 0 10px 0;">{{firma}}</h2>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 30px 0;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb;">Beschreibung</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb;">Menge</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb;">Preis</th>
          <th style="padding: 12px; text-align: left; border-bottom: 2px solid #2563eb;">Total</th>
        </tr>
      </thead>
      <tbody>
        {{#each positionen}}
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{{beschreibung}}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">{{menge}}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">CHF {{preis}}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">CHF {{total}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #2563eb; text-align: right;">
      <div style="display: flex; justify-content: flex-end; align-items: center; margin: 10px 0;">
        <span style="font-size: 24px; font-weight: 700; color: #2563eb;">CHF {{betrag}}</span>
      </div>
    </div>

    <div style="margin-top: 60px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <p>Vielen Dank für Ihr Vertrauen!</p>
    </div>
  </div>
</body>
</html>`;

  return {
    html,
    css: '',
    success: false,
  };
}

/**
 * Auto-detect best conversion method and convert PDF
 */
export async function convertPdfToHtml(pdfFile: File): Promise<ConversionResult> {
  // Try PDFix API first (if configured)
  const apiKey = import.meta.env.VITE_PDFIX_API_KEY;

  if (apiKey) {
    const result = await convertPdfWithPDFix(pdfFile);
    if (result.success) {
      return result;
    }
  }

  // Use PDF.js for client-side conversion (1:1 layout preservation)
  const pdfJsResult = await convertPdfWithPdfJs(pdfFile);
  if (pdfJsResult.success) {
    return pdfJsResult;
  }

  // Fallback to default template only if PDF.js fails
  return getFallbackTemplate();
}
