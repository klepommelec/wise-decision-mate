
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface DecisionFormProps {
  onSubmit: (decision: { title: string; description: string }) => void;
}

export function DecisionForm({ onSubmit }: DecisionFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate loading
    setTimeout(() => {
      onSubmit({ title, description });
      setIsSubmitting(false);
    }, 600);
  };
  
  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-2xl font-medium">Quelle décision devez-vous prendre?</CardTitle>
          <CardDescription>
            Décrivez la décision que vous devez prendre. Soyez aussi précis que possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titre de la décision</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Choisir une nouvelle voiture"
                className="w-full"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Plus de détails sur la décision à prendre..."
                className="min-h-[100px]"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full transition-all" 
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Traitement..." : "Continuer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
