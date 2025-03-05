
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  updateProfile: (profileData: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Récupération du profil utilisateur
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
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }
  };

  // Mise à jour du profil utilisateur
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) throw new Error("Utilisateur non connecté");

    try {
      const { error } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", user.id);

      if (error) throw error;

      // Mettre à jour le profil dans le state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      throw error;
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
          
          // Récupérer le profil complet
          const profileData = await fetchProfile(data.session.user.id);
          if (profileData) {
            setProfile(profileData as Profile);
          }
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
          
          // Récupérer le profil complet
          const profileData = await fetchProfile(session.user.id);
          if (profileData) {
            setProfile(profileData as Profile);
          }
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
