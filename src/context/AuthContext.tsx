
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  profile: any | null;
  updateProfilePicture: (file: File) => Promise<{ error: any | null; url: string | null }>;
  removeProfilePicture: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  profile: null,
  updateProfilePicture: async () => ({ error: null, url: null }),
  removeProfilePicture: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error in fetchProfile:", error);
      return null;
    }
  };

  // Function to update profile picture
  const updateProfilePicture = async (file: File) => {
    if (!user) return { error: new Error("User not authenticated"), url: null };

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("Uploading file to storage:", filePath);

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        return { error: uploadError, url: null };
      }

      console.log("File uploaded successfully, getting public URL");

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log("Public URL:", urlData.publicUrl);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { error: updateError, url: null };
      }

      console.log("Profile updated successfully");

      // Update local state
      setProfile((prev: any) => ({ ...prev, avatar_url: urlData.publicUrl }));

      return { error: null, url: urlData.publicUrl };
    } catch (error) {
      console.error("Error in updateProfilePicture:", error);
      return { error, url: null };
    }
  };

  // Function to remove profile picture
  const removeProfilePicture = async () => {
    if (!user || !profile?.avatar_url) return { error: new Error("No profile picture to remove") };

    try {
      console.log("Removing profile picture:", profile.avatar_url);
      
      // Extract file name from URL
      const urlParts = profile.avatar_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      console.log("Extracted file name:", fileName);

      // Delete file from storage if it exists
      if (fileName) {
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove([fileName]);

        if (deleteError) {
          console.error("Error deleting image:", deleteError);
        } else {
          console.log("File deleted successfully");
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        return { error: updateError };
      }

      console.log("Profile updated successfully, avatar_url set to null");

      // Update local state
      setProfile((prev: any) => ({ ...prev, avatar_url: null }));

      return { error: null };
    } catch (error) {
      console.error("Error in removeProfilePicture:", error);
      return { error };
    }
  };

  useEffect(() => {
    // Récupération de la session initiale
    const getInitialSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user ?? null);

        // Fetch profile if user exists
        if (data.session?.user) {
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
        setUser(session?.user ?? null);
        
        // Fetch profile if user exists
        if (session?.user) {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
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
    loading,
    profile,
    updateProfilePicture,
    removeProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
