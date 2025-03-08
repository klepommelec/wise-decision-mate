
import { Button } from '@/components/ui/button';
import { ChevronLeft, Home, PlusCircle, Settings, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface StepNavigatorProps {
  onNewDecision: () => void;
  currentStep?: string;
  previousSteps?: string[];
  onBackStep?: () => void;
}

export function StepNavigator({
  onNewDecision,
  currentStep,
  previousSteps = [],
  onBackStep
}: StepNavigatorProps) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const renderBreadcrumbs = () => {
    if (!currentStep || previousSteps.length === 0) return null;
    
    return (
      <div className="hidden md:flex items-center text-sm text-muted-foreground space-x-2">
        <Button variant="ghost" size="sm" className="h-auto p-0" onClick={() => navigate('/')}>
          <Home className="h-3.5 w-3.5 mr-1" />
          <span>Accueil</span>
        </Button>
        
        {previousSteps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span>/</span>
            <Button variant="ghost" size="sm" className="h-auto p-0" onClick={onBackStep}>
              {step}
            </Button>
          </div>
        ))}
        
        <div className="flex items-center space-x-2">
          <span>/</span>
          <span className="font-medium text-foreground">{currentStep}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4 mb-6">
      <div className="flex justify-between items-center">
        {renderBreadcrumbs()}
        
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="text-muted-foreground" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Changer de thème</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {currentStep && (
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-primary text-primary-foreground">
                Progression
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-primary">
                {/* Updated to reflect the new 3-step flow (Decision, Criteria, Analysis) */}
                {previousSteps.length + 1}/3
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-secondary">
            <div 
              style={{
                width: `${(previousSteps.length + 1) / 3 * 100}%`
              }} 
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}
