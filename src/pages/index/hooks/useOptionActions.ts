
import { useState } from 'react';
import { toast } from 'sonner';
import { Option, Criterion, Evaluation } from './types';
import { useRecommendation } from './useRecommendation';
import { processOptionDescriptions, generateEvaluations } from '../utils/aiHelpers';

export function useOptionActions() {
  const [isProcessingManualEntries, setIsProcessingManualEntries] = useState(false);
  const { updateRecommendation } = useRecommendation();

  const handleOptionsComplete = async (
    optionsData: Option[], 
    generateWithAI: boolean = false,
    decision: { id: string; title: string; description: string },
    criteria: Criterion[],
    setOptions: (options: Option[]) => void,
    setEvaluations: (evaluations: Evaluation[]) => void,
    setStep: (step: string) => void
  ) => {
    console.log("handleOptionsComplete called with:", optionsData, generateWithAI);
    
    setIsProcessingManualEntries(true);
    
    const processedOptions = await processOptionDescriptions(optionsData, decision.title);
    
    const deterministicEvaluations = generateEvaluations(processedOptions, criteria);
    
    if (decision.id) {
      await updateRecommendation(decision.id, processedOptions, criteria, deterministicEvaluations);
    }
    
    setOptions(processedOptions);
    setEvaluations(deterministicEvaluations);
    setIsProcessingManualEntries(false);
    setStep('analysis');
  };

  const handleRegenerateOptions = async (
    decision: { id: string; title: string; description: string },
    criteria: Criterion[],
    setOptions: (options: Option[]) => void,
    setEvaluations: (evaluations: Evaluation[]) => void,
    generateOptions: (title: string, description: string) => Promise<Option[]>,
    generateEvaluations: (options: Option[], criteria: Criterion[]) => Evaluation[]
  ) => {
    setIsProcessingManualEntries(true);
    try {
      const generatedOptions = await generateOptions(decision.title, decision.description);
      
      const deterministicEvaluations = generateEvaluations(generatedOptions, criteria);
      
      if (decision.id) {
        await updateRecommendation(decision.id, generatedOptions, criteria, deterministicEvaluations);
      }
      
      setOptions(generatedOptions);
      setEvaluations(deterministicEvaluations);
    } catch (error) {
      console.error("Error regenerating options:", error);
    } finally {
      setIsProcessingManualEntries(false);
    }
  };

  const handleAddOption = async (
    newOption: { title: string },
    decision: { id: string; title: string; description: string },
    options: Option[],
    criteria: Criterion[],
    evaluations: Evaluation[],
    setOptions: (options: Option[]) => void,
    setEvaluations: (evaluations: Evaluation[]) => void
  ) => {
    setIsProcessingManualEntries(true);
    try {
      console.log("Adding new option:", newOption.title);
      
      // Create a new option with a unique ID
      const newOptionObj: Option = {
        id: `manual-${Date.now()}`,
        title: newOption.title,
        description: '',
        isAIGenerated: false
      };
      
      // Process the new option to generate a description
      const processedOptions = await processOptionDescriptions([newOptionObj], decision.title);
      const addedOption = processedOptions[0];
      
      // Add the new option to the existing options
      const updatedOptions = [...options, addedOption];
      setOptions(updatedOptions);
      
      // Generate evaluations for the new option
      const newEvaluations = criteria.map(criterion => ({
        optionId: addedOption.id,
        criterionId: criterion.id,
        score: 0 // Will be replaced by generated score
      }));
      
      // Generate scores for the new evaluations
      const deterministicEvaluations = generateEvaluations([addedOption], criteria);
      
      // Merge the new evaluations with existing ones
      const updatedEvaluations = [...evaluations, ...deterministicEvaluations];
      setEvaluations(updatedEvaluations);
      
      // Update recommendation if needed
      if (decision.id) {
        await updateRecommendation(decision.id, updatedOptions, criteria, updatedEvaluations);
      }
    } catch (error) {
      console.error("Error adding new option:", error);
    } finally {
      setIsProcessingManualEntries(false);
    }
  };

  return {
    isProcessingManualEntries,
    handleOptionsComplete,
    handleRegenerateOptions,
    handleAddOption
  };
}
