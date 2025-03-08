
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardPen, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotesProps {
  decisionId?: string;
  decisionTitle: string;
}

export function Notes({ decisionId, decisionTitle }: NotesProps) {
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Load existing notes if decisionId is provided
  useEffect(() => {
    const loadNotes = async () => {
      if (!user || !decisionId) return;
      
      try {
        setIsLoading(true);
        
        // Find existing decision
        const { data: existingDecisions, error: fetchError } = await supabase
          .from('decisions')
          .select('notes')
          .eq('id', decisionId)
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error("Error fetching notes:", fetchError);
          return;
        }
        
        if (existingDecisions?.notes) {
          setNotes(existingDecisions.notes);
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
      }

      toast.success("Notes sauvegardées avec succès");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Erreur lors de la sauvegarde des notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <ClipboardPen className="h-5 w-5 mr-2" />
          Notes personnelles
        </CardTitle>
        {user && (
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
          <Textarea
            placeholder="Ajoutez vos notes personnelles ici..."
            className="min-h-[150px] w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        )}
        {!user && (
          <p className="text-sm text-muted-foreground mt-2">
            Connectez-vous pour sauvegarder vos notes.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
