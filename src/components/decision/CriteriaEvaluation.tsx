import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ArrowRight, GripVertical, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Option } from '@/components/decision/options/types';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
export interface Criterion {
  id: string;
  name: string;
  weight: number;
  isAIGenerated?: boolean;
}
export interface Evaluation {
  optionId: string;
  criterionId: string;
  score: number;
}
interface CriteriaEvaluationProps {
  criteria: Criterion[];
  isLoading?: boolean;
  onComplete: (criteria: Criterion[]) => void;
  decisionTitle: string;
}
export function CriteriaEvaluation({
  criteria: initialCriteria,
  isLoading = false,
  onComplete,
  decisionTitle
}: CriteriaEvaluationProps) {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria || []);
  useEffect(() => {
    if (initialCriteria && initialCriteria.length > 0) {
      setCriteria(initialCriteria);
    }
  }, [initialCriteria]);
  const addCriterion = () => {
    const newCriterion = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      weight: 3,
      isAIGenerated: false
    };
    setCriteria([...criteria, newCriterion]);
  };
  const removeCriterion = (id: string) => {
    if (criteria.length <= 2) return;
    setCriteria(criteria.filter(c => c.id !== id));
  };
  const updateCriterion = (id: string, field: 'name' | 'weight', value: string | number) => {
    setCriteria(criteria.map(c => c.id === id ? {
      ...c,
      [field]: value,
      isAIGenerated: false
    } : c));
  };
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(criteria);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    const updatedItems = items.map((item, index) => {
      const newWeight = Math.max(1, Math.min(5, 5 - Math.floor(index * 5 / items.length)));
      return {
        ...item,
        weight: newWeight
      };
    });
    setCriteria(updatedItems);
  };
  const isCriteriaValid = criteria.every(c => c.name.trim() !== '');
  const handleComplete = () => {
    // Make sure we're passing the current local state of criteria
    onComplete(criteria);
  };
  return <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="transition-all duration-300 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            Définissez vos critères d'évaluation
          </CardTitle>
          <CardDescription>
            Quels facteurs sont importants pour votre décision concernant "{decisionTitle}"?
            <div className="text-xs mt-1">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded-full bg-primary/10"></span>
                Critères standards
              </span>
              <span className="flex items-center gap-1 mt-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                <span className="inline-block w-3 h-3 rounded-full bg-amber-100 dark:bg-amber-900/30"></span>
                Critères suggérés par l'IA
              </span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Faites glisser les critères pour les réorganiser selon leur importance. Les critères en haut sont plus importants.
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="criteriaList">
              {provided => <div className="space-y-6" {...provided.droppableProps} ref={provided.innerRef}>
                  {criteria.map((criterion, index) => <Draggable key={criterion.id} draggableId={criterion.id} index={index}>
                      {(provided, snapshot) => <div ref={provided.innerRef} {...provided.draggableProps} className={cn("p-4 border rounded-lg animate-slide-in", snapshot.isDragging ? "shadow-lg" : "", criterion.isAIGenerated ? "bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30" : "bg-white/50 dark:bg-gray-800/50")} style={{
                  animationDelay: `${index * 0.1}s`,
                  ...provided.draggableProps.style
                }}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div {...provided.dragHandleProps} className="cursor-grab p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                                <GripVertical className="h-5 w-5 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium">Critère {index + 1}</h3>
                              {criterion.isAIGenerated && <Sparkles className="h-4 w-4 text-amber-500" />}
                            </div>
                            {criteria.length > 2 && <Button variant="ghost" size="icon" onClick={() => removeCriterion(criterion.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>}
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Input id={`name-${criterion.id}`} value={criterion.name} onChange={e => updateCriterion(criterion.id, 'name', e.target.value)} placeholder="Ex: Coût, Qualité, Durabilité..." className="w-full" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-medium">Importance (1-5)</span>
                                <span className="text-sm font-medium">{criterion.weight}</span>
                              </div>
                              <Slider id={`weight-${criterion.id}`} min={1} max={5} step={1} value={[criterion.weight]} onValueChange={values => updateCriterion(criterion.id, 'weight', values[0])} className="w-full" />
                              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                                <span>Peu important</span>
                                <span>Très important</span>
                              </div>
                            </div>
                          </div>
                        </div>}
                    </Draggable>)}
                  {provided.placeholder}
                </div>}
            </Droppable>
          </DragDropContext>
          
          <Button variant="outline" className="w-full flex items-center justify-center gap-2 mt-6" onClick={addCriterion}>
            <Plus className="h-4 w-4" />
            Ajouter un critère
          </Button>
        </CardContent>
        <CardFooter className="justify-end pt-2">
          <Button onClick={handleComplete} disabled={!isCriteriaValid || isLoading} className="gap-2 rounded-full text-gray-900 bg-lime-400 hover:bg-lime-500 font-medium">
            {isLoading ? "Chargement..." : "Continuer"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>;
}