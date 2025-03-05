
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ModeToggle } from "./ModeToggle";
import { Container } from "./Container";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Header = () => {
  const {
    user,
    loading,
    profile
  } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Déconnexion réussie");
      navigate("/auth");
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion :", error);
      toast.error(error.message || "Erreur lors de la déconnexion");
    }
  };
  
  const getUserInitials = () => {
    if (profile?.username) {
      return profile.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="border-b">
      <Container>
        <div className="flex h-16 items-center justify-between py-2">
          <div className="flex gap-6 md:gap-10">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-heading text-xl font-bold">
                Decidify
              </span>
            </Link>
            
            <nav className="hidden gap-6 md:flex">
              <Link to="/" className="flex items-center text-lg font-medium text-foreground">
                Décisions
              </Link>
              <Link to="/about" className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground">
                À propos
              </Link>
              <Link to="/help" className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground">
                Aide
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <ModeToggle />
            
            {!loading && (
              user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-9 w-9">
                        <AvatarImage 
                          src={profile?.avatar_url || ''} 
                          alt="Avatar" 
                          className="object-cover"
                          onError={(e) => {
                            console.error("Error loading avatar image:", e);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 leading-none p-2">
                      <p className="font-medium">{profile?.username || user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onSelect={() => navigate("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer" 
                      onSelect={() => navigate("/settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 dark:text-red-400" 
                      onSelect={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => navigate("/auth")}>
                  Se connecter
                </Button>
              )
            )}
          </div>
        </div>
      </Container>
    </header>
  );
};
