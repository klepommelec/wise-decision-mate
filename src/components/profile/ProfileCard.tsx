
import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, LogOut, Settings, Pencil, Upload } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Moon, Sun, Monitor, ChevronDown, Check } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCardProps {
  user: any;
  profile: any;
  decisions: any[];
  updateProfilePicture: (file: File) => Promise<{ error: any | null; url: string | null }>;
  removeProfilePicture: () => Promise<{ error: any | null }>;
}

export function ProfileCard({ user, profile, decisions, updateProfilePicture, removeProfilePicture }: ProfileCardProps) {
  const navigate = useNavigate();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    try {
      setIsUploadingImage(true);
      const file = e.target.files[0];
      const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
      
      if (file.size > maxSizeInBytes) {
        toast.error("L'image est trop volumineuse (max: 5MB)");
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error("Veuillez sélectionner une image");
        return;
      }

      const { error, url } = await updateProfilePicture(file);
      
      if (error) {
        toast.error("Erreur lors du téléchargement de l'image");
        console.error("Error uploading profile picture:", error);
      } else {
        toast.success("Photo de profil mise à jour");
      }
    } catch (error) {
      console.error("Error handling profile picture upload:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setIsUploadingImage(false);
      // Clear the input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setIsUploadingImage(true);
      const { error } = await removeProfilePicture();
      
      if (error) {
        toast.error("Erreur lors de la suppression de l'image");
        console.error("Error removing profile picture:", error);
      } else {
        toast.success("Photo de profil supprimée");
      }
    } catch (error) {
      console.error("Error handling profile picture removal:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4 mr-2" />;
      case 'dark':
        return <Moon className="h-4 w-4 mr-2" />;
      case 'system':
        return <Monitor className="h-4 w-4 mr-2" />;
      default:
        return <Sun className="h-4 w-4 mr-2" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Clair';
      case 'dark':
        return 'Sombre';
      case 'system':
        return 'Système';
      default:
        return 'Clair';
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
          <div className="relative group">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleProfilePictureUpload}
            />
            
            {profile?.avatar_url ? (
              <Avatar className="h-24 w-24 border cursor-pointer">
                <AvatarImage src={profile.avatar_url} alt="Photo de profil" />
                <AvatarFallback className="bg-primary/10">
                  <User className="h-12 w-12 text-primary" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 cursor-pointer">
                <User className="h-12 w-12 text-primary" />
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute inset-0 bg-black/50 rounded-full"></div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="icon" 
                      className="z-10" 
                      onClick={triggerFileInput}
                      disabled={isUploadingImage}
                    >
                      {isUploadingImage ? (
                        <div className="h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin" />
                      ) : profile?.avatar_url ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{profile?.avatar_url ? 'Modifier' : 'Ajouter'} une photo</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {profile?.avatar_url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="z-10" 
                        onClick={handleRemoveProfilePicture}
                        disabled={isUploadingImage}
                      >
                        <LucideIcons.Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Supprimer la photo</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
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
                  <div className="space-y-4 py-0">
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
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between items-center">
                      <span>Thème</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="flex items-center gap-1">
                            {getThemeIcon()}
                            {getThemeLabel()}
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTheme("light")} className="flex items-center">
                            <Sun className="h-3.5 w-3.5 mr-2" />
                            <span>Clair</span>
                            {theme === "light" && <Check className="h-3.5 w-3.5 ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("dark")} className="flex items-center">
                            <Moon className="h-3.5 w-3.5 mr-2" />
                            <span>Sombre</span>
                            {theme === "dark" && <Check className="h-3.5 w-3.5 ml-2" />}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setTheme("system")} className="flex items-center">
                            <Monitor className="h-3.5 w-3.5 mr-2" />
                            <span>Système</span>
                            {theme === "system" && <Check className="h-3.5 w-3.5 ml-2" />}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
        <Button variant="destructive" className="w-full" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </CardFooter>
    </Card>
  );
}
