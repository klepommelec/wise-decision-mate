
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Plus, Sparkles, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
}

interface OptionsListProps {
  decisionTitle: string;
  onComplete: (options: Option[], generateWithAI?: boolean) => void;
  isLoading?: boolean;
  initialOptions?: Option[];
}

export function OptionsList({ decisionTitle, onComplete, isLoading = false, initialOptions }: OptionsListProps) {
  const [options, setOptions] = useState<Option[]>(
    initialOptions && initialOptions.length > 0
      ? initialOptions
      : [
          { id: '1', title: '', description: '', isAIGenerated: false },
          { id: '2', title: '', description: '', isAIGenerated: false },
        ]
  );
  
  const [useAI, setUseAI] = useState(true);
  
  // Update options when initialOptions changes
  useEffect(() => {
    if (initialOptions && initialOptions.length > 0) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);
  
  const addOption = () => {
    const newOption = { 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      description: '',
      isAIGenerated: false
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
  
  const handleSubmit = () => {
    console.log("handleSubmit called with options:", options);
    console.log("useAI setting:", useAI);
    
    // Check if all options are empty (titles specifically)
    const allEmptyTitles = options.every(o => !o.title.trim());
    console.log("All option titles empty?", allEmptyTitles);
    
    // Pass options and the generateWithAI flag to the onComplete function
    // Generate with AI if all options are empty and AI is enabled
    onComplete(options, allEmptyTitles && useAI);
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
            Listez les différentes options pour votre décision concernant "{decisionTitle}"
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
                      placeholder="Ex: Acheter une maison neuve"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${option.id}`}>Description (optionnel)</Label>
                    <Textarea
                      id={`description-${option.id}`}
                      value={option.description}
                      onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                      placeholder="Détails, avantages et inconvénients de cette option..."
                      className="min-h-[80px]"
                    />
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
        <CardFooter className="justify-end pt-2">
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
