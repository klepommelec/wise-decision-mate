
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface AvatarUploadProps {
  existingAvatarUrl: string | null;
  onAvatarUpdated: (url: string) => void;
}

export function AvatarUpload({ existingAvatarUrl, onAvatarUpdated }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(existingAvatarUrl);
  const { user } = useAuth();

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0) {
        return;
      }

      const file = files[0];
      if (!file.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image");
        return;
      }

      // Maximum 2MB
      if (file.size > 2 * 1024 * 1024) {
        toast.error("L'image ne doit pas dépasser 2MB");
        return;
      }

      setIsUploading(true);

      // Créer un nom de fichier unique avec l'ID de l'utilisateur
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload de l'image vers le bucket "avatars"
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtenir l'URL publique
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
        throw new Error("Impossible d'obtenir l'URL publique");
      }

      // Mettre à jour le profil avec la nouvelle URL d'avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'UI
      setAvatarUrl(publicUrlData.publicUrl);
      onAvatarUpdated(publicUrlData.publicUrl);
      toast.success("Photo de profil mise à jour");
    } catch (error: any) {
      console.error("Erreur lors de l'upload de l'avatar:", error);
      toast.error(error.message || "Erreur lors de l'upload de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-24 w-24">
        <AvatarImage src={avatarUrl || ""} alt="Photo de profil" className="object-cover" />
        <AvatarFallback className="text-lg">{getUserInitials()}</AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-center space-y-2">
        <Label htmlFor="avatar-upload" className="cursor-pointer">
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" size="sm" className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Chargement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Changer la photo
                </>
              )}
            </Button>
          </div>
          <Input 
            id="avatar-upload" 
            type="file" 
            accept="image/*"
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </Label>
        <p className="text-xs text-muted-foreground">
          JPG, PNG ou GIF. 2MB maximum.
        </p>
      </div>
    </div>
  );
}
