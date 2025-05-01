import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job, Application } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/JobForm";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Jobs() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });
  
  // Function to get applications for a job
  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/applications', { jobId: selectedJob?.id }],
    enabled: !!selectedJob?.id && isJobDetailOpen,
    queryFn: async ({ queryKey }) => {
      if (!selectedJob?.id) return [];
      const res = await fetch(`/api/applications?jobId=${selectedJob.id}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    }
  });
  
  const handleCreateJob = () => {
    setSelectedJob(null);
    setIsEditMode(false);
    setIsJobModalOpen(true);
  };
  
  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditMode(true);
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
            <Card 
              key={job.id} 
              className={cn(
                "overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer",
                selectedJob?.id === job.id && "border-primary shadow-md"
              )}
              onClick={() => setSelectedJob(job)}
            >
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
                  <span className="text-sm font-medium text-primary">
                    {/* We can add a query to get application count later */}
                    {0} applicants
                  </span>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleEditJob(job);
                    }}>
                      <i className="fas fa-edit mr-1"></i>
                      Edit
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
      
      {/* Job Detail Modal */}
      <Dialog open={!!selectedJob && !isJobModalOpen} onOpenChange={(open) => {
        if (!open) {
          setSelectedJob(null);
          setIsJobDetailOpen(false);
        } else {
          setIsJobDetailOpen(true);
        }
      }}>
        <DialogContent className="max-w-4xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                    <DialogDescription className="text-lg mt-1">
                      {selectedJob.location}
                    </DialogDescription>
                  </div>
                  <Badge variant={
                    selectedJob.status === "open" ? "default" : 
                    selectedJob.status === "paused" ? "secondary" : 
                    "outline"
                  }>
                    {selectedJob.status}
                  </Badge>
                </div>
              </DialogHeader>
              
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="applications">Applications</TabsTrigger>
                  <TabsTrigger value="candidates">Candidates</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center">
                      <i className="fas fa-dollar-sign mr-2 text-primary"></i>
                      {selectedJob.salary || "Not specified"}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-calendar mr-2 text-primary"></i>
                      Posted {formatDistanceToNow(new Date(selectedJob.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Job Description</h3>
                    <div className="text-neutral-dark whitespace-pre-line">
                      {selectedJob.description}
                    </div>
                    
                    {selectedJob.requirements && (
                      <>
                        <h3 className="font-semibold text-lg pt-4">Requirements</h3>
                        <div className="text-neutral-dark whitespace-pre-line">
                          {selectedJob.requirements}
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="applications" className="mt-4">
                  {applications && applications.length > 0 ? (
                    <div className="space-y-4">
                      {applications.map(application => (
                        <Card key={application.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base">
                                {/* We'll need to get candidate name from user data */}
                                Applicant
                              </CardTitle>
                              <Badge>{application.status || "Applied"}</Badge>
                            </div>
                            <CardDescription>
                              Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{application.coverLetter}</p>
                          </CardContent>
                          <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">View Profile</Button>
                            <Button size="sm">Review</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-dark">
                      No applications found for this job posting.
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="candidates" className="mt-4">
                  <div className="text-center py-8 text-neutral-dark">
                    No candidates matched with this job yet.
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={() => setSelectedJob(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsEditMode(true);
                  setIsJobModalOpen(true);
                }}>
                  <i className="fas fa-edit mr-2"></i>
                  Edit Job
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Job Create/Edit Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Job" : "Create New Job"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of your job posting."
                : "Fill in the details to create a new job posting."}
            </DialogDescription>
          </DialogHeader>
          <JobForm 
            job={isEditMode && selectedJob ? selectedJob : undefined}
            onSuccess={() => {
              setIsJobModalOpen(false);
              setIsEditMode(false);
              queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
              toast({
                title: isEditMode ? "Job updated" : "Job created",
                description: isEditMode 
                  ? "Your job posting has been updated successfully."
                  : "Your job posting has been created successfully.",
              });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
