
import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Download, Star, Check, ArrowRight, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Option, Criterion, Evaluation } from '@/integrations/supabase/client';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface AnalysisResultProps {
  decisionId: string;
  decisionTitle: string;
  options: Option[];
  criteria: Criterion[];
  evaluations: Evaluation[];
  onBack: () => void;
  onReset: () => void;
}

interface OptionScore {
  option: Option;
  score: number;
  details: {
    criterionId: string;
    criterionName: string;
    weight: number;
    score: number;
    weightedScore: number;
  }[];
}

export function AnalysisResult({ 
  decisionId,
  decisionTitle, 
  options, 
  criteria, 
  evaluations, 
  onBack, 
  onReset 
}: AnalysisResultProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);
  const { user } = useAuth();

  const finalScores = useMemo(() => {
    const scores: Record<string, any> = {};
    
    options.forEach(option => {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      const details: any[] = [];
      
      criteria.forEach(criterion => {
        const evaluation = evaluations.find(e => 
          e.optionId === option.id && e.criterionId === criterion.id
        );
        
        if (evaluation) {
          const weightedScore = evaluation.score * criterion.weight;
          totalWeightedScore += weightedScore;
          totalWeight += criterion.weight;
          
          details.push({
            criterionId: criterion.id,
            criterionName: criterion.name,
            weight: criterion.weight,
            score: evaluation.score,
            weightedScore: weightedScore
          });
        }
      });
      
      const averageWeightedScore = totalWeight > 0 ? 
        totalWeightedScore / totalWeight : 0;
      
      scores[option.id] = {
        id: option.id,
        title: option.title,
        description: option.description,
        score: parseFloat(averageWeightedScore.toFixed(2)),
        details: details
      };
    });
    
    return Object.values(scores).sort((a: any, b: any) => b.score - a.score);
  }, [options, criteria, evaluations]);

  const criteriaChartData = useMemo(() => {
    const criterionToUse = selectedCriterion || (criteria.length > 0 ? criteria[0].id : null);
    
    if (!criterionToUse) return [];
    
    return options.map(option => {
      const evaluation = evaluations.find(e => 
        e.optionId === option.id && e.criterionId === criterionToUse
      );
      
      return {
        name: option.title,
        score: evaluation ? evaluation.score : 0
      };
    });
  }, [options, criteria, evaluations, selectedCriterion]);

  const bestOption = finalScores.length > 0 ? finalScores[0] : null;

  const toggleExpandOption = (optionId: string) => {
    if (expandedOption === optionId) {
      setExpandedOption(null);
    } else {
      setExpandedOption(optionId);
    }
  };

  const handleSaveFavoriteOption = async (optionTitle: string) => {
    if (!user || !decisionId) {
      toast.error("Impossible d'enregistrer votre choix. Veuillez vous reconnecter.");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ favorite_option: optionTitle })
        .eq('id', decisionId);
        
      if (error) throw error;
      
      toast.success('Option favorite enregistrée!');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'option favorite:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'option favorite');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = finalScores.map((item: any) => ({
    name: item.title,
    score: item.score
  }));

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="mb-6 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Résumé de l'analyse</CardTitle>
          <CardDescription>
            Voici le résultat de votre décision "{decisionTitle}"
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bestOption && (
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
                  onClick={() => handleSaveFavoriteOption(bestOption.title)}
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
          )}
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-medium">Résultats détaillés</CardTitle>
              <CardDescription>
                Comparaison des options selon les critères d'évaluation
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Score global par option</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8">
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mb-8">
            <div className="flex flex-col mb-4">
              <h3 className="text-lg font-medium mb-2">Score par critère</h3>
              <div className="overflow-x-auto pb-2 -mx-1 px-1">
                <div className="flex gap-2 min-w-min">
                  {criteria.map((criterion) => (
                    <Button
                      key={criterion.id}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "text-xs whitespace-nowrap",
                        selectedCriterion === criterion.id && "bg-primary/10 border-primary"
                      )}
                      onClick={() => setSelectedCriterion(criterion.id)}
                    >
                      {criterion.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={criteriaChartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Détails des options</h3>
            <div className="space-y-4">
              {finalScores.map((option: any, index: number) => (
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
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-bold">
                          Score: {option.score}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSaveFavoriteOption(option.title)}
                          disabled={isSaving}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Choisir
                        </Button>
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
                        {option.details.map((detail: any) => (
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
        </CardContent>
        <CardFooter className="justify-between pt-4">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux options
          </Button>
          <Button variant="default" onClick={onReset} className="gap-2">
            Nouvelle décision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
