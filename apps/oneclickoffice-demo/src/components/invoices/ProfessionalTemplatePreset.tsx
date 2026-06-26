import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import professionalInvoiceTemplate from '@/templates/professional-invoice-template';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProfessionalTemplatePresetProps {
  onTemplateCreated?: () => void;
}

export default function ProfessionalTemplatePreset({ onTemplateCreated }: ProfessionalTemplatePresetProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = React.useState(false);

  const createProfessionalTemplate = async () => {
    try {
      setIsCreating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Fehler',
          description: 'Sie müssen angemeldet sein',
          variant: 'destructive',
        });
        return;
      }

      // Check if template with this name already exists
      const { data: existing } = await supabase
        .from('invoice_templates')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', professionalInvoiceTemplate.name)
        .single();

      if (existing) {
        toast({
          title: 'Hinweis',
          description: 'Dieses Template existiert bereits',
          variant: 'default',
        });
        return;
      }

      // Create new template with professional design
      const { error } = await supabase
        .from('invoice_templates')
        .insert({
          user_id: user.id,
          name: professionalInvoiceTemplate.name,
          file_url: '', // Not used for HTML templates
          editable_html: professionalInvoiceTemplate.html,
          editable_css: professionalInvoiceTemplate.css,
        });

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Professional Template wurde erstellt',
      });

      // Callback to refresh template list
      if (onTemplateCreated) {
        onTemplateCreated();
      }
    } catch {
      toast({
        title: 'Fehler',
        description: 'Template konnte nicht erstellt werden',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          <FileText className="w-4 h-4" />
          Professional Template erstellen
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Professional Invoice Template</AlertDialogTitle>
          <AlertDialogDescription>
            Möchten Sie ein vorgefertigtes professionelles Rechnungs-Template erstellen?
            <br /><br />
            <strong>Enthält:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Professionelles Tabellen-Layout wie im Referenz-Design</li>
              <li>Graue Tabellen-Header</li>
              <li>Alternierende Zeilen-Farben</li>
              <li>Zwischensumme und Offener Betrag</li>
              <li>Schweizer Standard-Format (A4)</li>
              <li>Alle Platzhalter für Firmendaten</li>
              <li>QR-Code Unterstützung</li>
            </ul>
            <br />
            Das Template kann nach der Erstellung vollständig angepasst werden.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction onClick={createProfessionalTemplate} disabled={isCreating}>
            {isCreating ? 'Wird erstellt...' : 'Jetzt erstellen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
