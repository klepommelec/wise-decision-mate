
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NewDecision from "./pages/NewDecision";
import MyDecisions from "./pages/MyDecisions";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./hooks/use-theme";
import { Header } from "./components/layout/Header";

const queryClient = new QueryClient();

// Cette composante est maintenant plus simple et ne gère que les navigations
// Le scrollToTop dans Index.tsx s'occupe des rechargements de page complets
const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    if (location.hash) return; // Ne pas scroller si nous naviguons vers un ancre
    
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, [location.pathname, location.search]);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/new-decision" element={<NewDecision />} />
              <Route path="/my-decisions" element={<MyDecisions />} />
              <Route path="/help" element={<Help />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
