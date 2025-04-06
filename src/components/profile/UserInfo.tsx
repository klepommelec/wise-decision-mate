
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";

export function UserInfo() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.user_metadata?.avatar_url} />
            <AvatarFallback>{getInitials(user.user_metadata?.full_name || user.email || '')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">
              {user.user_metadata?.full_name || 'Utilisateur'}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Membre depuis {new Date(user.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
