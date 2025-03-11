import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
interface StepNavigatorProps {
  previousSteps: string[];
  currentStep: string;
  onBackStep?: () => void;
}
export const StepNavigator = ({
  previousSteps,
  currentStep,
  onBackStep
}: StepNavigatorProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const shareDecision = () => {
    // Create a share URL for this decision
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => toast.success("Lien de partage copié dans le presse-papier")).catch(() => toast.error("Impossible de copier le lien de partage"));
  };
  const goToHome = () => {
    // Simplement naviguer vers la page d'accueil sans réinitialiser l'état
    navigate('/');
  };
  return <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" className="gap-1" onClick={goToHome}>
          <Home className="h-4 w-4" />
          Accueil
        </Button>
        
        {/* Afficher uniquement les étapes précédentes, sans Décision */}
        {previousSteps.filter(step => step !== "Décision").map((step, index, filteredSteps) => <React.Fragment key={step}>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            {index === filteredSteps.length - 1 && onBackStep ? <Button variant="ghost" size="sm" onClick={onBackStep}>
                {step}
              </Button> : <span className="text-muted-foreground">{step}</span>}
          </React.Fragment>)}
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{currentStep}</span>
      </div>
      
      <Button variant="outline" size="sm" onClick={shareDecision} className="gap-2 rounded-full text-gray-900 bg-white border-gray-200 hover:bg-gray-100 font-medium">
        <Share2 className="h-4 w-4" />
        Partager
      </Button>
    </div>;
};