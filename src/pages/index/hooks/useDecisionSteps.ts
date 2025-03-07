
import { useState, useEffect } from 'react';
import { useDecisionState, type Step, type Decision } from './useDecisionState';
import { useCriteriaState, type Criterion } from './useCriteriaState';
import { useOptionsState, type Option, type Evaluation } from './useOptionsState';
import { useRecommendation } from './useRecommendation';
import { useOptionActions } from './useOptionActions';

export type { Step, Decision, Option, Criterion, Evaluation };

export function useDecisionSteps(existingDecision?: { id: string; title: string; description: string; deadline?: string }) {
  const {
    step,
    setStep,
    decision,
    setDecision,
    handleDecisionSubmit: baseHandleDecisionSubmit,
    handleReset
  } = useDecisionState(existingDecision);
  
  const {
    criteria,
    setCriteria,
    isGeneratingCriteria,
    generateCriteria,
    handleCriteriaComplete: baseHandleCriteriaComplete
  } = useCriteriaState();
  
  const {
    options,
    setOptions,
    evaluations,
    setEvaluations,
    isGeneratingOptions,
    generateOptions,
    generateEvaluations,
    processOptionDescriptions
  } = useOptionsState();
  
  const {
    recommendationsMap,
    updateRecommendation
  } = useRecommendation();

  const {
    isProcessingManualEntries,
    handleOptionsComplete: baseHandleOptionsComplete,
    handleRegenerateOptions: baseHandleRegenerateOptions,
    handleAddOption: baseHandleAddOption
  } = useOptionActions();

  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
      setDecision({
        id: existingDecision.id,
        title: existingDecision.title,
        description: existingDecision.description,
        deadline: existingDecision.deadline
      });
      
      if (step === 'decision') {
        console.log("Loading existing decision, moving to criteria step:", existingDecision.id);
        setStep('criteria');
        
        generateCriteria(existingDecision.title, existingDecision.description, true);
      }
    }
  }, [existingDecision, step]);

  const handleDecisionSubmit = async (decisionData: { 
    title: string; 
    description: string; 
    deadline?: string 
  }, generateWithAI: boolean = false) => {
    await baseHandleDecisionSubmit(decisionData);
    
    await generateCriteria(decisionData.title, decisionData.description, generateWithAI);
    
    setStep('criteria');
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    const processedCriteria = await baseHandleCriteriaComplete(criteriaData);
    
    try {
      const generatedOptions = await generateOptions(decision.title, decision.description);
      
      const deterministicEvaluations = generateEvaluations(generatedOptions, processedCriteria);
      
      setStep('options');
    } catch (error) {
      console.error("Error in criteria completion flow:", error);
      setStep('options');
    }
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    return baseHandleOptionsComplete(
      optionsData, 
      generateWithAI, 
      decision, 
      criteria, 
      setOptions, 
      setEvaluations, 
      (stepValue: string) => setStep(stepValue as Step)  // Fix: Convert string to Step type
    );
  };

  const handleBackToCriteria = () => {
    console.log("Navigating back to criteria screen");
    setStep('criteria');
  };

  const handleRegenerateOptions = async () => {
    return baseHandleRegenerateOptions(
      decision, 
      criteria, 
      setOptions, 
      setEvaluations, 
      generateOptions, 
      generateEvaluations
    );
  };

  const handleAddOption = async (newOption: { title: string }) => {
    return baseHandleAddOption(
      newOption, 
      decision, 
      options, 
      criteria, 
      evaluations, 
      setOptions, 
      setEvaluations
    );
  };

  return {
    step,
    setStep,
    decision,
    setDecision,
    options,
    setOptions,
    criteria,
    setCriteria,
    evaluations,
    setEvaluations,
    isGeneratingOptions,
    isGeneratingCriteria,
    isProcessingManualEntries,
    recommendationsMap,
    handleDecisionSubmit,
    handleCriteriaComplete,
    handleOptionsComplete,
    handleBackToCriteria,
    handleReset,
    handleRegenerateOptions,
    handleAddOption
  };
}
