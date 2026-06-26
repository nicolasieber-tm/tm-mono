import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profil = () => {
  const { signOut, user } = useAuth();

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
        if (error.code === 'PGRST116') {
          return null;
        }
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
    <div className="min-h-screen bg-background p-5 space-y-8 pb-28">
      <div className="mb-2">
        <h1 className="text-3xl font-bold text-foreground mb-3">Profil</h1>
        <p className="text-base text-muted-foreground">Ihre persönlichen Informationen</p>
      </div>

      <Card className="shadow-lg">
        <CardContent className="pt-8 pb-8">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <div className="p-6 bg-primary/10 rounded-2xl">
                <User className="h-12 w-12 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-base text-muted-foreground mb-2 font-medium">Name</p>
                <p className="text-2xl font-bold text-foreground">{displayName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={signOut}
        variant="destructive"
        className="w-full h-16 text-lg font-bold shadow-md active:scale-95 transition-transform"
      >
        <LogOut className="h-6 w-6 mr-3" />
        Abmelden
      </Button>
    </div>
  );
};

export default Profil;
