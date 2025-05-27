
import { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/layout/Container';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList } from '@/components/decision/options';
import { CriteriaEvaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
  
  const {
    user,
    loading
  } = useAuth();
  
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
      // Delay the reset to allow exit animations to complete
      const timer = setTimeout(() => {
        handleReset();
        setIsTransitioning(false);
      }, 300); // Match this with exit animation duration
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.state]);

  const handleNewDecision = () => {
    setIsTransitioning(true);
    navigate('/');
  };

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

  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }

  const renderWelcomeScreen = () => {
    if (step !== 'decision' || existingDecision) return null;
    return (
      <motion.div 
        className="text-center mb-16 relative z-10"
        {...pageTransition}
      >
        <h1 className="main-title font-medium">
          Bonjour, comment puis-je vous<br />aider aujourd'hui ?
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Memo vous assiste à structurer votre réflexion<br />
          et à analyser objectivement les options qui s'offrent à vous.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50" ref={contentRef}>
      <div className="flex-1 flex flex-col relative pt-[110px] pb-[90px] py-0">
        <div className="relative z-10 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            {step === 'decision' && (
              <motion.div 
                key="decision"
                className="flex-1 flex flex-col items-center justify-center py-0"
                {...pageTransition}
              >
                <Container className="flex flex-col justify-center items-center w-full max-w-4xl mx-auto">
                  {renderWelcomeScreen()}
                  <motion.div 
                    className="w-full max-w-2xl mx-auto"
                    {...pageTransition}
                  >
                    <DecisionForm 
                      onSubmit={handleDecisionSubmit} 
                      initialDecision={decision.id ? decision : undefined} 
                    />
                  </motion.div>
                </Container>
              </motion.div>
            )}

            {step !== 'decision' && (
              <Container key="other-steps">
                <motion.div 
                  className="w-full max-w-2xl mx-auto"
                  {...pageTransition}
                >
                  {step === 'criteria' && (
                    <div>
                      <StepNavigator 
                        currentStep="Critères" 
                        previousSteps={[]} 
                        onBackStep={() => handleReset()} 
                      />
                      <CriteriaEvaluation 
                        criteria={criteria} 
                        isLoading={isGeneratingCriteria || isProcessingManualEntries} 
                        onComplete={handleCriteriaComplete} 
                        decisionTitle={decision.title} 
                      />
                    </div>
                  )}
                  
                  {step === 'analysis' && (
                    <div>
                      <StepNavigator 
                        currentStep="Analyse" 
                        previousSteps={["Critères"]} 
                        onBackStep={() => handleBackToCriteria()} 
                      />
                      <AnalysisResult 
                        decisionTitle={decision.title} 
                        options={options} 
                        criteria={criteria} 
                        evaluations={evaluations} 
                        onBack={() => handleBackToCriteria()} 
                        onReset={handleReset} 
                        onRegenerateOptions={handleRegenerateOptions} 
                        onAddOption={handleAddOption} 
                      />
                    </div>
                  )}
                </motion.div>
              </Container>
            )}
          </AnimatePresence>

          {user && step === 'decision' && !existingDecision && (
            <div className="w-full mt-auto">
              <Container className="py-12">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isTransitioning ? 0 : 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <DecisionsList 
                    onDecisionClick={handleDecisionClick} 
                    onNewDecision={handleReset} 
                  />
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
