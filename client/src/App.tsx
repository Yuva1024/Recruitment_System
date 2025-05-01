import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import Candidates from "@/pages/Candidates";
import Interviews from "@/pages/Interviews";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import JobSearch from "@/pages/JobSearch";
import MyApplications from "@/pages/MyApplications";
import { useEffect } from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // Only show sidebar and header for authenticated users
  if (!user) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/auth" component={AuthPage} />
        
        <ProtectedRoute path="/">
          <Dashboard />
        </ProtectedRoute>
        
        <ProtectedRoute path="/jobs" requiredRole="recruiter">
          <Jobs />
        </ProtectedRoute>
        
        <ProtectedRoute path="/candidates" requiredRole="recruiter">
          <Candidates />
        </ProtectedRoute>
        
        <ProtectedRoute path="/interviews" requiredRole="recruiter">
          <Interviews />
        </ProtectedRoute>
        
        <ProtectedRoute path="/analytics" requiredRole="recruiter">
          <Analytics />
        </ProtectedRoute>
        
        <ProtectedRoute path="/settings">
          <Settings />
        </ProtectedRoute>
        
        <ProtectedRoute path="/job-search" requiredRole="candidate">
          <JobSearch />
        </ProtectedRoute>
        
        <ProtectedRoute path="/my-applications" requiredRole="candidate">
          <MyApplications />
        </ProtectedRoute>
        
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  // Set the document title
  useEffect(() => {
    document.title = "TalentTrack - Recruitment Management System";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
