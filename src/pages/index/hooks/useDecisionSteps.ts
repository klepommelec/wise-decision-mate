import { useState, useEffect } from 'react';
import { useDecisionState, type Step, type Decision } from './useDecisionState';
import { useCriteriaState, type Criterion } from './useCriteriaState';
import { useOptionsState, type Option, type Evaluation } from './useOptionsState';
import { useRecommendation } from './useRecommendation';

export type { Step, Decision, Option, Criterion, Evaluation };

export function useDecisionSteps(existingDecision?: { id: string; title: string; description: string; deadline?: string }) {
  const [isProcessingManualEntries, setIsProcessingManualEntries] = useState(false);
  
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

  const handleDecisionSubmit = async (decisionData: { title: string; description: string; deadline?: string }, generateWithAI: boolean = false) => {
    await baseHandleDecisionSubmit(decisionData);
    
    await generateCriteria(decisionData.title, decisionData.description, generateWithAI);
    
    setStep('criteria');
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    setIsProcessingManualEntries(true);
    
    const processedCriteria = await baseHandleCriteriaComplete(criteriaData);
    
    try {
      const generatedOptions = await generateOptions(decision.title, decision.description);
      
      const deterministicEvaluations = generateEvaluations(generatedOptions, processedCriteria);
      
      setIsProcessingManualEntries(false);
      setStep('options');
    } catch (error) {
      console.error("Error in criteria completion flow:", error);
      setIsProcessingManualEntries(false);
      setStep('options');
    }
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    console.log("handleOptionsComplete called with:", optionsData, generateWithAI);
    
    setIsProcessingManualEntries(true);
    
    const processedOptions = await processOptionDescriptions(optionsData, decision.title);
    
    const deterministicEvaluations = generateEvaluations(processedOptions, criteria);
    
    if (decision.id) {
      await updateRecommendation(decision.id, processedOptions, criteria, deterministicEvaluations);
    }
    
    setIsProcessingManualEntries(false);
    setStep('analysis');
  };

  const handleBackToCriteria = () => {
    console.log("Navigating back to criteria screen");
    setStep('criteria');
  };

  const handleRegenerateOptions = async () => {
    setIsProcessingManualEntries(true);
    try {
      const generatedOptions = await generateOptions(decision.title, decision.description);
      
      const deterministicEvaluations = generateEvaluations(generatedOptions, criteria);
      
      if (decision.id) {
        await updateRecommendation(decision.id, generatedOptions, criteria, deterministicEvaluations);
      }
    } catch (error) {
      console.error("Error regenerating options:", error);
    } finally {
      setIsProcessingManualEntries(false);
    }
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
    handleRegenerateOptions
  };
}
