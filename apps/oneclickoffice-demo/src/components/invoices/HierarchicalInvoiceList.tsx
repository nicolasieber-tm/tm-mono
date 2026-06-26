import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, ChevronDown, Pencil, Trash2, FileText, FileDown, Loader2, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateWorkReportForInvoice } from '@/utils/workReportGenerator';
import { isDemoMode } from '@/hooks/useDemoMode';
import { useQueryClient } from '@tanstack/react-query';

interface Invoice {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total: number;
  status: string;
  pdf_url?: string;
  work_report_url?: string;
  client_id: string;
  created_at: string;
  clients?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  companies?: {
    id: string;
    name: string;
  };
}

interface HierarchicalInvoiceListProps {
  invoices: Invoice[];
  companies: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; first_name: string; last_name: string; company_id: string }>;
  expandedCompanies?: Set<string>;
  selectedClientId?: string | null;
  onExpandedCompaniesChange?: (next: Set<string>) => void;
  onSelectedClientIdChange?: (next: string | null) => void;
  focusedInvoiceId?: string | null;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onStatusChange: (invoiceId: string, newStatus: string) => void;
  formatDate: (date: string) => string;
  formatAmount: (amount: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusVariant: (status: string) => "default" | "secondary" | "outline";
  /** Hierarchy display mode. Defaults to "two_level". */
  mode?: "two_level" | "single_level";
}

