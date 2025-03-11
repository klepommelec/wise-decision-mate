import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, List, Clock, Star, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
interface Decision {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline?: string | null;
  favorite_option?: string | null;
  ai_recommendation?: string | null;
}
interface DecisionsListProps {
  onDecisionClick: (decision: Decision) => void;
  onNewDecision: () => void;
}
export function DecisionsList({
  onDecisionClick,
  onNewDecision
}: DecisionsListProps) {
  const [userDecisions, setUserDecisions] = useState<Decision[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState(true);
  const [recommendationsMap, setRecommendationsMap] = useState<Record<string, string>>({});
  const {
    user
  } = useAuth();
  useEffect(() => {
    if (user) {
      fetchDecisionsWithRecommendations();
    }
  }, [user]);
  const fetchDecisionsWithRecommendations = async () => {
    if (!user) return;
    try {
      setLoadingDecisions(true);
      console.log("Récupération des décisions pour l'utilisateur:", user.id);
      const {
        data,
        error
      } = await supabase.from("decisions").select("id, title, description, created_at, deadline, favorite_option, ai_recommendation").eq("user_id", user.id).order("created_at", {
        ascending: false
      });
      if (error) {
        console.error("Erreur lors de la récupération des décisions:", error);
        throw error;
      }
      console.log("Décisions récupérées:", data);
      setUserDecisions(data || []);
      const recMap: Record<string, string> = {};
      data?.forEach(decision => {
        if (decision.ai_recommendation) {
          recMap[decision.id] = decision.ai_recommendation;
        }
      });
      setRecommendationsMap(recMap);
    } catch (error: any) {
      console.error("Erreur lors de la récupération des décisions:", error);
      toast.error("Impossible de charger vos décisions");
    } finally {
      setLoadingDecisions(false);
    }
  };
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Pas de deadline";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };
  const handleRefresh = () => {
    fetchDecisionsWithRecommendations();
    toast.success("Liste des décisions actualisée");
  };
  return <div className="w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6 pt-24">
        <h2 className="text-2xl font-bold">Mes Décisions</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} className="rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
          <Button onClick={onNewDecision} className="rounded-full font-medium text-gray-900 bg-lime-400 hover:bg-lime-500">
            Nouvelle décision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loadingDecisions ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Card key={i} className="h-[180px] animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>)}
        </div> : userDecisions.length === 0 ? <Card className="p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <List className="text-primary h-6 w-6" />
          </div>
          <CardTitle className="mb-2">Aucune décision</CardTitle>
          <CardDescription className="mb-6">
            Vous n'avez pas encore enregistré de décisions
          </CardDescription>
          <Button onClick={onNewDecision}>
            Créer votre première décision
          </Button>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userDecisions.map(decision => <Card key={decision.id} className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200" onClick={() => {
        console.log("Décision sélectionnée:", decision);
        onDecisionClick(decision);
      }}>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="line-clamp-1 font-medium">{decision.title}</CardTitle>
                </div>
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Clock className="h-3 w-3" />
                    {formatDate(decision.deadline)}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {decision.favorite_option ? <div className="flex items-center gap-1.5 text-green-700 dark:text-green-500 text-sm font-medium">
                    <CheckCircle className="h-4 w-4" />
                    <span className="line-clamp-1">{decision.favorite_option}</span>
                  </div> : <div>
                    {recommendationsMap[decision.id] ? <div className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-500 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5" />
                        <span>Recommandation IA: {recommendationsMap[decision.id]}</span>
                      </div> : <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                        <Star className="h-3.5 w-3.5" />
                        <span>Pas encore de recommandation</span>
                      </div>}
                  </div>}
              </CardContent>
            </Card>)}
        </div>}
    </div>;
}