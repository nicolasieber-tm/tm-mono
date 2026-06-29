import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Loader2, Camera, Check, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { useUnternehmenSettings } from "@/hooks/useUnternehmenSettings";
import { useIsSingleLevel } from "@/hooks/useClientHierarchyMode";
import { useClients } from "@/hooks/useClients";
import { useKunden } from "@/hooks/useKunden";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type FailedExpense = {
  id: string;
  receipt_image_url: string | null;
  processing_error: string | null;
  created_at: string;
};

const Spesen = () => {
  const { user } = useAuth();
  const { activeCompanyId } = useActiveCompany();
  const queryClient = useQueryClient();
  const { data: settings } = useUnternehmenSettings();
  const expenseClientLinkingEnabled =
    settings?.expense_client_linking_enabled ?? false;
  const isSingle = useIsSingleLevel();
  const { data: companies } = useKunden({ enabled: expenseClientLinkingEnabled });
  const { data: clients } = useClients({ enabled: expenseClientLinkingEnabled });
  const [formData, setFormData] = useState({ company_id: "", client_id: "" });
  const filteredClients =
    clients?.filter((c) => c.company_id === formData.company_id) || [];
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  // Failed expenses für diesen User - zum erneuten Analysieren
  const { data: failedExpenses = [] } = useQuery<FailedExpense[]>({
    queryKey: ['mobile-failed-expenses', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('id, receipt_image_url, processing_error, created_at')
        .eq('employee_id', user!.id)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as FailedExpense[];
    },
  });

  const uploadReceipt = async (file: File): Promise<string | null> => {
    try {
      setUploadProgress(30);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      setUploadProgress(50);
      const { error } = await supabase.storage
        .from("Spesen")
        .upload(fileName, file);

      if (error) throw error;

      setUploadProgress(80);
      const { data: { publicUrl } } = supabase.storage
        .from("Spesen")
        .getPublicUrl(fileName);

      setUploadProgress(100);
      return publicUrl;
    } catch {
      toast.error("Fehler beim Hochladen des Fotos");
      setUploadStatus('error');
      return null;
    }
  };

  /**
   * Subscribe to realtime updates for a specific expense row.
   * Fires when the edge function finishes (status changes to completed/failed).
   * Auto-cleans up after 60 seconds to avoid leaking channels.
   */
  const subscribeToExpenseUpdate = (expenseId: string) => {
    const channel = supabase
      .channel(`expense-${expenseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'expenses',
          filter: `id=eq.${expenseId}`,
        },
        (payload) => {
          const updated = payload.new as {
            status: string;
            amount: number | null;
            category: string | null;
            processing_error: string | null;
          };
          if (updated.status === 'completed') {
            toast.success(
              `✅ ${updated.amount?.toFixed(2) ?? '0.00'} CHF erkannt: ${updated.category ?? ''}`,
              { duration: 5000 }
            );
            queryClient.invalidateQueries({ queryKey: ['mobile-failed-expenses'] });
            supabase.removeChannel(channel);
          } else if (updated.status === 'failed') {
            toast.error(
              `❌ ${updated.processing_error ?? 'Fehler bei Verarbeitung'}`,
              { duration: 8000 }
            );
            queryClient.invalidateQueries({ queryKey: ['mobile-failed-expenses'] });
            supabase.removeChannel(channel);
          }
        }
      )
      .subscribe();

    // Auto-cleanup nach 60 Sekunden falls nichts kommt
    setTimeout(() => {
      supabase.removeChannel(channel);
    }, 60000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Datei ist zu groß. Maximal 10MB erlaubt.");
      return;
    }

    setReceiptFile(file);
    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');

    try {
      // Phase 1a: Upload zu Storage (max ~2s)
      const uploadedUrl = await uploadReceipt(file);
      if (!uploadedUrl) throw new Error('Upload failed');

      // Phase 1b: Insert expenses row mit status='processing'
      // Der Postgres Trigger feuert automatisch via pg_net und ruft die
      // Edge Function extract-expense-from-receipt auf (fire & forget).
      const { data: newExpense, error } = await supabase
        .from('expenses')
        .insert({
          employee_id: user!.id,
          unternehmen_id: activeCompanyId,
          company_id: formData.company_id || null,
          client_id: isSingle ? null : formData.client_id || null,
          receipt_image_url: uploadedUrl,
          status: 'processing',
          expense_date: new Date().toISOString().split('T')[0],
          amount: 0,
          category: 'Wird erkannt...',
        })
        .select('id')
        .single();

      if (error || !newExpense) throw error ?? new Error('Insert failed');

      // Sofortiges Feedback fuer den User - kein Warten auf AI
      setUploadStatus('success');
      toast.success("Beleg erfolgreich gespeichert – wird analysiert...");

      // Phase 2: Realtime Subscription fuer Live-Update wenn AI fertig ist
      subscribeToExpenseUpdate(newExpense.id);

      // Formular nach 3s zuruecksetzen
      setTimeout(() => {
        setReceiptFile(null);
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 3000);

    } catch {
      toast.error("Fehler beim Verarbeiten des Belegs");
      setUploadStatus('error');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Retry a failed expense by setting its status back to 'processing'.
   * The UPDATE trigger (expenses_ai_retry_trigger) automatically re-invokes
   * the edge function - no manual function call needed.
   */
  const retryExpense = async (expenseId: string) => {
    const { error } = await supabase
      .from('expenses')
      .update({ status: 'processing', processing_error: null })
      .eq('id', expenseId);

    if (error) {
      toast.error('Fehler beim erneuten Versuch');
      return;
    }

    toast.success('Beleg wird erneut analysiert...');
    subscribeToExpenseUpdate(expenseId);
    queryClient.invalidateQueries({ queryKey: ['mobile-failed-expenses'] });
  };

  return (
    <div className="min-h-screen bg-background p-5 pb-28">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-3">Spesen erfassen</h1>
        <p className="text-base text-muted-foreground">Quittung fotografieren für automatische Verarbeitung</p>
      </div>

      {expenseClientLinkingEnabled && (
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="m-spesen-company" className="text-base font-semibold">
                Firma
              </Label>
              <Select
                value={formData.company_id}
                onValueChange={(value) =>
                  setFormData({ company_id: value, client_id: "" })
                }
              >
                <SelectTrigger id="m-spesen-company" className="h-12 text-base">
                  <SelectValue placeholder="Firma wählen (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {companies?.map((company) => (
                    <SelectItem key={company.id} value={company.id} className="text-base py-3">
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!isSingle && (
              <div className="space-y-2">
                <Label htmlFor="m-spesen-client" className="text-base font-semibold">
                  Klient
                </Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(value) =>
                    setFormData((p) => ({ ...p, client_id: value }))
                  }
                  disabled={!formData.company_id}
                >
                  <SelectTrigger id="m-spesen-client" className="h-12 text-base">
                    <SelectValue
                      placeholder={
                        formData.company_id
                          ? "Klient wählen (optional)"
                          : "Zuerst Firma wählen"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredClients.map((client) => (
                      <SelectItem key={client.id} value={client.id} className="text-base py-3">
                        {client.first_name} {client.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Main Photo Upload Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 shadow-lg">
        <CardContent className="pt-10 pb-10">
          <div className="space-y-8">
            <div className="text-center">
              <Camera className="h-28 w-28 mx-auto mb-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground mb-3">Beleg fotografieren</h2>
              <p className="text-base text-muted-foreground">
                Foto oder PDF wird automatisch hochgeladen und verarbeitet
              </p>
            </div>

            {/* Camera Button (Primary) */}
            <div data-tour="receipt-camera">
              <input
                type="file"
                accept="image/*,application/pdf"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-camera"
                disabled={uploading}
                aria-label="Beleg mit Kamera fotografieren"
                aria-describedby="camera-help"
              />
              <label
                htmlFor="receipt-camera"
                className={`block border-3 border-primary rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  uploading
                    ? 'bg-primary/5 border-dashed cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 active:scale-95 shadow-lg'
                }`}
                role="button"
                aria-busy={uploading}
                aria-live="polite"
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                    e.preventDefault();
                    document.getElementById('receipt-camera')?.click();
                  }
                }}
              >
                {uploading ? (
                  <div className="text-primary">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin" />
                    <p className="text-xl font-bold">Wird hochgeladen...</p>
                    <p className="text-base mt-2">Bitte warten</p>
                  </div>
                ) : receiptFile && uploadStatus === 'success' ? (
                  <div className="text-primary-foreground">
                    <Check className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-xl font-bold">Erfolgreich!</p>
                    <p className="text-base mt-2">{receiptFile.name}</p>
                  </div>
                ) : (
                  <div className="text-primary-foreground">
                    <Camera className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-xl font-bold">Kamera öffnen</p>
                    <p className="text-base mt-2">Antippen um Foto zu machen</p>
                  </div>
                )}
              </label>
              <span id="camera-help" className="sr-only">
                Öffnet die Kamera zum Fotografieren des Belegs. Akzeptiert Bilder und PDF-Dateien bis 10MB.
              </span>

              {/* Progress Bar */}
              {uploading && (
                <div
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  className="mt-6 space-y-3"
                >
                  <Progress
                    value={uploadProgress}
                    className="h-2"
                    aria-label={`Upload-Fortschritt: ${uploadProgress}%`}
                  />
                  <p className="text-center text-sm text-muted-foreground">
                    {uploadProgress < 50 ? 'Wird vorbereitet...' :
                     uploadProgress < 80 ? 'Wird hochgeladen...' :
                     'Fast fertig...'}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {!uploading && receiptFile && uploadStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-green-900 text-base">Erfolgreich gespeichert!</p>
                      <p className="text-sm text-green-700 mt-0.5">Wird im Hintergrund analysiert</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm uppercase font-semibold">
                <span className="bg-background px-4 text-muted-foreground">oder</span>
              </div>
            </div>

            {/* File Picker Button (Secondary) */}
            <div>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-file"
                disabled={uploading}
                aria-label="Beleg aus Galerie wählen"
                aria-describedby="file-help"
              />
              <label
                htmlFor="receipt-file"
                className={`block border-2 border-input rounded-2xl p-8 text-center transition-all cursor-pointer ${
                  uploading
                    ? 'bg-muted cursor-not-allowed'
                    : 'bg-background hover:bg-muted hover:border-primary active:scale-95 shadow-md'
                }`}
                role="button"
                aria-busy={uploading}
                tabIndex={0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !uploading) {
                    e.preventDefault();
                    document.getElementById('receipt-file')?.click();
                  }
                }}
              >
                <Upload className="h-14 w-14 mx-auto mb-3 text-muted-foreground" />
                <p className="text-lg font-bold text-foreground">Aus Galerie wählen</p>
                <p className="text-base text-muted-foreground mt-2">Foto oder PDF hochladen</p>
              </label>
              <span id="file-help" className="sr-only">
                Wählen Sie eine Datei aus Ihrer Galerie. Akzeptiert Bilder und PDF-Dateien bis 10MB.
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Expenses - "Belege die Aufmerksamkeit brauchen" */}
      {failedExpenses.length > 0 && (
        <Card className="mt-8 border-2 border-orange-300 bg-orange-50/50 shadow-md">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              <h3 className="text-lg font-bold text-orange-900">
                Belege die Aufmerksamkeit brauchen ({failedExpenses.length})
              </h3>
            </div>
            <div className="space-y-3">
              {failedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3 bg-white rounded-lg border border-orange-200"
                >
                  <p className="text-sm text-orange-800 mb-2">
                    {exp.processing_error ?? 'Unbekannter Fehler'}
                  </p>
                  <Button
                    onClick={() => retryExpense(exp.id)}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Nochmal analysieren
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="mt-8 border-2 border-blue-200 bg-blue-50/50 shadow-md">
        <CardContent className="pt-6 pb-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Check className="h-7 w-7 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-blue-900 mb-2">Automatische Verarbeitung</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                Ihr Beleg wird automatisch analysiert und die Spese wird erstellt.
                Sie können alle Spesen in der Desktop-Ansicht unter "Spesen" einsehen.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Spesen;
