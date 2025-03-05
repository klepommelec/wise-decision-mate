import { useState, useEffect, useRef } from 'react';
import { Container } from '@/components/layout/Container';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList } from '@/components/decision/OptionsList';
import { CriteriaEvaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';
import { useAuth } from '@/context/AuthContext';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { StepNavigator } from './components/StepNavigator';
import { DecisionsList } from './components/DecisionsList';
import { useDecisionSteps, type Decision } from './hooks/useDecisionSteps';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
    handleReset
  } = useDecisionSteps(existingDecision);

  // Cette fonction garantit que la page se positionne correctement lors du chargement
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  };

  // Assure que la page se repositionne correctement lors du chargement initial et des changements de route
  useEffect(() => {
    scrollToTop();
  }, []);

  // Pour gérer le positionnement lors des navigations
  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);
  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);
  useEffect(() => {
    // Scroll to top when step changes
    if (contentRef.current) {
      contentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, [step]);
  const handleNewDecision = () => {
    window.location.href = '/';
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
  if (!loading && !user) {
    return <Navigate to="/auth" />;
  }
  const renderWelcomeScreen = () => {
    if (step !== 'decision' || existingDecision) return null;
    return <div className="max-w-4xl mx-auto mb-1 pt-16 py-0">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="text-center mb-1 py-[64px]">
          <h1 className="text-4xl font-bold tracking-tight mb-3">Prenez des décisions éclairées</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Notre outil vous aide à structurer votre réflexion et à analyser objectivement les options qui s'offrent à vous.
          </p>
        </motion.div>
      </div>;
  };
  return <div className="flex flex-col min-h-screen" ref={contentRef}>
      <div className="flex-1 flex flex-col">
        {step === 'decision' && <>
            {renderWelcomeScreen()}
            <div id="decision-form" className="flex-1 flex items-center justify-center py-8">
              <Container className="flex justify-center items-center w-full">
                <motion.div className="w-full max-w-2xl mx-auto" initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.4
            }}>
                  <DecisionForm onSubmit={handleDecisionSubmit} initialDecision={decision.id ? decision : undefined} />
                </motion.div>
              </Container>
            </div>
          </>}
        
        <AnimatePresence mode="wait">
          {step !== 'decision' && <Container>
              <motion.div className="w-full max-w-2xl mx-auto" key={step} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.4
          }}>
                {step === 'criteria' && <div>
                    <StepNavigator onNewDecision={handleNewDecision} currentStep="Critères" previousSteps={["Décision"]} onBackStep={() => handleReset()} />
                    <CriteriaEvaluation criteria={criteria} isLoading={isGeneratingCriteria || isProcessingManualEntries} onComplete={handleCriteriaComplete} decisionTitle={decision.title} />
                  </div>}
                
                {step === 'options' && <div>
                    <StepNavigator onNewDecision={handleNewDecision} currentStep="Options" previousSteps={["Décision", "Critères"]} onBackStep={handleBackToCriteria} />
                    <OptionsList decisionTitle={decision.title} onComplete={handleOptionsComplete} onBack={handleBackToCriteria} isLoading={isGeneratingOptions || isProcessingManualEntries} initialOptions={options} />
                  </div>}
                
                {step === 'analysis' && <div>
                    <StepNavigator onNewDecision={handleNewDecision} currentStep="Analyse" previousSteps={["Décision", "Critères", "Options"]} onBackStep={() => handleBackToCriteria()} />
                    <AnalysisResult decisionTitle={decision.title} options={options} criteria={criteria} evaluations={evaluations} onBack={() => handleBackToCriteria()} onReset={handleReset} />
                  </div>}
              </motion.div>
            </Container>}
        </AnimatePresence>

        {user && step === 'decision' && !existingDecision && <div className="w-full mt-auto">
            <Container className="py-12">
              <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5,
            delay: 0.5
          }}>
                <DecisionsList onDecisionClick={handleDecisionClick} onNewDecision={handleReset} />
              </motion.div>
            </Container>
          </div>}
      </div>
    </div>;
};
export default Index;