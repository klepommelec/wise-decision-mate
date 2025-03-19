import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
export default function Help() {
  const navigate = useNavigate();
  return <Container className="py-10">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Aide et Documentation</h1>
            <p className="text-muted-foreground mt-2">
              Apprenez à utiliser notre outil d'aide à la décision efficacement
            </p>
          </div>

          <Tabs defaultValue="guide">
            <TabsList className="grid w-full grid-cols-3 rounded-full gap-1">
              <TabsTrigger value="guide" className="rounded-full hover:bg-gray-100">Guide d'utilisation</TabsTrigger>
              <TabsTrigger value="faq" className="rounded-full hover:bg-gray-100">FAQ</TabsTrigger>
              <TabsTrigger value="contact" className="rounded-full hover:bg-gray-100">Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="guide" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Comment prendre une décision?</CardTitle>
                  <CardDescription>
                    Un processus en 4 étapes simples
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">1. Définir votre décision</h3>
                    <p className="text-sm text-muted-foreground">
                      Décrivez clairement la décision à prendre et ajoutez une date limite si nécessaire.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">2. Définir vos critères</h3>
                    <p className="text-sm text-muted-foreground">
                      Identifiez les facteurs importants pour votre décision et attribuez-leur un poids.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">3. Ajouter vos options</h3>
                    <p className="text-sm text-muted-foreground">
                      Listez les différentes alternatives que vous envisagez.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">4. Analyser les résultats</h3>
                    <p className="text-sm text-muted-foreground">
                      Examinez l'analyse et la recommandation générée par notre outil.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Astuces pour de meilleures décisions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Prenez le temps de bien définir tous vos critères</li>
                    <li>Soyez honnête dans l'évaluation des poids</li>
                    <li>N'hésitez pas à revenir en arrière pour ajuster vos critères</li>
                    <li>Sauvegardez votre décision pour la consulter plus tard</li>
                    <li>Partagez votre analyse avec d'autres personnes pour obtenir leur avis</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Catalogue des composants</CardTitle>
                  <CardDescription>
                    Découvrez tous les éléments disponibles dans l'application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Consultez notre bibliothèque de composants pour mieux comprendre les éléments d'interface que vous rencontrerez dans l'application.
                  </p>
                  <Button variant="outline" onClick={() => window.open('/components', '_blank')} className="flex items-center w-full justify-center gap-2 rounded-full">
                    Consulter les composants
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Questions fréquemment posées</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        Puis-je modifier une décision après l'avoir enregistrée?
                      </AccordionTrigger>
                      <AccordionContent>
                        Oui, vous pouvez accéder à vos décisions sauvegardées depuis votre profil et les modifier à tout moment.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-2">
                      <AccordionTrigger>
                        Comment fonctionne le calcul des scores?
                      </AccordionTrigger>
                      <AccordionContent>
                        Notre algorithme multiplie la note de chaque option pour un critère par le poids du critère, puis additionne tous ces scores pour obtenir un score global.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                      <AccordionTrigger>
                        Puis-je partager mes décisions avec d'autres personnes?
                      </AccordionTrigger>
                      <AccordionContent>
                        Cette fonctionnalité sera bientôt disponible. Vous pourrez partager vos décisions par email ou avec un lien.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-4">
                      <AccordionTrigger>
                        Mes données sont-elles sécurisées?
                      </AccordionTrigger>
                      <AccordionContent>
                        Oui, toutes vos données sont cryptées et protégées. Nous utilisons Supabase pour assurer la sécurité de vos informations.
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-5">
                      <AccordionTrigger>
                        Puis-je exporter mes résultats?
                      </AccordionTrigger>
                      <AccordionContent>
                        Nous travaillons actuellement sur cette fonctionnalité. Bientôt, vous pourrez exporter vos résultats en PDF ou CSV.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Besoin d'aide supplémentaire?</CardTitle>
                  <CardDescription>
                    Notre équipe est là pour vous aider
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Si vous avez des questions spécifiques ou besoin d'assistance, n'hésitez pas à nous contacter:
                  </p>
                  
                  <div className="grid gap-4 py-4">
                    <div className="flex flex-col space-y-1.5">
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">support@jupi.co</p>
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <p className="font-medium">Heures de support</p>
                      <p className="text-sm text-muted-foreground">Du lundi au vendredi, 9h - 18h</p>
                    </div>
                  </div>
                  
                  <Button className="w-full rounded-full font-medium text-gray-900 bg-lime-400 hover:bg-lime-500">
                    Envoyer un message
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Container>;
}