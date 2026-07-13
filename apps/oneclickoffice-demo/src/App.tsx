import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActiveCompanyProvider } from "@/contexts/ActiveCompanyContext";
import { LayoutChromeProvider } from "@/contexts/LayoutChromeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { TourProvider } from "./components/tour/TourProvider";
import TourOverlay from "./components/tour/TourOverlay";
import ConsentBanner from "./components/ConsentBanner";

// Nur die Marketing-Landingpage (Route "/") wird eager geladen — sie ist der
// Einstieg für den Ad-Traffic. Alles andere (die eigentliche Demo-App mit
// Dashboard, Rechnungen, Zeiterfassung … samt schwerer Libs wie jspdf, konva,
// recharts, pdfjs) wird per code-splitting nachgeladen und landet NICHT im
// Landing-Bundle. Wichtig fürs mobile Ad-Publikum, das die Demo-App (iframe)
// gar nicht öffnet.
import Landing from "./pages/Landing";

const Danke = lazy(() => import("./pages/Danke"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Unternehmen = lazy(() => import("./pages/Unternehmen"));
const Klienten = lazy(() => import("./pages/Klienten"));
const KlientDetail = lazy(() => import("./pages/KlientDetail"));
const KundeDetail = lazy(() => import("./pages/KundeDetail"));
const Zeiterfassung = lazy(() => import("./pages/Zeiterfassung"));
const Spesen = lazy(() => import("./pages/Spesen"));
const Rechnungen = lazy(() => import("./pages/Rechnungen"));
const Mitarbeitende = lazy(() => import("./pages/Mitarbeitende"));
const Einstellungen = lazy(() => import("./pages/Einstellungen"));
const InvoiceTemplateEditor = lazy(() => import("./pages/InvoiceTemplateEditor"));
const SystemStatus = lazy(() => import("./pages/SystemStatus"));
const Zeit = lazy(() => import("./pages/mobile/Zeit"));
const MobileSpesen = lazy(() => import("./pages/mobile/Spesen"));
const MobileNotizen = lazy(() => import("./pages/mobile/Notizen"));
const Profil = lazy(() => import("./pages/mobile/Profil"));
const MainLayout = lazy(() => import("./components/layout/MainLayout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const KlientenAkte = lazy(() => import("./pages/KlientenAkte"));

// Neutraler Ladezustand, während ein nachgeladenes Chunk kommt. Erscheint NICHT
// beim ersten Landing-Aufruf (Landing ist eager), nur bei Navigation in die Demo.
const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ActiveCompanyProvider>
              <LayoutChromeProvider>
              <TourProvider>
              <Suspense fallback={<RouteFallback />}>
              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/danke" element={<Danke />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/login" element={<Login />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unternehmen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Unternehmen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/klienten"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Klienten />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/klienten/:clientId"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <KlientDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unternehmen/:companyId"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <KundeDetail />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/klienten-akte"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <KlientenAkte />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/zeiterfassung"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Zeiterfassung />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/spesen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Spesen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rechnungen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Rechnungen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mitarbeitende"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Mitarbeitende />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/einstellungen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Einstellungen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/einstellungen/system-status"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <SystemStatus />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/rechnungsvorlagen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <InvoiceTemplateEditor />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/zeit"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Zeit />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/spesen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MobileSpesen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/notizen"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <MobileNotizen />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/profil"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Profil />
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
              <TourOverlay />
              <ConsentBanner />
              </TourProvider>
              </LayoutChromeProvider>
            </ActiveCompanyProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
