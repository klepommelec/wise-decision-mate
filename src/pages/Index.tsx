
import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList, Option } from '@/components/decision/OptionsList';
import { CriteriaEvaluation, Criterion, Evaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

type Step = 'decision' | 'options' | 'criteria' | 'analysis';

// Fonction pour générer des options avec Claude AI
const generateAIOptions = async (decisionTitle: string, decisionDescription: string): Promise<Option[]> => {
  try {
    const response = await supabase.functions.invoke('generateAIOptions', {
      body: { title: decisionTitle, description: decisionDescription }
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data.options;
  } catch (error: any) {
    console.error('Erreur lors de la génération des options:', error);
    toast.error('Erreur lors de la génération des options avec l\'IA');
    
    // Options par défaut en cas d'erreur
    return [
      { id: '1', title: 'Option A', description: 'Première solution envisageable pour répondre à cette problématique.' },
      { id: '2', title: 'Option B', description: 'Alternative qui présente des avantages différents.' },
      { id: '3', title: 'Option C', description: 'Approche plus innovante ou moins conventionnelle.' },
      { id: '4', title: 'Statu quo', description: 'Ne rien changer et maintenir la situation actuelle.' }
    ];
  }
};

const Index = () => {
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState({ title: '', description: '' });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const { user, loading } = useAuth();

  const handleDecisionSubmit = async (decisionData: { title: string; description: string }, generateOptions: boolean = false) => {
    setDecision(decisionData);
    
    if (generateOptions) {
      try {
        setIsGeneratingOptions(true);
        toast.info("Génération des options en cours...");
        
        const aiOptions = await generateAIOptions(decisionData.title, decisionData.description);
        setOptions(aiOptions);
        
        toast.success("Options générées avec succès!");
      } catch (error) {
        console.error("Error generating options:", error);
        toast.error("Erreur lors de la génération des options");
        // Set default empty options
        setOptions([
          { id: '1', title: '', description: '' },
          { id: '2', title: '', description: '' }
        ]);
      } finally {
        setIsGeneratingOptions(false);
      }
    } else {
      // Set default empty options if not generating
      setOptions([
        { id: '1', title: '', description: '' },
        { id: '2', title: '', description: '' }
      ]);
    }
    
    setStep('options');
  };

  const handleOptionsComplete = (optionsData: Option[]) => {
    setOptions(optionsData);
    setStep('criteria');
  };

  const handleCriteriaComplete = (criteriaData: Criterion[], evaluationsData: Evaluation[]) => {
    setCriteria(criteriaData);
    setEvaluations(evaluationsData);
    setStep('analysis');
  };

  const handleReset = () => {
    setStep('decision');
    setDecision({ title: '', description: '' });
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
            <DecisionForm onSubmit={handleDecisionSubmit} />
          )}
          
          {step === 'options' && (
            <OptionsList 
              decisionTitle={decision.title} 
              onComplete={handleOptionsComplete}
              isLoading={isGeneratingOptions}
              initialOptions={options}
            />
          )}
          
          {step === 'criteria' && (
            <CriteriaEvaluation 
              options={options}
              onComplete={handleCriteriaComplete}
            />
          )}
          
          {step === 'analysis' && (
            <AnalysisResult
              decisionTitle={decision.title}
              options={options}
              criteria={criteria}
              evaluations={evaluations}
              onBack={() => setStep('criteria')}
              onReset={handleReset}
            />
          )}
        </div>
      </Container>
    </>
  );
};

export default Index;
