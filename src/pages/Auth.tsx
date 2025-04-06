import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";

// Schéma de validation pour le formulaire d'inscription
const signUpSchema = z.object({
  email: z.string().email({
    message: "Email invalide"
  }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères"
  }),
  confirm: z.string().min(6, {
    message: "La confirmation doit contenir au moins 6 caractères"
  })
}).refine(data => data.password === data.confirm, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm"]
});

// Schéma de validation pour le formulaire de connexion
const signInSchema = z.object({
  email: z.string().email({
    message: "Email invalide"
  }),
  password: z.string().min(1, {
    message: "Veuillez entrer votre mot de passe"
  })
});
type SignUpFormValues = z.infer<typeof signUpSchema>;
type SignInFormValues = z.infer<typeof signInSchema>;
interface LocationState {
  message?: string;
  decisionData?: {
    title: string;
    description: string;
    useAI: boolean;
  };
}
export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user
  } = useAuth();
  const locationState = location.state as LocationState | null;
  const message = locationState?.message;
  const decisionData = locationState?.decisionData;

  // Formulaires avec validation
  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      confirm: ""
    }
  });
  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  // Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      if (decisionData) {
        // Si des données de décision sont présentes, redirigez vers la page de création de décision
        navigate("/new-decision", {
          state: {
            decisionData
          }
        });
      } else {
        // Sinon, redirigez vers le tableau de bord
        navigate("/dashboard");
      }
    }
  }, [user, navigate, decisionData]);

  // Fonction de connexion
  const onSignIn: SubmitHandler<SignInFormValues> = async data => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const {
        error
      } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      if (error) {
        throw error;
      }
      toast.success("Connexion réussie");
      // La redirection est gérée par useEffect ci-dessus
    } catch (error: any) {
      console.error("Erreur de connexion:", error);
      setAuthError(error.message);
      toast.error("Échec de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const onSignUp: SubmitHandler<SignUpFormValues> = async data => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const {
        error
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      });
      if (error) {
        throw error;
      }
      toast.success("Compte créé avec succès");
      // La redirection est gérée par useEffect ci-dessus
    } catch (error: any) {
      console.error("Erreur d'inscription:", error);
      setAuthError(error.message);
      toast.error("Échec de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="container flex items-center justify-center min-h-screen py-10">
      <div className="w-full max-w-md">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6 rounded-full">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
        </Button>

        {message && <Alert className="mb-6 bg-lime-50 border-lime-200">
            <AlertDescription className="text-lime-800">{message}</AlertDescription>
          </Alert>}

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Bienvenue sur Memo</CardTitle>
            <CardDescription>
              Connectez-vous ou créez un compte pour commencer à prendre de meilleures décisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 rounded-full">
                <TabsTrigger value="signin" className="rounded-full">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="rounded-full">Inscription</TabsTrigger>
              </TabsList>
              
              {/* Onglet de connexion */}
              <TabsContent value="signin">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                    <FormField control={signInForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre@email.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={signInForm.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <Button type="submit" disabled={isLoading} className="w-full bg-lime-400 hover:bg-lime-500 rounded-full">
                      {isLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              {/* Onglet d'inscription */}
              <TabsContent value="signup">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-4">
                    <FormField control={signUpForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre@email.fr" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={signUpForm.control} name="password" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={signUpForm.control} name="confirm" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Confirmer le mot de passe</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <Button type="submit" disabled={isLoading} className="w-full rounded-full bg-lime-400 hover:bg-lime-500">
                      {isLoading ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            {authError && <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-red-600 text-sm">{authError}</p>
              </div>}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 border-t pt-4">
            <p className="text-center text-sm text-gray-500">
              En continuant, vous acceptez nos{" "}
              <a href="#" className="underline">Conditions d'utilisation</a> et notre{" "}
              <a href="#" className="underline">Politique de confidentialité</a>.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>;
}