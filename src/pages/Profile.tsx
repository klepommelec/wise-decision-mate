
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/components/profile/UserProfile";
import { DecisionsList } from "@/components/profile/DecisionsList";
import { useDecisions } from "@/hooks/use-decisions";

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFavorites, setShowFavorites] = useState(false);

  const { decisions, isLoading, handleDeleteDecision, exportDecision } = useDecisions(
    user?.id,
    sortBy,
    showFavorites
  );

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
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="rounded-full text-gray-600 bg-white border-gray-200 hover:bg-gray-100"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Tabs defaultValue="profile" className="w-full py-[16px]">
          <TabsList className="grid w-full grid-cols-2 mb-8 rounded-full gap-1">
            <TabsTrigger value="profile" className="rounded-full hover:bg-gray-100">
              Profil
            </TabsTrigger>
            <TabsTrigger value="decisions" className="rounded-full hover:bg-gray-100">
              Mes décisions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <UserProfile user={user} onSignOut={handleSignOut} />
          </TabsContent>
          
          <TabsContent value="decisions">
            <DecisionsList
              decisions={decisions}
              isLoading={isLoading}
              viewMode={viewMode}
              sortBy={sortBy}
              showFavorites={showFavorites}
              onViewModeChange={setViewMode}
              onSortByChange={setSortBy}
              onShowFavoritesChange={setShowFavorites}
              onExportDecision={exportDecision}
              onDeleteDecision={handleDeleteDecision}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
