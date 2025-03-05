
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { List, Calendar, ArrowRight } from "lucide-react";

interface Decision {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

const MyDecisions = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDecisions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("decisions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDecisions(data || []);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des décisions:", error);
        toast.error("Impossible de charger vos décisions");
      } finally {
        setLoading(false);
      }
    };

    fetchDecisions();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <Header />
      <Container>
        <div className="py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Mes Décisions</h1>
              <p className="text-muted-foreground mt-1">
                Retrouvez l'historique de toutes vos décisions
              </p>
            </div>
            <Button onClick={() => navigate("/")} className="gap-2">
              Nouvelle décision
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-[200px] animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded w-full mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : decisions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <List className="text-primary h-6 w-6" />
              </div>
              <CardTitle className="mb-2">Aucune décision</CardTitle>
              <CardDescription className="mb-6">
                Vous n'avez pas encore enregistré de décisions
              </CardDescription>
              <Button onClick={() => navigate("/")}>
                Créer votre première décision
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decisions.map((decision) => (
                <Card 
                  key={decision.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => {
                    // For now, we'll just display a message
                    // In the future, this could navigate to a detail view
                    toast.info("Fonctionnalité à venir: voir les détails de la décision");
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="line-clamp-1">{decision.title}</CardTitle>
                    </div>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(decision.created_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {decision.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {decision.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Pas de description
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default MyDecisions;
