
import { useState } from 'react';
import { toast } from 'sonner';
import { generateAIOptions, generateDescription, generateDeterministicScore } from '../utils/aiHelpers';
import { Criterion } from './useCriteriaState';

export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
}

export interface Evaluation {
  optionId: string;
  criterionId: string;
  score: number;
}

export function useOptionsState() {
  const [options, setOptions] = useState<Option[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);

  const generateOptions = async (title: string, description: string) => {
    try {
      setIsGeneratingOptions(true);
      toast.info("Génération des options en cours...");
      
      const aiOptions = await generateAIOptions(title, description);
      console.log("AI options generated automatically after criteria:", aiOptions);
      
      if (aiOptions && aiOptions.length > 0) {
        setOptions(aiOptions);
        return aiOptions;
      } else {
        toast.error("Aucune option n'a pu être générée. Veuillez essayer à nouveau.");
        const defaultOptions = [
          { id: '1', title: '', description: '', isAIGenerated: false },
          { id: '2', title: '', description: '', isAIGenerated: false }
        ];
        setOptions(defaultOptions);
        return defaultOptions;
      }
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error("Erreur lors de la génération des options");
      const defaultOptions = [
        { id: '1', title: '', description: '', isAIGenerated: false },
        { id: '2', title: '', description: '', isAIGenerated: false }
      ];
      setOptions(defaultOptions);
      return defaultOptions;
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  const generateEvaluations = (options: Option[], criteria: Criterion[]) => {
    const deterministicEvaluations = options.flatMap(option => 
      criteria.map(criterion => ({
        optionId: option.id,
        criterionId: criterion.id,
        score: generateDeterministicScore(option.title, criterion.name)
      }))
    );
    
    console.log("Generated deterministic evaluations:", deterministicEvaluations);
    setEvaluations(deterministicEvaluations);
    return deterministicEvaluations;
  };

  const processOptionDescriptions = async (options: Option[], decisionTitle: string) => {
    const processedOptions = [...options];
    const optionsToProcess = processedOptions.filter(option => 
      !option.isAIGenerated && (!option.description || option.description.trim() === '')
    );
    
    if (optionsToProcess.length > 0) {
      toast.info("Traitement des options ajoutées manuellement...");
      
      for (let i = 0; i < optionsToProcess.length; i++) {
        const option = optionsToProcess[i];
        if (!option.description || option.description.trim() === '') {
          try {
            const description = await generateDescription(
              option.title, 
              decisionTitle, 
              'option'
            );
            
            const index = processedOptions.findIndex(o => o.id === option.id);
            if (index !== -1) {
              processedOptions[index] = {
                ...processedOptions[index],
                description
              };
            }
          } catch (error) {
            console.error("Erreur lors de la génération de description pour l'option:", error);
          }
        }
      }
    }
    
    setOptions(processedOptions);
    return processedOptions;
  };

  return {
    options,
    setOptions,
    evaluations,
    setEvaluations,
    isGeneratingOptions,
    generateOptions,
    generateEvaluations,
    processOptionDescriptions
  };
}
