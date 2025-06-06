import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sparkles, Calendar, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [description, setDescription] = useState(initialDecision?.description || '');
  const [showDescription, setShowDescription] = useState(!!initialDecision?.description);
  const [deadline, setDeadline] = useState<Date | undefined>(initialDecision?.deadline ? new Date(initialDecision.deadline) : undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();

  // Mise à jour des champs si initialDecision change
  useEffect(() => {
    if (initialDecision) {
      setTitle(initialDecision.title || '');
      setDescription(initialDecision.description || '');
      setDeadline(initialDecision.deadline ? new Date(initialDecision.deadline) : undefined);
      setShowDescription(!!initialDecision.description);
      console.log("DecisionForm received initialDecision:", initialDecision);
    }
  }, [initialDecision]);
  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };
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
          description,
          deadline: deadline ? deadline.toISOString() : null
        });
        if (error) throw error;
      } else {
        console.log("Using existing decision:", initialDecision.id);
        if (initialDecision.title !== title || initialDecision.description !== description || initialDecision.deadline !== (deadline ? deadline.toISOString() : null)) {
          const {
            error
          } = await supabase.from('decisions').update({
            title,
            description,
            deadline: deadline ? deadline.toISOString() : null
          }).eq('id', initialDecision.id);
          if (error) throw error;
        }
      }
      onSubmit({
        title,
        description,
        deadline: deadline ? deadline.toISOString() : undefined
      }, useAI);
      setIsSubmitting(false);
    } catch (error: any) {
      console.error("Erreur lors de l'enregistrement de la décision:", error);
      toast.error(error.message || "Une erreur est survenue");
      setIsSubmitting(false);
    }
  }, [title, description, deadline, useAI, user, navigate, onSubmit, initialDecision]);
  return <div className="w-full max-w-2xl mx-auto animate-fade-in pt-0">
      <Card className="gradient-border-card transition-all duration-300 shadow-xl overflow-hidden bg-white rounded-3xl">
        <CardHeader className="bg-white border-b rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="rounded-full w-10 h-10 flex items-center justify-center text-black font-bold text-xl font-handwriting bg-lime-400">M</div>
            <CardTitle className="font-medium text-xl">Bonjour, quelle décision voulez-vous prendre ?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 bg-white rounded-b-3xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la décision</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Choisir une nouvelle voiture" className="w-full bg-white" required />
            </div>
            
            <Button type="button" variant="outline" size="sm" onClick={toggleDescription} className="w-full text-sm flex justify-between items-center bg-white">
              <span>Description (optionnel)</span>
              {showDescription ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            {showDescription && <div className="space-y-2">
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Détails supplémentaires sur votre décision..." className="min-h-[80px] bg-white" />
              </div>}
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite (optionnel)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="deadline" variant="outline" className={cn("w-full justify-start text-left font-normal bg-white", !deadline && "text-muted-foreground")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd MMMM yyyy") : "Sélectionner une date limite"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <CalendarComponent mode="single" selected={deadline} onSelect={setDeadline} initialFocus className={cn("p-3 pointer-events-auto")} />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Switch id="ai-options" checked={useAI} onCheckedChange={setUseAI} className="bg-lime-400 hover:bg-lime-500" />
              <div className="grid gap-1.5">
                <Label htmlFor="ai-options" className="text-sm font-medium leading-none flex items-center gap-1.5">
                  Générer automatiquement des options et critères
                </Label>
              </div>
            </div>
            
            <Button type="submit" variant="secondary" disabled={!title.trim() || isSubmitting} className="w-full transition-all mt-2 gap-2 py-6 rounded-full bg-lime-400 hover:bg-lime-500 text-gray-700">
              {isSubmitting ? "Traitement..." : "Continuer"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>;
}