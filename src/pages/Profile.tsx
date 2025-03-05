
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { 
  LogOut, 
  User, 
  ArrowLeft, 
  PlusCircle, 
  Settings, 
  Download, 
  Share2,
  Bell,
  Calendar,
  Filter,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [showFavorites, setShowFavorites] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    } else if (user) {
      fetchUserDecisions();
    }
  }, [user, loading, navigate, sortBy, showFavorites]);

  const fetchUserDecisions = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("decisions")
        .select("*")
        .eq("user_id", user?.id);
      
      // Filtrage des favoris si activé
      if (showFavorites) {
        query = query.not('favorite_option', 'is', null);
      }
      
      // Tri selon la sélection de l'utilisateur
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
      const { error } = await supabase
        .from("decisions")
        .delete()
        .eq("id", decisionId);
      
      if (error) throw error;
      
      toast.success("Décision supprimée");
      fetchUserDecisions();
    } catch (error: any) {
      console.error("Error deleting decision:", error);
      toast.error("Erreur lors de la suppression");
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
          className="mb-6" 
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="decisions">Mes décisions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Profil utilisateur</CardTitle>
                <CardDescription>
                  Gérez vos informations personnelles et vos préférences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium">{user.email}</h3>
                    <p className="text-sm text-muted-foreground">
                      Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Settings className="h-3.5 w-3.5" />
                            Paramètres
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Paramètres du compte</DialogTitle>
                            <DialogDescription>
                              Personnalisez vos préférences
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                              <span>Thème</span>
                              <div className="flex gap-2">
                                <Button 
                                  variant={theme === "light" ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTheme("light")}
                                  className="gap-1"
                                >
                                  <Sun className="h-3.5 w-3.5" />
                                  Clair
                                </Button>
                                <Button 
                                  variant={theme === "dark" ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTheme("dark")}
                                  className="gap-1"
                                >
                                  <Moon className="h-3.5 w-3.5" />
                                  Sombre
                                </Button>
                                <Button 
                                  variant={theme === "system" ? "default" : "outline"} 
                                  size="sm"
                                  onClick={() => setTheme("system")}
                                  className="gap-1"
                                >
                                  <Monitor className="h-3.5 w-3.5" />
                                  Système
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Notifications par email</span>
                              <Button variant="outline" size="sm">Configurer</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Changer de mot de passe</span>
                              <Button variant="outline" size="sm">Modifier</Button>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Exporter mes données</span>
                              <Button variant="outline" size="sm">Exporter</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Statistiques</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-bold">{decisions.length}</p>
                        <p className="text-sm text-muted-foreground">Décisions créées</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-bold">
                          {decisions.filter(d => d.favorite_option).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Décisions finalisées</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                        <p className="text-3xl font-bold">
                          {decisions.filter(d => d.deadline && new Date(d.deadline) > new Date()).length}
                        </p>
                        <p className="text-sm text-muted-foreground">En attente</p>
                      </CardContent>
                    </Card>
                  </div>
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
          </TabsContent>
          
          <TabsContent value="decisions">
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
                  {viewMode === "grid" ? (
                    <ListIcon className="h-3.5 w-3.5" />
                  ) : (
                    <GridIcon className="h-3.5 w-3.5" />
                  )}
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
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-[180px] bg-muted rounded-md animate-pulse" />
                ))}
              </div>
            ) : decisions.length > 0 ? (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-4`}>
                {decisions.map((decision) => (
                  <Card key={decision.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-border/60">
                    <CardHeader className={`p-4 ${viewMode === "list" ? "flex-row justify-between items-center" : ""}`}>
                      <div>
                        <CardTitle className={`${viewMode === "list" ? "text-base" : "text-lg"} line-clamp-1`}>
                          {decision.title}
                        </CardTitle>
                        {viewMode === "grid" && (
                          <CardDescription className="flex items-center gap-1 text-xs mt-1">
                            <Calendar className="h-3 w-3" />
                            {decision.deadline 
                              ? new Date(decision.deadline).toLocaleDateString('fr-FR')
                              : "Pas de deadline"}
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
                                onClick={(e) => {
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
                                onClick={(e) => {
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm("Êtes-vous sûr de vouloir supprimer cette décision ?")) {
                                    handleDeleteDecision(decision.id);
                                  }
                                }}
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
                          className="ml-auto"
                          onClick={() => navigate("/", { state: { existingDecision: decision } })}
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
                <Button 
                  onClick={() => navigate("/new-decision")}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer une décision
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}

// Composants d'icônes supplémentaires
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="8" x2="21" y1="6" y2="6" />
      <line x1="8" x2="21" y1="12" y2="12" />
      <line x1="8" x2="21" y1="18" y2="18" />
      <line x1="3" x2="3.01" y1="6" y2="6" />
      <line x1="3" x2="3.01" y1="12" y2="12" />
      <line x1="3" x2="3.01" y1="18" y2="18" />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function Trash(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
