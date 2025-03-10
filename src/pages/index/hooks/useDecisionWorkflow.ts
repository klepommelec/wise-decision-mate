
import { useState } from 'react';
import { Decision, Criterion, Option, Evaluation } from './types';

export function useDecisionWorkflow() {
  const handleDecisionSubmit = async (
    decisionData: { 
      title: string; 
      description: string; 
      deadline?: string 
    },
    setDecision: (decision: Decision) => void,
    generateCriteria: (title: string, description: string, generateWithAI: boolean) => Promise<void>,
    setStep: (step: string) => void,
    decision: Decision
  ) => {
    // Update the decision data
    setDecision({
      id: decision.id,
      title: decisionData.title,
      description: decisionData.description,
      deadline: decisionData.deadline
    });
    
    // Generate criteria for the decision
    await generateCriteria(decisionData.title, decisionData.description, true);
    
    // Move to the criteria step
    setStep('criteria');
  };

  const handleCriteriaComplete = async (
    criteriaData: Criterion[],
    baseHandleCriteriaComplete: (criteriaData: Criterion[]) => Promise<Criterion[]>,
    decision: Decision,
    generateOptions: (title: string, description: string) => Promise<Option[]>,
    generateEvaluations: (options: Option[], criteria: Criterion[]) => Evaluation[],
    setStep: (step: string) => void
  ) => {
    // Process the criteria data
    const processedCriteria = await baseHandleCriteriaComplete(criteriaData);
    
    try {
      // Generate options automatically
      const generatedOptions = await generateOptions(decision.title, decision.description);
      
      // Generate evaluations for the options
      const deterministicEvaluations = generateEvaluations(generatedOptions, processedCriteria);
      
      // Skip the options step and go directly to analysis
      setStep('analysis');
    } catch (error) {
      console.error("Error in criteria completion flow:", error);
      // Even if there's an error, proceed to analysis with whatever we have
      setStep('analysis');
    }
  };

  const handleBackToCriteria = (setStep: (step: string) => void) => {
    console.log("Navigating back to criteria screen");
    setStep('criteria');
  };

  return {
    handleDecisionSubmit,
    handleCriteriaComplete,
    handleBackToCriteria
  };
}
