import { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Download, Star, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisResultProps {
  decisionTitle: string;
  options: Option[];
  criteria: Criterion[];
  evaluations: Evaluation[];
  onBack: () => void;
  onReset: () => void;
}

interface OptionScore {
  option: Option;
  score: number;
  details: {
    criterionId: string;
    criterionName: string;
    weight: number;
    score: number;
    weightedScore: number;
  }[];
}

export function AnalysisResult({ 
  decisionTitle, 
  options, 
  criteria, 
  evaluations, 
  onBack, 
  onReset 
}: AnalysisResultProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const finalScores = useMemo(() => {
    const scores = {};
    
    options.forEach(option => {
      let totalWeightedScore = 0;
      let totalWeight = 0;
      
      criteria.forEach(criterion => {
        const evaluation = evaluations.find(e => 
          e.optionId === option.id && e.criterionId === criterion.id
        );
        
        if (evaluation) {
          totalWeightedScore += evaluation.score * criterion.weight;
          totalWeight += criterion.weight;
        }
      });
      
      const averageWeightedScore = totalWeight > 0 ? 
        totalWeightedScore / totalWeight : 0;
      
      scores[option.id] = {
        id: option.id,
        title: option.title,
        description: option.description,
        score: parseFloat(averageWeightedScore.toFixed(2))
      };
    });
    
    return Object.values(scores).sort((a, b) => b.score - a.score);
  }, [options, criteria, evaluations]);

  const bestOption = finalScores.length > 0 ? finalScores[0] : null;

  const handleSaveFavoriteOption = async () => {
    if (!user || !bestOption) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ favorite_option: bestOption.title })
        .eq('title', decisionTitle);
        
      if (error) throw error;
      
      toast.success('Option favorite enregistrée!');
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'option favorite:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'option favorite');
    } finally {
      setIsSaving(false);
    }
  };

  const chartData = finalScores.map(item => ({
    name: item.title,
    score: item.score
  }));

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="glass-card">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-medium">Résultats de l'analyse</CardTitle>
              <CardDescription>
                Voici l'analyse de votre décision "{decisionTitle}"
              </CardDescription>
            </div>
            {bestOption && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={handleSaveFavoriteOption}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>Enregistrement...</>
                ) : (
                  <>
                    <Star className="h-4 w-4 text-yellow-500" />
                    Enregistrer l'option favorite
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Détails des options</h3>
            <div className="space-y-4">
              {finalScores.map((option, index) => (
                <Card key={option.id} className={index === 0 ? "border-primary" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        {index === 0 && (
                          <div className="bg-primary/10 text-primary p-1 rounded-full mr-2">
                            <Star className="h-4 w-4" />
                          </div>
                        )}
                        <CardTitle className="text-lg">
                          {option.title}
                        </CardTitle>
                      </div>
                      <div className="text-lg font-bold">
                        Score: {option.score}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">{option.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="justify-between pt-4">
          <Button variant="back" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour aux options
          </Button>
          <Button variant="default" onClick={onReset} className="gap-2">
            Nouvelle décision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
