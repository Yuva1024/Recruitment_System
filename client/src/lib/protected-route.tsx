import { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

interface ProtectedRouteProps {
  path: string;
  requiredRole?: "recruiter" | "candidate";
  children: ReactNode;
}

export function ProtectedRoute({ path, requiredRole, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // If authentication is still loading, show a loading spinner
  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  // If no user is authenticated, redirect to login
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // If a specific role is required, check if the user has that role
  if (requiredRole && user.role !== requiredRole) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
          <h1 className="text-3xl font-bold text-destructive mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You do not have permission to access this page. This area is for {requiredRole}s only.
          </p>
          <a href="/" className="text-primary hover:underline">
            Return to Dashboard
          </a>
        </div>
      </Route>
    );
  }

  // If all checks pass, render the children
  return <Route path={path}>{children}</Route>;
}