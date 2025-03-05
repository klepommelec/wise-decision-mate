
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Option, Criterion, Evaluation } from '@/integrations/supabase/client';
import { findRecommendedOption } from '@/integrations/supabase/client';
import { generateAICriteria, generateAIOptions, generateDescription, generateDeterministicScore } from '../utils/aiHelpers';

export type Step = 'decision' | 'criteria' | 'options' | 'analysis';

export interface Decision {
  id: string;
  title: string;
  description: string;
  deadline?: string;
}

export function useDecisionSteps(existingDecision?: { id: string; title: string; description: string; deadline?: string }) {
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState<Decision>({
    id: existingDecision?.id || '',
    title: existingDecision?.title || '',
    description: existingDecision?.description || '',
    deadline: existingDecision?.deadline || undefined
  });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [isProcessingManualEntries, setIsProcessingManualEntries] = useState(false);
  const [recommendationsMap, setRecommendationsMap] = useState<Record<string, string>>({});

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

  const generateCriteria = async (title: string, description: string, autoGenerate: boolean = true) => {
    if (autoGenerate) {
      try {
        setIsGeneratingCriteria(true);
        toast.info("Génération des critères en cours...");
        
        const aiCriteria = await generateAICriteria(title, description);
        setCriteria(aiCriteria);
        
        toast.success("Critères générés avec succès!");
      } catch (error) {
        console.error("Error generating criteria:", error);
        toast.error("Erreur lors de la génération des critères");
        setCriteria([
          { id: '1', name: 'Coût', weight: 3, isAIGenerated: false },
          { id: '2', name: 'Qualité', weight: 4, isAIGenerated: false }
        ]);
      } finally {
        setIsGeneratingCriteria(false);
      }
    } else {
      setCriteria([
        { id: '1', name: 'Coût', weight: 3, isAIGenerated: false },
        { id: '2', name: 'Qualité', weight: 4, isAIGenerated: false }
      ]);
    }
  };

  const handleDecisionSubmit = async (decisionData: { title: string; description: string; deadline?: string }, generateWithAI: boolean = false) => {
    setDecision({
      id: decision.id,
      title: decisionData.title,
      description: decisionData.description,
      deadline: decisionData.deadline
    });
    
    await generateCriteria(decisionData.title, decisionData.description, generateWithAI);
    
    setStep('criteria');
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    setIsProcessingManualEntries(true);
    
    const processedCriteria = [...criteriaData];
    const criteriaToProcess = processedCriteria.filter(criterion => 
      !criterion.isAIGenerated
    );
    
    if (criteriaToProcess.length > 0) {
      for (const criterion of criteriaToProcess) {
        console.log(`Criterion ${criterion.name} processed`);
      }
    }
    
    setCriteria(processedCriteria);
    
    try {
      setIsGeneratingOptions(true);
      toast.info("Génération des options en cours...");
      
      const aiOptions = await generateAIOptions(decision.title, decision.description);
      console.log("AI options generated automatically after criteria:", aiOptions);
      
      if (aiOptions && aiOptions.length > 0) {
        setOptions(aiOptions);
        
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
                  decision.title, 
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
        
        const deterministicEvaluations = aiOptions.flatMap(option => 
          processedCriteria.map(criterion => ({
            optionId: option.id,
            criterionId: criterion.id,
            score: generateDeterministicScore(option.title, criterion.name)
          }))
        );
        
        console.log("Generated deterministic evaluations:", deterministicEvaluations);
        setEvaluations(deterministicEvaluations);
        setIsGeneratingOptions(false);
        toast.success("Options générées avec succès!");
      } else {
        toast.error("Aucune option n'a pu être générée. Veuillez essayer à nouveau.");
        setOptions([
          { id: '1', title: '', description: '', isAIGenerated: false },
          { id: '2', title: '', description: '', isAIGenerated: false }
        ]);
      }
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error("Erreur lors de la génération des options");
      setOptions([
        { id: '1', title: '', description: '', isAIGenerated: false },
        { id: '2', title: '', description: '', isAIGenerated: false }
      ]);
    } finally {
      setIsGeneratingOptions(false);
      setIsProcessingManualEntries(false);
      setStep('options');
    }
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    console.log("handleOptionsComplete called with:", optionsData, generateWithAI);
    
    setIsProcessingManualEntries(true);
    
    const processedOptions = [...optionsData];
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
              decision.title, 
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
    
    const deterministicEvaluations = processedOptions.flatMap(option => 
      criteria.map(criterion => ({
        optionId: option.id,
        criterionId: criterion.id,
        score: generateDeterministicScore(option.title, criterion.name)
      }))
    );
    
    console.log("Generated deterministic evaluations for options:", deterministicEvaluations);
    setEvaluations(deterministicEvaluations);
    
    const recommendedOption = findRecommendedOption(processedOptions, criteria, deterministicEvaluations);
    
    if (recommendedOption && decision.id) {
      try {
        const { error } = await supabase
          .from('decisions')
          .update({ 
            ai_recommendation: recommendedOption 
          })
          .eq('id', decision.id);
          
        if (error) {
          console.error("Error updating AI recommendation:", error);
        } else {
          console.log("Updated AI recommendation:", recommendedOption);
          setRecommendationsMap(prev => ({
            ...prev,
            [decision.id]: recommendedOption
          }));
        }
      } catch (error) {
        console.error("Error saving recommendation:", error);
      }
    }
    
    setIsProcessingManualEntries(false);
    setStep('analysis');
  };

  const handleBackToCriteria = () => {
    console.log("Navigating back to criteria screen");
    setStep('criteria');
  };

  const handleReset = () => {
    setStep('decision');
    setDecision({ id: '', title: '', description: '' });
    setOptions([]);
    setCriteria([]);
    setEvaluations([]);
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
    handleReset
  };
}
