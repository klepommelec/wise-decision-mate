
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Decision {
  id?: string;
  title: string;
  description: string;
}

interface DecisionFormProps {
  onSubmit: (decision: { title: string; description: string }, generateOptions?: boolean) => void;
  initialDecision?: Decision;
}

export function DecisionForm({ onSubmit, initialDecision }: DecisionFormProps) {
  const [title, setTitle] = useState(initialDecision?.title || '');
  const [description, setDescription] = useState(initialDecision?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-submit if initialDecision is provided
  useEffect(() => {
    if (initialDecision && initialDecision.title) {
      // We need to simulate a submit but without actually calling handleSubmit
      // to avoid saving it again to the database
      onSubmit({ 
        title: initialDecision.title, 
        description: initialDecision.description 
      }, false);
    }
  }, [initialDecision, onSubmit]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      toast.error("Vous devez être connecté pour créer une décision");
      navigate("/auth");
      setIsSubmitting(false);
      return;
    }

    try {
      // If we don't have an initialDecision, it's a new decision
      if (!initialDecision) {
        // Enregistrer la décision dans Supabase
        const { error } = await supabase
          .from('decisions')
          .insert({
            user_id: user.id,
            title,
            description
          });

        if (error) throw error;
      }
      
      // Continuer avec le processus normal
      onSubmit({ title, description }, useAI);
      setIsSubmitting(false);
      
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de la décision:", error);
      toast.error(error.message || "Une erreur est survenue");
      setIsSubmitting(false);
    }
  }, [title, description, useAI, user, navigate, onSubmit, initialDecision]);
  
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            {initialDecision ? "Modifier votre décision" : "Quelle décision devez-vous prendre?"}
          </CardTitle>
          <CardDescription>
            {initialDecision 
              ? "Vous pouvez modifier les détails de votre décision."
              : "Décrivez la décision que vous devez prendre. Soyez aussi précis que possible."
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la décision</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Choisir une nouvelle voiture"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Plus de détails sur la décision à prendre..."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="ai-options"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
              <div className="grid gap-1.5">
                <Label
                  htmlFor="ai-options"
                  className="text-sm font-medium leading-none flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Générer automatiquement des options avec l'IA
                </Label>
                <p className="text-sm text-muted-foreground">
                  L'IA vous suggérera des options pertinentes en fonction de votre décision
                </p>
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full transition-all" 
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Traitement..." : (initialDecision ? "Continuer" : "Continuer")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
