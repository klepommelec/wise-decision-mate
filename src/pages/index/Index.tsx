
import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (existingDecision) {
      console.log("Loading existing decision:", existingDecision);
    }
  }, [existingDecision]);

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

  return (
    <div className="flex flex-col min-h-screen">
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
                <div>
                  <StepNavigator onNewDecision={handleNewDecision} />
                  <CriteriaEvaluation 
                    criteria={criteria}
                    isLoading={isGeneratingCriteria || isProcessingManualEntries}
                    onComplete={handleCriteriaComplete}
                    decisionTitle={decision.title}
                  />
                </div>
              )}
              
              {step === 'options' && (
                <div>
                  <StepNavigator onNewDecision={handleNewDecision} />
                  <OptionsList 
                    decisionTitle={decision.title} 
                    onComplete={handleOptionsComplete}
                    onBack={handleBackToCriteria}
                    isLoading={isGeneratingOptions || isProcessingManualEntries}
                    initialOptions={options}
                  />
                </div>
              )}
              
              {step === 'analysis' && (
                <div>
                  <StepNavigator onNewDecision={handleNewDecision} />
                  <AnalysisResult
                    decisionTitle={decision.title}
                    options={options}
                    criteria={criteria}
                    evaluations={evaluations}
                    onBack={() => handleBackToCriteria()}
                    onReset={handleReset}
                  />
                </div>
              )}
            </div>
          </Container>
        )}

        {user && step === 'decision' && (
          <div className="w-full mt-auto">
            <Container className="py-12">
              <DecisionsList 
                onDecisionClick={handleDecisionClick} 
                onNewDecision={handleReset} 
              />
            </Container>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
