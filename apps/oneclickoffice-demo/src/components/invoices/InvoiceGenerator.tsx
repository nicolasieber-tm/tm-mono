import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Plus, Trash2 } from 'lucide-react';

interface InvoicePosition {
  beschreibung: string;
  menge: number;
  preis: number;
}

interface InvoiceData {
  firma: string;
  datum: string;
  rechnungsnummer: string;
  positionen: InvoicePosition[];
  total: number;
  qrCodeData?: string;
}

interface InvoiceTemplate {
  id: string;
  name: string;
  file_url: string;
  mapping?: Record<string, unknown> | null;
}

interface InvoiceGeneratorProps {
  templates: InvoiceTemplate[];
}

export default function InvoiceGenerator({ templates }: InvoiceGeneratorProps) {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<InvoiceTemplate | null>(null);
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    firma: '',
    datum: new Date().toISOString().split('T')[0],
    rechnungsnummer: '',
    positionen: [{ beschreibung: '', menge: 1, preis: 0 }],
    total: 0,
    qrCodeData: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Calculate total from positions
  const calculateTotal = (positions: InvoicePosition[]) => {
    return positions.reduce((sum, pos) => sum + pos.menge * pos.preis, 0);
  };

  // Update position
  const updatePosition = (index: number, field: keyof InvoicePosition, value: string | number) => {
    const newPositions = [...invoiceData.positionen];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setInvoiceData({
      ...invoiceData,
      positionen: newPositions,
      total: calculateTotal(newPositions),
    });
  };

  // Add position
  const addPosition = () => {
    setInvoiceData({
      ...invoiceData,
      positionen: [...invoiceData.positionen, { beschreibung: '', menge: 1, preis: 0 }],
    });
  };

  // Remove position
  const removePosition = (index: number) => {
    const newPositions = invoiceData.positionen.filter((_, i) => i !== index);
    setInvoiceData({
      ...invoiceData,
      positionen: newPositions,
      total: calculateTotal(newPositions),
    });
  };

  // Generate QR Code as PNG base64
  const generateQRCode = async (data: string): Promise<string> => {
    const qrDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 1,
    });
    return qrDataUrl;
  };

  // Main PDF generation function
  const generateInvoicePDF = async (): Promise<Uint8Array> => {
    if (!selectedTemplate) {
      throw new Error('Keine Vorlage ausgewählt');
    }

    // Fetch the template PDF
    const response = await fetch(selectedTemplate.file_url);
    const existingPdfBytes = await response.arrayBuffer();

    // Load the PDF
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Get page dimensions
    const { width, height } = firstPage.getSize();

    // Parse layout map from template
    const layoutMap = selectedTemplate.mapping || {};

    // Set default font
    const fontSize = 10;
    const textColor = rgb(0, 0, 0);

    // Write fixed fields based on layout map
    if (layoutMap.firma) {
      firstPage.drawText(invoiceData.firma, {
        x: layoutMap.firma.x,
        y: height - layoutMap.firma.y, // Convert from top-origin to bottom-origin
        size: fontSize,
        color: textColor,
      });
    }

    if (layoutMap.datum) {
      firstPage.drawText(invoiceData.datum, {
        x: layoutMap.datum.x,
        y: height - layoutMap.datum.y,
        size: fontSize,
        color: textColor,
      });
    }

    if (layoutMap.rechnungsnummer) {
      firstPage.drawText(invoiceData.rechnungsnummer, {
        x: layoutMap.rechnungsnummer.x,
        y: height - layoutMap.rechnungsnummer.y,
        size: fontSize,
        color: textColor,
      });
    }

    // Write dynamic positions
    if (layoutMap.positions_start && layoutMap.row_height) {
      const startY = height - layoutMap.positions_start.y;
      const rowHeight = layoutMap.row_height;

      invoiceData.positionen.forEach((pos, i) => {
        const y = startY - i * rowHeight;

        // Description
        if (layoutMap.position_beschreibung) {
          firstPage.drawText(pos.beschreibung, {
            x: layoutMap.position_beschreibung.x,
            y,
            size: fontSize,
            color: textColor,
          });
        }

        // Quantity
        if (layoutMap.position_menge) {
          firstPage.drawText(pos.menge.toString(), {
            x: layoutMap.position_menge.x,
            y,
            size: fontSize,
            color: textColor,
          });
        }

        // Price
        if (layoutMap.position_preis) {
          firstPage.drawText(`CHF ${pos.preis.toFixed(2)}`, {
            x: layoutMap.position_preis.x,
            y,
            size: fontSize,
            color: textColor,
          });
        }

        // Total per position
        if (layoutMap.position_total) {
          firstPage.drawText(`CHF ${(pos.menge * pos.preis).toFixed(2)}`, {
            x: layoutMap.position_total.x,
            y,
            size: fontSize,
            color: textColor,
          });
        }
      });
    }

    // Write total
    if (layoutMap.total) {
      firstPage.drawText(`CHF ${invoiceData.total.toFixed(2)}`, {
        x: layoutMap.total.x,
        y: height - layoutMap.total.y,
        size: fontSize + 2,
        color: textColor,
      });
    }

    // Add QR Code if data provided
    if (invoiceData.qrCodeData && layoutMap.qr_code) {
      try {
        const qrCodeDataUrl = await generateQRCode(invoiceData.qrCodeData);
        const qrCodeImageBytes = await fetch(qrCodeDataUrl).then((res) => res.arrayBuffer());
        const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);

        const qrSize = layoutMap.qr_code.width || 100;
        firstPage.drawImage(qrCodeImage, {
          x: layoutMap.qr_code.x,
          y: height - layoutMap.qr_code.y - qrSize,
          width: qrSize,
          height: qrSize,
        });
      } catch {
        // QR code embedding failed, continue without it
      }
    }

    // Save and return PDF bytes
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  };

  // Handle invoice generation
  const handleGenerateInvoice = async () => {
    try {
      setIsGenerating(true);

      // Validation
      if (!selectedTemplate) {
        toast({
          title: 'Fehler',
          description: 'Bitte wählen Sie eine Vorlage aus',
          variant: 'destructive',
        });
        return;
      }

      if (!invoiceData.firma || !invoiceData.rechnungsnummer) {
        toast({
          title: 'Fehler',
          description: 'Bitte füllen Sie Firma und Rechnungsnummer aus',
          variant: 'destructive',
        });
        return;
      }

      // Generate PDF
      const pdfBytes = await generateInvoicePDF();

      // Download PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rechnung_${invoiceData.rechnungsnummer}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      // Upload to Supabase Storage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const fileName = `${user.id}/${invoiceData.firma}/${invoiceData.rechnungsnummer}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from('INVOICES')
          .upload(fileName, pdfBytes, {
            contentType: 'application/pdf',
            upsert: true,
          });

        if (uploadError) {
          toast({
            title: 'Warnung',
            description: 'Rechnung wurde heruntergeladen, aber nicht in Supabase gespeichert',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Erfolg',
            description: 'Rechnung wurde generiert und gespeichert',
          });
        }
      } else {
        toast({
          title: 'Erfolg',
          description: 'Rechnung wurde heruntergeladen',
        });
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Rechnung konnte nicht generiert werden',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Rechnung generieren</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Selection */}
          <div>
            <Label>Vorlage auswählen</Label>
            <select
              className="w-full mt-1 p-2 border rounded-md"
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                setSelectedTemplate(template);
              }}
            >
              <option value="">-- Vorlage wählen --</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Firma</Label>
              <Input
                value={invoiceData.firma}
                onChange={(e) => setInvoiceData({ ...invoiceData, firma: e.target.value })}
                placeholder="Kohler Elektro AG"
              />
            </div>
            <div>
              <Label>Rechnungsnummer</Label>
              <Input
                value={invoiceData.rechnungsnummer}
                onChange={(e) => setInvoiceData({ ...invoiceData, rechnungsnummer: e.target.value })}
                placeholder="RE-2025-006"
              />
            </div>
            <div>
              <Label>Datum</Label>
              <Input
                type="date"
                value={invoiceData.datum}
                onChange={(e) => setInvoiceData({ ...invoiceData, datum: e.target.value })}
              />
            </div>
            <div>
              <Label>QR-Code Daten (optional)</Label>
              <Input
                value={invoiceData.qrCodeData || ''}
                onChange={(e) => setInvoiceData({ ...invoiceData, qrCodeData: e.target.value })}
                placeholder="Zahlungsinformationen"
              />
            </div>
          </div>

          {/* Positions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Positionen</Label>
              <Button size="sm" onClick={addPosition} variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Position hinzufügen
              </Button>
            </div>

            <div className="space-y-2">
              {invoiceData.positionen.map((pos, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Input
                      placeholder="Beschreibung"
                      value={pos.beschreibung}
                      onChange={(e) => updatePosition(index, 'beschreibung', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Menge"
                      value={pos.menge}
                      onChange={(e) => updatePosition(index, 'menge', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Preis"
                      value={pos.preis}
                      onChange={(e) => updatePosition(index, 'preis', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Input value={`CHF ${(pos.menge * pos.preis).toFixed(2)}`} disabled />
                  </div>
                  <div className="col-span-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removePosition(index)}
                      disabled={invoiceData.positionen.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-right">
              <span className="text-lg font-bold">Total: CHF {invoiceData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGenerating || !selectedTemplate}
            className="w-full"
          >
            <FileDown className="w-4 h-4 mr-2" />
            {isGenerating ? 'Wird generiert...' : 'Rechnung generieren'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
