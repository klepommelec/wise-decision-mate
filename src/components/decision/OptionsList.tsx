
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, ArrowRight, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export interface Option {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  isAIGenerated?: boolean;
}

interface OptionsListProps {
  decisionTitle: string;
  onComplete: (options: Option[]) => void;
  isLoading?: boolean;
  initialOptions?: Option[];
}

export function OptionsList({ decisionTitle, onComplete, isLoading = false, initialOptions }: OptionsListProps) {
  const [options, setOptions] = useState<Option[]>([
    { id: '1', title: '', description: '', isAIGenerated: false },
    { id: '2', title: '', description: '', isAIGenerated: false }
  ]);
  
  useEffect(() => {
    if (initialOptions && initialOptions.length >= 2) {
      // Marquer les options initiales comme générées par l'IA si elles ne sont pas déjà marquées
      const markedOptions = initialOptions.map(option => ({
        ...option,
        isAIGenerated: option.isAIGenerated !== false
      }));
      setOptions(markedOptions);
    }
  }, [initialOptions]);
  
  const addOption = () => {
    setOptions([...options, { 
      id: Math.random().toString(36).substr(2, 9), 
      title: '', 
      description: '',
      isAIGenerated: false
    }]);
  };
  
  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(option => option.id !== id));
  };
  
  const updateOption = (id: string, field: 'title' | 'description' | 'imageUrl', value: string) => {
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

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      updateOption(id, 'imageUrl', imageUrl);
    };
    reader.readAsDataURL(file);
  };
  
  const isValid = options.filter(option => option.title.trim() !== '').length >= 2;
  
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto animate-fade-in">
        <Card className="glass-card transition-all duration-300">
          <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
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
                    <Skeleton className="h-32 w-full" />
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
        <CardHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
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
                className={`p-4 border rounded-lg transition-all duration-300 animate-slide-in ${
                  option.isAIGenerated 
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40' 
                    : 'bg-white/50 dark:bg-gray-800/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Option {index + 1}</h3>
                    {option.isAIGenerated && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-700 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Badge>
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
                  {/* Zone d'image */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor={`image-${option.id}`}>Image (optionnel)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2 text-xs"
                              onClick={() => document.getElementById(`file-${option.id}`)?.click()}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Ajouter une image
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ajouter une image à cette option</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    <input 
                      type="file" 
                      id={`file-${option.id}`} 
                      accept="image/*" 
                      onChange={(e) => handleImageUpload(option.id, e)} 
                      className="hidden" 
                    />
                    
                    {option.imageUrl ? (
                      <div className="relative border rounded-lg overflow-hidden h-40 group">
                        <img 
                          src={option.imageUrl} 
                          alt={option.title || `Option ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white bg-black/50 hover:bg-black/70"
                            onClick={() => updateOption(option.id, 'imageUrl', '')}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border border-dashed rounded-lg h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => document.getElementById(`file-${option.id}`)?.click()}
                      >
                        <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Cliquez pour ajouter une image</p>
                      </div>
                    )}
                  </div>
                  
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
