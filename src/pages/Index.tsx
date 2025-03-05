
import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList } from '@/components/decision/OptionsList';
import { CriteriaEvaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, Option, Criterion, Evaluation } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, List, Calendar, Clock, Star, CheckCircle } from 'lucide-react';

type Step = 'decision' | 'criteria' | 'options' | 'analysis';

interface LocationState {
  existingDecision?: {
    id: string;
    title: string;
    description: string;
    deadline?: string;
  };
}

interface Decision {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  deadline?: string | null;
  favorite_option?: string | null;
}

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
    
    return [
      { id: '1', name: 'Coût', weight: 3, isAIGenerated: true },
      { id: '2', name: 'Qualité', weight: 4, isAIGenerated: true },
      { id: '3', name: 'Durabilité', weight: 5, isAIGenerated: true }
    ];
  }
};

const generateDescription = async (
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

const generateDeterministicScore = (optionTitle: string, criterionName: string): number => {
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

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const existingDecision = locationState?.existingDecision;
  const { user, loading } = useAuth();
  
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState<{ id: string; title: string; description: string; deadline?: string }>({
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
  const [userDecisions, setUserDecisions] = useState<Decision[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState(true);

  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);

  useEffect(() => {
    const fetchUserDecisions = async () => {
      if (!user) return;

      try {
        setLoadingDecisions(true);
        const { data, error } = await supabase
          .from("decisions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setUserDecisions(data || []);
      } catch (error: any) {
        console.error("Erreur lors de la récupération des décisions:", error);
        toast.error("Impossible de charger vos décisions");
      } finally {
        setLoadingDecisions(false);
      }
    };

    fetchUserDecisions();
  }, [user]);

  useEffect(() => {
    if (existingDecision) {
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

  const handleDecisionClick = (selectedDecision: Decision) => {
    console.log("Opening decision:", selectedDecision.id, selectedDecision.title);
    setStep('decision');
    navigate("/", { 
      state: { 
        existingDecision: {
          id: selectedDecision.id,
          title: selectedDecision.title,
          description: selectedDecision.description || "",
          deadline: selectedDecision.deadline
        }
      }
    });
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return "Pas de deadline";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex flex-col">
        {step === 'decision' && (
          <div className="flex-1 flex items-center justify-center py-12">
            <Container className="flex justify-center items-center w-full">
              <div className="w-full max-w-2xl mx-auto">
                <DecisionForm 
                  onSubmit={handleDecisionSubmit} 
                  initialDecision={decision.id ? decision : undefined}
                />
              </div>
            </Container>
          </div>
        )}
        
        {step !== 'decision' && (
          <Container>
            <div className="w-full max-w-2xl mx-auto">
              {step === 'criteria' && (
                <CriteriaEvaluation 
                  criteria={criteria}
                  isLoading={isGeneratingCriteria || isProcessingManualEntries}
                  onComplete={handleCriteriaComplete}
                  decisionTitle={decision.title}
                />
              )}
              
              {step === 'options' && (
                <OptionsList 
                  decisionTitle={decision.title} 
                  onComplete={handleOptionsComplete}
                  onBack={handleBackToCriteria}
                  isLoading={isGeneratingOptions || isProcessingManualEntries}
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
        )}

        {user && step === 'decision' && (
          <div className="w-full mt-auto">
            <Container className="py-12">
              <div className="w-full max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Mes Décisions</h2>
                  <Button onClick={() => handleReset()} className="gap-2">
                    Nouvelle décision
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {loadingDecisions ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="h-[180px] animate-pulse">
                        <CardHeader>
                          <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-4 bg-muted rounded w-1/2"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 bg-muted rounded w-full mb-2"></div>
                          <div className="h-4 bg-muted rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : userDecisions.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <List className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle className="mb-2">Aucune décision</CardTitle>
                    <CardDescription className="mb-6">
                      Vous n'avez pas encore enregistré de décisions
                    </CardDescription>
                    <Button onClick={() => handleReset()}>
                      Créer votre première décision
                    </Button>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userDecisions.map((decision) => (
                      <Card 
                        key={decision.id}
                        className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                        onClick={() => handleDecisionClick(decision)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <CardTitle className="line-clamp-1">{decision.title}</CardTitle>
                          </div>
                          <div className="flex items-center justify-between">
                            <CardDescription className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3" />
                              {formatDate(decision.deadline)}
                            </CardDescription>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {decision.favorite_option ? (
                            <div className="flex items-center gap-1.5 text-green-700 dark:text-green-500 text-sm font-medium">
                              <CheckCircle className="h-4 w-4" />
                              <span className="line-clamp-1">{decision.favorite_option}</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-yellow-700 dark:text-yellow-500 text-sm text-muted-foreground">
                                <Star className="h-3.5 w-3.5" />
                                <span>Recommandation IA: Singapour</span>
                              </div>
                              <p className="text-sm text-muted-foreground italic">
                                Pas encore de décision finale
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Container>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
