import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Job } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { JobForm } from "../jobs/JobForm";

export function RecentJobs() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs/recent'],
  });
  
  const handleCreateJob = () => {
    setIsJobModalOpen(true);
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="px-4 py-5 border-b border-neutral-light sm:px-6 flex justify-between items-start">
          <div>
            <CardTitle>Recent Job Postings</CardTitle>
            <CardDescription>Your recently created job listings</CardDescription>
          </div>
          <Link href="/jobs">
            <a className="text-sm font-medium text-primary hover:text-primary-dark">
              View all
            </a>
          </Link>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-light">
            {isLoading ? (
              <>
                <div className="p-4">
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="p-4">
                  <Skeleton className="h-24 w-full" />
                </div>
              </>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-neutral-lightest cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-base font-medium text-neutral-darkest">{job.title}</h4>
                      <div className="mt-1 flex items-center text-sm text-neutral-dark">
                        <i className="fas fa-map-marker-alt mr-1"></i>
                        <span>{job.location}</span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-neutral-dark">
                        <i className="fas fa-dollar-sign mr-1"></i>
                        <span>{job.salary || 'Salary not specified'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant="default" className="bg-primary-light">
                        {/* This would be from applications count in a real implementation */}
                        {Math.floor(Math.random() * 20) + 1} applicants
                      </Badge>
                      <span className="mt-1 text-xs text-neutral-dark">
                        Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-dark">
                No jobs found. Create your first job posting.
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="bg-neutral-lightest px-4 py-4 text-center">
          <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
            <DialogTrigger asChild>
              <Button variant="default" onClick={handleCreateJob}>
                <i className="fas fa-plus mr-2"></i>
                Create New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <JobForm 
                onSuccess={() => {
                  setIsJobModalOpen(false);
                  toast({
                    title: "Job created",
                    description: "Your job posting has been created successfully.",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </>
  );
}
