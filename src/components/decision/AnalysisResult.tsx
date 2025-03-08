
import { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  const [isSaving, setIsSaving] = useState<boolean>(false);
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

  // Function to save current decision state
  const saveDecision = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour sauvegarder une décision");
      return;
    }

    try {
      setIsSaving(true);

      // Find existing decision or create a new one
      const { data: existingDecisions, error: fetchError } = await supabase
        .from('decisions')
        .select('id')
        .eq('title', decisionTitle)
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) throw fetchError;

      let decisionId;

      if (existingDecisions && existingDecisions.length > 0) {
        // Update existing decision
        decisionId = existingDecisions[0].id;
      } else {
        // Create new decision
        const { data: newDecision, error: insertError } = await supabase
          .from('decisions')
          .insert({ 
            title: decisionTitle, 
            user_id: user.id,
            ai_recommendation: bestOption ? bestOption.title : null
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        decisionId = newDecision.id;
      }

      // Save criteria
      for (const criterion of criteria) {
        const { error: criterionError } = await supabase
          .from('criteria')
          .upsert({
            decision_id: decisionId,
            name: criterion.name,
            weight: criterion.weight,
            id: criterion.id.includes('temp-') ? undefined : criterion.id
          });

        if (criterionError) throw criterionError;
      }

      // Save options
      for (const option of options) {
        const { error: optionError } = await supabase
          .from('options')
          .upsert({
            decision_id: decisionId,
            title: option.title,
            description: option.description,
            id: option.id.includes('temp-') ? undefined : option.id
          });

        if (optionError) throw optionError;
      }

      // Save evaluations
      for (const evaluation of evaluations) {
        const { error: evaluationError } = await supabase
          .from('evaluations')
          .upsert({
            decision_id: decisionId,
            option_id: evaluation.optionId,
            criterion_id: evaluation.criterionId,
            score: evaluation.score,
          });

        if (evaluationError) throw evaluationError;
      }

      toast.success("Décision sauvegardée avec succès");
    } catch (error) {
      console.error("Error saving decision:", error);
      toast.error("Erreur lors de la sauvegarde de la décision");
    } finally {
      setIsSaving(false);
    }
  };

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
              {user && (
                <Button 
                  onClick={saveDecision} 
                  variant="outline" 
                  className="gap-2"
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              )}
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
              Retour aux critères
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
