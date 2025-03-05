
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dghezzwmzzfaqmoqdvdl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnaGV6endtenpmYXFtb3FkdmRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NjQ5MDksImV4cCI6MjA1NjI0MDkwOX0.GvM5C1Qlm9Gquk4eoQ-qWAOeTXb7vDX7hWUrRJVDInI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Add interfaces for our app's data structure
export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
}

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

// Add a function to find the recommended option based on evaluations
export const findRecommendedOption = (
  options: Option[],
  criteria: Criterion[],
  evaluations: Evaluation[]
): string | null => {
  if (!options.length || !criteria.length || !evaluations.length) {
    return null;
  }

  // Calculate weighted scores for each option
  const optionScores = options.map(option => {
    let totalScore = 0;
    let totalWeight = 0;

    criteria.forEach(criterion => {
      const evaluation = evaluations.find(
        e => e.optionId === option.id && e.criterionId === criterion.id
      );
      
      if (evaluation) {
        totalScore += evaluation.score * criterion.weight;
        totalWeight += criterion.weight;
      }
    });

    // Calculate the weighted average
    const weightedAverage = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return {
      optionId: option.id,
      title: option.title,
      score: weightedAverage
    };
  });

  // Sort options by score (highest first)
  optionScores.sort((a, b) => b.score - a.score);
  
  // Return the title of the highest-scoring option
  return optionScores.length > 0 ? optionScores[0].title : null;
}
