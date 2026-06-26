import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Info, RefreshCw, Building2, Loader2 } from "lucide-react";
import {
  useSystemErrors,
  useMarkErrorResolved,
  type SystemError,
} from "@/hooks/useSystemErrors";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const severityConfig = {
  critical: { color: 'destructive', icon: AlertTriangle, label: 'Kritisch' },
  warning: { color: 'secondary', icon: AlertTriangle, label: 'Warnung' },
  info: { color: 'outline', icon: Info, label: 'Info' },
} as const;

function SystemStatus() {
  const [activeTab, setActiveTab] = useState<'open' | 'resolved' | 'all'>('open');
  const { isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const filter =
    activeTab === 'open'
      ? { resolved: false }
      : activeTab === 'resolved'
        ? { resolved: true }
        : undefined;

  const { data: errors = [], isLoading, refetch } = useSystemErrors(filter);
  const markResolved = useMarkErrorResolved();

  const openCritical = errors.filter(
    (e) => e.severity === 'critical' && !e.resolved
  ).length;
  const openWarning = errors.filter(
    (e) => e.severity === 'warning' && !e.resolved
  ).length;

  // Admin-Guard: Diese Seite ist nur für Admins. Nicht-Admins werden
  // zurück in die Einstellungen geleitet (Defense-in-depth zusätzlich zur
  // RLS-Isolation, die Daten ohnehin schützt).
  if (isAdminLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAdmin) {
    return <Navigate to="/einstellungen" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System-Status</h1>
          <p className="text-muted-foreground">
            Überwachung der AI-Belegerkennung und weiterer System-Komponenten
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Aktualisieren
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={openCritical > 0 ? 'border-red-500 bg-red-50' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Kritische Fehler (offen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-3xl font-bold ${
                openCritical > 0 ? 'text-red-600' : ''
              }`}
            >
              {openCritical}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Warnungen (offen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openWarning}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {openCritical === 0 ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">OK</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                  <span className="text-lg font-semibold text-red-600">
                    Handlung nötig
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="open">Offen</TabsTrigger>
          <TabsTrigger value="resolved">Behoben</TabsTrigger>
          <TabsTrigger value="all">Alle</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 text-center text-muted-foreground">
                  Lade...
                </div>
              ) : errors.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Keine Fehler in dieser Kategorie 🎉
                </div>
              ) : (
                <div className="divide-y">
                  {errors.map((err) => (
                    <ErrorRow
                      key={err.id}
                      error={err}
                      onResolve={() => markResolved.mutate(err.id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ErrorRow({
  error,
  onResolve,
}: {
  error: SystemError;
  onResolve: () => void;
}) {
  const cfg = severityConfig[error.severity];
  const Icon = cfg.icon;

  return (
    <div className="p-4 flex items-start gap-4">
      <Icon
        className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
          error.severity === 'critical'
            ? 'text-red-600'
            : error.severity === 'warning'
              ? 'text-orange-500'
              : 'text-blue-500'
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge
            variant={
              cfg.color as 'default' | 'destructive' | 'secondary' | 'outline'
            }
          >
            {cfg.label}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {error.error_type}
          </span>
          <Badge variant="outline" className="gap-1 text-xs">
            <Building2 className="h-3 w-3" />
            {error.unternehmen?.company_name ?? 'System / Global'}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {format(new Date(error.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
          </span>
          {error.resolved && (
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3" /> Behoben
            </Badge>
          )}
          {error.notified && !error.resolved && (
            <Badge variant="outline" className="text-xs">
              📨 Telegram gesendet
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium break-words">{error.error_message}</p>
        {error.context && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Context anzeigen
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
              {JSON.stringify(error.context, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {!error.resolved && (
        <Button
          onClick={onResolve}
          size="sm"
          variant="outline"
          className="flex-shrink-0"
        >
          Als behoben markieren
        </Button>
      )}
    </div>
  );
}

export default SystemStatus;
