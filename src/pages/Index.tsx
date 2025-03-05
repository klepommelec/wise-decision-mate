
import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Header } from '@/components/layout/Header';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { OptionsList, Option } from '@/components/decision/OptionsList';
import { CriteriaEvaluation, Criterion, Evaluation } from '@/components/decision/CriteriaEvaluation';
import { AnalysisResult } from '@/components/decision/AnalysisResult';

type Step = 'decision' | 'options' | 'criteria' | 'analysis';

const Index = () => {
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState({ title: '', description: '' });
  const [options, setOptions] = useState<Option[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const handleDecisionSubmit = (decisionData: { title: string; description: string }) => {
    setDecision(decisionData);
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
