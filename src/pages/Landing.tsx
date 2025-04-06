import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Brain, Zap, BarChart3, Award, ArrowDown, Users, Globe, MessageSquare, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { LandingDecisionForm } from "@/components/landing/LandingDecisionForm";
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  className,
  delay = 0
}: {
  icon: any;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
      }
    }, {
      threshold: 0.1
    });
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, [delay]);
  return <div ref={cardRef} className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 transform", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10", className)}>
      <div className="rounded-full bg-lime-100 w-12 h-12 flex items-center justify-center mb-4">
        <Icon className="text-lime-600" size={24} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>;
};
const ProcessStep = ({
  number,
  title,
  description,
  delay = 0
}: {
  number: number;
  title: string;
  description: string;
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const stepRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
      }
    }, {
      threshold: 0.1
    });
    if (stepRef.current) {
      observer.observe(stepRef.current);
    }
    return () => {
      if (stepRef.current) {
        observer.unobserve(stepRef.current);
      }
    };
  }, [delay]);
  return <div ref={stepRef} className={cn("flex gap-4 items-start transition-all duration-700 transform", isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-[-50px]")}>
      <div className="bg-lime-500 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-1">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>;
};
const Testimonial = ({
  quote,
  author,
  role,
  avatar,
  className
}: {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  className?: string;
}) => <div className={cn("bg-white rounded-xl p-6 shadow-sm border border-gray-100 h-full flex flex-col", className)}>
    <div className="flex-1">
      <Badge className="bg-lime-100 text-lime-800 mb-4 hover:bg-lime-200">Témoignage</Badge>
      <p className="italic text-gray-700 mb-4 text-lg">"{quote}"</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-200 to-lime-400 flex items-center justify-center text-lime-800 font-semibold">
        {avatar || author.charAt(0)}
      </div>
      <div>
        <p className="font-semibold">{author}</p>
        <p className="text-gray-500 text-sm">{role}</p>
      </div>
    </div>
  </div>;
export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("businesses");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const scrollToNextSection = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth"
    });
  };
  return <div className="flex flex-col min-h-screen overflow-hidden">
      <section className="min-h-screen relative overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full flex items-center justify-center bg-gradient-to-br from-white to-lime-50 relative">
          <div className="max-w-xl relative z-10">
            <div className="space-y-6 animate-fade-in text-center">
              <h1 className="font-bold tracking-tight text-gray-900 text-6xl">
                Choisissez mieux avec Memo
              </h1>
              
              <p className="text-xl text-gray-600 text-center">
                Une approche structurée et interactive pour analyser vos options et faire les meilleurs choix.
              </p>
              
              <div className="text-center text-2xl font-semibold text-gray-800">
                Prenez des décisions éclairées
              </div>
              
              <p className="text-lg text-gray-600 text-center max-w-lg mx-auto">
                Memo vous assiste à structurer votre réflexion
                et à analyser objectivement les options qui s'offrent à vous.
              </p>
            </div>
            
            <div className="mt-10 w-full flex justify-center">
              <LandingDecisionForm />
            </div>
          </div>

          <div className="hidden lg:block absolute top-0 right-0 w-1/3 h-full">
            <img alt="Main droite" className="absolute top-10 right-0 w-full max-w-sm opacity-70 object-contain z-0" src="/lovable-uploads/49017462-c901-45f8-9cdd-2c12f141987a.png" />
          </div>
          
          <div className="hidden lg:block absolute bottom-0 left-0 w-1/3 h-full">
            <img src="/lovable-uploads/48468dde-ce5d-47a7-8c02-3c1640b44558.png" alt="Main gauche" className="absolute bottom-10 left-0 w-full max-w-sm opacity-70 object-contain z-0" />
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge className="bg-lime-100 text-lime-800 mb-4">Fonctionnalités</Badge>
            <h2 className="text-4xl font-bold mb-6">Une expérience de décision révolutionnaire</h2>
            <p className="text-xl text-gray-600">
              Memo vous apporte tous les outils nécessaires pour analyser, comparer et 
              finaliser vos décisions importantes avec clarté et confiance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Brain} title="Analyse structurée" description="Décomposez vos décisions complexes en critères clairs et évaluez méthodiquement chaque option." delay={100} />
            <FeatureCard icon={Zap} title="Aide IA intelligente" description="Générez des options et des critères adaptés à votre situation grâce à notre assistant IA." delay={300} />
            <FeatureCard icon={BarChart3} title="Visualisation dynamique" description="Comprenez facilement vos données grâce à des graphiques et tableaux comparatifs interactifs." delay={500} />
            <FeatureCard icon={Award} title="Recommandations précises" description="Obtenez une recommandation basée sur l'analyse approfondie de vos critères et priorités." delay={700} />
            <FeatureCard icon={Globe} title="Accessibilité totale" description="Accédez à vos décisions depuis n'importe quel appareil, à tout moment." delay={900} />
            <FeatureCard icon={Users} title="Collaboration d'équipe" description="Partagez vos analyses et travaillez ensemble sur des décisions importantes." delay={1100} />
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-b from-white to-lime-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge className="bg-lime-100 text-lime-800 mb-4">Processus</Badge>
            <h2 className="text-4xl font-bold mb-6">Comment ça fonctionne</h2>
            <p className="text-xl text-gray-600">
              Un processus simple en 4 étapes pour transformer votre façon de prendre des décisions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-12 order-2 lg:order-1">
              <ProcessStep number={1} title="Définissez votre décision" description="Commencez par clarifier précisément le problème à résoudre ou la décision à prendre." delay={100} />
              <ProcessStep number={2} title="Ajoutez vos options" description="Listez toutes les alternatives possibles ou utilisez notre IA pour vous aider à générer des options pertinentes." delay={300} />
              <ProcessStep number={3} title="Établissez vos critères" description="Identifiez les facteurs importants pour évaluer chaque option selon vos priorités personnelles." delay={500} />
              <ProcessStep number={4} title="Analysez et décidez" description="Visualisez la comparaison de vos options et obtenez une recommandation claire basée sur votre analyse." delay={700} />
            </div>
            
            <div className="relative order-1 lg:order-2">
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-lime-200 rounded-full opacity-60 blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-100 rounded-full opacity-60 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge className="bg-lime-100 text-lime-800 mb-4">Applications</Badge>
            <h2 className="text-4xl font-bold mb-6">Adapté à tous vos besoins</h2>
            <p className="text-xl text-gray-600">
              Que vous soyez un particulier ou une entreprise, Memo s'adapte à toutes les situations de prise de décision.
            </p>
            
            <div className="mt-8 flex justify-center space-x-4">
              <Button variant={activeTab === "businesses" ? "highlight" : "outline"} onClick={() => setActiveTab("businesses")} className={cn("rounded-full transition-all duration-300", activeTab === "businesses" ? "text-gray-900" : "")}>
                Entreprises
              </Button>
              <Button variant={activeTab === "individuals" ? "highlight" : "outline"} onClick={() => setActiveTab("individuals")} className={cn("rounded-full transition-all duration-300", activeTab === "individuals" ? "text-gray-900" : "")}>
                Particuliers
              </Button>
            </div>
          </div>

          {activeTab === "businesses" && <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-semibold mb-6">Pour les entreprises</h3>
                <ul className="space-y-4">
                  {["Recrutement et sélection de candidats", "Choix de fournisseurs et partenariats", "Décisions d'investissements stratégiques", "Planification de lancement de produits", "Stratégies d'expansion"].map((item, index) => <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-lime-50 transition-colors">
                      <CheckCircle2 className="text-lime-500 flex-shrink-0" size={20} />
                      <span>{item}</span>
                    </li>)}
                </ul>
              </div>
              
              <div className="lg:col-span-3">
                <Carousel className="w-full">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="Memo a transformé notre processus de sélection des fournisseurs. Ce qui prenait des semaines de réunions se fait maintenant en quelques heures avec une transparence totale." author="Marie Dupont" role="Directrice des achats, TechCorp" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="La clarté que Memo apporte à nos décisions stratégiques est inestimable. Nous pouvons maintenant justifier chaque choix avec des données concrètes." author="Jean Martin" role="CEO, Innovatech" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="Nos réunions d'équipe sont devenues beaucoup plus productives jusqu'à ce que nous utilisons Memo pour structurer nos processus décisionnels." author="Sophie Bernard" role="Responsable innovation, MediaPlus" />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            </div>}

          {activeTab === "individuals" && <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-2xl font-semibold mb-6">Pour les particuliers</h3>
                <ul className="space-y-4">
                  {["Orientations de carrière et changements professionnels", "Décisions d'achat importantes (immobilier, véhicule)", "Choix de formations et d'études", "Planification financière et investissements", "Déménagements et choix de vie"].map((item, index) => <li key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-lime-50 transition-colors">
                      <CheckCircle2 className="text-lime-500 flex-shrink-0" size={20} />
                      <span>{item}</span>
                    </li>)}
                </ul>
              </div>
              
              <div className="lg:col-span-3">
                <Carousel className="w-full">
                  <CarouselContent>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="J'hésitais entre plusieurs options de carrière. Grâce à Memo, j'ai pu clarifier mes priorités et prendre une décision en fonction de ce qui compte vraiment pour moi." author="Thomas Leroy" role="Ingénieur logiciel" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="Pour l'achat de notre maison, Memo nous a permis de comparer objectivement toutes les options. Sans cette méthode, nous aurions probablement fait le mauvais choix." author="Émilie et Marc Dubois" role="Jeunes parents" />
                      </div>
                    </CarouselItem>
                    <CarouselItem>
                      <div className="p-1 h-full">
                        <Testimonial quote="Choisir entre plusieurs universités était stressant jusqu'à ce que j'utilise Memo pour organiser toutes les informations. Ça a rendu ma décision beaucoup plus claire." author="Léa Martin" role="Étudiante" />
                      </div>
                    </CarouselItem>
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            </div>}
        </div>
      </section>

      <section className="py-24 bg-lime-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <Badge className="bg-lime-200 text-lime-800 mb-4">Questions fréquentes</Badge>
            <h2 className="text-4xl font-bold mb-6">Tout ce que vous devez savoir</h2>
            <p className="text-xl text-gray-600">
              Les réponses aux questions les plus courantes sur Memo
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6">
              {[{
              q: "Comment Memo m'aide-t-il à prendre de meilleures décisions ?",
              a: "Memo structure votre processus de décision en décomposant les problèmes complexes en critères mesurables, en facilitant la comparaison des options et en permettant une analyse visuelle claire des résultats."
            }, {
              q: "Est-ce que l'outil est gratuit ?",
              a: "Memo propose une version gratuite qui permet d'accéder aux fonctionnalités essentielles. Des options premium sont disponibles pour les utilisateurs qui ont besoin de fonctionnalités avancées."
            }, {
              q: "Puis-je partager mes analyses avec d'autres personnes ?",
              a: "Oui, vous pouvez facilement partager vos analyses de décision avec d'autres personnes, ce qui est particulièrement utile pour les décisions collaboratives en entreprise ou en famille."
            }, {
              q: "Mes données sont-elles sécurisées ?",
              a: "Absolument. La sécurité des données est notre priorité. Toutes les données sont chiffrées et nous ne partageons jamais vos informations avec des tiers."
            }].map((faq, i) => <div key={i} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-xl font-semibold mb-3">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400 to-lime-600 z-0"></div>
        
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-lime-300 opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-lime-200 opacity-20"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 rounded-full bg-white opacity-10"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-xl text-center">
            <h2 className="text-4xl font-bold mb-6">Prêt à prendre de meilleures décisions ?</h2>
            <p className="text-xl text-gray-600 mb-8">
              Commencez dès maintenant et découvrez comment Memo peut transformer votre façon de prendre des décisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="highlight" size="lg" className="rounded-full text-gray-900 text-lg" onClick={() => navigate("/new-decision")}>
                Créer ma première décision <ArrowRight className="ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full text-lg border-lime-500 text-lime-700 hover:bg-lime-50" onClick={() => navigate("/about")}>
                Découvrir les fonctionnalités
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/lovable-uploads/1465f08a-adfe-457b-a2f9-f046b763d7f1.png" alt="Memo Logo" className="h-8 w-auto" />
              </div>
              <p className="text-gray-500 mb-4">Décisions éclairées, résultats assurés</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Twitter</span>
                  <Globe className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">LinkedIn</span>
                  <Users className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Instagram</span>
                  <MessageSquare className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Produit</h3>
              <ul className="space-y-2">
                <li><Button variant="link" onClick={() => navigate("/about")}>À propos</Button></li>
                <li><Button variant="link" onClick={() => navigate("/help")}>Guide d'utilisation</Button></li>
                <li><Button variant="link">Fonctionnalités</Button></li>
                <li><Button variant="link">Tarifs</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Ressources</h3>
              <ul className="space-y-2">
                <li><Button variant="link">Blog</Button></li>
                <li><Button variant="link">Tutoriels</Button></li>
                <li><Button variant="link">FAQ</Button></li>
                <li><Button variant="link">Support</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Légal</h3>
              <ul className="space-y-2">
                <li><Button variant="link">Conditions d'utilisation</Button></li>
                <li><Button variant="link">Politique de confidentialité</Button></li>
                <li><Button variant="link">Mentions légales</Button></li>
                <li><Button variant="link">Cookies</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">&copy; {new Date().getFullYear()} Memo. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>;
}