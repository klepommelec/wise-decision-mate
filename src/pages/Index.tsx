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

type Step = 'decision' | 'options' | 'criteria' | 'analysis';

const generateAIOptions = async (decisionTitle: string, decisionDescription: string): Promise<Option[]> => {
  try {
    console.log('Appelant generateAIOptions avec:', { decisionTitle, decisionDescription });
    
    const response = await supabase.functions.invoke('generateAIOptions', {
      body: { title: decisionTitle, description: decisionDescription }
    });

    if (response.error) {
      console.error('Erreur supabase function:', response.error);
      throw new Error(response.error.message);
    }

    console.log('Réponse reçue de la fonction:', response.data);
    
    if (!response.data?.options || !Array.isArray(response.data.options)) {
      console.error('Format de réponse invalide:', response.data);
      throw new Error('Format de réponse invalide');
    }

    return response.data.options;
  } catch (error: any) {
    console.error('Erreur lors de la génération des options:', error);
    toast.error('Erreur lors de la génération des options avec l\'IA');
    
    return [
      { 
        id: '1', 
        title: 'Option A', 
        description: 'Première solution envisageable pour répondre à cette problématique.',
        isAIGenerated: true,
        imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'
      },
      { 
        id: '2', 
        title: 'Option B', 
        description: 'Alternative qui présente des avantages différents.',
        isAIGenerated: true,
        imageUrl: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80'
      },
      { 
        id: '3', 
        title: 'Option C', 
        description: 'Approche plus innovante ou moins conventionnelle.',
        isAIGenerated: true,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
      },
      { 
        id: '4', 
        title: 'Statu quo', 
        description: 'Ne rien changer et maintenir la situation actuelle.',
        isAIGenerated: true,
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
      }
    ];
  }
};

const Index = () => {
  const location = useLocation();
  const decisionFromState = location.state as { 
    decisionId: string;
    decisionTitle: string;
    decisionDescription: string | null;
  } | null;

  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState({ 
    id: decisionFromState?.decisionId || '',
    title: decisionFromState?.decisionTitle || '', 
    description: decisionFromState?.decisionDescription || '' 
  });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (decisionFromState && decisionFromState.decisionTitle) {
      console.log('Initializing from decision state:', decisionFromState);
      setOptions([
        { id: '1', title: '', description: '', isAIGenerated: false },
        { id: '2', title: '', description: '', isAIGenerated: false }
      ]);
      setStep('options');
      window.history.replaceState({}, document.title);
    }
  }, [decisionFromState]);

  const handleDecisionSubmit = async (decisionData: { title: string; description: string }, generateOptions: boolean = false) => {
    setDecision({ 
      id: decision.id,
      title: decisionData.title, 
      description: decisionData.description 
    });
    
    console.log('Decision submitted:', { ...decisionData, id: decision.id, generateOptions });
    
    if (generateOptions) {
      try {
        setIsGeneratingOptions(true);
        toast.info("Génération des options en cours...");
        
        const aiOptions = await generateAIOptions(decisionData.title, decisionData.description);
        console.log('AI options generated:', aiOptions);
        setOptions(aiOptions);
        
        toast.success("Options générées avec succès!");
      } catch (error) {
        console.error("Error generating options:", error);
        toast.error("Erreur lors de la génération des options");
        setOptions([
          { id: '1', title: '', description: '', isAIGenerated: false },
          { id: '2', title: '', description: '', isAIGenerated: false }
        ]);
      } finally {
        setIsGeneratingOptions(false);
      }
    } else {
      setOptions([
        { id: '1', title: '', description: '', isAIGenerated: false },
        { id: '2', title: '', description: '', isAIGenerated: false }
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
              initialDecision={decisionFromState ? {
                title: decisionFromState.decisionTitle,
                description: decisionFromState.decisionDescription || ''
              } : undefined}
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
