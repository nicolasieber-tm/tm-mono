import { useInvoice } from "@/hooks/useInvoices";
import {
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Loader2 } from "lucide-react";
import { formatCHF, formatDateDE } from "@/components/expenses/formatters";

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Entwurf",
  sent: "Offen",
  paid: "Bezahlt",
};

interface Props {
  id: string;
}

export const ActivityInvoiceDetail = ({ id }: Props) => {
  const { data: invoice, isLoading, error } = useInvoice(id);

  return (
    <DialogContent className="max-w-lg">
      <DialogTitle className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-blue-600" />
        {invoice ? `Rechnung ${invoice.invoice_number}` : "Rechnung"}
      </DialogTitle>
      <DialogDescription className="sr-only">Rechnungsdetails</DialogDescription>

      {isLoading && (
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      )}
      {error && !isLoading && (
        <p className="py-8 text-center text-sm text-destructive">
          Rechnung konnte nicht geladen werden.
        </p>
      )}

      {invoice && !isLoading && (
        <div className="space-y-4">
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Zeitraum</dt>
              <dd className="font-medium">
                {formatDateDE(invoice.period_start)} – {formatDateDE(invoice.period_end)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd className="font-medium">
                {INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Betrag</dt>
              <dd className="text-lg font-bold">CHF {formatCHF(Number(invoice.total) || 0)}</dd>
            </div>
          </dl>

          {invoice.pdf_url ? (
            <Button asChild className="w-full">
              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                PDF öffnen
              </a>
            </Button>
          ) : (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              Kein PDF vorhanden
            </p>
          )}
        </div>
      )}
    </DialogContent>
  );
};
