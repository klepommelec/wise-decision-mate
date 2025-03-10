
import { useState, useEffect } from 'react';
import { useDecisionState, type Step, type Decision } from './useDecisionState';
import { useCriteriaState, type Criterion } from './useCriteriaState';
import { useOptionsState, type Option, type Evaluation } from './useOptionsState';
import { useRecommendation } from './useRecommendation';
import { useOptionActions } from './useOptionActions';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
        
        // Charger les données sauvegardées depuis Supabase
        loadSavedDecisionData(existingDecision.id);
      }
    }
  }, [existingDecision, step]);

  // Fonction pour charger les données complètes d'une décision
  const loadSavedDecisionData = async (decisionId: string) => {
    try {
      console.log("Chargement des données pour la décision:", decisionId);
      
      // 1. Charger les critères
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('criteria')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (criteriaError) throw criteriaError;
      console.log("Critères chargés:", criteriaData);
      
      if (!criteriaData || criteriaData.length === 0) {
        console.log("Aucun critère trouvé, génération automatique");
        setStep('criteria');
        generateCriteria(existingDecision!.title, existingDecision!.description || "", true);
        return;
      }
      
      // 2. Charger les options
      const { data: optionsData, error: optionsError } = await supabase
        .from('options')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (optionsError) throw optionsError;
      console.log("Options chargées:", optionsData);
      
      // 3. Charger les évaluations
      const { data: evaluationsData, error: evalError } = await supabase
        .from('evaluations')
        .select('*')
        .eq('decision_id', decisionId);
      
      if (evalError) throw evalError;
      console.log("Évaluations chargées:", evaluationsData);
      
      // Transformer les données pour notre application
      const formattedCriteria: Criterion[] = criteriaData.map(c => ({
        id: c.id,
        name: c.name,
        weight: c.weight
      }));
      
      const formattedOptions: Option[] = optionsData.map(o => ({
        id: o.id,
        title: o.title,
        description: o.description || ""
      }));
      
      const formattedEvaluations: Evaluation[] = evaluationsData.map(e => ({
        optionId: e.option_id,
        criterionId: e.criterion_id,
        score: e.score
      }));
      
      // Mettre à jour l'état avec les données chargées
      setCriteria(formattedCriteria);
      setOptions(formattedOptions);
      setEvaluations(formattedEvaluations);
      
      // Passer directement à l'étape d'analyse
      setStep('analysis');
      
      console.log("Données chargées avec succès, passage à l'analyse");
      
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      toast.error("Impossible de charger les données de la décision");
      // En cas d'erreur, revenir à l'étape des critères
      setStep('criteria');
      generateCriteria(existingDecision!.title, existingDecision!.description || "", true);
    }
  };

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
