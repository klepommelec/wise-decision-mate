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

  // Font loading detection
  useEffect(() => {
    // Use the document.fonts API to check when fonts are loaded
    if ("fonts" in document) {
      document.fonts.load('1em "Roboto"').then(() => {
        console.log("Font has loaded!");
        setFontsLoaded(true);
      }).catch(err => {
        console.warn("Font loading issue:", err);
        // Set loaded anyway after a delay to avoid UI being stuck
        setTimeout(() => setFontsLoaded(true), 1000);
      });
    } else {
      // Fallback for browsers without the fonts API
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
    return <div className="text-center mb-16">
        <h1 className="main-title font-medium">
          Prenez des décisions<br />averties, avec Memo.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Memo vous assiste à structurer votre réflexion<br />
          et à analyser objectivement les options qui s'offrent à vous.
        </p>
      </div>;
  };
  return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-50" ref={contentRef}>
      <div className="flex-1 flex flex-col py-[80px] relative">
        {/* Hand SVG background */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none z-0">
          <img src="/lovable-uploads/c2e072d3-6efa-4ea3-82df-5e038dd43589.png" alt="Hand decoration" className="object-contain w-full h-full opacity-40" />
        </div>
        
        {step === 'decision' && <div className="flex-1 flex flex-col items-center justify-center py-0 z-10 relative">
            <Container className="flex flex-col justify-center items-center w-full max-w-4xl mx-auto">
              {renderWelcomeScreen()}
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
          </div>}
        
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
                
                {step === 'analysis' && <div>
                    <StepNavigator onNewDecision={handleNewDecision} currentStep="Analyse" previousSteps={["Décision", "Critères"]} onBackStep={() => handleBackToCriteria()} />
                    <AnalysisResult decisionTitle={decision.title} options={options} criteria={criteria} evaluations={evaluations} onBack={() => handleBackToCriteria()} onReset={handleReset} onRegenerateOptions={handleRegenerateOptions} onAddOption={handleAddOption} />
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