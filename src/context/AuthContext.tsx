
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

// Interface pour le profil utilisateur
interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le profil utilisateur
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Erreur lors de la récupération du profil:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erreur inattendue:", error);
      return null;
    }
  };

  // Fonction de déconnexion améliorée
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Erreur de déconnexion:", error);
        
        // Si l'erreur est due à une session manquante, on réinitialise quand même l'état local
        if (error.message?.includes("Auth session missing")) {
          setSession(null);
          setUser(null);
          setProfile(null);
          toast.success("Déconnexion réussie");
          return;
        }
        
        throw error;
      }
      
      // Si la déconnexion est réussie, on réinitialise l'état local
      // (Mais cela sera normalement géré par l'écouteur onAuthStateChange)
      toast.success("Déconnexion réussie");
    } catch (error: any) {
      console.error("Erreur de déconnexion:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  useEffect(() => {
    // Récupération de la session initiale
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        if (data.session?.user) {
          setUser(data.session.user);
          
          // Récupérer le profil utilisateur
          const profileData = await fetchProfile(data.session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification avec un nettoyage approprié
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("État d'authentification changé:", _event);
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          
          // Récupérer le profil utilisateur lors d'un changement d'authentification
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setUser(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Important: nettoyer l'écouteur à la destruction du composant
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user,
    profile,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
