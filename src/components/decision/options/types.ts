
export interface Option {
  id: string;
  title: string;
  description: string;
  isAIGenerated?: boolean;
  isLoading?: boolean;
}

export interface OptionsListProps {
  decisionTitle: string;
  onComplete: (options: Option[], generateWithAI?: boolean) => void;
  onBack?: () => void;
  isLoading?: boolean;
  initialOptions?: Option[];
}
