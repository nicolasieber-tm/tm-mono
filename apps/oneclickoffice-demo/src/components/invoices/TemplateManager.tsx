import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Save, Trash2, Eye, FileText } from 'lucide-react';
import professionalInvoiceTemplate from '@/templates/professional-invoice-template';
import ProfessionalInvoiceTable from './ProfessionalInvoiceTable';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

interface Template {
  id: string;
  name: string;
  editable_html: string;
  editable_css: string;
  user_id: string;
  unternehmen_id?: string | null;
  created_at: string;
  updated_at: string;
}

export default function TemplateManager() {
  const { toast } = useToast();
  const { activeCompanyId } = useActiveCompany();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [templateName, setTemplateName] = useState('');
  const [templateHtml, setTemplateHtml] = useState('');
  const [templateCss, setTemplateCss] = useState('');

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, [activeCompanyId]);

  const loadTemplates = async () => {
    try {
      if (!activeCompanyId) {
        setTemplates([]);
        return;
      }

      const { data, error } = await supabase
        .from('invoice_templates')
        .select('*')
        .eq('unternehmen_id', activeCompanyId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTemplates(data || []);
    } catch {
      toast({
        title: 'Fehler',
        description: 'Templates konnten nicht geladen werden',
        variant: 'destructive',
      });
    }
  };

  const createNewTemplate = () => {
    setIsEditing(true);
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateHtml('');
    setTemplateCss('');
  };

  const useProfessionalTemplate = () => {
    setIsEditing(true);
    setSelectedTemplate(null);
    setTemplateName(professionalInvoiceTemplate.name);
    setTemplateHtml(professionalInvoiceTemplate.html);
    setTemplateCss(professionalInvoiceTemplate.css);
  };

  const editTemplate = (template: Template) => {
    setIsEditing(true);
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateHtml(template.editable_html || '');
    setTemplateCss(template.editable_css || '');
  };

  const saveTemplate = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      if (!activeCompanyId) {
        toast({
          title: 'Fehler',
          description: 'Bitte zuerst ein ERP-Unternehmen auswählen',
          variant: 'destructive',
        });
        return;
      }

      if (!templateName.trim()) {
        toast({
          title: 'Fehler',
          description: 'Bitte geben Sie einen Template-Namen ein',
          variant: 'destructive',
        });
        return;
      }

      if (selectedTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('invoice_templates')
          .update({
            name: templateName,
            editable_html: templateHtml,
            editable_css: templateCss,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedTemplate.id)
          .eq('unternehmen_id', activeCompanyId);

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Template wurde aktualisiert',
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('invoice_templates')
          .insert({
            user_id: user.id,
            unternehmen_id: activeCompanyId,
            name: templateName,
            file_url: '', // Not used for HTML templates
            editable_html: templateHtml,
            editable_css: templateCss,
          });

        if (error) throw error;

        toast({
          title: 'Erfolg',
          description: 'Template wurde erstellt',
        });
      }

      setIsEditing(false);
      loadTemplates();
    } catch {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht gespeichert werden',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Möchten Sie dieses Template wirklich löschen?')) {
      return;
    }

    try {
      if (!activeCompanyId) {
        toast({
          title: 'Fehler',
          description: 'Bitte zuerst ein ERP-Unternehmen auswählen',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('invoice_templates')
        .delete()
        .eq('id', templateId)
        .eq('unternehmen_id', activeCompanyId);

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Template wurde gelöscht',
      });

      loadTemplates();
    } catch {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht gelöscht werden',
        variant: 'destructive',
      });
    }
  };

  const previewTemplate = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="space-y-6">
      {/* Templates List */}
      {!isEditing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rechnungs-Templates</CardTitle>
              <div className="flex gap-2">
                <Button onClick={useProfessionalTemplate} variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Professional Template verwenden
                </Button>
                <Button onClick={createNewTemplate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Neues Template
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Keine Templates vorhanden.</p>
                <p className="text-sm mt-2">Erstellen Sie ein neues Template oder verwenden Sie das Professional Template.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Erstellt: {new Date(template.created_at).toLocaleDateString('de-CH')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editTemplate(template)}
                        >
                          Bearbeiten
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Template Editor */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedTemplate ? 'Template bearbeiten' : 'Neues Template erstellen'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Template Name */}
            <div>
              <Label>Template Name</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="z.B. Professional Invoice Swiss"
              />
            </div>

            {/* HTML Editor */}
            <div>
              <Label>HTML Template</Label>
              <Textarea
                value={templateHtml}
                onChange={(e) => setTemplateHtml(e.target.value)}
                placeholder="HTML Code mit Platzhaltern: {{firma}}, {{datum}}, {{positionen}}, etc."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Verfügbare Platzhalter: {'{'}{'{'}{'}'}firma}, {'{'}{'{'}{'}'}datum}, {'{'}{'{'}{'}'}rechnungsnummer}, {'{'}{'{'}{'}'}total},
                {'{{'}#each positionen{'}}'} ... {'{{'}/ each{'}}'}
              </p>
            </div>

            {/* CSS Editor */}
            <div>
              <Label>CSS Styling</Label>
              <Textarea
                value={templateCss}
                onChange={(e) => setTemplateCss(e.target.value)}
                placeholder="CSS Styles für das Template"
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            {/* Preview Button */}
            <Button
              variant="outline"
              onClick={previewTemplate}
              className="w-full"
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
            </Button>

            {/* Preview */}
            {showPreview && (
              <div className="border rounded-lg p-6 bg-white">
                <h3 className="text-lg font-semibold mb-4">Vorschau</h3>
                <div
                  dangerouslySetInnerHTML={{
                    __html: `<style>${templateCss}</style>${templateHtml}`,
                  }}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={saveTemplate} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Wird gespeichert...' : 'Speichern'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedTemplate(null);
                }}
              >
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professional Table Demo */}
      {!isEditing && templates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Professional Table Design - Vorschau</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfessionalInvoiceTable
              positionen={[
                {
                  beschreibung: 'Beispiel Position 1',
                  menge: 2,
                  einzelpreis: 100.0,
                  gesamtpreis: 200.0,
                },
                {
                  beschreibung: 'Beispiel Position 2',
                  menge: 1,
                  einzelpreis: 50.0,
                  gesamtpreis: 50.0,
                },
              ]}
              zwischensumme={250.0}
              offenerBetrag={250.0}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
