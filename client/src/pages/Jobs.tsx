import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/JobForm";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

export default function Jobs() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });
  
  const handleCreateJob = () => {
    setIsJobModalOpen(true);
  };
  
  const filteredJobs = jobs?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
                         
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Jobs Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-darkest">Job Listings</h2>
          <p className="mt-1 text-sm text-neutral-dark">Manage and create your job postings</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={handleCreateJob}>
            <i className="fas fa-plus -ml-1 mr-2"></i>
            Post New Job
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="text-neutral-medium fas fa-search"></i>
            </div>
            <Input 
              type="text" 
              placeholder="Search jobs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant={statusFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={statusFilter === "open" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("open")}
          >
            Open
          </Button>
          <Button 
            variant={statusFilter === "paused" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("paused")}
          >
            Paused
          </Button>
          <Button 
            variant={statusFilter === "closed" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStatusFilter("closed")}
          >
            Closed
          </Button>
        </div>
      </div>
      
      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : filteredJobs && filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">{job.title}</h3>
                  <Badge variant={
                    job.status === "open" ? "default" : 
                    job.status === "paused" ? "secondary" : 
                    "outline"
                  }>
                    {job.status}
                  </Badge>
                </div>
                
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm text-neutral-dark">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    <span>{job.location}</span>
                  </div>
                  
                  {job.salary && (
                    <div className="flex items-center text-sm text-neutral-dark">
                      <i className="fas fa-dollar-sign mr-2"></i>
                      <span>{job.salary}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-neutral-dark">
                    <i className="fas fa-clock mr-2"></i>
                    <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
                
                <p className="text-sm mb-4 line-clamp-3">
                  {job.description}
                </p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-primary">12 applicants</span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">
                      <i className="fas fa-edit"></i>
                    </Button>
                    <Button variant="default" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-dark">
            {searchTerm || statusFilter !== "all" 
              ? "No jobs match your search criteria." 
              : "No jobs found. Create your first job posting."}
          </div>
        )}
      </div>
      
      {/* Job Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
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
    </div>
  );
}
