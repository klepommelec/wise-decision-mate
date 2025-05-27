import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingDecisionForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus sur l'input au chargement du composant
  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSubmitting(true);

    // Rediriger vers la page d'authentification
    setTimeout(() => {
      navigate('/auth', {
        state: {
          message: "Créez un compte pour continuer avec votre décision",
          decisionData: {
            title,
            description,
            useAI
          }
        }
      });
      setIsSubmitting(false);
    }, 300);
  };

  const toggleDescription = () => {
    setShowDescription(prev => !prev);
  };

  return (
    <Card className="gradient-border-card transition-all duration-300 shadow-sm overflow-hidden bg-white w-full max-w-lg rounded-2xl">
      <CardHeader className="bg-white border-b rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-11 h-10 flex items-center justify-center text-black font-bold text-xl font-handwriting bg-lime-400">M</div>
          <CardTitle className="font-medium text-xl">Bonjour, quelle décision voulez-vous prendre ?</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 bg-white rounded-b-2xl my-0 py-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 my-0 py-0">
          <div className="my-0 py-0 border-none">
            <Input 
              ref={titleInputRef}
              id="title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ex: Choisir une nouvelle voiture" 
              required 
              className="w-full bg-white border-none px-0 min-h-40 text-start align-top pt-0 leading-tight" 
              style={{ textAlignLast: 'left' }}
            />
          </div>
          
          {showDescription && (
            <div className="space-y-2">
              <Textarea 
                id="description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Détails supplémentaires sur votre décision..." 
                className="min-h-[80px] bg-white" 
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2 pt-2 border-t">
            <Switch 
              id="ai-options" 
              checked={useAI} 
              onCheckedChange={setUseAI} 
              className="bg-lime-400 hover:bg-lime-500" 
            />
            <div className="grid gap-1.5">
              <Label htmlFor="ai-options" className="text-sm font-medium leading-none flex items-center gap-1.5">
                Générer automatiquement des options et critères
              </Label>
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="secondary" 
            disabled={!title.trim() || isSubmitting} 
            className="w-full transition-all mt-2 gap-2 py-6 rounded-full bg-lime-400 hover:bg-lime-500 text-gray-700"
          >
            {isSubmitting ? "Traitement..." : "Continuer"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
