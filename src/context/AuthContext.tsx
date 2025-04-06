
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération de la session initiale
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification avec un nettoyage approprié
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("État d'authentification changé:", _event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Important: nettoyer l'écouteur à la destruction du composant
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // La mise à jour de l'état sera gérée par l'écouteur onAuthStateChange
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
