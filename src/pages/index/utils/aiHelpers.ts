
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Option, Criterion, Evaluation } from '@/integrations/supabase/client';

export const generateAIOptions = async (decisionTitle: string, decisionDescription: string): Promise<Option[]> => {
  try {
    console.log("Attempting to generate AI options for:", decisionTitle);
    const response = await supabase.functions.invoke('generateAIOptions', {
      body: { title: decisionTitle, description: decisionDescription }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log("AI options response:", response.data);
    
    return response.data.options.map((option, index) => ({
      ...option,
      id: `ai-${index + 1}`,
      isAIGenerated: true
    }));
  } catch (error: any) {
    console.error('Erreur lors de la génération des options:', error);
    toast.error('Erreur lors de la génération des options avec l\'IA');
    
    return [
      { id: 'ai-1', title: 'Option A', description: 'Première solution envisageable pour répondre à cette problématique.', isAIGenerated: true },
      { id: 'ai-2', title: 'Option B', description: 'Alternative qui présente des avantages différents.', isAIGenerated: true },
      { id: 'ai-3', title: 'Option C', description: 'Approche plus innovante ou moins conventionnelle.', isAIGenerated: true },
      { id: 'ai-4', title: 'Statu quo', description: 'Ne rien changer et maintenir la situation actuelle.', isAIGenerated: true }
    ];
  }
};

export const generateAICriteria = async (decisionTitle: string, decisionDescription: string): Promise<Criterion[]> => {
  try {
    const response = await supabase.functions.invoke('generateAICriteria', {
      body: { title: decisionTitle, description: decisionDescription }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data.criteria;
  } catch (error: any) {
    console.error('Erreur lors de la génération des critères:', error);
    toast.error('Erreur lors de la génération des critères avec l\'IA');
    
    return [
      { id: '1', name: 'Coût', weight: 3, isAIGenerated: true },
      { id: '2', name: 'Qualité', weight: 4, isAIGenerated: true },
      { id: '3', name: 'Durabilité', weight: 5, isAIGenerated: true }
    ];
  }
};

export const generateDescription = async (
  title: string, 
  context: string, 
  type: 'option' | 'criterion'
): Promise<string> => {
  try {
    const response = await supabase.functions.invoke('generateDescription', {
      body: { title, context, type }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data.description;
  } catch (error: any) {
    console.error(`Erreur lors de la génération de description pour ${type}:`, error);
    
    if (type === 'option') {
      return `Option considérant ${title.toLowerCase()} comme solution potentielle à cette problématique.`;
    } else {
      return `Évalue dans quelle mesure chaque option satisfait le critère de ${title.toLowerCase()}.`;
    }
  }
};

export const generateDeterministicScore = (optionTitle: string, criterionName: string): number => {
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  };
  
  const combinedHash = hash(optionTitle + criterionName);
  return 3 + (combinedHash % 8);
};

export const processOptionDescriptions = async (options: Option[], decisionTitle: string): Promise<Option[]> => {
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
  
  return processedOptions;
};

export const generateEvaluations = (options: Option[], criteria: Criterion[]): Evaluation[] => {
  const evaluations = options.flatMap(option => 
    criteria.map(criterion => ({
      optionId: option.id,
      criterionId: criterion.id,
      score: generateDeterministicScore(option.title, criterion.name)
    }))
  );
  
  console.log("Generated deterministic evaluations:", evaluations);
  return evaluations;
};
