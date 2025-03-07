
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowRight, Plus, Sparkles, ArrowLeft } from 'lucide-react';
import { OptionItem } from './OptionItem';
import { AIGenerationSettings } from './AIGenerationSettings';
import { useOptionsLogic } from './useOptionsLogic';
import { OptionsListProps } from './types';

export function OptionsList({ decisionTitle, onComplete, onBack, isLoading = false, initialOptions, autoSubmit = false }: OptionsListProps) {
  const {
    options,
    useAI,
    setUseAI,
    addOption,
    removeOption,
    updateOption,
    handleTitleBlur,
    isValid
  } = useOptionsLogic(initialOptions);
  
  const handleSubmit = () => {
    console.log("handleSubmit called with options:", options);
    console.log("useAI setting:", useAI);
    
    const hasEmptyOptions = options.some(o => !o.title.trim());
    console.log("Has empty options?", hasEmptyOptions);
    
    onComplete(options, hasEmptyOptions && useAI);
  };
  
  // Auto submit if the autoSubmit prop is true
  useEffect(() => {
    if (autoSubmit && isValid) {
      console.log("Auto-submitting options");
      handleSubmit();
    }
  }, [autoSubmit, isValid]);
  
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="transition-all duration-300 border border-gray-200">
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
              <OptionItem
                key={option.id}
                option={option}
                index={index}
                canDelete={options.length > 2}
                onUpdate={updateOption}
                onDelete={removeOption}
                onTitleBlur={(option) => handleTitleBlur(option, decisionTitle)}
              />
            ))}
            
            <AIGenerationSettings 
              useAI={useAI} 
              onUseAIChange={setUseAI} 
            />
            
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
