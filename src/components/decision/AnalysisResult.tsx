import { useState, useMemo, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Option, Criterion, Evaluation } from '@/integrations/supabase/client';

// Import our components
import { BestOption } from './analysis/BestOption';
import { OptionsChart } from './analysis/OptionsChart';
import { CriteriaChart } from './analysis/CriteriaChart';
import { OptionDetails } from './analysis/OptionDetails';
import { DownloadPDF } from './analysis/DownloadPDF';
import { Notes } from './analysis/Notes'; // Import the new Notes component

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
      console.log("Starting decision save process...");

      // Find existing decision or create a new one
      const { data: existingDecisions, error: fetchError } = await supabase
        .from('decisions')
        .select('id')
        .eq('title', decisionTitle)
        .eq('user_id', user.id)
        .limit(1);

      if (fetchError) {
        console.error("Error fetching existing decision:", fetchError);
        throw fetchError;
      }

      let decisionId;

      if (existingDecisions && existingDecisions.length > 0) {
        // Update existing decision
        decisionId = existingDecisions[0].id;
        console.log("Updating existing decision:", decisionId);
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

        if (insertError) {
          console.error("Error creating new decision:", insertError);
          throw insertError;
        }
        
        decisionId = newDecision.id;
        console.log("Created new decision:", decisionId);
      }

      // First, delete any existing criteria, options and evaluations to avoid duplicates
      console.log("Cleaning existing data...");
      
      // Delete existing evaluations first (due to foreign key constraints)
      const { error: deleteEvalError } = await supabase
        .from('evaluations')
        .delete()
        .eq('decision_id', decisionId);
        
      if (deleteEvalError) {
        console.error("Error deleting existing evaluations:", deleteEvalError);
        throw deleteEvalError;
      }
      
      // Delete existing criteria
      const { error: deleteCriteriaError } = await supabase
        .from('criteria')
        .delete()
        .eq('decision_id', decisionId);
        
      if (deleteCriteriaError) {
        console.error("Error deleting existing criteria:", deleteCriteriaError);
        throw deleteCriteriaError;
      }
      
      // Delete existing options
      const { error: deleteOptionsError } = await supabase
        .from('options')
        .delete()
        .eq('decision_id', decisionId);
        
      if (deleteOptionsError) {
        console.error("Error deleting existing options:", deleteOptionsError);
        throw deleteOptionsError;
      }
      
      console.log("Data cleaned, proceeding with new data insertion...");

      // Now insert all criteria and get their new IDs
      const criteriaToInsert = criteria.map(criterion => ({
        decision_id: decisionId,
        name: criterion.name,
        weight: criterion.weight
      }));
      
      const { data: insertedCriteria, error: criteriaError } = await supabase
        .from('criteria')
        .insert(criteriaToInsert)
        .select('id, name');
        
      if (criteriaError) {
        console.error("Error inserting criteria:", criteriaError);
        throw criteriaError;
      }
      
      console.log("Inserted criteria:", insertedCriteria);
      
      // Create a mapping from criteria names to their new IDs
      const criteriaMap = insertedCriteria.reduce((map, c) => {
        map[c.name] = c.id;
        return map;
      }, {} as Record<string, string>);
      
      // Now insert all options and get their new IDs
      const optionsToInsert = options.map(option => ({
        decision_id: decisionId,
        title: option.title,
        description: option.description
      }));
      
      const { data: insertedOptions, error: optionsError } = await supabase
        .from('options')
        .insert(optionsToInsert)
        .select('id, title');
        
      if (optionsError) {
        console.error("Error inserting options:", optionsError);
        throw optionsError;
      }
      
      console.log("Inserted options:", insertedOptions);
      
      // Create a mapping from option titles to their new IDs
      const optionsMap = insertedOptions.reduce((map, o) => {
        map[o.title] = o.id;
        return map;
      }, {} as Record<string, string>);
      
      // Finally, insert all evaluations with the new IDs
      const evaluationsToInsert = [];
      
      for (const evaluation of evaluations) {
        const option = options.find(o => o.id === evaluation.optionId);
        const criterion = criteria.find(c => c.id === evaluation.criterionId);
        
        if (!option || !criterion) {
          console.warn("Skipping evaluation - missing option or criterion", evaluation);
          continue;
        }
        
        const optionId = optionsMap[option.title];
        const criterionId = criteriaMap[criterion.name];
        
        if (!optionId || !criterionId) {
          console.warn("Skipping evaluation - missing mapped ID", {
            optionTitle: option.title,
            criterionName: criterion.name,
            optionId,
            criterionId
          });
          continue;
        }
        
        evaluationsToInsert.push({
          decision_id: decisionId,
          option_id: optionId,
          criterion_id: criterionId,
          score: evaluation.score
        });
      }
      
      // Only proceed if we have evaluations to insert
      if (evaluationsToInsert.length > 0) {
        const { error: evalError } = await supabase
          .from('evaluations')
          .insert(evaluationsToInsert);
          
        if (evalError) {
          console.error("Error inserting evaluations:", evalError);
          throw evalError;
        }
        
        console.log("Inserted evaluations:", evaluationsToInsert.length);
      } else {
        console.warn("No evaluations to insert");
      }

      toast.success("Décision sauvegardée avec succès");
      console.log("Decision saved successfully");
    } catch (error) {
      console.error("Error saving decision:", error);
      toast.error("Erreur lors de la sauvegarde de la décision");
    } finally {
      setIsSaving(false);
    }
  };

  // Find existing decision ID for the Notes component
  const [decisionId, setDecisionId] = useState<string | undefined>(undefined);
  
  useMemo(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('decisions')
      .select('id')
      .eq('title', decisionTitle)
      .eq('user_id', user.id)
      .limit(1);
      
    if (data && data.length > 0) {
      setDecisionId(data[0].id);
    }
  }, [decisionTitle, user]);

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
      
      {/* Enhanced Notes component with sharing capability */}
      <Notes decisionId={decisionId} decisionTitle={decisionTitle} />
    </div>
  );
}
