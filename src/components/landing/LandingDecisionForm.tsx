
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
  const [isFocused, setIsFocused] = useState(false);
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
    <Card className="gradient-border-card transition-all duration-500 hover:shadow-lg shadow-sm overflow-hidden bg-white w-full max-w-lg rounded-3xl group">
      <CardHeader className="bg-white border-b rounded-t-3xl pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full w-10 h-10 flex items-center justify-center text-black font-bold text-xl font-handwriting bg-lime-400 transition-transform duration-200 group-hover:scale-105">
            M
          </div>
          <CardTitle className="font-medium text-xl text-gray-800">
            Comment puis-je vous aider aujourd'hui ?
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="bg-white rounded-b-3xl px-6 pt-6 pb-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Zone de saisie principale améliorée */}
          <div className={`relative transition-all duration-300 ${
            isFocused ? 'transform scale-[1.01]' : ''
          }`}>
            <div className="min-h-[120px] flex items-start">
              <Input
                ref={titleInputRef}
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ex: Choisir une nouvelle voiture"
                required
                className="w-full h-auto min-h-[120px] bg-transparent border-none px-0 py-0 text-lg md:text-xl leading-relaxed text-gray-800 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none resize-none font-medium"
                style={{
                  textAlign: 'left',
                  alignItems: 'flex-start'
                }}
              />
            </div>
            
            {/* Indicateur de focus subtil */}
            <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-lime-400 to-lime-500 transition-all duration-300 ${
              isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`} />
          </div>
          
          {/* Zone de description conditionnelle */}
          {showDescription && (
            <div className="space-y-3 animate-fade-in">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails supplémentaires sur votre décision..."
                className="min-h-[100px] bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-700 placeholder:text-gray-400 focus:border-lime-400 focus:ring-2 focus:ring-lime-100 transition-all duration-200"
              />
            </div>
          )}
          
          {/* Bouton de soumission amélioré */}
          <Button 
            type="submit" 
            variant="secondary" 
            disabled={!title.trim() || isSubmitting} 
            className="w-full transition-all duration-300 mt-4 gap-3 py-7 rounded-full bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-gray-800 font-semibold text-lg hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                Continuer
                <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </>
            )}
          </Button>
          
          {/* Bouton d'ajout de description optionnel */}
          {!showDescription && (
            <button
              type="button"
              onClick={toggleDescription}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200 self-start flex items-center gap-1 hover:gap-2"
            >
              <span>Ajouter des détails</span>
              <ChevronDown className="h-4 w-4 transition-all duration-200" />
            </button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
