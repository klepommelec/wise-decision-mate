
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { DecisionsList } from "@/components/profile/DecisionsList";

export default function Profile() {
  const {
    user,
    loading,
    profile,
    updateProfilePicture,
    removeProfilePicture
  } = useAuth();
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
    } finally {
      setIsLoading(false);
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
        <Button variant="ghost" className="mb-6" onClick={() => navigate("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="decisions">Mes décisions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <ProfileCard 
              user={user} 
              profile={profile} 
              decisions={decisions}
              updateProfilePicture={updateProfilePicture}
              removeProfilePicture={removeProfilePicture}
            />
          </TabsContent>
          
          <TabsContent value="decisions">
            <DecisionsList 
              decisions={decisions}
              isLoading={isLoading}
              fetchUserDecisions={fetchUserDecisions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
