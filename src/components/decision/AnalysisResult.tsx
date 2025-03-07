
import { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import type { Option, Criterion, Evaluation } from '@/integrations/supabase/client';

// Import our new components
import { BestOption } from './analysis/BestOption';
import { OptionsChart } from './analysis/OptionsChart';
import { CriteriaChart } from './analysis/CriteriaChart';
import { OptionDetails } from './analysis/OptionDetails';
import { DownloadPDF } from './analysis/DownloadPDF';

interface AnalysisResultProps {
  decisionTitle: string;
  options: Option[];
  criteria: Criterion[];
  evaluations: Evaluation[];
  onBack: () => void;
  onReset: () => void;
  onRegenerateOptions?: () => void;
  onAddOption?: (option: { title: string }) => void;
}

export function AnalysisResult({ 
  decisionTitle, 
  options, 
  criteria, 
  evaluations, 
  onBack, 
  onReset,
  onRegenerateOptions,
  onAddOption
}: AnalysisResultProps) {
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Calculate final scores for options
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

  // Prepare data for the criteria chart
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

  // Get the best option (with highest score)
  const bestOption = finalScores.length > 0 ? finalScores[0] : null;

  // Prepare data for the options chart
  const chartData = finalScores.map((item: any) => ({
    name: item.title,
    score: item.score
  }));

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      {/* Display the best option */}
      <BestOption 
        bestOption={bestOption} 
        decisionTitle={decisionTitle} 
        onRegenerateOptions={onRegenerateOptions} 
      />

      <div ref={contentRef}>
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
            {/* Options chart */}
            <OptionsChart chartData={chartData} />
            
            {/* Criteria chart */}
            <CriteriaChart 
              criteria={criteria}
              criteriaChartData={criteriaChartData}
              selectedCriterion={selectedCriterion}
              setSelectedCriterion={setSelectedCriterion}
            />
            
            {/* Option details */}
            <OptionDetails 
              finalScores={finalScores}
              onAddOption={onAddOption}
            />
          </CardContent>
          <CardFooter className="justify-between pt-4">
            <Button variant="back" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux options
            </Button>
            <DownloadPDF 
              decisionTitle={decisionTitle}
              contentRef={contentRef}
            />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
