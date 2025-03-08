
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, PlusCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <a 
            href="/" 
            className="flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <img 
              src="/lovable-uploads/6101851f-2549-45ba-a231-ed9bfb465e2b.png" 
              alt="Wise Logo" 
              className="h-8 max-h-[32px] w-auto" 
            />
          </a>
        </div>
        <nav className="flex items-center gap-4">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/new-decision")}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Nouvelle décision
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/help")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Aide et documentation
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/profile")}
              >
                <User className="h-4 w-4 mr-2" />
                Mon profil
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-muted-foreground" 
                onClick={() => navigate('/help')}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Aide et documentation
              </Button>
              <Button size="sm" onClick={() => navigate("/auth")}>
                <User className="h-4 w-4 mr-2" />
                Connexion
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
