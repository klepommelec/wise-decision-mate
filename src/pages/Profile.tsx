
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LogOut, User, ArrowLeft, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    } else if (user) {
      fetchUserDecisions();
    }
  }, [user, loading, navigate]);

  const fetchUserDecisions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("decisions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDecisions(data || []);
    } catch (error: any) {
      console.error("Error fetching decisions:", error);
      toast.error("Erreur lors du chargement des décisions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      navigate("/");
    } catch (error: any) {
      toast.error("Erreur lors de la déconnexion");
      console.error("Erreur de déconnexion:", error);
    }
  };

  if (loading || !user) {
    return (
      <Container className="py-10">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-10">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profil utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{user.email}</h3>
                <p className="text-sm text-muted-foreground">
                  Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-medium mb-4">Mes décisions</h3>
              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-muted rounded-md animate-pulse" />
                  ))}
                </div>
              ) : decisions.length > 0 ? (
                <div className="space-y-2">
                  {decisions.map((decision) => (
                    <Card key={decision.id} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => navigate("/", { state: { existingDecision: decision } })}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{decision.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(decision.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-md">
                  <p className="text-muted-foreground">Vous n'avez pas encore créé de décision.</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => navigate("/new-decision")}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Créer une décision
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
}
