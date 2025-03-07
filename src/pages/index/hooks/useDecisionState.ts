
import { useState } from 'react';

export type Step = 'decision' | 'criteria' | 'options' | 'analysis';

export interface Decision {
  id: string;
  title: string;
  description: string;
  deadline?: string;
}

export function useDecisionState(existingDecision?: Decision) {
  const [step, setStep] = useState<Step>('decision');
  const [decision, setDecision] = useState<Decision>({
    id: existingDecision?.id || '',
    title: existingDecision?.title || '',
    description: existingDecision?.description || '',
    deadline: existingDecision?.deadline || undefined
  });

  const handleDecisionSubmit = async (decisionData: { 
    title: string; 
    description: string; 
    deadline?: string 
  }) => {
    setDecision({
      id: decision.id,
      title: decisionData.title,
      description: decisionData.description,
      deadline: decisionData.deadline
    });
  };

  const handleReset = () => {
    setStep('decision');
    setDecision({ id: '', title: '', description: '' });
  };

  return {
    step,
    setStep,
    decision,
    setDecision,
    handleDecisionSubmit,
    handleReset
  };
}
