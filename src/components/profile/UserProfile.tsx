
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Sun, Moon, Laptop, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileProps {
  user: User;
  onSignOut: () => Promise<void>;
}

export const UserProfile = ({ user, onSignOut }: UserProfileProps) => {
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    try {
      await onSignOut();
      toast.success("Déconnexion réussie");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Une erreur s'est produite lors de la déconnexion");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Profil utilisateur</CardTitle>
        <CardDescription>
          Gérez vos informations personnelles et vos préférences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="h-24 w-24 rounded-full flex items-center justify-center flex-shrink-0 bg-lime-100">
            <span className="text-4xl text-lime-600 font-medium">
              {user.email ? user.email[0].toUpperCase() : '?'}
            </span>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-medium">{user.email}</h3>
            <p className="text-sm text-muted-foreground">
              Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR')}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100">
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
                    <div className="border-b pb-4">
                      <h3 className="text-sm font-medium mb-3">Thème</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <Button 
                          variant={theme === "light" ? "default" : "outline"} 
                          size="sm" 
                          className="w-full justify-start" 
                          onClick={() => {
                            setTheme("light");
                            toast.success("Thème clair activé");
                          }}
                        >
                          <Sun className="h-4 w-4 mr-2" />
                          Clair
                        </Button>
                        <Button 
                          variant={theme === "dark" ? "default" : "outline"} 
                          size="sm" 
                          className="w-full justify-start" 
                          onClick={() => {
                            setTheme("dark");
                            toast.success("Thème sombre activé");
                          }}
                        >
                          <Moon className="h-4 w-4 mr-2" />
                          Sombre
                        </Button>
                        <Button 
                          variant={theme === "system" ? "default" : "outline"} 
                          size="sm" 
                          className="w-full justify-start" 
                          onClick={() => {
                            setTheme("system");
                            toast.success("Thème système activé");
                          }}
                        >
                          <Laptop className="h-4 w-4 mr-2" />
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
                <p className="text-3xl font-bold">{0}</p>
                <p className="text-sm text-muted-foreground">Décisions créées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Décisions finalisées</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">En attente</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={handleSignOut} className="w-full rounded-full">
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </CardFooter>
    </Card>
  );
};
