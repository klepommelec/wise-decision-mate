
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Option } from './OptionsList';
import { cn } from '@/lib/utils';

export interface Criterion {
  id: string;
  name: string;
  weight: number;
}

export interface Evaluation {
  optionId: string;
  criterionId: string;
  score: number;
}

interface CriteriaEvaluationProps {
  options: Option[];
  onComplete: (criteria: Criterion[], evaluations: Evaluation[]) => void;
}

export function CriteriaEvaluation({ options, onComplete }: CriteriaEvaluationProps) {
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: '1', name: 'Coût', weight: 3 },
    { id: '2', name: 'Qualité', weight: 4 },
  ]);
  
  const [evaluations, setEvaluations] = useState<Evaluation[]>(
    options.flatMap(option => 
      criteria.map(criterion => ({
        optionId: option.id,
        criterionId: criterion.id,
        score: 5
      }))
    )
  );
  
  const [step, setStep] = useState<'criteria' | 'evaluation'>('criteria');
  
  const addCriterion = () => {
    const newCriterion = { 
      id: Math.random().toString(36).substr(2, 9), 
      name: '', 
      weight: 3 
    };
    
    setCriteria([...criteria, newCriterion]);
    
    // Add default evaluations for this criterion
    const newEvaluations = options.map(option => ({
      optionId: option.id,
      criterionId: newCriterion.id,
      score: 5
    }));
    
    setEvaluations([...evaluations, ...newEvaluations]);
  };
  
  const removeCriterion = (id: string) => {
    if (criteria.length <= 2) return;
    setCriteria(criteria.filter(c => c.id !== id));
    setEvaluations(evaluations.filter(e => e.criterionId !== id));
  };
  
  const updateCriterion = (id: string, field: 'name' | 'weight', value: string | number) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };
  
  const updateEvaluation = (optionId: string, criterionId: string, score: number) => {
    setEvaluations(evaluations.map(e => 
      e.optionId === optionId && e.criterionId === criterionId
        ? { ...e, score }
        : e
    ));
  };
  
  const getEvaluationValue = (optionId: string, criterionId: string): number => {
    const evaluation = evaluations.find(
      e => e.optionId === optionId && e.criterionId === criterionId
    );
    return evaluation ? evaluation.score : 5;
  };
  
  const handleContinue = () => {
    if (step === 'criteria') {
      setStep('evaluation');
    } else {
      onComplete(criteria, evaluations);
    }
  };
  
  const isCriteriaValid = criteria.every(c => c.name.trim() !== '');
  
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            {step === 'criteria' ? 'Définissez vos critères' : 'Évaluez vos options'}
          </CardTitle>
          <CardDescription>
            {step === 'criteria' 
              ? 'Quels facteurs sont importants pour cette décision?' 
              : 'Notez chaque option selon les critères définis'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'criteria' ? (
            <div className="space-y-6">
              {criteria.map((criterion, index) => (
                <div 
                  key={criterion.id} 
                  className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50 animate-slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Critère {index + 1}</h3>
                    {criteria.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeCriterion(criterion.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`name-${criterion.id}`}>Nom du critère</Label>
                      <Input
                        id={`name-${criterion.id}`}
                        value={criterion.name}
                        onChange={(e) => updateCriterion(criterion.id, 'name', e.target.value)}
                        placeholder="Ex: Coût, Qualité, Durabilité..."
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`weight-${criterion.id}`}>Importance (1-5)</Label>
                        <span className="text-sm font-medium">{criterion.weight}</span>
                      </div>
                      <Slider
                        id={`weight-${criterion.id}`}
                        min={1}
                        max={5}
                        step={1}
                        value={[criterion.weight]}
                        onValueChange={(values) => updateCriterion(criterion.id, 'weight', values[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Peu important</span>
                        <span>Très important</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2" 
                onClick={addCriterion}
              >
                <Plus className="h-4 w-4" />
                Ajouter un critère
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {options.map((option, optionIndex) => (
                <div 
                  key={option.id}
                  className="space-y-4 p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50 animate-slide-in"
                  style={{ animationDelay: `${optionIndex * 0.1}s` }}
                >
                  <h3 className="font-medium text-lg">{option.title}</h3>
                  {option.description && (
                    <p className="text-sm text-muted-foreground mb-2">{option.description}</p>
                  )}
                  
                  <div className="space-y-6">
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="space-y-2">
                        <div className="flex justify-between">
                          <Label>
                            {criterion.name} 
                            <span className="text-xs ml-2 text-muted-foreground">
                              (Importance: {criterion.weight}/5)
                            </span>
                          </Label>
                          <span className="text-sm font-medium">
                            {getEvaluationValue(option.id, criterion.id)}
                          </span>
                        </div>
                        <Slider
                          min={1}
                          max={10}
                          step={1}
                          value={[getEvaluationValue(option.id, criterion.id)]}
                          onValueChange={(values) => 
                            updateEvaluation(option.id, criterion.id, values[0])
                          }
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Faible</span>
                          <span>Excellent</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className={cn(
          "flex pt-2", 
          step === 'criteria' ? "justify-end" : "justify-between"
        )}>
          {step === 'evaluation' && (
            <Button 
              variant="outline" 
              onClick={() => setStep('criteria')}
            >
              Revenir aux critères
            </Button>
          )}
          <Button 
            onClick={handleContinue} 
            disabled={step === 'criteria' && !isCriteriaValid}
            className="gap-2"
          >
            {step === 'criteria' ? 'Continuer' : 'Voir l\'analyse'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
