
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Plus, Sparkles, Trash2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
  isLoading?: boolean;
}

interface OptionsListProps {
  decisionTitle: string;
  onComplete: (options: Option[], generateWithAI?: boolean) => void;
  onBack?: () => void; // Add this line to include the onBack prop
  isLoading?: boolean;
  initialOptions?: Option[];
}

export function OptionsList({ decisionTitle, onComplete, onBack, isLoading = false, initialOptions }: OptionsListProps) {
  const [options, setOptions] = useState<Option[]>(
    initialOptions && initialOptions.length > 0
      ? initialOptions
      : [
          { id: '1', title: '', description: '', isAIGenerated: false, isLoading: false },
          { id: '2', title: '', description: '', isAIGenerated: false, isLoading: false },
        ]
  );
  
  const [useAI, setUseAI] = useState(true);
  
  // Update options when initialOptions changes
  useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setOptions(initialOptions.map(option => ({
        ...option,
        isLoading: false
      })));
    }
  }, [initialOptions]);
  
  const addOption = () => {
    const newOption = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      description: '',
      isAIGenerated: false,
      isLoading: false
    };
    setOptions([...options, newOption]);
  };
  
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(o => o.id !== id));
  };
  
  const updateOption = (id: string, field: 'title' | 'description', value: string) => {
    setOptions(options.map(o => 
      o.id === id ? { ...o, [field]: value, isAIGenerated: false } : o
    ));
  };

  // Function to generate description for an option
  const generateDescription = async (option: Option) => {
    if (!option.title.trim() || option.isAIGenerated || option.isLoading) return;
    
    try {
      // Set loading state for this specific option
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id ? { ...o, isLoading: true } : o
      ));
      
      // Call the generateDescription edge function
      const response = await supabase.functions.invoke('generateDescription', {
        body: { 
          title: option.title, 
          context: decisionTitle, 
          type: 'option' 
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
      
      // Update the option with the generated description
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id 
          ? { 
              ...o, 
              description: response.data.description, 
              isLoading: false 
            } 
          : o
      ));
    } catch (error) {
      console.error('Erreur lors de la génération de description:', error);
      
      // Reset loading state on error
      setOptions(prevOptions => prevOptions.map(o => 
        o.id === option.id ? { ...o, isLoading: false } : o
      ));
    }
  };
  
  // Function to handle blur event on title input
  const handleTitleBlur = (option: Option) => {
    // Generate description if title has content and option doesn't already have a description
    if (option.title.trim() && (!option.description || option.description.trim() === '')) {
      generateDescription(option);
    }
  };
  
  const handleSubmit = () => {
    console.log("handleSubmit called with options:", options);
    console.log("useAI setting:", useAI);
    
    // Verify all options have titles (to avoid any empty options)
    const hasEmptyOptions = options.some(o => !o.title.trim());
    console.log("Has empty options?", hasEmptyOptions);
    
    // Pass options to the onComplete function
    // If we have options with titles, use them
    // If all options have empty titles and useAI is enabled, pass the generate flag
    onComplete(options, hasEmptyOptions && useAI);
  };
  
  // Valid if we have at least 2 options with content OR AI is enabled
  const isValid = (options.length >= 2 && options.some(o => o.title.trim() !== '')) || useAI;
  
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            Quelles sont vos options?
          </CardTitle>
          <CardDescription>
            {initialOptions && initialOptions.some(o => o.isAIGenerated) 
              ? "Voici des options générées par l'IA pour votre décision. Vous pouvez les modifier ou en ajouter d'autres."
              : `Listez les différentes options pour votre décision concernant "${decisionTitle}"`}
            <div className="text-xs mt-1">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-primary/10"></span>
                Options standards
              </span>
              <span className="flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="inline-block w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-900/30"></span>
                Options suggérées par l'IA
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {options.map((option, index) => (
              <div 
                key={option.id} 
                className={cn(
                  "p-4 border rounded-lg animate-slide-in",
                  option.isAIGenerated 
                    ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30" 
                    : "bg-white/50 dark:bg-gray-800/50"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Option {index + 1}</h3>
                    {option.isAIGenerated && (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  {options.length > 2 && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeOption(option.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`title-${option.id}`}>Titre de l'option</Label>
                    <Input
                      id={`title-${option.id}`}
                      value={option.title}
                      onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                      onBlur={() => handleTitleBlur(option)}
                      placeholder="Ex: Acheter une maison neuve"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${option.id}`}>Description (optionnel)</Label>
                    {option.isLoading ? (
                      <div className="space-y-2 animate-pulse">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <Progress className="h-1 mt-1" value={50} />
                      </div>
                    ) : (
                      <Textarea
                        id={`description-${option.id}`}
                        value={option.description}
                        onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                        placeholder="Détails, avantages et inconvénients de cette option..."
                        className="min-h-[80px]"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={addOption}
            >
              <Plus className="h-4 w-4" />
              Ajouter une option
            </Button>
            
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
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  Générer automatiquement des options avec l'IA si aucune n'est renseignée
                </Label>
                <p className="text-sm text-muted-foreground">
                  L'IA vous suggérera des options pertinentes en fonction de votre décision
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between pt-2">
          {onBack && (
            <Button 
              onClick={onBack} 
              variant="back"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux critères
            </Button>
          )}
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || isLoading}
            className="gap-2"
          >
            {isLoading ? "Chargement..." : "Continuer"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
