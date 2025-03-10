
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Decision, Criterion, Option, Evaluation } from './types';

export function useExistingDecision() {
  const loadSavedDecisionData = async (
    decisionId: string,
    setStep: (step: string) => void,
    setCriteria: (criteria: Criterion[]) => void,
    setOptions: (options: Option[]) => void,
    setEvaluations: (evaluations: Evaluation[]) => void,
    generateCriteria: (title: string, description: string, autoGenerate: boolean) => Promise<void>
  ) => {
    try {
      console.log("Chargement des données pour la décision:", decisionId);
      
      // 1. Charger les critères
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (criteriaError) throw criteriaError;
      console.log("Critères chargés:", criteriaData);
      
      if (!criteriaData || criteriaData.length === 0) {
        console.log("Aucun critère trouvé, génération automatique");
        setStep('criteria');
        return { shouldGenerateCriteria: true };
      }
      
      // 2. Charger les options
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (optionsError) throw optionsError;
      console.log("Options chargées:", optionsData);
      
      // 3. Charger les évaluations
      const { data: evaluationsData, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (evalError) throw evalError;
      console.log("Évaluations chargées:", evaluationsData);
      
      // Transformer les données pour notre application
      const formattedCriteria: Criterion[] = criteriaData.map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight
      }));
      
      const formattedOptions: Option[] = optionsData.map(o => ({
        id: o.id,
        title: o.title,
        description: o.description || ""
      }));
      
      const formattedEvaluations: Evaluation[] = evaluationsData.map(e => ({
        optionId: e.option_id,
        criterionId: e.criterion_id,
        score: e.score
      }));
      
      // Mettre à jour l'état avec les données chargées
      setCriteria(formattedCriteria);
      setOptions(formattedOptions);
      setEvaluations(formattedEvaluations);
      
      // Passer directement à l'étape d'analyse
      setStep('analysis');
      
      console.log("Données chargées avec succès, passage à l'analyse");
      return { shouldGenerateCriteria: false };
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Impossible de charger les données de la décision");
      // En cas d'erreur, revenir à l'étape des critères
      setStep('criteria');
      return { shouldGenerateCriteria: true };
    }
  };

  return {
    loadSavedDecisionData
  };
}
