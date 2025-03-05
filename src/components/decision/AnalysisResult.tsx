
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Option } from './OptionsList';
import { Criterion, Evaluation } from './CriteriaEvaluation';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle, LightbulbIcon, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

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
  const [showDetails, setShowDetails] = useState(false);
  
  console.log("Analyzing with evaluations:", evaluations);
  
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  
  const optionScores: OptionScore[] = options.map(option => {
    const details = criteria.map(criterion => {
      const evaluation = evaluations.find(
        e => e.optionId === option.id && e.criterionId === criterion.id
      );
      
      // Vérifier si nous avons trouvé une évaluation correspondante
      if (!evaluation) {
        console.warn(`No evaluation found for option ${option.id} and criterion ${criterion.id}`);
      }
      
      const score = evaluation ? evaluation.score : 5; // Default to 5 if no evaluation found
      const normalizedWeight = criterion.weight / totalWeight;
      const weightedScore = score * normalizedWeight;
      
      return {
        criterionId: criterion.id,
        criterionName: criterion.name,
        weight: criterion.weight,
        score,
        weightedScore
      };
    });
    
    const totalScore = details.reduce((sum, d) => sum + d.weightedScore, 0);
    console.log(`Option ${option.title} scored ${totalScore.toFixed(2)}`);
    
    return {
      option,
      score: totalScore,
      details
    };
  });
  
  // Sort options by score (highest first)
  optionScores.sort((a, b) => b.score - a.score);
  
  const bestOption = optionScores[0];
  
  const getProgressPercentage = (score: number) => {
    return (score / 10) * 100;
  };
  
  const getRecommendation = () => {
    if (optionScores.length < 2) {
      return {
        title: "Analyse impossible",
        message: "Il faut au moins deux options pour effectuer une analyse comparative."
      };
    }
    
    const topScore = bestOption.score;
    const secondBestScore = optionScores[1]?.score || 0;
    const scoreDifference = topScore - secondBestScore;
    
    if (scoreDifference < 0.5) {
      return {
        title: "Décision serrée",
        message: "Les meilleures options sont très proches. Considérez d'autres facteurs qui pourraient ne pas être reflétés dans cette analyse."
      };
    } else if (scoreDifference < 1.5) {
      return {
        title: "Option recommandée",
        message: `L'option "${bestOption.option.title}" semble être la meilleure, mais les autres options sont aussi valables.`
      };
    } else {
      return {
        title: "Option clairement supérieure",
        message: `L'option "${bestOption.option.title}" se démarque nettement comme la meilleure solution.`
      };
    }
  };
  
  const recommendation = getRecommendation();
  
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      <Card className="glass-card transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-medium">Analyse des résultats</CardTitle>
              <CardDescription>
                Pour la décision: <span className="font-medium">{decisionTitle}</span>
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
            >
              <LightbulbIcon className="h-3 w-3" />
              Analyse IA
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <div className="bg-secondary/50 p-4 rounded-lg space-y-2 border">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                {recommendation.title}
              </h3>
              <p className="text-muted-foreground">{recommendation.message}</p>
            </div>
            
            <div className="space-y-6 pt-2">
              {optionScores.map((optionScore, index) => (
                <div 
                  key={optionScore.option.id}
                  className={cn(
                    "p-4 border rounded-lg space-y-3 animate-slide-in transition-colors",
                    index === 0 ? "bg-primary/5 border-primary/20" : "bg-white/50 dark:bg-gray-800/50"
                  )}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-center">
                    <h3 className={cn(
                      "font-medium",
                      index === 0 ? "text-lg" : "text-base"
                    )}>
                      {index === 0 && (
                        <span className="inline-block mr-2 text-primary">★</span>
                      )}
                      {optionScore.option.title}
                    </h3>
                    <span className="font-medium">
                      {optionScore.score.toFixed(1)}
                    </span>
                  </div>
                  
                  <Progress 
                    value={getProgressPercentage(optionScore.score)} 
                    className={cn(
                      "h-2",
                      index === 0 ? "bg-primary/20" : "bg-secondary"
                    )}
                  />
                  
                  {optionScore.option.description && (
                    <p className="text-sm text-muted-foreground">{optionScore.option.description}</p>
                  )}
                  
                  {showDetails && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-sm font-medium">Détails par critère:</h4>
                      {optionScore.details.map((detail) => (
                        <div key={detail.criterionId} className="flex items-center text-sm">
                          <div className="w-1/3">{detail.criterionName}</div>
                          <div className="w-1/3 flex items-center gap-1">
                            <span>Score: {detail.score}/10</span>
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                  <Info className="h-3 w-3" />
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent side="top" className="w-60 text-xs">
                                Importance du critère: {detail.weight}/5
                                <br />
                                Score pondéré: {detail.weightedScore.toFixed(2)}
                              </HoverCardContent>
                            </HoverCard>
                          </div>
                          <div className="w-1/3">
                            <Progress 
                              value={getProgressPercentage(detail.score)} 
                              className="h-1.5" 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Masquer les détails" : "Afficher les détails par critère"}
          </Button>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button onClick={onReset}>
            Nouvelle décision
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
