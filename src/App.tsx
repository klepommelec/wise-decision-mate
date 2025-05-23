
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import NewDecision from "./pages/NewDecision";
import MyDecisions from "./pages/MyDecisions";
import NotFound from "./pages/NotFound";
import Help from "./pages/Help";
import Components from "./pages/Components";
import Landing from "./pages/Landing";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./hooks/use-theme";
import { Header } from "./components/layout/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/new-decision" element={<NewDecision />} />
              <Route path="/my-decisions" element={<MyDecisions />} />
              <Route path="/help" element={<Help />} />
              <Route path="/components" element={<Components />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
