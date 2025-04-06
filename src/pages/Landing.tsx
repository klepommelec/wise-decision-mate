
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Brain, Zap, BarChart3, Award } from "lucide-react";
import { cn } from "@/lib/utils";

// Helper component for feature cards
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  className 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  className?: string;
}) => (
  <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow", className)}>
    <div className="rounded-full bg-lime-100 w-12 h-12 flex items-center justify-center mb-4">
      <Icon className="text-lime-600" size={24} />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Helper component for process steps
const ProcessStep = ({ number, title, description }: { number: number; title: string; description: string }) => (
  <div className="flex gap-4 items-start">
    <div className="bg-lime-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
      {number}
    </div>
    <div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

// Helper component for testimonials
const Testimonial = ({ quote, author, role, className }: { quote: string; author: string; role: string; className?: string }) => (
  <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100", className)}>
    <p className="italic text-gray-700 mb-4">"{quote}"</p>
    <div>
      <p className="font-semibold">{author}</p>
      <p className="text-gray-500 text-sm">{role}</p>
    </div>
  </div>
);

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("businesses");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-lime-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Prenez des décisions <span className="text-lime-500">éclairées</span> avec confiance
              </h1>
              <p className="text-xl text-gray-600 md:max-w-md">
                Une approche structurée pour analyser vos options et faire les meilleurs choix, professionnels comme personnels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  variant="highlight" 
                  size="lg" 
                  className="rounded-full text-gray-900"
                  onClick={() => navigate("/new-decision")}
                >
                  Nouvelle décision <ArrowRight className="ml-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="rounded-full"
                  onClick={() => navigate("/about")}
                >
                  En savoir plus
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/c2e072d3-6efa-4ea3-82df-5e038dd43589.png" 
                alt="Interface Jupi" 
                className="w-full h-auto rounded-lg shadow-lg animate-slide-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jupi vous apporte tous les outils nécessaires pour analyser, comparer et finaliser vos décisions importantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Brain}
              title="Analyse structurée" 
              description="Décomposez vos décisions complexes en critères clairs et évaluez méthodiquement chaque option."
            />
            <FeatureCard 
              icon={Zap}
              title="Aide IA intelligente" 
              description="Générez des options et des critères adaptés à votre situation grâce à notre assistant IA."
            />
            <FeatureCard 
              icon={BarChart3}
              title="Visualisation claire" 
              description="Comprenez facilement vos données grâce à des graphiques et tableaux comparatifs intuitifs."
            />
            <FeatureCard 
              icon={Award}
              title="Recommandations précises" 
              description="Obtenez une recommandation basée sur l'analyse approfondie de vos critères et priorités."
            />
            <FeatureCard 
              icon={CheckCircle2}
              title="Sauvegarde des décisions" 
              description="Conservez l'historique de vos décisions et consultez-les à tout moment."
              className="md:col-span-2 lg:col-span-1"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment ça fonctionne</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un processus simple en 4 étapes pour vous aider à prendre les meilleures décisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <ProcessStep
                number={1}
                title="Définissez votre décision"
                description="Commencez par clarifier le problème à résoudre ou la décision à prendre."
              />
              <ProcessStep
                number={2}
                title="Ajoutez vos options"
                description="Listez toutes les alternatives possibles ou utilisez l'IA pour en générer."
              />
              <ProcessStep
                number={3}
                title="Établissez vos critères"
                description="Identifiez les facteurs importants pour évaluer chaque option."
              />
              <ProcessStep
                number={4}
                title="Analysez et décidez"
                description="Évaluez chaque option selon vos critères et obtenez une recommandation claire."
              />
            </div>
            <div className="flex items-center justify-center">
              <img 
                src="/lovable-uploads/6101851f-2549-45ba-a231-ed9bfb465e2b.png" 
                alt="Processus de décision" 
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Adapté à tous vos besoins</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Que vous soyez un particulier ou une entreprise, Jupi s'adapte à toutes les situations de prise de décision.
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Button 
                variant={activeTab === "businesses" ? "highlight" : "outline"} 
                onClick={() => setActiveTab("businesses")}
                className={activeTab === "businesses" ? "text-gray-900" : ""}
              >
                Entreprises
              </Button>
              <Button 
                variant={activeTab === "individuals" ? "highlight" : "outline"} 
                onClick={() => setActiveTab("individuals")}
                className={activeTab === "individuals" ? "text-gray-900" : ""}
              >
                Particuliers
              </Button>
            </div>
          </div>

          {activeTab === "businesses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Pour les entreprises</h3>
                <ul className="space-y-3">
                  {["Recrutement et sélection de candidats", "Choix de fournisseurs", "Investissements stratégiques", "Planification de projets", "Décisions d'expansion"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="text-lime-500" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Témoignage</h4>
                <Testimonial 
                  quote="Jupi a transformé notre processus de sélection des fournisseurs. Ce qui prenait des semaines de réunions se fait maintenant en quelques heures avec une transparence totale."
                  author="Marie Dupont"
                  role="Directrice des achats"
                />
              </div>
            </div>
          )}

          {activeTab === "individuals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              <div>
                <h3 className="text-2xl font-semibold mb-4">Pour les particuliers</h3>
                <ul className="space-y-3">
                  {["Choix de carrière", "Achat immobilier", "Planification financière", "Choix d'éducation", "Décisions familiales importantes"].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="text-lime-500" size={20} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-3">Témoignage</h4>
                <Testimonial 
                  quote="J'hésitais entre plusieurs options de carrière. Grâce à Jupi, j'ai pu clarifier mes priorités et prendre une décision en fonction de ce qui compte vraiment pour moi."
                  author="Thomas Leroy"
                  role="Ingénieur logiciel"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Questions fréquentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Tout ce que vous devez savoir pour commencer à utiliser Jupi
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y">
            {[
              {
                q: "Comment Jupi m'aide-t-il à prendre de meilleures décisions ?",
                a: "Jupi structure votre processus de décision en décomposant les problèmes complexes en critères mesurables, en facilitant la comparaison des options et en permettant une analyse visuelle claire des résultats."
              },
              {
                q: "Est-ce que l'outil est gratuit ?",
                a: "Jupi propose une version gratuite qui permet d'accéder aux fonctionnalités essentielles. Des options premium sont disponibles pour les utilisateurs qui ont besoin de fonctionnalités avancées."
              },
              {
                q: "Puis-je partager mes analyses avec d'autres personnes ?",
                a: "Oui, vous pouvez facilement partager vos analyses de décision avec d'autres personnes, ce qui est particulièrement utile pour les décisions collaboratives en entreprise ou en famille."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Absolument. La sécurité des données est notre priorité. Toutes les données sont chiffrées et nous ne partageons jamais vos informations avec des tiers."
              }
            ].map((faq, i) => (
              <div key={i} className="py-6">
                <h3 className="text-xl font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-lime-50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Prêt à prendre de meilleures décisions ?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Commencez dès maintenant et découvrez comment Jupi peut transformer votre façon de prendre des décisions.
            </p>
            <Button 
              variant="highlight" 
              size="lg" 
              className="rounded-full text-gray-900"
              onClick={() => navigate("/new-decision")}
            >
              Créer ma première décision <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <img src="/lovable-uploads/1465f08a-adfe-457b-a2f9-f046b763d7f1.png" alt="Jupi Logo" className="h-8 w-auto" />
                <span className="text-xl font-semibold">Jupi</span>
              </div>
              <p className="text-gray-500 mt-2">Décisions éclairées, résultats assurés</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/about")}>À propos</Button>
              <Button variant="ghost" onClick={() => navigate("/help")}>Aide</Button>
              <Button variant="ghost">Confidentialité</Button>
              <Button variant="ghost">Contact</Button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Jupi. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
