
import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Brain, Lightbulb, Scale, Award, PenTool } from 'lucide-react';

const About = () => {
  return (
    <Container>
      <div className="max-w-3xl mx-auto py-12 space-y-12 animate-fade-in">
        <section className="space-y-4 text-center">
          <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            À propos
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Prise de décision simplifiée et éclairée
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            DecisionMate vous aide à prendre des décisions complexes de manière structurée et objective.
          </p>
        </section>

        <Card className="glass-panel">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Notre approche</h2>
                <p className="text-muted-foreground">
                  DecisionMate utilise une méthode d'analyse multicritères pour vous aider à évaluer objectivement 
                  différentes options. Notre processus vous guide pas à pas pour structurer votre réflexion.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Comment ça marche?</h2>
                <p className="text-muted-foreground">
                  Définissez votre décision, listez vos options, évaluez-les selon des critères pondérés, 
                  et recevez une analyse claire basée sur vos inputs. Simple, transparent et efficace.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <section className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">Pourquoi utiliser DecisionMate?</h2>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="glass-card hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center h-full">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Structure de pensée</h3>
                <p className="text-muted-foreground text-sm">
                  Organisez votre réflexion de manière méthodique et objective
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center h-full">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Scale className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Analyse pondérée</h3>
                <p className="text-muted-foreground text-sm">
                  Attribuez plus d'importance aux critères qui comptent vraiment pour vous
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center h-full">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Lightbulb className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Clarté</h3>
                <p className="text-muted-foreground text-sm">
                  Visualisez clairement les forces et faiblesses de chaque option
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center h-full">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Confiance</h3>
                <p className="text-muted-foreground text-sm">
                  Prenez des décisions avec plus d'assurance et moins de regrets
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-md transition-all">
              <CardContent className="pt-6 pb-4 flex flex-col items-center text-center h-full">
                <div className="p-3 bg-primary/10 rounded-full mb-4">
                  <PenTool className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Personnalisation</h3>
                <p className="text-muted-foreground text-sm">
                  Adaptez l'analyse à vos besoins spécifiques et à vos valeurs
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <Separator />
        
        <section className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Prêt à prendre de meilleures décisions?</h2>
          <p className="text-muted-foreground mb-6">
            Que ce soit pour votre vie personnelle ou professionnelle, DecisionMate vous aide à faire des choix éclairés.
          </p>
          <a 
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Essayer maintenant
          </a>
        </section>
      </div>
    </Container>
  );
};

export default About;
