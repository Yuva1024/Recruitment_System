import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function JobSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch jobs with caching
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Handle job application
  const applyMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const res = await apiRequest("POST", "/api/applications", {
        userId: user?.id,
        jobId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Submitted",
        description: "Your job application has been successfully submitted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message || "Failed to submit your application. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter jobs based on search term
  const filteredJobs = searchTerm
    ? jobs?.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : jobs;
  
  // Format date to readable string
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-darkest">Find Jobs</h1>
          <p className="text-neutral-dark mt-1">Browse and apply for open positions</p>
        </div>
        
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="relative max-w-md">
            <Input
              type="text"
              placeholder="Search jobs by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <i className="fas fa-search text-neutral-medium"></i>
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs && filteredJobs.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-1">{job.title}</CardTitle>
                    <CardDescription className="text-neutral-dark">
                      <div className="flex items-center mb-1">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        {job.location}
                      </div>
                      {job.salary && (
                        <div className="flex items-center">
                          <i className="fas fa-money-bill-wave mr-2"></i>
                          {job.salary}
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-neutral-dark mb-4">
                  {job.description.length > 150
                    ? `${job.description.substring(0, 150)}...`
                    : job.description}
                </p>
                
                {job.requirements && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium mb-1">Requirements:</h4>
                    <p className="text-sm text-neutral-dark">
                      {job.requirements.length > 100
                        ? `${job.requirements.substring(0, 100)}...`
                        : job.requirements}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col items-start pt-0">
                <div className="text-xs text-neutral-medium mb-3">
                  Posted on {formatDate(job.createdAt)}
                </div>
                <Button 
                  className="w-full" 
                  disabled={job.status !== "open" || applyMutation.isPending}
                  onClick={() => applyMutation.mutate(job.id)}
                >
                  {applyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Apply Now"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <i className="fas fa-search text-4xl text-neutral-light mb-4"></i>
          <h3 className="text-xl font-medium text-neutral-dark mb-1">No jobs found</h3>
          <p className="text-neutral-medium">
            {searchTerm
              ? `No jobs match "${searchTerm}". Try a different search term.`
              : "There are no open positions available at the moment."}
          </p>
        </div>
      )}
    </div>
  );
}