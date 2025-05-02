import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecruitmentPipeline } from "@/components/dashboard/RecruitmentPipeline";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/JobForm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, FileText, Calendar, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Job, Application } from "../types";

// Component for Candidate Dashboard
function CandidateDashboard() {
  const { user } = useAuth();
  
  // Fetch recent jobs
  const { data: recentJobs } = useQuery<Job[]>({
    queryKey: ["/api/jobs/recent"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch user's applications
  const { data: applications } = useQuery<Application[]>({
    queryKey: ["/api/applications", { userId: user?.id }],
    enabled: !!user?.id,
  });
  
  // Format date
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-darkest">Candidate Dashboard</h2>
        <p className="mt-1 text-sm text-neutral-dark">Welcome back, {user?.fullName}! Here's your job search overview.</p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-primary/90 to-primary text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Find Jobs</CardTitle>
            <CardDescription className="text-white/80">Browse open positions</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Briefcase className="h-8 w-8 text-white/80" />
            <Button variant="secondary" size="sm" asChild>
              <a href="/job-search" className="text-primary">
                Browse Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>My Applications</CardTitle>
            <CardDescription>Track your job applications</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div className="text-right">
              <p className="text-2xl font-bold">{applications?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Applications</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Your scheduled interviews</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-between items-center">
            <Calendar className="h-8 w-8 text-muted-foreground" />
            <Button variant="outline" size="sm" asChild>
              <a href="/my-applications">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Job Applications */}
      {applications && applications.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Your recently submitted job applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {applications.slice(0, 3).map((application) => {
                const job = recentJobs?.find(job => job.id === application.jobId);
                
                return (
                  <div key={application.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <h4 className="font-medium">{job?.title || "Unknown Position"}</h4>
                      <p className="text-sm text-muted-foreground">{job?.location || "Unknown Location"}</p>
                      <p className="text-xs text-muted-foreground">Applied on {formatDate(application.appliedAt)}</p>
                    </div>
                    <Badge variant={application.status === "rejected" ? "destructive" : "default"}>
                      {application.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Job Postings</CardTitle>
          <CardDescription>Latest job opportunities you might be interested in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs?.slice(0, 5).map((job) => (
              <div key={job.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{job.title}</h4>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                  {job.salary && (
                    <p className="text-xs text-muted-foreground">{job.salary}</p>
                  )}
                </div>
                <Button size="sm" asChild>
                  <a href={`/job-search`}>View</a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for Recruiter Dashboard
function RecruiterDashboard() {
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const { toast } = useToast();
  
  const handlePostJob = () => {
    setIsJobModalOpen(true);
  };
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-darkest">Recruitment Dashboard</h2>
          <p className="mt-1 text-sm text-neutral-dark">Overview of your recruitment pipeline and activities</p>
        </div>
        
        <div className="mt-4 flex space-x-3 md:mt-0">
          <Button variant="outline" size="sm">
            <i className="fas fa-filter -ml-1 mr-2"></i>
            Filter
          </Button>
          <Button size="sm" onClick={handlePostJob}>
            <i className="fas fa-plus -ml-1 mr-2"></i>
            Post Job
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Recruitment Pipeline */}
      <RecruitmentPipeline />
      
      {/* Recent Jobs and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentJobs />
        <RecentActivity />
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

// Admin Dashboard
function AdminDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Dashboard Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-darkest">Admin Dashboard</h2>
        <p className="mt-1 text-sm text-neutral-dark">Welcome back, {user?.fullName}! Here's your system overview.</p>
      </div>
      
      {/* Admin Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">User Management</CardTitle>
            <CardDescription>Manage system users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full mt-2" onClick={() => window.location.href = "/admin/users"}>
              Go to User Management
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">System Activity</CardTitle>
            <CardDescription>View all system activities and logs</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full mt-2" onClick={() => window.location.href = "/admin/activities"}>
              View Activity Logs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Activity and Recruiter Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <RecentJobs />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  // Render different dashboard based on user role
  if (user?.role === "candidate") {
    return <CandidateDashboard />;
  } else if (user?.role === "admin") {
    return <AdminDashboard />;
  }
  
  // Default to recruiter dashboard
  return <RecruiterDashboard />;
}
