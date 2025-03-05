
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StepNavigatorProps {
  onNewDecision: () => void;
}

export function StepNavigator({ onNewDecision }: StepNavigatorProps) {
  return (
    <div className="flex justify-end mb-4">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onNewDecision}
        className="gap-2"
      >
        <PlusCircle className="h-4 w-4" />
        Nouvelle décision
      </Button>
    </div>
  );
}
