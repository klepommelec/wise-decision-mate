
import { useState, useEffect } from 'react';
import { supabase, Option, Criterion, Evaluation, DatabaseOption, DatabaseCriterion, DatabaseEvaluation, mapOptionFromDB, mapCriterionFromDB, mapEvaluationFromDB } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDecisionDataParams {
  decisionId: string;
  enabled?: boolean;
}

interface UseDecisionDataResult {
  options: Option[];
  criteria: Criterion[];
  evaluations: Evaluation[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useDecisionData = ({ decisionId, enabled = true }: UseDecisionDataParams): UseDecisionDataResult => {
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!decisionId || !enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching data for decision:", decisionId);
      
      const [optionsResponse, criteriaResponse, evaluationsResponse] = await Promise.all([
        supabase.from('options').select('*').eq('decision_id', decisionId),
        supabase.from('criteria').select('*').eq('decision_id', decisionId),
        supabase.from('evaluations').select('*').eq('decision_id', decisionId)
      ]);
      
      if (optionsResponse.error) throw new Error(optionsResponse.error.message);
      if (criteriaResponse.error) throw new Error(criteriaResponse.error.message);
      if (evaluationsResponse.error) throw new Error(evaluationsResponse.error.message);
      
      console.log("Data fetched successfully:", {
        options: optionsResponse.data,
        criteria: criteriaResponse.data,
        evaluations: evaluationsResponse.data
      });
      
      // Map the database response to our application interfaces
      const fetchedOptions = (optionsResponse.data as DatabaseOption[]).map(mapOptionFromDB);
      const fetchedCriteria = (criteriaResponse.data as DatabaseCriterion[]).map(mapCriterionFromDB);
      const fetchedEvaluations = (evaluationsResponse.data as DatabaseEvaluation[]).map(mapEvaluationFromDB);
      
      setOptions(fetchedOptions);
      setCriteria(fetchedCriteria);
      setEvaluations(fetchedEvaluations);
    } catch (err) {
      console.error("Error fetching decision data:", err);
      setError(err instanceof Error ? err : new Error('Une erreur est survenue lors du chargement des données'));
      toast.error("Erreur lors du chargement des données de la décision");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [decisionId, enabled]);

  return {
    options,
    criteria,
    evaluations,
    isLoading,
    error,
    refetch: fetchData
  };
};

export default useDecisionData;
