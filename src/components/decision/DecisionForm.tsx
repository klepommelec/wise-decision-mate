import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Sparkles, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
interface Decision {
  id?: string;
  title: string;
  description: string;
  deadline?: string;
}
interface DecisionFormProps {
  onSubmit: (decision: {
    title: string;
    description: string;
    deadline?: string;
  }, generateOptions?: boolean) => void;
  initialDecision?: Decision;
}
export function DecisionForm({
  onSubmit,
  initialDecision
}: DecisionFormProps) {
  const [title, setTitle] = useState(initialDecision?.title || '');
  const [deadline, setDeadline] = useState<Date | undefined>(initialDecision?.deadline ? new Date(initialDecision.deadline) : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (initialDecision) {
      console.log("DecisionForm received initialDecision:", initialDecision);
    }
  }, [initialDecision]);
  useEffect(() => {
    if (initialDecision && initialDecision.title) {
      console.log("Auto-submitting with initialDecision:", initialDecision);
      onSubmit({
        title: initialDecision.title,
        description: initialDecision.description,
        deadline: initialDecision.deadline
      }, false);
    }
  }, [initialDecision, onSubmit]);
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);
    if (!user) {
      toast.error("Vous devez être connecté pour créer une décision");
      navigate("/auth");
      setIsSubmitting(false);
      return;
    }
    try {
      if (!initialDecision?.id) {
        console.log("Creating new decision:", title);
        const {
          error
        } = await supabase.from('decisions').insert({
          user_id: user.id,
          title,
          description: "",
          // Nous conservons le champ dans l'API mais l'envoyons vide
          deadline: deadline ? deadline.toISOString() : null
        });
        if (error) throw error;
      } else {
        console.log("Using existing decision:", initialDecision.id);
        if (initialDecision.deadline !== (deadline ? deadline.toISOString() : null)) {
          const {
            error
          } = await supabase.from('decisions').update({
            title,
            description: "",
            // Nous conservons le champ dans l'API mais l'envoyons vide
            deadline: deadline ? deadline.toISOString() : null
          }).eq('id', initialDecision.id);
          if (error) throw error;
        }
      }
      onSubmit({
        title,
        description: "",
        // Nous conservons le champ dans l'API mais l'envoyons vide
        deadline: deadline ? deadline.toISOString() : undefined
      }, useAI);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de la décision:", error);
      toast.error(error.message || "Une erreur est survenue");
      setIsSubmitting(false);
    }
  }, [title, deadline, useAI, user, navigate, onSubmit, initialDecision]);
  const handleNewDecision = () => {
    // Rechargement de la page pour commencer une nouvelle décision
    window.location.href = '/';
  };
  return <div className="w-full max-w-2xl mx-auto animate-fade-in pt-10">
      <Card className="transition-all duration-300 border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">
            {initialDecision?.id ? "Modifier votre décision" : "Quelle décision devez-vous prendre?"}
          </CardTitle>
          <CardDescription>
            {initialDecision?.id ? "Vous pouvez modifier les détails de votre décision." : "Décrivez la décision que vous devez prendre. Soyez aussi précis que possible."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Choisir une nouvelle voiture" className="w-full" required />
            </div>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="deadline" variant="outline" className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd MMMM yyyy") : "Sélectionner une date limite"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent mode="single" selected={deadline} onSelect={setDeadline} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch id="ai-options" checked={useAI} onCheckedChange={setUseAI} />
              <div className="grid gap-1.5">
                <div className="text-sm font-medium leading-none flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Générer automatiquement des options avec l'IA
                </div>
                <p className="text-sm text-muted-foreground">
                  L'IA vous suggérera des options pertinentes en fonction de votre décision
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full transition-all" disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? "Traitement..." : initialDecision ? "Continuer" : "Continuer"}
            </Button>
          </form>
        </CardContent>
        
      </Card>
    </div>;
}