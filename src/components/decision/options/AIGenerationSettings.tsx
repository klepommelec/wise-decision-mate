
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

interface AIGenerationSettingsProps {
  useAI: boolean;
  onUseAIChange: (value: boolean) => void;
}

export function AIGenerationSettings({ useAI, onUseAIChange }: AIGenerationSettingsProps) {
  return (
    <div className="flex items-center space-x-2 pt-2">
      <Switch
        id="ai-options"
        checked={useAI}
        onCheckedChange={onUseAIChange}
      />
      <div className="grid gap-1.5">
        <Label
          htmlFor="ai-options"
          className="text-sm font-medium leading-none flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Générer automatiquement des options avec l'IA si aucune n'est renseignée
        </Label>
        <p className="text-sm text-muted-foreground">
          L'IA vous suggérera des options pertinentes en fonction de votre décision
        </p>
      </div>
    </div>
  );
}
