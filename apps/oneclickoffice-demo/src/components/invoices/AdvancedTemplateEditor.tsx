import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Upload, Loader2, Edit, Trash2, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import ModernTemplateEditor from './ModernTemplateEditor';
import { convertPdfToHtml } from '@/utils/pdfConverter';
import ProfessionalTemplatePreset from './ProfessionalTemplatePreset';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';
import { useSetLayoutChromeHidden } from '@/contexts/LayoutChromeContext';

interface Template {
  id: string;
  name: string;
  file_url: string;
  html_url?: string;
  css_url?: string;
  editable_html?: string;
  editable_css?: string;
  deckblatt_enabled?: boolean | null;
  deckblatt_html?: string | null;
  deckblatt_css?: string | null;
  created_at: string;
}

export default function AdvancedTemplateEditor() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [conversionStatus, setConversionStatus] = useState<string>('');
  const [conversionMethod, setConversionMethod] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { activeCompanyId } = useActiveCompany();

  // Hide the global app chrome (DesktopSidebar + MobileNavigation + page
  // padding) while the template editor is open, so the editor can use the
  // entire viewport. Auto-restores on unmount or when the user leaves edit
  // mode via "Zurück zur Übersicht".
  useSetLayoutChromeHidden(isEditing && !!selectedTemplate);

  useEffect(() => {
    loadTemplates();
  }, [activeCompanyId]);

  /**
   * Lädt alle Templates des aktuellen Users
   */
  const loadTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein',
        variant: 'destructive',
      });
      return;
    }

    if (!activeCompanyId) {
      setTemplates([]);
      return;
    }

    const { data, error } = await supabase
      .from('invoice_templates')
      .select('*')
      .eq('unternehmen_id', activeCompanyId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Templates konnten nicht geladen werden',
        variant: 'destructive',
      });
      return;
    }
    setTemplates(data || []);
  };

  /**
   * Upload PDF und speichere initial in Supabase
   */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!templateName.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Template-Namen ein',
        variant: 'destructive',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'Fehler',
        description: 'Sie müssen angemeldet sein',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsConverting(true);
      setConversionStatus('Uploading PDF...');
      setConversionMethod('');

      // 1. Upload PDF to storage
      const fileName = `${user.id}/${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('invoice_templates')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('invoice_templates')
        .getPublicUrl(uploadData.path);


      // 2. Create database record
      if (!activeCompanyId) {
        throw new Error('Kein ERP-Unternehmen ausgewählt');
      }

      const { data: templateData, error: insertError } = await supabase
        .from('invoice_templates')
        .insert({
          user_id: user.id,
          unternehmen_id: activeCompanyId,
          name: templateName,
          file_url: publicUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Convert PDF to HTML with 1:1 layout preservation
      setConversionStatus('Converting PDF to HTML (1:1 layout)...');

      const conversionResult = await convertPdfToHtml(file);

      if (conversionResult.success) {
        // Check if it's PDFix or PDF.js based on the conversion
        const isPDFix = import.meta.env.VITE_PDFIX_API_KEY;
        setConversionMethod(isPDFix ? 'PDFix API' : 'PDF.js (Client-side)');
        setConversionStatus(`Conversion successful with ${isPDFix ? 'PDFix API' : 'PDF.js'}`);
      } else {
        setConversionMethod('Fallback Template');
        setConversionStatus('Using fallback template');
      }

      // 4. Save HTML and CSS to database
      setConversionStatus('Saving to database...');
      const { error: updateError } = await supabase
        .from('invoice_templates')
        .update({
          editable_html: conversionResult.html,
          editable_css: conversionResult.css,
        })
        .eq('id', templateData.id);

      if (updateError) {
        throw updateError;
      }

      setConversionStatus('Complete');

      toast({
        title: 'Upload erfolgreich',
        description: conversionResult.success
          ? 'PDF wurde mit 1:1 Layout in HTML konvertiert'
          : 'Template wurde mit Standard-Layout erstellt',
      });

      // Reload templates
      await loadTemplates();
      setTemplateName('');

      // Reset status after delay
      setTimeout(() => {
        setConversionStatus('');
        setConversionMethod('');
      }, 3000);

    } catch (error) {
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Upload fehlgeschlagen',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  /**
   * Öffnet Template im GrapesJS Editor
   */
  const openEditor = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditing(true);
  };

  /**
   * Schließt Editor und lädt Templates neu
   */
  const closeEditor = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
    loadTemplates();
  };

  /**
   * Löscht ein Template
   */
  const deleteTemplate = async (id: string) => {
    if (!confirm('Möchten Sie dieses Template wirklich löschen?')) return;

    // Finde das Template, um die file_url zu bekommen
    const template = templates.find(t => t.id === id);

    if (template?.file_url) {
      // Extrahiere den Pfad aus der URL
      // Format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/PATH
      const urlParts = template.file_url.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        const [bucket, ...pathParts] = urlParts[1].split('/');
        const filePath = pathParts.join('/');

        // Lösche die Datei aus dem Storage
        const { error: storageError } = await supabase.storage
          .from(bucket)
          .remove([decodeURIComponent(filePath)]);

        // Fahre trotzdem fort mit dem Löschen des DB-Eintrags
      }
    }

    // Lösche den Datenbank-Eintrag
    if (!activeCompanyId) {
      toast({
        title: 'Fehler',
        description: 'Kein ERP-Unternehmen ausgewählt',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', id)
      .eq('unternehmen_id', activeCompanyId);

    if (error) {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht gelöscht werden',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Gelöscht',
      description: 'Template und zugehörige Dateien wurden gelöscht',
    });

    loadTemplates();
  };

  // Wenn Editor offen ist, zeige Modern Editor.
  // MainLayout liefert bereits h-[100dvh] über chromeHidden, deshalb kommt
  // der Editor hier nur mit h-full min-h-0 aus — vermeidet doppeltes h-screen
  // und die daraus entstehenden doppelten Scrollbars.
  if (isEditing && selectedTemplate) {
    return (
      <div className="h-full min-h-0 flex flex-col">
        <div className="bg-white border-b p-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold">{selectedTemplate.name}</h2>
            <p className="text-sm text-gray-500">Template bearbeiten - Moderner Editor</p>
          </div>
          <Button onClick={closeEditor} variant="outline">
            Zurück zur Übersicht
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <ModernTemplateEditor
            templateId={selectedTemplate.id}
            initialHtml={selectedTemplate.editable_html || ''}
            initialCss={selectedTemplate.editable_css || ''}
            initialDeckblattEnabled={selectedTemplate.deckblatt_enabled ?? false}
            initialDeckblattHtml={selectedTemplate.deckblatt_html ?? ''}
            initialDeckblattCss={selectedTemplate.deckblatt_css ?? ''}
            onSave={loadTemplates}
          />
        </div>
      </div>
    );
  }

  // Ansonsten zeige Template-Liste.
  // p-6 lebt hier (früher in InvoiceTemplateEditor.tsx), damit der Editor-Mode
  // das Padding nicht abbekommt.
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF Template hochladen und bearbeiten</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Laden Sie eine PDF-Rechnung hoch. Ein Standard-HTML-Template wird erstellt, das Sie dann im GrapesJS Editor anpassen können.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Upload Form */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Template-Name</label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="z.B. Standard Schweiz Rechnung"
                disabled={isConverting}
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isConverting || !templateName.trim()}
              className="flex items-center gap-2"
            >
              {isConverting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Konvertiert...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  PDF hochladen
                </>
              )}
            </Button>
          </div>

          {isConverting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">PDF wird konvertiert...</p>
                  <p className="text-sm text-blue-700 mt-1">{conversionStatus}</p>
                  {conversionMethod && (
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      {conversionMethod === 'Fallback Template' ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span className="text-amber-700">
                            Standard-Template (Konvertierung fehlgeschlagen)
                          </span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-green-700">
                            <strong>1:1 Layout-Konvertierung</strong> mit {conversionMethod}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Liste */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Ihre Templates</h2>

        {templates.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Noch keine Templates vorhanden</p>
              <p className="text-sm mt-2">Laden Sie Ihre erste PDF-Vorlage hoch</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-xs text-gray-500">
                    Erstellt: {new Date(template.created_at).toLocaleDateString('de-CH')}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-green-600 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Bereit zum Bearbeiten
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => openEditor(template)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Im Editor öffnen
                      </Button>
                      <Button
                        onClick={() => deleteTemplate(template.id)}
                        variant="destructive"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
