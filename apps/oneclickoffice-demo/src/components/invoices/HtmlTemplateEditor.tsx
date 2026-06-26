import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Code, Trash2, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveCompany } from '@/contexts/ActiveCompanyContext';

interface HtmlTemplate {
  id: string;
  user_id: string;
  unternehmen_id?: string | null;
  name: string;
  html_content: string;
  css_content: string;
  created_at: string;
  updated_at: string;
}

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rechnung {{rechnungsnummer}}</title>
</head>
<body>
  <div class="invoice-container">
    <div class="header">
      <h1>RECHNUNG</h1>
      <div class="invoice-number">Nr. {{rechnungsnummer}}</div>
      <div class="invoice-date">Datum: {{datum}}</div>
    </div>

    <div class="company-info">
      <h2>{{firma}}</h2>
    </div>

    <div class="invoice-details">
      <table class="items-table">
        <thead>
          <tr>
            <th>Beschreibung</th>
            <th>Menge</th>
            <th>Preis</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {{#each positionen}}
          <tr>
            <td>{{beschreibung}}</td>
            <td>{{menge}}</td>
            <td>CHF {{preis}}</td>
            <td>CHF {{total}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>

      <div class="total-section">
        <div class="total-row">
          <span class="total-label">Gesamtbetrag:</span>
          <span class="total-amount">CHF {{total}}</span>
        </div>
      </div>
    </div>

    <div class="qr-code-section">
      {{#if qrCodeData}}
      <img src="{{qrCodeDataUrl}}" alt="QR Code" class="qr-code" />
      {{/if}}
    </div>

    <div class="footer">
      <p>Vielen Dank für Ihr Vertrauen!</p>
    </div>
  </div>
</body>
</html>`;

const DEFAULT_CSS = `@page {
  size: A4;
  margin: 2cm;
}

body {
  font-family: 'Helvetica', 'Arial', sans-serif;
  color: #333;
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

.invoice-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.header {
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 3px solid #2563eb;
  padding-bottom: 20px;
}

.header h1 {
  color: #2563eb;
  font-size: 32px;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.invoice-number {
  font-size: 16px;
  color: #666;
  margin: 5px 0;
}

.invoice-date {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.company-info {
  margin-bottom: 30px;
}

.company-info h2 {
  color: #333;
  font-size: 24px;
  margin: 0 0 10px 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin: 30px 0;
}

.items-table thead {
  background-color: #f3f4f6;
}

.items-table th {
  padding: 12px;
  text-align: left;
  border-bottom: 2px solid #2563eb;
  font-weight: 600;
  color: #333;
}

.items-table td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.items-table tr:last-child td {
  border-bottom: none;
}

.total-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #2563eb;
  text-align: right;
}

.total-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin: 10px 0;
}

.total-label {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-amount {
  font-size: 24px;
  font-weight: 700;
  color: #2563eb;
}

.qr-code-section {
  margin-top: 40px;
  text-align: center;
}

.qr-code {
  width: 150px;
  height: 150px;
  border: 1px solid #e5e7eb;
  padding: 10px;
}

.footer {
  margin-top: 60px;
  text-align: center;
  color: #666;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}`;

export default function HtmlTemplateEditor() {
  const [templates, setTemplates] = useState<HtmlTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<HtmlTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [htmlContent, setHtmlContent] = useState(DEFAULT_HTML);
  const [cssContent, setCssContent] = useState(DEFAULT_CSS);
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit');
  const { toast } = useToast();
  const { activeCompanyId } = useActiveCompany();

  useEffect(() => {
    loadTemplates();
  }, [activeCompanyId]);

  const loadTemplates = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !activeCompanyId) {
      setTemplates([]);
      return;
    }

    const { data, error } = await supabase
      .from('html_invoice_templates')
      .select('*')
      .eq('user_id', user.id)
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

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte Template-Name eingeben',
        variant: 'destructive',
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (!activeCompanyId) {
      toast({
        title: 'Fehler',
        description: 'Bitte zuerst ein ERP-Unternehmen auswählen',
        variant: 'destructive',
      });
      return;
    }

    const templateData = {
      user_id: user.id,
      unternehmen_id: activeCompanyId,
      name: templateName,
      html_content: htmlContent,
      css_content: cssContent,
    };

    if (selectedTemplate) {
      const { error } = await supabase
        .from('html_invoice_templates')
        .update({ ...templateData, updated_at: new Date().toISOString() })
        .eq('id', selectedTemplate.id)
        .eq('unternehmen_id', activeCompanyId);

      if (error) {
        toast({
          title: 'Fehler',
          description: 'Template konnte nicht aktualisiert werden',
          variant: 'destructive',
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('html_invoice_templates')
        .insert(templateData);

      if (error) {
        toast({
          title: 'Fehler',
          description: 'Template konnte nicht gespeichert werden',
          variant: 'destructive',
        });
        return;
      }
    }

    toast({
      title: 'Erfolg',
      description: 'Template gespeichert',
    });

    loadTemplates();
  };

  const loadTemplate = (template: HtmlTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setHtmlContent(template.html_content);
    setCssContent(template.css_content);
  };

  const deleteTemplate = async (id: string) => {
    if (!activeCompanyId) {
      toast({
        title: 'Fehler',
        description: 'Bitte zuerst ein ERP-Unternehmen auswählen',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase
      .from('html_invoice_templates')
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
      title: 'Erfolg',
      description: 'Template gelöscht',
    });

    loadTemplates();
    if (selectedTemplate?.id === id) {
      newTemplate();
    }
  };

  const newTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName('');
    setHtmlContent(DEFAULT_HTML);
    setCssContent(DEFAULT_CSS);
  };

  const renderPreview = () => {
    // Sample data for preview
    const sampleData = {
      rechnungsnummer: 'RE-2025-001',
      datum: new Date().toLocaleDateString('de-CH'),
      firma: 'Musterfirma AG',
      positionen: [
        { beschreibung: 'Beratung', menge: '5', preis: '150.00', total: '750.00' },
        { beschreibung: 'Entwicklung', menge: '10', preis: '180.00', total: '1800.00' },
      ],
      total: '2550.00',
    };

    let html = htmlContent;

    // Replace simple placeholders
    html = html.replace(/\{\{rechnungsnummer\}\}/g, sampleData.rechnungsnummer);
    html = html.replace(/\{\{datum\}\}/g, sampleData.datum);
    html = html.replace(/\{\{firma\}\}/g, sampleData.firma);
    html = html.replace(/\{\{total\}\}/g, sampleData.total);

    // Replace positions loop (simple implementation)
    const positionsHtml = sampleData.positionen.map(pos => `
      <tr>
        <td>${pos.beschreibung}</td>
        <td>${pos.menge}</td>
        <td>CHF ${pos.preis}</td>
        <td>CHF ${pos.total}</td>
      </tr>
    `).join('');

    html = html.replace(/\{\{#each positionen\}\}[\s\S]*?\{\{\/each\}\}/g, positionsHtml);

    // Remove conditional blocks for QR code if no data
    html = html.replace(/\{\{#if qrCodeData\}\}[\s\S]*?\{\{\/if\}\}/g, '');

    return `
      <style>${cssContent}</style>
      ${html}
    `;
  };

  return (
    <div className="flex h-screen">
      {/* Template List Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">HTML Templates</h2>

        <Button onClick={newTemplate} className="w-full mb-6">
          <FileText className="w-4 h-4 mr-2" />
          Neues Template
        </Button>

        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTemplate?.id === template.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div onClick={() => loadTemplate(template)} className="flex-1">
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(template.created_at).toLocaleDateString('de-CH')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTemplate(template.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm">
          <h3 className="font-semibold mb-2 text-blue-900">Verfügbare Platzhalter:</h3>
          <ul className="space-y-1 text-blue-800">
            <li>• <code>{'{{firma}}'}</code></li>
            <li>• <code>{'{{datum}}'}</code></li>
            <li>• <code>{'{{rechnungsnummer}}'}</code></li>
            <li>• <code>{'{{total}}'}</code></li>
            <li>• <code>{'{{qrCodeDataUrl}}'}</code></li>
          </ul>
          <p className="mt-3 text-blue-700">Positionen-Loop:</p>
          <code className="text-xs block mt-1 bg-white p-2 rounded">
            {'{{#each positionen}}'}
            <br />
            {'  {{beschreibung}}'}
            <br />
            {'  {{menge}}'}
            <br />
            {'  {{preis}}'}
            <br />
            {'{{/each}}'}
          </code>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Template-Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={saveTemplate} disabled={!templateName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
            <div className="flex gap-2 ml-auto">
              <Button
                variant={previewMode === 'edit' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('edit')}
              >
                <Code className="w-4 h-4 mr-2" />
                Code
              </Button>
              <Button
                variant={previewMode === 'preview' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('preview')}
              >
                <Eye className="w-4 h-4 mr-2" />
                Vorschau
              </Button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {previewMode === 'edit' ? (
            <Tabs defaultValue="html" className="h-full flex flex-col">
              <TabsList className="mx-4 mt-4">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="flex-1 p-4 overflow-auto">
                <Textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="font-mono text-sm h-full min-h-[600px]"
                  placeholder="HTML Code hier eingeben..."
                />
              </TabsContent>
              <TabsContent value="css" className="flex-1 p-4 overflow-auto">
                <Textarea
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  className="font-mono text-sm h-full min-h-[600px]"
                  placeholder="CSS Code hier eingeben..."
                />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-full overflow-auto p-8 bg-gray-100">
              <Card className="max-w-4xl mx-auto">
                <CardContent className="p-0">
                  <div
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                    className="bg-white"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
