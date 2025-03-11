
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDecisions = (userId: string | undefined, sortBy: string, showFavorites: boolean) => {
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserDecisions();
    }
  }, [userId, sortBy, showFavorites]);

  const fetchUserDecisions = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from("decisions").select("*").eq("user_id", userId);
      if (showFavorites) {
        query = query.not('favorite_option', 'is', null);
      }
      if (sortBy === "recent") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "alphabetical") {
        query = query.order("title", { ascending: true });
      } else if (sortBy === "deadline") {
        query = query.order("deadline", { ascending: true });
      }
      const { data, error } = await query;
      if (error) throw error;
      setDecisions(data || []);
    } catch (error: any) {
      console.error("Error fetching decisions:", error);
      toast.error("Erreur lors du chargement des décisions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDecision = async (decisionId: string) => {
    try {
      const { error } = await supabase.from("decisions").delete().eq("id", decisionId);
      if (error) throw error;
      toast.success("Décision supprimée");
      fetchUserDecisions();
    } catch (error: any) {
      console.error("Error deleting decision:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const exportDecision = (decision: any) => {
    try {
      const dataStr = JSON.stringify(decision, null, 2);
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `decision-${decision.title.toLowerCase().replace(/\s+/g, '-')}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success("Décision exportée avec succès");
    } catch (error) {
      console.error("Error exporting decision:", error);
      toast.error("Erreur lors de l'exportation");
    }
  };

  return {
    decisions,
    isLoading,
    handleDeleteDecision,
    exportDecision
  };
};
