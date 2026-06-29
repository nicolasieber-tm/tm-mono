import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ActiveCompanyProvider } from "@/contexts/ActiveCompanyContext";
import { LayoutChromeProvider } from "@/contexts/LayoutChromeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Danke from "./pages/Danke";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Unternehmen from "./pages/Unternehmen";
import Klienten from "./pages/Klienten";
import KlientDetail from "./pages/KlientDetail";
import KundeDetail from "./pages/KundeDetail";
import Zeiterfassung from "./pages/Zeiterfassung";
import Spesen from "./pages/Spesen";
import Rechnungen from "./pages/Rechnungen";
import Mitarbeitende from "./pages/Mitarbeitende";
import Einstellungen from "./pages/Einstellungen";
import InvoiceTemplateEditor from "./pages/InvoiceTemplateEditor";
import SystemStatus from "./pages/SystemStatus";
import Zeit from "./pages/mobile/Zeit";
import MobileSpesen from "./pages/mobile/Spesen";
import MobileNotizen from "./pages/mobile/Notizen";
import Profil from "./pages/mobile/Profil";
import MainLayout from "./components/layout/MainLayout";
import NotFound from "./pages/NotFound";
import KlientenAkte from "./pages/KlientenAkte";
import ErrorBoundary from "./components/ErrorBoundary";
import { TourProvider } from "./components/tour/TourProvider";
import TourOverlay from "./components/tour/TourOverlay";

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
              <TourOverlay />
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
