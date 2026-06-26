import AdvancedTemplateEditor from '@/components/invoices/AdvancedTemplateEditor';
import { isDemoMode } from '@/hooks/useDemoMode';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileStack, Eye } from 'lucide-react';

export default function InvoiceTemplateEditor() {
  // Im Demo-Modus ist der Vorlagen-Editor nur Vorschau (nicht bearbeitbar),
  // damit keine Vorlagen verändert oder exportiert werden können.
  if (isDemoMode) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3">
            <FileStack className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Rechnungsvorlagen</h1>
            <p className="mt-1 text-muted-foreground">Gestalten Sie das Layout Ihrer Rechnungen</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <CardTitle>Vorschau-Modus</CardTitle>
            </div>
            <CardDescription>
              Im Demo ist der Vorlagen-Editor nur als Vorschau verfügbar und nicht bearbeitbar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              In der Vollversion gestalten Sie hier Ihre Rechnungsvorlagen per Drag-and-drop: Logo,
              Absender, Positionen, Swiss QR-Rechnung und Farben — alles im eigenen Look.
            </p>
            <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6 text-center">
              <FileStack className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Standard-Vorlage (Demo)</p>
              <p className="mt-1">Aktiv für alle Demo-Rechnungen.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <AdvancedTemplateEditor />;
}
