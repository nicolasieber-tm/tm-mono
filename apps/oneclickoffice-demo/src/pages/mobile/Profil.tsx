import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, LogOut, Loader2, Globe, Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTimeStats } from "@/hooks/useTimeStats";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();

const Profil = () => {
  const { signOut, user } = useAuth();
  const stats = useTimeStats();

  // Fetch employee profile
  const { data: employeeProfile, isLoading } = useQuery({
    queryKey: ["employee-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    },
    enabled: !!user,
  });

  const displayName = employeeProfile
    ? `${employeeProfile.first_name} ${employeeProfile.last_name}`
    : user?.email || "Benutzer";

  return (
    <div className="min-h-screen bg-background p-5 space-y-6 pb-28">
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-base text-muted-foreground">Ihr Konto und Ihre Aktivität</p>
      </div>

      {/* Profil-Karte */}
      <Card className="shadow-lg">
        <CardContent className="pt-6 pb-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-none">
                {employeeProfile ? (
                  <span className="text-2xl font-bold">{initials(displayName)}</span>
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-foreground truncate">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistik */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { value: `${stats.weekHours.toFixed(1)}`, label: "Std / Woche" },
          { value: `${stats.monthHours.toFixed(0)}`, label: "Std / Monat" },
          { value: `${stats.monthCount}`, label: "Einträge" },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="py-4 px-3 text-center">
              <div className="text-2xl font-bold text-foreground tabular-nums">{s.value}</div>
              <div className="text-xs text-muted-foreground font-medium mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Einstellungen (Demo: light-only, daher kein Dunkelmodus-Schalter) */}
      <Card className="overflow-hidden">
        <div className="divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <div className="h-9 w-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-none">
              <Globe className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Sprache</div>
              <div className="text-sm text-muted-foreground">Anzeige-Sprache</div>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Deutsch</span>
          </div>

          <div className="flex items-center gap-3 p-4">
            <div className="h-9 w-9 rounded-lg bg-muted text-muted-foreground flex items-center justify-center flex-none">
              <Info className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-foreground">Über die App</div>
              <div className="text-sm text-muted-foreground">OneClick Office</div>
            </div>
            <span className="text-sm font-semibold text-muted-foreground">Beta</span>
          </div>
        </div>
      </Card>

      <Button
        onClick={signOut}
        variant="destructive"
        className="w-full h-14 text-lg font-bold shadow-md active:scale-95 transition-transform"
      >
        <LogOut className="h-6 w-6 mr-3" />
        Abmelden
      </Button>
    </div>
  );
};

export default Profil;
