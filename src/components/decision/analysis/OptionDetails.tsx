import { useState } from 'react';
import { Star, ChevronUp, ChevronDown, Info, Plus } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { Option } from '@/integrations/supabase/client';

interface OptionScore {
  id: string;
  title: string;
  description: string;
  score: number;
  details: {
    criterionId: string;
    criterionName: string;
    weight: number;
    score: number;
    weightedScore: number;
  }[];
}

interface OptionDetailsProps {
  finalScores: OptionScore[];
  onAddOption?: (option: { title: string }) => void;
}

export function OptionDetails({ finalScores, onAddOption }: OptionDetailsProps) {
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [newOptionTitle, setNewOptionTitle] = useState('');
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [newOptionId, setNewOptionId] = useState<string | null>(null);
  const [loadingOptionTitle, setLoadingOptionTitle] = useState<string>('');

  const toggleExpandOption = (optionId: string) => {
    if (expandedOption === optionId) {
      setExpandedOption(null);
    } else {
      setExpandedOption(optionId);
    }
  };

  const handleAddOption = () => {
    if (newOptionTitle.trim() && onAddOption) {
      setIsGeneratingDescription(true);
      setLoadingOptionTitle(newOptionTitle.trim());
      
      const tempId = `temp-${Date.now()}`;
      setNewOptionId(tempId);
      
      onAddOption({ title: newOptionTitle.trim() });
      
      setNewOptionTitle('');
      setIsAddingOption(false);
      
      setTimeout(() => {
        setIsGeneratingDescription(false);
        setNewOptionId(null);
      }, 3000);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Détails des options</h3>
        
        {onAddOption && !isAddingOption && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setIsAddingOption(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter une option
          </Button>
        )}
      </div>
      
      {isAddingOption && (
        <Card className="mb-4 border-dashed border-primary/50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Label htmlFor="new-option">Nouvelle option</Label>
              <div className="flex gap-2">
                <Input
                  id="new-option"
                  placeholder="Titre de l'option (ex: Acheter une maison neuve)"
                  value={newOptionTitle}
                  onChange={(e) => setNewOptionTitle(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddOption} 
                  disabled={!newOptionTitle.trim() || isGeneratingDescription}
                >
                  Ajouter
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingOption(false);
                    setNewOptionTitle('');
                  }}
                  disabled={isGeneratingDescription}
                >
                  Annuler
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Une description sera générée automatiquement pour cette option.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isGeneratingDescription && (
        <Card key="loading-option" className="mb-4 border border-primary/30 animate-pulse">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{loadingOptionTitle}</CardTitle>
              <div className="text-lg font-bold">
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 w-full justify-between mt-3"
              disabled
            >
              <span>Détails par critère</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        {finalScores.map((option, index) => (
          <Card key={option.id} className={index === 0 ? "border-primary" : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  {index === 0 && (
                    <div className="bg-primary/10 text-primary p-1 rounded-full mr-2">
                      <Star className="h-4 w-4" />
                    </div>
                  )}
                  <CardTitle className="text-lg">
                    {option.title}
                  </CardTitle>
                </div>
                <div className="text-lg font-bold">
                  Score: {option.score}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-muted-foreground text-sm mb-3">{option.description}</p>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 w-full justify-between"
                onClick={() => toggleExpandOption(option.id)}
              >
                <span>Détails par critère</span>
                {expandedOption === option.id ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              
              {expandedOption === option.id && (
                <div className="mt-4 border rounded-md divide-y">
                  <div className="grid grid-cols-12 p-2 bg-muted font-medium text-sm">
                    <div className="col-span-5">Critère</div>
                    <div className="col-span-2 text-center">Poids</div>
                    <div className="col-span-2 text-center">Score</div>
                    <div className="col-span-3 text-center">Score pondéré</div>
                  </div>
                  {option.details.map((detail) => (
                    <div key={detail.criterionId} className="grid grid-cols-12 p-2 text-sm">
                      <div className="col-span-5 flex items-center">
                        {detail.criterionName}
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 ml-1">
                              <Info className="h-3 w-3" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-medium">Formule de calcul</h4>
                              <p className="text-sm text-muted-foreground">
                                Score pondéré = Score × Poids du critère
                              </p>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="col-span-2 text-center">{detail.weight}</div>
                      <div className="col-span-2 text-center">{detail.score}</div>
                      <div className="col-span-3 text-center font-medium">
                        {detail.weightedScore.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
