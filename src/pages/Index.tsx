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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, List, Calendar, Clock } from 'lucide-react';

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

// Fonction pour générer une description pour une option ou un critère ajouté manuellement
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
    
    // Descriptions par défaut en cas d'erreur
    if (type === 'option') {
      return `Option considérant ${title.toLowerCase()} comme solution potentielle à cette problématique.`;
    } else {
      return `Évalue dans quelle mesure chaque option satisfait le critère de ${title.toLowerCase()}.`;
    }
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

  // Log the existing decision for debugging
  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);

  // Fetch user's decisions
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
    // Update decision state when existingDecision changes
    if (existingDecision) {
      setDecision({
        id: existingDecision.id,
        title: existingDecision.title,
        description: existingDecision.description,
        deadline: existingDecision.deadline
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

  const handleDecisionSubmit = async (decisionData: { title: string; description: string; deadline?: string }, generateWithAI: boolean = false) => {
    // Important: Preserve the existing ID when updating decision
    setDecision({
      id: decision.id,
      title: decisionData.title,
      description: decisionData.description,
      deadline: decisionData.deadline
    });
    
    // Generate criteria first
    await generateCriteria(decisionData.title, decisionData.description, generateWithAI);
    
    setStep('criteria');
  };

  const handleCriteriaComplete = async (criteriaData: Criterion[]) => {
    setIsProcessingManualEntries(true);
    
    // Traiter chaque critère pour s'assurer qu'il a une description complète
    const processedCriteria = [...criteriaData];
    const criteriaToProcess = processedCriteria.filter(criterion => 
      !criterion.isAIGenerated
    );
    
    // Gérer les critères ajoutés manuellement (on ne modifie pas leurs poids)
    if (criteriaToProcess.length > 0) {
      for (const criterion of criteriaToProcess) {
        // Nous ne modifions que les critères sans description
        // Comme le modèle ne stocke pas de descriptions pour les critères, 
        // cette partie est préparée pour de futures extensions
        console.log(`Criterion ${criterion.name} processed`);
      }
    }
    
    setCriteria(processedCriteria);
    
    // Générer automatiquement des options avec l'IA après la définition des critères
    try {
      setIsGeneratingOptions(true);
      toast.info("Génération des options en cours...");
      
      const aiOptions = await generateAIOptions(decision.title, decision.description);
      console.log("AI options generated automatically after criteria:", aiOptions);
      
      if (aiOptions && aiOptions.length > 0) {
        setOptions(aiOptions);
        
        // Traiter chaque option pour s'assurer qu'elle a une description
        const processedOptions = [...options];
        const optionsToProcess = processedOptions.filter(option => 
          !option.isAIGenerated && (!option.description || option.description.trim() === '')
        );
        
        // Générer des descriptions pour les options ajoutées manuellement
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
                
                // Mettre à jour l'option avec la description générée
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
        
        // Préparer les évaluations avec des scores déterministes pour les options IA
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
      setIsProcessingManualEntries(false);
      setStep('options');
    }
  };

  const handleOptionsComplete = async (optionsData: Option[], generateWithAI: boolean = false) => {
    console.log("handleOptionsComplete called with:", optionsData, generateWithAI);
    
    setIsProcessingManualEntries(true);
    
    // Traiter chaque option pour s'assurer qu'elle a une description
    const processedOptions = [...optionsData];
    const optionsToProcess = processedOptions.filter(option => 
      !option.isAIGenerated && (!option.description || option.description.trim() === '')
    );
    
    // Générer des descriptions pour les options ajoutées manuellement
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
            
            // Mettre à jour l'option avec la description générée
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
    
    // Si l'utilisateur a modifié les options ou en a ajouté de nouvelles, utilisez celles-ci
    setOptions(processedOptions);
    
    // Préparer les évaluations avec des scores déterministes
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
    // Save the current options before going back
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

  // Rediriger vers la page d'authentification si l'utilisateur n'est pas connecté
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <Header />
      <Container>
        <div className="min-h-[80vh] flex flex-col py-12">
          <div className="w-full max-w-2xl mx-auto mb-12">
            {step === 'decision' && (
              <DecisionForm 
                onSubmit={handleDecisionSubmit} 
                initialDecision={decision.id ? decision : undefined}
              />
            )}
            
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

          {/* User's Decisions Section */}
          {user && step === 'decision' && (
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
                      className="hover:shadow-md transition-shadow cursor-pointer"
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
                          
                          {decision.favorite_option && (
                            <div className="text-xs bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-md">
                              ★ {decision.favorite_option}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {decision.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {decision.description}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Pas de description
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </>
  );
};

export default Index;
