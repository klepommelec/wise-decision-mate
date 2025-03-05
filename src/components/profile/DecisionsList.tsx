
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlusCircle, Filter, Download, Share2, Calendar } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { toast } from "sonner";
import { Star } from "../icons/Star";
import { CheckCircle } from "../icons/CheckCircle";
import { InfoIcon } from "../icons/InfoIcon";
import { GridIcon } from "../icons/GridIcon";
import { ListIcon } from "../icons/ListIcon";
import { supabase } from "@/integrations/supabase/client";

interface DecisionsListProps {
  decisions: any[];
  isLoading: boolean;
  fetchUserDecisions: () => Promise<void>;
}

export function DecisionsList({ decisions, isLoading, fetchUserDecisions }: DecisionsListProps) {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [showFavorites, setShowFavorites] = useState(false);

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

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold">Mes décisions</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className={showFavorites ? "bg-primary/10" : ""} 
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Star className="h-3.5 w-3.5 mr-1" />
            {showFavorites ? "Toutes" : "Favorites"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Trier par
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Plus récentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                Ordre alphabétique
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("deadline")}>
                Date d'échéance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <ListIcon className="h-3.5 w-3.5" /> : <GridIcon className="h-3.5 w-3.5" />}
          </Button>
          
          <Button 
            className="gap-1.5" 
            size="sm" 
            onClick={() => navigate("/new-decision")}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nouvelle décision
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[180px] bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      ) : decisions.length > 0 ? (
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
          {decisions.map(decision => (
            <Card key={decision.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-border/60">
              <CardHeader className={`p-4 ${viewMode === "list" ? "flex-row justify-between items-center" : ""}`}>
                <div>
                  <CardTitle className={`${viewMode === "list" ? "text-base" : "text-lg"} line-clamp-1`}>
                    {decision.title}
                  </CardTitle>
                  {viewMode === "grid" && (
                    <CardDescription className="flex items-center gap-1 text-xs mt-1">
                      <Calendar className="h-3 w-3" />
                      {decision.deadline ? new Date(decision.deadline).toLocaleDateString('fr-FR') : "Pas de deadline"}
                    </CardDescription>
                  )}
                </div>
                {viewMode === "list" && decision.deadline && (
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {new Date(decision.deadline).toLocaleDateString('fr-FR')}
                  </CardDescription>
                )}
              </CardHeader>
              
              <CardContent className={`p-4 pt-0 ${viewMode === "list" ? "flex items-center justify-between" : ""}`}>
                <div>
                  {decision.favorite_option ? (
                    <div className="flex items-center gap-1.5 text-green-700 dark:text-green-500 text-sm font-medium">
                      <CheckCircle className="h-4 w-4" />
                      <span className="line-clamp-1">{decision.favorite_option}</span>
                    </div>
                  ) : decision.ai_recommendation ? (
                    <div className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-500 text-sm">
                      <Star className="h-3.5 w-3.5" />
                      <span className="line-clamp-1">Recommandation: {decision.ai_recommendation}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <InfoIcon className="h-3.5 w-3.5" />
                      <span>En cours d'analyse</span>
                    </div>
                  )}
                  
                  {viewMode === "grid" && (
                    <p className="text-muted-foreground text-xs mt-2 line-clamp-2">
                      {decision.description || "Aucune description"}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-1 mt-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={e => {
                            e.stopPropagation();
                            exportDecision(decision);
                          }}
                        >
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Exporter</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8" 
                          onClick={e => {
                            e.stopPropagation();
                            toast.info("Fonctionnalité de partage à venir");
                          }}
                        >
                          <Share2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Partager</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                          onClick={e => {
                            e.stopPropagation();
                            if (confirm("Êtes-vous sûr de vouloir supprimer cette décision ?")) {
                              handleDeleteDecision(decision.id);
                            }
                          }}
                        >
                          <LucideIcons.Trash className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Supprimer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="ml-auto" 
                    onClick={() => navigate("/", {
                      state: { existingDecision: decision }
                    })}
                  >
                    Ouvrir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-md">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <PlusCircle className="text-primary h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold mb-2">Aucune décision</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Vous n'avez pas encore créé de décision. Commencez par en créer une nouvelle.
          </p>
          <Button onClick={() => navigate("/new-decision")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une décision
          </Button>
        </div>
      )}
    </>
  );
}
