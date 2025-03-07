
import { useState } from 'react';
import { Star, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Option } from '@/integrations/supabase/client';

interface BestOptionProps {
  bestOption: {
    id: string;
    title: string;
    description: string;
    score: number;
  } | null;
  decisionTitle: string;
  onRegenerateOptions?: () => void;
}

export function BestOption({ bestOption, decisionTitle, onRegenerateOptions }: BestOptionProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveFavoriteOption = async () => {
    if (!bestOption) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ favorite_option: bestOption.title })
        .eq('title', decisionTitle);
        
      if (error) throw error;
      
      toast.success('Option favorite enregistrée!');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'option favorite:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'option favorite');
    } finally {
      setIsSaving(false);
    }
  };

  if (!bestOption) return null;

  return (
    <Card className="mb-6 border border-gray-200">
      <CardHeader>
        <h2 className="text-2xl font-medium">Résumé de l'analyse</h2>
        <p className="text-sm text-muted-foreground">
          Voici le résultat de votre décision "{decisionTitle}"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-medium">Option suggérée</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveFavoriteOption}
              disabled={isSaving}
            >
              {isSaving ? (
                <>Enregistrement...</>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Enregistrer comme choix
                </>
              )}
            </Button>
          </div>
          
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xl font-semibold">{bestOption.title}</p>
              <div className="text-xl font-bold">{bestOption.score}</div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{bestOption.description}</p>
          </div>
        </div>
        
        {onRegenerateOptions && (
          <div className="flex flex-col gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={onRegenerateOptions} 
              className="w-full flex items-center justify-center gap-2"
            >
              <span className="h-4 w-4">✨</span>
              Générer de nouvelles options
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
