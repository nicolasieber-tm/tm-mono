import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        toast.error("Anmeldung fehlgeschlagen", {
          description: error.message === "Invalid login credentials"
            ? "E-Mail oder Passwort ist falsch."
            : error.message,
        });
      } else {
        toast.success("Erfolgreich angemeldet");

        // Auf mobilen Geräten direkt zur mobilen Zeit-Ansicht navigieren
        const isMobile = window.innerWidth < 768;
        navigate(isMobile ? "/mobile/zeit" : "/dashboard");
      }
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten", {
        description: "Bitte versuchen Sie es später erneut.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetLoading(true);

    try {
      const { error } = await resetPassword(resetEmail);

      if (error) {
        toast.error("Fehler beim Zurücksetzen", {
          description: error.message,
        });
      } else {
        toast.success("E-Mail gesendet", {
          description: "Bitte prüfen Sie Ihren Posteingang für weitere Anweisungen.",
        });
        setIsResetDialogOpen(false);
        setResetEmail("");
      }
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten");
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">OneClick Office</CardTitle>
          <CardDescription className="text-center">
            Melden Sie sich mit Ihren Zugangsdaten an
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@beispiel.ch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird angemeldet...
                </>
              ) : (
                "Anmelden"
              )}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsResetDialogOpen(true)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Passwort vergessen?
              </button>
            </div>
          </form>

          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Passwort zurücksetzen</DialogTitle>
                <DialogDescription>
                  Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen Ihres Passworts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleResetPassword}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">E-Mail</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@beispiel.ch"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsResetDialogOpen(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button type="submit" disabled={isResetLoading}>
                    {isResetLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Wird gesendet...
                      </>
                    ) : (
                      "Link senden"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Powered by <span className="font-semibold">Trending Media</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
