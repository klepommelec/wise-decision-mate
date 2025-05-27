
import { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/layout/Container';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { CriteriaEvaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { AuthSection } from '@/components/auth/AuthSection';
import { useAuth } from '@/context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { StepNavigator } from './components/StepNavigator';
import { DecisionsList } from './components/DecisionsList';
import { useDecisionSteps, type Decision } from './hooks/useDecisionSteps';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationState {
  existingDecision?: {
    id: string;
    title: string;
    description: string;
    deadline?: string;
  };
}

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const existingDecision = locationState?.existingDecision;
  const { user, loading } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const {
    step,
    decision,
    options,
    criteria,
    evaluations,
    isGeneratingOptions,
    isGeneratingCriteria,
    isProcessingManualEntries,
    handleDecisionSubmit,
    handleCriteriaComplete,
    handleOptionsComplete,
    handleBackToCriteria,
    handleReset,
    handleRegenerateOptions,
    handleAddOption
  } = useDecisionSteps(existingDecision);

  useEffect(() => {
    if ("fonts" in document) {
      document.fonts.load('1em "Roboto"').then(() => {
        console.log("Font has loaded!");
        setFontsLoaded(true);
      }).catch(err => {
        console.warn("Font loading issue:", err);
        setTimeout(() => setFontsLoaded(true), 1000);
      });
    } else {
      setTimeout(() => setFontsLoaded(true), 1000);
    }
  }, []);

  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [step]);

  useEffect(() => {
    if (location.pathname === '/' && !location.state?.existingDecision) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        handleReset();
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state]);

  const handleDecisionClick = (selectedDecision: Decision) => {
    console.log("Opening decision:", selectedDecision.id, selectedDecision.title);
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

  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: "easeInOut" }
  };

  // Si l'authentification est en cours de chargement
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, afficher la section d'authentification
  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-white to-lime-50">
        <div className="flex-1 flex items-center justify-center py-12">
          <Container className="flex flex-col justify-center items-center w-full max-w-4xl mx-auto">
            <motion.div className="text-center mb-16 relative z-10" {...pageTransition}>
              <h1 className="main-title font-medium">
                Bonjour, comment puis-je<br />vous aider aujourd'hui ?
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Memo vous assiste à structurer votre réflexion<br />
                et à analyser objectivement les options qui s'offrent à vous.
              </p>
            </motion.div>
            <motion.div className="w-full max-w-md mx-auto" {...pageTransition}>
              <AuthSection />
            </motion.div>
          </Container>
        </div>
      </div>
    );
  }

  const renderWelcomeScreen = () => {
    if (step !== 'decision' || existingDecision) return null;
    return (
      <motion.div className="text-center mb-16 relative z-10" {...pageTransition}>
        <h1 className="main-title font-medium">
          Bonjour, comment puis-je<br />vous aider aujourd'hui ?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Memo vous assiste à structurer votre réflexion<br />
          et à analyser objectivement les options qui s'offrent à vous.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen lovable-gradient-bg" ref={contentRef}>
      <div className="flex-1 flex flex-col relative py-0">
        <div className="relative z-10 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 'decision' && (
              <motion.div key="decision" className="flex-1 flex flex-col items-center justify-center py-0" {...pageTransition}>
                <Container className="flex flex-col justify-center items-center w-full max-w-4xl mx-auto">
                  {renderWelcomeScreen()}
                  <motion.div className="w-full max-w-2xl mx-auto" {...pageTransition}>
                    <DecisionForm onSubmit={handleDecisionSubmit} initialDecision={decision.id ? decision : undefined} />
                  </motion.div>
                </Container>
              </motion.div>
            )}

            {step !== 'decision' && (
              <Container key="other-steps">
                <motion.div className="w-full max-w-2xl mx-auto" {...pageTransition}>
                  {step === 'criteria' && (
                    <div>
                      <StepNavigator currentStep="Critères" previousSteps={[]} onBackStep={() => handleReset()} />
                      <CriteriaEvaluation criteria={criteria} isLoading={isGeneratingCriteria || isProcessingManualEntries} onComplete={handleCriteriaComplete} decisionTitle={decision.title} />
                    </div>
                  )}
                  
                  {step === 'analysis' && (
                    <div>
                      <StepNavigator currentStep="Analyse" previousSteps={["Critères"]} onBackStep={() => handleBackToCriteria()} />
                      <AnalysisResult decisionTitle={decision.title} options={options} criteria={criteria} evaluations={evaluations} onBack={() => handleBackToCriteria()} onReset={handleReset} onRegenerateOptions={handleRegenerateOptions} onAddOption={handleAddOption} />
                    </div>
                  )}
                </motion.div>
              </Container>
            )}
          </AnimatePresence>

          {user && step === 'decision' && !existingDecision && (
            <div className="w-full mt-auto decisions-gradient-overlay">
              <Container className="py-12">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: isTransitioning ? 0 : 1 }} transition={{ duration: 0.3, delay: 0.3 }} className="px-0">
                  <DecisionsList onDecisionClick={handleDecisionClick} onNewDecision={handleReset} />
                </motion.div>
              </Container>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
