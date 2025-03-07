
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { findRecommendedOption } from '@/integrations/supabase/client';
import { Option } from './useOptionsState';
import { Criterion } from './useCriteriaState';
import { Evaluation } from './useOptionsState';

export function useRecommendation() {
  const [recommendationsMap, setRecommendationsMap] = useState<Record<string, string>>({});

  const updateRecommendation = async (
    decisionId: string,
    options: Option[], 
    criteria: Criterion[], 
    evaluations: Evaluation[]
  ) => {
    if (!decisionId) return null;
    
    const recommendedOption = findRecommendedOption(options, criteria, evaluations);
    
    if (recommendedOption) {
      try {
        const { error } = await supabase
          .from('decisions')
          .update({ 
            ai_recommendation: recommendedOption 
          })
          .eq('id', decisionId);
          
        if (error) {
          console.error("Error updating AI recommendation:", error);
        } else {
          console.log("Updated AI recommendation:", recommendedOption);
          setRecommendationsMap(prev => ({
            ...prev,
            [decisionId]: recommendedOption
          }));
        }
        return recommendedOption;
      } catch (error) {
        console.error("Error saving recommendation:", error);
      }
    }
    return null;
  };

  return {
    recommendationsMap,
    updateRecommendation
  };
}
