
import { Container } from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/components/profile/UserInfo";
import { DecisionsList } from "@/components/profile/DecisionsList";

export default function Profile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container>
        <div className="animate-pulse space-y-4 py-8">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  return (
    <Container className="py-8 space-y-8">
      <UserInfo />
      <DecisionsList />
    </Container>
  );
}
