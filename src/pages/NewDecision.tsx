
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecisionForm } from '@/components/decision/DecisionForm';
import { Container } from '@/components/layout/Container';
import { useAuth } from '@/context/AuthContext';

export default function NewDecision() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const handleSubmit = (decision: { title: string; description: string; deadline?: string }, generateOptions?: boolean) => {
    navigate("/", { 
      state: { 
        newDecision: {
          title: decision.title,
          description: decision.description,
          deadline: decision.deadline,
          generateOptions
        }
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center py-12">
        <Container className="flex justify-center items-center w-full">
          <div className="w-full max-w-2xl mx-auto">
            <DecisionForm onSubmit={handleSubmit} />
          </div>
        </Container>
      </div>
    </div>
  );
}
