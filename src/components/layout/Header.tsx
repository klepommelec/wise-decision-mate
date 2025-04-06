
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, PlusCircle, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const {
    user,
    loading
  } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(user ? '/dashboard' : '/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="container flex h-16 items-center justify-between py-3">
        <div className="flex items-center gap-2">
          <a href={user ? '/dashboard' : '/'} className="flex items-center gap-2" onClick={handleLogoClick}>
            <img src="/lovable-uploads/1465f08a-adfe-457b-a2f9-f046b763d7f1.png" alt="Memo Logo" className="h-8 max-h-[32px] w-auto" />
            <span className="font-semibold text-lg">Memo</span>
          </a>
        </div>
        <nav className="flex items-center gap-3">
          {loading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/help")} 
                className="rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100 font-medium"
              >
                Aide
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate("/profile")} 
                className="rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100 font-medium"
              >
                Mon profil
              </Button>
              <Button 
                variant="highlight" 
                size="sm" 
                onClick={() => navigate("/new-decision")} 
                className="rounded-full text-gray-900 bg-lime-400 hover:bg-lime-500 font-medium"
              >
                Nouvelle décision
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-gray-600 bg-white border-gray-300 hover:bg-gray-50 font-medium" 
                onClick={() => navigate('/help')}
              >
                Aide
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full text-gray-600 bg-white border-gray-300 hover:bg-gray-50 font-medium"  
                onClick={() => navigate("/about")}
              >
                À propos
              </Button>
              <Button 
                variant="highlight" 
                size="sm" 
                onClick={() => navigate("/auth")} 
                className="rounded-full bg-[#D2FC79] hover:bg-[#c8f056] text-gray-800 font-semibold"
              >
                Commencer
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
