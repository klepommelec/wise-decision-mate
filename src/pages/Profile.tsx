
import { Container } from "@/components/layout/Container";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { UserInfo } from "@/components/profile/UserInfo";
import { DecisionsList } from "@/components/profile/DecisionsList";
import { useState } from "react";
import { useDecisions } from "@/hooks/use-decisions";
import { UserProfile } from "@/components/profile/UserProfile";

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [showFavorites, setShowFavorites] = useState<boolean>(false);

  // Use the hook to fetch decisions data
  const {
    decisions,
    isLoading: loadingDecisions,
    handleDeleteDecision,
    exportDecision
  } = useDecisions(user?.id, sortBy, showFavorites);

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
      <UserProfile user={user} onSignOut={signOut} />
      <DecisionsList 
        decisions={decisions}
        isLoading={loadingDecisions}
        viewMode={viewMode}
        sortBy={sortBy}
        showFavorites={showFavorites}
        onViewModeChange={setViewMode}
        onSortByChange={setSortBy}
        onShowFavoritesChange={setShowFavorites}
        onExportDecision={exportDecision}
        onDeleteDecision={handleDeleteDecision}
      />
    </Container>
  );
}
