import { Container } from '@/components/layout/Container';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, PenTool, Brain, Scale, Lightbulb, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
const About = () => {
  return <Container>
      <div className="max-w-4xl mx-auto py-12 space-y-16 animate-fade-in">
        {/* En-tête du manifeste */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4 bg-lime300">
            <BookOpen className="h-4 w-4" />
            <span>Notre Manifeste</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
            Pour des décisions<br />éclairées et sans regrets
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
            Nous croyons que les meilleures décisions ne sont pas prises sur un coup de tête, mais à travers 
            un processus structuré qui respecte la complexité de nos vies.
          </p>
        </section>

        {/* Déclaration de principes */}
        <section className="prose prose-lg dark:prose-invert mx-auto">
          <div className="font-medium text-xl mb-6 text-primary border-l-4 border-primary pl-4 py-2">
            Dans un monde où l'information est abondante mais la clarté rare, nous défendons une approche 
            différente de la prise de décision.
          </div>
          <p>
            Chaque jour, nous sommes confrontés à des choix dont les conséquences façonnent notre avenir. 
            Pourtant, la plupart d'entre nous prenons ces décisions sans méthode, souvent submergés par les 
            émotions, les biais cognitifs et la pression sociale.
          </p>
          <p>
            Chez <span className="font-semibold">Memo</span>, nous refusons cette approche hasardeuse. 
            Nous croyons que chaque personne mérite d'avoir accès à des outils qui transforment 
            l'anxiété du choix en une démarche sereine et réfléchie.
          </p>
        </section>

        {/* Nos convictions */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">Nos convictions fondamentales</h2>
          
          <Card className="glass-panel border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1" className="border-b border-primary/10">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xl font-medium">La clarté cognitive avant tout</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-muted-foreground">
                    Nous croyons que dégager l'esprit du brouillard cognitif est la première étape vers de meilleures décisions. 
                    Notre méthodologie transforme le chaos mental en un processus ordonné qui permet d'aborder chaque décision 
                    avec sérénité et objectivité.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-b border-primary/10">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Scale className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xl font-medium">L'équilibre entre raison et intuition</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-muted-foreground">
                    Les meilleures décisions ne sont ni purement rationnelles, ni purement intuitives. 
                    Notre approche valorise autant l'analyse objective que la sagesse personnelle, 
                    en vous aidant à trouver le juste équilibre entre ces deux forces.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3" className="border-b border-primary/10">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <PenTool className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xl font-medium">La personnalisation plutôt que l'uniformité</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-muted-foreground">
                    Chaque décision est unique, tout comme chaque personne. Nous rejetons les approches génériques 
                    et privilégions un système adaptable qui respecte votre individualité, vos valeurs et vos priorités spécifiques.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-primary/5">
                    <div className="flex items-center gap-3 text-left">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Lightbulb className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xl font-medium">L'autonomie par la méthode</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-muted-foreground">
                    Notre objectif n'est pas de décider à votre place, mais de vous donner les outils pour devenir 
                    un décideur autonome et confiant. Nous vous enseignons une méthode que vous pourrez appliquer 
                    tout au long de votre vie, pour toutes les décisions importantes que vous aurez à prendre.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-12" />

        {/* Notre engagement */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-center">Notre engagement envers vous</h2>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="glass-card hover:shadow-md transition-all border-primary/20">
              <CardContent className="pt-6 pb-4 flex flex-col items-start h-full">
                <div className="p-2 bg-primary/10 rounded-full mb-4">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Simplicité sans compromis</h3>
                <p className="text-muted-foreground">
                  Nous nous engageons à maintenir notre plateforme accessible et intuitive, sans jamais sacrifier 
                  la profondeur et la rigueur qui font la force de notre approche.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass-card hover:shadow-md transition-all border-primary/20">
              <CardContent className="pt-6 pb-4 flex flex-col items-start h-full">
                <div className="p-2 bg-primary/10 rounded-full mb-4">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Évolution constante</h3>
                <p className="text-muted-foreground">
                  Nous nous engageons à faire évoluer continuellement notre méthodologie et nos outils, 
                  en intégrant les dernières avancées en sciences cognitives et en design centré sur l'humain.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
        
        {/* Appel à l'action */}
        <section className="text-center bg-primary/5 p-8 md:p-12 rounded-2xl border border-primary/10">
          <h2 className="text-3xl font-bold mb-4">Rejoignez le mouvement</h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Transformez votre façon de prendre des décisions et découvrez la sérénité 
            qui vient avec une approche structurée, objective et personnalisée.
          </p>
          <Button size="lg" className="text-base px-8 py-6 h-auto" asChild>
            <Link to="/auth">Commencer votre voyage</Link>
          </Button>
        </section>
      </div>
    </Container>;
};
export default About;