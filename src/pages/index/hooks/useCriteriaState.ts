
import { useState } from 'react';
import { toast } from 'sonner';
import { generateAICriteria, generateDescription } from '../utils/aiHelpers';

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  isAIGenerated?: boolean;
}

export function useCriteriaState() {
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [isProcessingManualEntries, setIsProcessingManualEntries] = useState(false);

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
    setIsProcessingManualEntries(false);
    return processedCriteria;
  };

  return {
    criteria,
    setCriteria,
    isGeneratingCriteria,
    isProcessingManualEntries,
    generateCriteria,
    handleCriteriaComplete
  };
}
