
import { useState, useEffect } from 'react';
import { useDecisionState } from './useDecisionState';
import { useCriteriaState } from './useCriteriaState';
import { useOptionsState } from './useOptionsState';
import { useRecommendation } from './useRecommendation';
import { useOptionActions } from './useOptionActions';
import { useExistingDecision } from './useExistingDecision';
import { useDecisionWorkflow } from './useDecisionWorkflow';
import { Decision, Criterion, Option, Evaluation, Step } from './types';

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

  const { loadSavedDecisionData } = useExistingDecision();
  
  const { 
    handleDecisionSubmit: workflowHandleDecisionSubmit,
    handleCriteriaComplete: workflowHandleCriteriaComplete,
    handleBackToCriteria: workflowHandleBackToCriteria
  } = useDecisionWorkflow();

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
        
        // Charger les données sauvegardées depuis Supabase
        loadSavedDecisionData(
          existingDecision.id,
          setStep,
          setCriteria,
          setOptions,
          setEvaluations,
          generateCriteria
        ).then(result => {
          if (result?.shouldGenerateCriteria) {
            generateCriteria(existingDecision.title, existingDecision.description || "", true);
          }
        });
      }
    }
  }, [existingDecision, step]);

  // Wrapper functions to connect the different hooks
  const handleDecisionSubmit = async (decisionData: { 
    title: string; 
    description: string; 
    deadline?: string 
  }, generateWithAI: boolean = false) => {
    return workflowHandleDecisionSubmit(
      decisionData,
      setDecision,
      generateCriteria,
      setStep,
      decision
    );
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    return workflowHandleCriteriaComplete(
      criteriaData,
      baseHandleCriteriaComplete,
      decision,
      generateOptions,
      generateEvaluations,
      setStep
    );
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    return baseHandleOptionsComplete(
      optionsData, 
      generateWithAI, 
      decision, 
      criteria, 
      setOptions, 
      setEvaluations, 
      (stepValue: Step) => setStep(stepValue)
    );
  };

  const handleBackToCriteria = () => {
    workflowHandleBackToCriteria(setStep);
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
