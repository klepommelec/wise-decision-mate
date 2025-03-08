
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ClipboardPen, Save, Share2, Copy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface NotesProps {
  decisionId?: string;
  decisionTitle: string;
}

export function Notes({ decisionId, decisionTitle }: NotesProps) {
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(false);
  const { user } = useAuth();

  // Load existing notes if decisionId is provided
  useEffect(() => {
    const loadNotes = async () => {
      if (!decisionId) return;
      
      try {
        setIsLoading(true);
        
        // Find existing decision
        const { data: existingDecisions, error: fetchError } = await supabase
          .from('decisions')
          .select('notes, user_id')
          .eq('id', decisionId)
          .single();

        if (fetchError) {
          console.error("Error fetching notes:", fetchError);
          return;
        }
        
        // Set shared state based on whether the current user is the owner
        const isOwner = user && existingDecisions.user_id === user.id;
        setIsShared(!isOwner && existingDecisions.notes);
        
        if (existingDecisions?.notes) {
          setNotes(existingDecisions.notes);
        }
        
        // Generate share URL if it's the owner
        if (isOwner) {
          // Create a share URL for this decision
          const shareUrlBase = window.location.origin;
          setShareUrl(`${shareUrlBase}/decision/${decisionId}`);
        }
      } catch (error) {
        console.error("Error loading notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, [decisionId, user]);

  const saveNotes = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour sauvegarder des notes");
      return;
    }

    try {
      setIsSaving(true);
      
      // Find existing decision or create a new one
      const { data: existingDecisions, error: fetchError } = await supabase
        .from('decisions')
        .select('id')
        .eq('title', decisionTitle)
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) {
        console.error("Error fetching existing decision:", fetchError);
        throw fetchError;
      }

      let decisionId;

      if (existingDecisions && existingDecisions.length > 0) {
        // Update existing decision
        decisionId = existingDecisions[0].id;
        
        const { error: updateError } = await supabase
          .from('decisions')
          .update({ notes })
          .eq('id', decisionId);
          
        if (updateError) {
          console.error("Error updating notes:", updateError);
          throw updateError;
        }
      } else {
        // Create new decision if it doesn't exist
        const { data: newDecision, error: insertError } = await supabase
          .from('decisions')
          .insert({ 
            title: decisionTitle, 
            user_id: user.id,
            notes
          })
          .select('id')
          .single();

        if (insertError) {
          console.error("Error creating new decision with notes:", insertError);
          throw insertError;
        }
        
        decisionId = newDecision.id;
        
        // Generate share URL for new decision
        const shareUrlBase = window.location.origin;
        setShareUrl(`${shareUrlBase}/decision/${decisionId}`);
      }

      toast.success("Notes sauvegardées avec succès");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setIsSaving(false);
    }
  };

  const copyShareUrl = () => {
    if (!shareUrl) return;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Lien de partage copié dans le presse-papier"))
      .catch(() => toast.error("Impossible de copier le lien de partage"));
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <ClipboardPen className="h-5 w-5 mr-2" />
          {isShared ? "Commentaires sur cette décision" : "Notes personnelles et partage"}
        </CardTitle>
        {user && !isShared && (
          <Button 
            onClick={saveNotes} 
            variant="outline" 
            size="sm"
            className="gap-2"
            disabled={isSaving}
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 w-full bg-muted animate-pulse rounded-md"></div>
        ) : (
          <Tabs defaultValue="notes" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="notes">
                {isShared ? "Commentaires" : "Notes personnelles"}
              </TabsTrigger>
              {!isShared && <TabsTrigger value="share">Partager</TabsTrigger>}
            </TabsList>
            <TabsContent value="notes">
              <Textarea
                placeholder={isShared 
                  ? "Partagez vos commentaires sur cette décision..." 
                  : "Ajoutez vos notes personnelles ici..."}
                className="min-h-[150px] w-full"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                readOnly={isShared}
              />
              {isShared && (
                <p className="text-sm text-muted-foreground mt-2">
                  Cette décision a été partagée avec vous. Vous pouvez voir les commentaires mais pas les modifier.
                </p>
              )}
            </TabsContent>
            {!isShared && (
              <TabsContent value="share">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Partagez cette décision avec d'autres personnes pour obtenir leur avis.
                    Ils pourront voir votre analyse et vos notes, mais ne pourront pas les modifier.
                  </p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={shareUrl} 
                      readOnly 
                      placeholder="Sauvegardez d'abord pour générer un lien de partage"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyShareUrl}
                      disabled={!shareUrl}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
        {!user && !isShared && (
          <p className="text-sm text-muted-foreground mt-2">
            Connectez-vous pour sauvegarder vos notes et partager cette décision.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
