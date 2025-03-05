import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList, Option } from '@/components/decision/OptionsList';
import { CriteriaEvaluation, Criterion, Evaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Step = 'decision' | 'criteria' | 'options' | 'analysis';

interface LocationState {
  existingDecision?: {
    id: string;
    title: string;
    description: string;
  };
}

// Fonction pour générer des options avec Claude AI
const generateAIOptions = async (decisionTitle: string, decisionDescription: string): Promise<Option[]> => {
  try {
    console.log("Attempting to generate AI options for:", decisionTitle);
    const response = await supabase.functions.invoke('generateAIOptions', {
      body: { title: decisionTitle, description: decisionDescription }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    console.log("AI options response:", response.data);
    
    // Ensure each option has a valid ID
    return response.data.options.map((option, index) => ({
      ...option,
      id: `ai-${index + 1}`,
      isAIGenerated: true
    }));
  } catch (error: any) {
    console.error('Erreur lors de la génération des options:', error);
    toast.error('Erreur lors de la génération des options avec l\'IA');
    
    // Options par défaut en cas d'erreur
    return [
      { id: 'ai-1', title: 'Option A', description: 'Première solution envisageable pour répondre à cette problématique.', isAIGenerated: true },
      { id: 'ai-2', title: 'Option B', description: 'Alternative qui présente des avantages différents.', isAIGenerated: true },
      { id: 'ai-3', title: 'Option C', description: 'Approche plus innovante ou moins conventionnelle.', isAIGenerated: true },
      { id: 'ai-4', title: 'Statu quo', description: 'Ne rien changer et maintenir la situation actuelle.', isAIGenerated: true }
    ];
  }
};

// Fonction pour générer des critères avec Claude AI
const generateAICriteria = async (decisionTitle: string, decisionDescription: string): Promise<Criterion[]> => {
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
    
    // Critères par défaut en cas d'erreur
    return [
      { id: '1', name: 'Coût', weight: 3, isAIGenerated: true },
      { id: '2', name: 'Qualité', weight: 4, isAIGenerated: true },
      { id: '3', name: 'Durabilité', weight: 5, isAIGenerated: true }
    ];
  }
};

// Fonction pour générer un score déterministe basé sur le titre de l'option et le nom du critère
const generateDeterministicScore = (optionTitle: string, criterionName: string): number => {
  // Utiliser une fonction de hachage simple basée sur les caractères des chaînes
  const hash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Conversion en 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Générer un nombre entre 3 et 10 basé sur le hachage combiné de l'option et du critère
  const combinedHash = hash(optionTitle + criterionName);
  return 3 + (combinedHash % 8);
};

const Index = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const existingDecision = locationState?.existingDecision;

  // Log the existing decision for debugging
  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);

  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState<{ id: string; title: string; description: string }>({
    id: existingDecision?.id || '',
    title: existingDecision?.title || '',
    description: existingDecision?.description || ''
  });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    // Update decision state when existingDecision changes
    if (existingDecision) {
      setDecision({
        id: existingDecision.id,
        title: existingDecision.title,
        description: existingDecision.description
      });
      
      // If we have an existing decision and we're on the decision step, skip to the criteria step
      if (step === 'decision') {
        console.log("Loading existing decision, moving to criteria step:", existingDecision.id);
        setStep('criteria');
        
        // Generate AI criteria for the existing decision
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
        // Set default criteria
        setCriteria([
          { id: '1', name: 'Coût', weight: 3, isAIGenerated: false },
          { id: '2', name: 'Qualité', weight: 4, isAIGenerated: false }
        ]);
      } finally {
        setIsGeneratingCriteria(false);
      }
    } else {
      // Set default empty criteria if not generating
      setCriteria([
        { id: '1', name: 'Coût', weight: 3, isAIGenerated: false },
        { id: '2', name: 'Qualité', weight: 4, isAIGenerated: false }
      ]);
    }
  };

  const handleDecisionSubmit = async (decisionData: { title: string; description: string }, generateWithAI: boolean = false) => {
    // Important: Preserve the existing ID when updating decision
    setDecision({
      id: decision.id,
      title: decisionData.title,
      description: decisionData.description
    });
    
    // Generate criteria first
    await generateCriteria(decisionData.title, decisionData.description, generateWithAI);
    
    setStep('criteria');
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    setCriteria(criteriaData);
    
    // Générer automatiquement des options avec l'IA après la définition des critères
    try {
      setIsGeneratingOptions(true);
      toast.info("Génération des options en cours...");
      
      const aiOptions = await generateAIOptions(decision.title, decision.description);
      console.log("AI options generated automatically after criteria:", aiOptions);
      
      if (aiOptions && aiOptions.length > 0) {
        setOptions(aiOptions);
        
        // Préparer les évaluations avec des scores déterministes pour les options IA
        const deterministicEvaluations = aiOptions.flatMap(option => 
          criteriaData.map(criterion => ({
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
        // Initialiser avec des options vides en cas d'erreur
        setOptions([
          { id: '1', title: '', description: '', isAIGenerated: false },
          { id: '2', title: '', description: '', isAIGenerated: false }
        ]);
      }
    } catch (error) {
      console.error("Error generating options:", error);
      toast.error("Erreur lors de la génération des options");
      // Initialiser avec des options vides en cas d'erreur
      setOptions([
        { id: '1', title: '', description: '', isAIGenerated: false },
        { id: '2', title: '', description: '', isAIGenerated: false }
      ]);
    } finally {
      setIsGeneratingOptions(false);
      setStep('options');
    }
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    console.log("handleOptionsComplete called with:", optionsData, generateWithAI);
    
    // Si l'utilisateur a modifié les options ou en a ajouté de nouvelles, utilisez celles-ci
    setOptions(optionsData);
    
    // Préparer les évaluations avec des scores déterministes
    const deterministicEvaluations = optionsData.flatMap(option => 
      criteria.map(criterion => ({
        optionId: option.id,
        criterionId: criterion.id,
        score: generateDeterministicScore(option.title, criterion.name)
      }))
    );
    
    console.log("Generated deterministic evaluations for options:", deterministicEvaluations);
    setEvaluations(deterministicEvaluations);
    setStep('analysis');
  };

  const handleReset = () => {
    setStep('decision');
    setDecision({ id: '', title: '', description: '' });
    setOptions([]);
    setCriteria([]);
    setEvaluations([]);
  };

  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <Header />
      <Container>
        <div className="min-h-[80vh] flex flex-col justify-center items-center py-12">
          {step === 'decision' && (
            <DecisionForm 
              onSubmit={handleDecisionSubmit} 
              initialDecision={decision.id ? decision : undefined}
            />
          )}
          
          {step === 'criteria' && (
            <CriteriaEvaluation 
              criteria={criteria}
              isLoading={isGeneratingCriteria}
              onComplete={handleCriteriaComplete}
              decisionTitle={decision.title}
            />
          )}
          
          {step === 'options' && (
            <OptionsList 
              decisionTitle={decision.title} 
              onComplete={handleOptionsComplete}
              isLoading={isGeneratingOptions}
              initialOptions={options}
            />
          )}
          
          {step === 'analysis' && (
            <AnalysisResult
              decisionTitle={decision.title}
              options={options}
              criteria={criteria}
              evaluations={evaluations}
              onBack={() => setStep('options')}
              onReset={handleReset}
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default Index;
