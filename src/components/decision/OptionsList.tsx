
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export interface Option {
  id: string;
  title: string;
  description: string;
}

interface OptionsListProps {
  decisionTitle: string;
  onComplete: (options: Option[]) => void;
  isLoading?: boolean;
  initialOptions?: Option[];
}

export function OptionsList({ decisionTitle, onComplete, isLoading = false, initialOptions }: OptionsListProps) {
  const [options, setOptions] = useState<Option[]>([
    { id: '1', title: '', description: '' },
    { id: '2', title: '', description: '' }
  ]);
  
  useEffect(() => {
    if (initialOptions && initialOptions.length >= 2) {
      setOptions(initialOptions);
    }
  }, [initialOptions]);
  
  const addOption = () => {
    setOptions([...options, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      description: '' 
    }]);
  };
  
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(option => option.id !== id));
  };
  
  const updateOption = (id: string, field: 'title' | 'description', value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };
  
  const handleContinue = () => {
    const validOptions = options.filter(option => option.title.trim() !== '');
    if (validOptions.length >= 2) {
      onComplete(validOptions);
    }
  };
  
  const isValid = options.filter(option => option.title.trim() !== '').length >= 2;
  
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto animate-fade-in">
        <Card className="glass-card transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-medium">Génération des options</CardTitle>
            <CardDescription>
              Pour la décision: <span className="font-medium">{decisionTitle}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-6 animate-spin">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <p>L'IA est en train de générer des options pertinentes...</p>
              </div>
              
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Quelles sont vos options?</CardTitle>
          <CardDescription>
            Pour la décision: <span className="font-medium">{decisionTitle}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {initialOptions && initialOptions.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 p-2 rounded">
                <Sparkles className="h-4 w-4" />
                <p>Options générées par IA. Vous pouvez les modifier ou en ajouter d'autres.</p>
              </div>
            )}
            
            {options.map((option, index) => (
              <div 
                key={option.id} 
                className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Option {index + 1}</h3>
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
                    <Label htmlFor={`title-${option.id}`}>Titre</Label>
                    <Input
                      id={`title-${option.id}`}
                      value={option.title}
                      onChange={(e) => updateOption(option.id, 'title', e.target.value)}
                      placeholder="Ex: Acheter une Tesla Model 3"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`description-${option.id}`}>Description (optionnel)</Label>
                    <Textarea
                      id={`description-${option.id}`}
                      value={option.description}
                      onChange={(e) => updateOption(option.id, 'description', e.target.value)}
                      placeholder="Avantages et inconvénients de cette option..."
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
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-2">
          <Button 
            onClick={handleContinue} 
            disabled={!isValid}
            className="gap-2"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
