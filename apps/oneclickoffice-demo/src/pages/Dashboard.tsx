import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, FileText, Loader2, Clock, ArrowUpRight, Receipt } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useExpenses } from "@/hooks/useExpenses";
import { useInvoices, useUpdateInvoice } from "@/hooks/useInvoices";
import { useNavigate } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import SystemErrorBanner from "@/components/SystemErrorBanner";
import { FinanceExportCard } from "@/components/dashboard/FinanceExportCard";
import { isDemoMode } from "@/hooks/useDemoMode";

type InvoiceWithRelations = Database["public"]["Tables"]["invoices"]["Row"] & {
  kunden?: { name: string } | null;
  clients?: { first_name: string; last_name: string } | null;
};

type ExpenseWithRelations = Database["public"]["Tables"]["expenses"]["Row"] & {
  kunden?: { name: string } | null;
  employees?: { first_name: string; last_name: string } | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: timeEntries, isLoading: loadingTimeEntries } = useTimeEntries();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses();
  const { data: invoices, isLoading: loadingInvoices } = useInvoices();
  const updateInvoice = useUpdateInvoice();

  // Calculate total revenue from paid invoices
  const paidInvoices = invoices?.filter(inv => inv.status === "paid") || [];
  const totalRevenue = paidInvoices.reduce((sum, inv) => {
    if (!inv.total) return sum;
    return sum + parseFloat(inv.total.toString());
  }, 0);

  // Calculate total expenses
  const totalExpenses = expenses?.reduce((sum, expense) => {
    if (!expense.amount) return sum;
    return sum + parseFloat(expense.amount.toString());
  }, 0) || 0;

  // Get open invoices (not paid)
  const openInvoices = invoices?.filter(inv => inv.status !== "paid") || [];
  const openInvoicesTotal = openInvoices.reduce((sum, inv) => {
    if (!inv.total) return sum;
    return sum + parseFloat(inv.total.toString());
  }, 0);

  // Get recent expenses (last 5)
  const recentExpenses = expenses?.slice(0, 5) || [];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("de-CH");
  };

  const isLoading = loadingTimeEntries || loadingExpenses || loadingInvoices;

  const stats = [
    {
      title: "Einnahmen Total",
      value: formatAmount(totalRevenue),
      icon: TrendingUp,
      trend: `${paidInvoices.length} bezahlte Rechnungen`,
      color: "text-green-600 dark:text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950",
      link: "/rechnungen"
    },
    {
      title: "Ausgaben Total",
      value: formatAmount(totalExpenses),
      icon: TrendingDown,
      trend: `${expenses?.length || 0} Spesen`,
      color: "text-orange-600 dark:text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950",
      link: "/spesen"
    },
    {
      title: "Offene Rechnungen",
      value: openInvoices.length.toString(),
      icon: FileText,
      trend: formatAmount(openInvoicesTotal),
      color: "text-blue-600 dark:text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      link: "/rechnungen"
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
        <SystemErrorBanner />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Übersicht Ihrer wichtigsten Kennzahlen</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/zeiterfassung")}>
              <Clock className="h-4 w-4 mr-2" />
              Zeit erfassen
            </Button>
          </div>
        </div>

        <div data-tour="dashboard-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card
              key={stat.title}
              className="relative overflow-hidden cursor-pointer transition-all hover:shadow-lg group border-border/50"
              onClick={() => navigate(stat.link)}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${stat.bgColor} transition-transform group-hover:scale-110`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm text-muted-foreground">{stat.trend}</p>
              </CardContent>
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${stat.color.replace('text-', 'bg-')} opacity-50`}></div>
            </Card>
          ))}
        </div>

        {!isDemoMode && <FinanceExportCard />}

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Offene Rechnungen</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Letzte ausstehende Zahlungen</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/rechnungen")}>
              Alle anzeigen
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {openInvoices.length > 0 ? (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Rechnungsnummer</TableHead>
                      <TableHead className="font-semibold">Klient</TableHead>
                      <TableHead className="font-semibold">Betrag</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openInvoices.slice(0, 5).map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                        <TableCell>
                          {(invoice as InvoiceWithRelations).clients
                            ? `${(invoice as InvoiceWithRelations).clients!.first_name} ${(invoice as InvoiceWithRelations).clients!.last_name}`
                            : "-"}
                        </TableCell>
                        <TableCell className="font-semibold">{formatAmount(invoice.total ? parseFloat(invoice.total.toString()) : 0)}</TableCell>
                        <TableCell>
                          <Select
                            value={invoice.status}
                            onValueChange={(value) =>
                              updateInvoice.mutate({
                                id: invoice.id,
                                updates: { status: value },
                              })
                            }
                          >
                            <SelectTrigger className="w-[140px] h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Entwurf</SelectItem>
                              <SelectItem value="sent">Versendet</SelectItem>
                              <SelectItem value="paid">Bezahlt</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Keine offenen Rechnungen vorhanden.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Letzte Spesen</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Kürzlich erfasste Ausgaben</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate("/spesen")}>
              Alle anzeigen
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentExpenses.length > 0 ? (
              <div className="rounded-lg border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Datum</TableHead>
                      <TableHead className="font-semibold">Mitarbeiter</TableHead>
                      <TableHead className="font-semibold">Kategorie</TableHead>
                      <TableHead className="text-right font-semibold">Betrag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExpenses.map((expense) => (
                      <TableRow key={expense.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-muted-foreground">{formatDate(expense.expense_date)}</TableCell>
                        <TableCell>
                          {(expense as ExpenseWithRelations).employees
                            ? `${(expense as ExpenseWithRelations).employees!.first_name} ${(expense as ExpenseWithRelations).employees!.last_name}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(parseFloat(expense.amount.toString()))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Keine Spesen vorhanden.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
