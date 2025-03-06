import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/layout/Container";
import { toast } from "sonner";
import { AtSign, Lock, User, UserPlus } from "lucide-react";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        
        toast.success("Connexion réussie!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: username,
            },
          },
        });

        if (error) throw error;
        
        toast.success("Inscription réussie! Vérifiez votre email pour confirmer votre compte.");
      }
    } catch (error: any) {
      toast.error(error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <div className="min-h-[80vh] flex flex-col justify-center items-center py-12">
        <Card className="w-full max-w-md glass-card transition-all duration-300 border-[#8E9196]">
          <CardHeader>
            <CardTitle className="text-2xl font-medium">
              {mode === "login" ? "Connexion" : "Inscription"}
            </CardTitle>
            <CardDescription>
              {mode === "login" 
                ? "Connectez-vous pour accéder à votre compte" 
                : "Créez un compte pour commencer"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10"
                      placeholder="Votre nom d'utilisateur"
                      required={mode === "signup"}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <AtSign className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <div className="absolute left-3 top-3 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              
              <Button type="submit" className="w-full mt-6" disabled={loading}>
                {loading 
                  ? "Chargement..." 
                  : mode === "login" 
                    ? "Se connecter" 
                    : "S'inscrire"
                }
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              variant="link" 
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="mt-2"
            >
              {mode === "login" ? (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Créer un compte
                </span>
              ) : (
                "Déjà un compte? Se connecter"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </Container>
  );
}
