import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Redirect, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Shield, LogIn } from "lucide-react";

// Form schema
const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AdminLogin() {
  const { loginMutation, user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string | null>(null);

  // Form definition
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      await loginMutation.mutateAsync(data);
      toast({
        title: "Login successful",
        description: "Welcome back, admin!",
      });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      toast({
        title: "Login failed",
        description: err.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  };

  // If user is already logged in, redirect to appropriate page
  if (user) {
    if (user.role === "admin") {
      return <Redirect href="/" />;
    } else {
      // Non-admin users should not access admin login
      toast({
        title: "Access denied",
        description: "You do not have admin privileges",
        variant: "destructive",
      });
      return <Redirect href="/" />;
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left Column - Form */}
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-10 flex items-center gap-3">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold">Admin Portal</h1>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Admin Login</CardTitle>
              <CardDescription>
                Log in to access the administrative dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin"
                            {...field}
                            autoComplete="username"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {error && (
                    <div className="text-sm text-destructive">{error}</div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      "Logging in..."
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col text-center text-sm text-muted-foreground">
              <p>Default admin credentials:</p>
              <p>Username: admin | Password: admin123</p>
            </CardFooter>
          </Card>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-50 px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => navigate("/admin/register")}
              >
                Register New Admin
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-r from-primary to-indigo-800">
        <div className="flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 text-white">
          <div className="max-w-lg">
            <h2 className="text-4xl font-bold mb-6">
              Admin Management Portal
            </h2>
            <p className="text-lg mb-8">
              Securely access administrative tools to manage users, monitor system
              activity, and configure platform settings.
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Secure Access</h3>
                  <p className="text-sm text-white/80">
                    Enhanced security for administrative functions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Complete Control</h3>
                  <p className="text-sm text-white/80">
                    Manage all aspects of the recruitment platform
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Audit Trail</h3>
                  <p className="text-sm text-white/80">
                    Comprehensive activity logging and monitoring
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}