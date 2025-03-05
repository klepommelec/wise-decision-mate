
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const {
    user,
    loading,
    signOut
  } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
    }
  };

  return <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2" onClick={e => {
          e.preventDefault();
          navigate('/');
        }}>
            <img alt="Wise Logo" className="h-8 max-h-[32px] w-auto" src="/lovable-uploads/22f4b129-c335-42a2-832c-f89150b4eed4.png" />
          </a>
        </div>
        <nav className="flex items-center gap-4">
          {loading ? <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div> : user ? <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/new-decision")}>
                Nouvelle décision
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <User className="h-4 w-4 mr-2" />
                Mon profil
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div> : <Button size="sm" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4 mr-2" />
              Connexion
            </Button>}
        </nav>
      </div>
    </header>;
}
