
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface LocationState {
  decisionData?: {
    title: string;
    description: string;
    useAI: boolean;
  };
}

export default function NewDecision() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const decisionData = locationState?.decisionData;
  const [initialDecision, setInitialDecision] = useState<{
    title: string;
    description: string;
  } | undefined>(undefined);

  useEffect(() => {
    // Si des données de décision sont disponibles depuis la redirection
    if (decisionData) {
      setInitialDecision({
        title: decisionData.title,
        description: decisionData.description
      });
    }
  }, [decisionData]);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Vous devez être connecté pour créer une décision");
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleDecisionSubmit = (decision: {
    title: string;
    description: string;
    deadline?: string;
  }, useAI: boolean) => {
    navigate("/", {
      state: {
        decision: {
          title: decision.title,
          description: decision.description,
          deadline: decision.deadline
        },
        useAI
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto pt-24 pb-16 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Nouvelle décision</h1>
        <DecisionForm 
          onSubmit={handleDecisionSubmit} 
          initialDecision={initialDecision}
        />
      </div>
    </div>
  );
}
