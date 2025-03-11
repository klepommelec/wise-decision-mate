
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Share2, Trash, Filter, Star, GridIcon, ListIcon, PlusCircle, Calendar, InfoIcon, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DecisionsListProps {
  decisions: any[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  sortBy: string;
  showFavorites: boolean;
  onViewModeChange: (mode: "grid" | "list") => void;
  onSortByChange: (sort: string) => void;
  onShowFavoritesChange: (show: boolean) => void;
  onExportDecision: (decision: any) => void;
  onDeleteDecision: (id: string) => void;
}

export const DecisionsList = ({
  decisions,
  isLoading,
  viewMode,
  sortBy,
  showFavorites,
  onViewModeChange,
  onSortByChange,
  onShowFavoritesChange,
  onExportDecision,
  onDeleteDecision,
}: DecisionsListProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
        {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-[180px] bg-muted rounded-md animate-pulse" />)}
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <h3 className="text-2xl font-bold">Mes décisions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onShowFavoritesChange(!showFavorites)} className="rounded-full">
            <Star className="h-3.5 w-3.5 mr-1" />
            {showFavorites ? "Toutes" : "Favorites"}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Trier par
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSortByChange("recent")}>
                Plus récentes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortByChange("alphabetical")}>
                Ordre alphabétique
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSortByChange("deadline")}>
                Date d'échéance
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")} 
            className="rounded-full"
          >
            {viewMode === "grid" ? <ListIcon className="h-3.5 w-3.5" /> : <GridIcon className="h-3.5 w-3.5" />}
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => navigate("/new-decision")} 
            className="gap-1.5 rounded-full font-medium text-gray-900 bg-lime-400 hover:bg-lime-500"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            Nouvelle décision
          </Button>
        </div>
      </div>
      
      {decisions.length > 0 ? (
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportDecision(decision);
                          }}
                          className="h-8 w-8 rounded-full"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Fonctionnalité de partage à venir");
                          }}
                          className="h-8 w-8 rounded-full"
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
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Êtes-vous sûr de vouloir supprimer cette décision ?")) {
                              onDeleteDecision(decision.id);
                            }
                          }}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full"
                        >
                          <Trash className="h-3.5 w-3.5" />
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
                    onClick={() => navigate("/", { state: { existingDecision: decision } })}
                    className="rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100 font-medium ml-auto"
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
};