export default function HierarchicalInvoiceList({
  invoices,
  companies,
  clients,
  expandedCompanies,
  selectedClientId,
  onExpandedCompaniesChange,
  onSelectedClientIdChange,
  focusedInvoiceId,
  onEdit,
  onDelete,
  onStatusChange,
  formatDate,
  formatAmount,
  getStatusLabel,
  getStatusVariant,
  mode = "two_level",
}: HierarchicalInvoiceListProps) {
  const [internalExpandedCompanies, setInternalExpandedCompanies] = useState<Set<string>>(new Set());
  const [internalSelectedClientId, setInternalSelectedClientId] = useState<string | null>(null);
  const [generatingWorkReport, setGeneratingWorkReport] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const expandedCompaniesState = expandedCompanies ?? internalExpandedCompanies;
  const selectedClientIdState = selectedClientId ?? internalSelectedClientId;
  const updateExpandedCompanies = onExpandedCompaniesChange ?? setInternalExpandedCompanies;
  const updateSelectedClientId = onSelectedClientIdChange ?? setInternalSelectedClientId;

  // Group invoices by company and client (two_level mode)
  const groupedInvoices = useMemo(() => {
    const grouped: Record<string, Record<string, Invoice[]>> = {};

    invoices?.forEach((invoice) => {
      const clientId = invoice.client_id || 'no-client';

      // Find the client to get their company_id
      const client = clients?.find(c => c.id === clientId);
      const companyId = client?.company_id || invoice.companies?.id || 'no-company';

      if (!grouped[companyId]) {
        grouped[companyId] = {};
      }
      if (!grouped[companyId][clientId]) {
        grouped[companyId][clientId] = [];
      }
      grouped[companyId][clientId].push(invoice);
    });

    return grouped;
  }, [invoices, clients]);

  // Group invoices directly by kunden (single_level mode: Kunde → Invoices, no client layer)
  const groupedByKunden = useMemo(() => {
    const grouped: Record<string, Invoice[]> = {};

    invoices?.forEach((invoice) => {
      const clientId = invoice.client_id || 'no-client';
      const client = clients?.find(c => c.id === clientId);
      const companyId = client?.company_id || invoice.companies?.id || 'no-company';

      if (!grouped[companyId]) {
        grouped[companyId] = [];
      }
      grouped[companyId].push(invoice);
    });

    // Sort invoices within each group by created_at desc
    Object.keys(grouped).forEach((companyId) => {
      grouped[companyId].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    return grouped;
  }, [invoices, clients]);

  // Get latest invoice for a client
  const getLatestInvoice = (clientInvoices: Invoice[]) => {
    return clientInvoices.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  };

  // Toggle company expansion
  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompaniesState);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    updateExpandedCompanies(newExpanded);
  };

  // Get company name by ID
  const getCompanyName = (companyId: string) => {
    if (companyId === 'no-company') return 'Ohne Firma';
    const company = companies?.find(c => c.id === companyId);
    return company?.name || 'Unbekannte Firma';
  };

  // Get client name by ID
  const getClientName = (clientId: string) => {
    const client = clients?.find(c => c.id === clientId);
    if (!client) return 'Unbekannter Klient';
    return `${client.first_name} ${client.last_name}`;
  };

  // Generate work report
  const handleGenerateWorkReport = async (invoice: Invoice) => {
    setGeneratingWorkReport(invoice.id);

    try {
      const result = await generateWorkReportForInvoice(invoice.id);

      if (result) {
        toast.success('Arbeitsrapport erfolgreich generiert');

        // Invalidate invoices query to refresh the list with new work_report_url
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
      } else {
        toast.error('Arbeitsrapport konnte nicht generiert werden');
      }
    } catch {
      toast.error('Fehler beim Generieren des Arbeitsrapports');
    } finally {
      setGeneratingWorkReport(null);
    }
  };

  // Download file helper - forces download instead of opening in browser
  const handleDownload = async (url: string, filename: string) => {
    try {
      // Fetch the file as a blob to force download behavior
      const response = await fetch(url);
      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      toast.error('Fehler beim Herunterladen der Datei');
    }
  };

  // Add cache buster to URL to prevent browser caching issues
  const addCacheBuster = (url: string) => {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  };

  // Get work report filename for a specific invoice
  const getWorkReportFilename = (invoice: Invoice) => {
    let subjectName: string;
    if (invoice.clients) {
      subjectName = `${invoice.clients.first_name} ${invoice.clients.last_name}`;
    } else {
      // single_level mode: no client — fall back to company name
      const companyId = invoice.companies?.id || 'no-company';
      const companyName = getCompanyName(companyId);
      subjectName = companyName !== 'Ohne Firma' && companyName !== 'Unbekannte Firma'
        ? companyName
        : '';
    }
    const periodRange = `${formatDate(invoice.period_start)} - ${formatDate(invoice.period_end)}`;
    return subjectName
      ? `Arbeitsrapport ${subjectName} ${periodRange}.pdf`
      : `Arbeitsrapport ${periodRange}.pdf`;
  };

  // ── Shared invoice-card renderer (used by both modes) ─────────────────────
  const renderInvoiceCard = (invoice: Invoice) => (
    <Card
      key={invoice.id}
      id={`invoice-${invoice.id}`}
      className={`p-4 ${focusedInvoiceId === invoice.id ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-medium">{invoice.invoice_number}</span>
            <Select
              value={invoice.status}
              onValueChange={(value) => onStatusChange(invoice.id, value)}
            >
              <SelectTrigger className="w-[140px]" onClick={(e) => e.stopPropagation()}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Entwurf</SelectItem>
                <SelectItem value="sent">Versendet</SelectItem>
                <SelectItem value="paid">Bezahlt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg">{formatAmount(invoice.total)}</span>

          {/* Document Actions */}
          <div className="flex items-center gap-3 border-l pl-3">
            {/* Invoice PDF Buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Rechnung</span>
              <div className="flex gap-1">
                {invoice.pdf_url ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Demo: Blob-URL ohne Cache-Buster öffnen (HTML-Vorschau).
                        window.open(isDemoMode ? invoice.pdf_url! : addCacheBuster(invoice.pdf_url!), '_blank');
                      }}
                      title="Rechnung ansehen"
                      className="h-8 px-2"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">{isDemoMode ? 'Vorschau' : 'Ansehen'}</span>
                    </Button>
                    {!isDemoMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(addCacheBuster(invoice.pdf_url!), `Rechnung_${invoice.invoice_number}.pdf`);
                        }}
                        title="Rechnung downloaden"
                        className="h-8 px-2"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Download</span>
                      </Button>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground italic">{isDemoMode ? 'Noch keine Vorschau' : 'Kein PDF'}</span>
                )}
              </div>
            </div>

            {/* Work Report Buttons */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Arbeitsrapport</span>
              <div className="flex gap-1">
                {invoice.work_report_url ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(addCacheBuster(invoice.work_report_url!), '_blank');
                      }}
                      title="Arbeitsrapport ansehen"
                      className="h-8 px-2"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Ansehen</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(addCacheBuster(invoice.work_report_url!), getWorkReportFilename(invoice));
                      }}
                      title="Arbeitsrapport downloaden"
                      className="h-8 px-2"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">Download</span>
                    </Button>
                  </>
                ) : generatingWorkReport === invoice.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="h-8 px-2"
                  >
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    <span className="text-xs">Generiert...</span>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateWorkReport(invoice);
                    }}
                    title="Arbeitsrapport nachträglich generieren"
                    className="h-8 px-2"
                  >
                    <FileDown className="h-3.5 w-3.5 mr-1" />
                    <span className="text-xs">Generieren</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Edit/Delete Actions */}
          <div className="flex gap-1 border-l pl-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(invoice);
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(invoice);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  // ── single_level: Kunde → Invoices (no client sub-rows) ─────────────────
  if (mode === "single_level") {
    return (
      <div className="space-y-2">
        {Object.entries(groupedByKunden).map(([companyId, companyInvoices]) => (
          <Card key={companyId} className="overflow-hidden">
            <div
              className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
              onClick={() => toggleCompany(companyId)}
            >
              <div className="flex items-center gap-2">
                {expandedCompaniesState.has(companyId) ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                <span className="font-semibold text-lg">{getCompanyName(companyId)}</span>
                <Badge variant="secondary">
                  {companyInvoices.length} Rechnung{companyInvoices.length !== 1 ? 'en' : ''}
                </Badge>
              </div>
            </div>

            {expandedCompaniesState.has(companyId) && (
              <CardContent className="p-4 space-y-2">
                {companyInvoices.map((invoice) => renderInvoiceCard(invoice))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    );
  }

  // ── two_level: Kunde → Klient → Invoices (existing behaviour) ───────────
  return (
    <div className="space-y-2">
      {Object.entries(groupedInvoices).map(([companyId, clientGroups]) => (
        <Card key={companyId} className="overflow-hidden">
          <div
            className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
            onClick={() => toggleCompany(companyId)}
          >
            <div className="flex items-center gap-2">
              {expandedCompaniesState.has(companyId) ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
              <span className="font-semibold text-lg">{getCompanyName(companyId)}</span>
              <Badge variant="secondary">
                {Object.keys(clientGroups).length} Klient{Object.keys(clientGroups).length !== 1 ? 'en' : ''}
              </Badge>
            </div>
          </div>

          {expandedCompaniesState.has(companyId) && (
            <CardContent className="p-0">
              {Object.entries(clientGroups).map(([clientId, clientInvoices]) => {
                const latestInvoice = getLatestInvoice(clientInvoices);
                const isSelected = selectedClientIdState === clientId;

                return (
                  <div key={clientId} className="border-t">
                    {/* Client Header */}
                    <div
                      className={`p-4 hover:bg-slate-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => updateSelectedClientId(isSelected ? null : clientId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isSelected ? (
                            <ChevronDown className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="font-medium">{getClientName(clientId)}</span>
                          <Badge variant="outline">{clientInvoices.length} Rechnung{clientInvoices.length !== 1 ? 'en' : ''}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Letzte: {formatDate(latestInvoice.created_at)}</span>
                          <Badge variant={getStatusVariant(latestInvoice.status)}>
                            {getStatusLabel(latestInvoice.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Client Invoices */}
                    {isSelected && (
                      <div className="bg-slate-50/50 p-4 space-y-2">
                        {clientInvoices
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((invoice) => renderInvoiceCard(invoice))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
