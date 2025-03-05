
import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList, Option } from '@/components/decision/OptionsList';
import { CriteriaEvaluation, Criterion, Evaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { toast } from 'sonner';

type Step = 'decision' | 'options' | 'criteria' | 'analysis';

// Mock function to simulate AI options generation
const generateAIOptions = async (decisionTitle: string, decisionDescription: string): Promise<Option[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate options based on the decision
  const baseOptions: Array<{ title: string, description: string }> = [];
  
  if (decisionTitle.toLowerCase().includes('voiture')) {
    baseOptions.push(
      { title: 'Acheter une voiture électrique', description: 'Meilleur pour l\'environnement, coûts de carburant réduits, entretien simplifié.' },
      { title: 'Acheter une voiture hybride', description: 'Un bon compromis entre économie et autonomie, moins de contraintes de recharge.' },
      { title: 'Acheter une voiture à essence', description: 'Plus abordable à l\'achat, grande disponibilité, pas de contrainte de recharge.' },
      { title: 'Location longue durée', description: 'Pas d\'engagement sur le long terme, inclut souvent l\'entretien et l\'assurance.' }
    );
  } else if (decisionTitle.toLowerCase().includes('maison') || decisionTitle.toLowerCase().includes('appartement')) {
    baseOptions.push(
      { title: 'Acheter un bien immobilier', description: 'Investissement à long terme, liberté de personnalisation, patrimoine.' },
      { title: 'Louer un logement', description: 'Flexibilité, moins de responsabilités d\'entretien, mobilité facilitée.' },
      { title: 'Rénover le logement actuel', description: 'Moins coûteux, pas de déménagement, valorisation du bien existant.' },
      { title: 'Construire une maison neuve', description: 'Personnalisation totale, normes énergétiques modernes, garanties constructeur.' }
    );
  } else if (decisionTitle.toLowerCase().includes('emploi') || decisionTitle.toLowerCase().includes('travail')) {
    baseOptions.push(
      { title: 'Accepter l\'offre d\'emploi', description: 'Nouvelles opportunités, évolution de carrière, nouveau réseau professionnel.' },
      { title: 'Rester dans l\'emploi actuel', description: 'Stabilité, environnement familier, avantages acquis.' },
      { title: 'Négocier de meilleures conditions', description: 'Amélioration sans changement radical, reconnaissance de votre valeur.' },
      { title: 'Se mettre à son compte', description: 'Indépendance, potentiel de revenus plus élevés, flexibilité totale.' }
    );
  } else {
    // Default generic options
    baseOptions.push(
      { title: 'Option A', description: 'Première solution envisageable pour répondre à cette problématique.' },
      { title: 'Option B', description: 'Alternative qui présente des avantages différents.' },
      { title: 'Option C', description: 'Approche plus innovante ou moins conventionnelle.' },
      { title: 'Statu quo', description: 'Ne rien changer et maintenir la situation actuelle.' }
    );
  }
  
  // Convert to Option type with IDs
  return baseOptions.map(option => ({
    id: Math.random().toString(36).substr(2, 9),
    title: option.title,
    description: option.description
  }));
};

const Index = () => {
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState({ title: '', description: '' });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);

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
