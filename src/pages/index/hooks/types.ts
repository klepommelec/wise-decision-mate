
import { Decision } from './useDecisionState';
import { Criterion } from './useCriteriaState';
import { Option, Evaluation } from './useOptionsState';

export type Step = 'decision' | 'criteria' | 'options' | 'analysis';

// Export all types explicitly
export type { Decision, Criterion, Option, Evaluation };
