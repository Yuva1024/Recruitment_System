import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Application, Job } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Briefcase, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function MyApplications() {
  const { user } = useAuth();
  
  // Fetch user's applications
  const { data: applications, isLoading: applicationsLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications", { userId: user?.id }],
    enabled: !!user?.id,
    queryFn: async ({ queryKey }) => {
      const res = await fetch(`/api/applications?userId=${user?.id}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    }
  });
  
  // Fetch jobs to get details for each application
  const { data: jobs, isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    enabled: !!applications,
  });
  
  const isLoading = applicationsLoading || jobsLoading;
  
  // Format date to readable string
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  // Get job details for an application
  const getJobDetails = (jobId: number) => {
    return jobs?.find(job => job.id === jobId);
  };
  
  // Get the status color for a given application status
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      applied: "bg-blue-500",
      screening: "bg-yellow-500",
      interview: "bg-purple-500",
      offer: "bg-green-500",
      hired: "bg-emerald-500",
      rejected: "bg-red-500",
    };
    return statusMap[status] || "bg-gray-500";
  };
  
  // Get the status badge variant for a given application status
  const getStatusVariant = (status: string) => {
    const variantMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      applied: "outline",
      screening: "secondary",
      interview: "default",
      offer: "default",
      hired: "default",
      rejected: "destructive",
    };
    return variantMap[status] || "outline";
  };
  
  // Calculate the application progress percentage
  const calculateProgress = (status: string) => {
    const progressMap: Record<string, number> = {
      applied: 20,
      screening: 40,
      interview: 60,
      offer: 80,
      hired: 100,
      rejected: 0,
    };
    return progressMap[status] || 0;
  };
  
  // Group applications by status
  const applicationsByStatus = applications?.reduce((acc, app) => {
    if (!acc[app.status]) {
      acc[app.status] = [];
    }
    acc[app.status].push(app);
    return acc;
  }, {} as Record<string, Application[]>) || {};
  
  // Count applications by status
  const statusCounts = Object.entries(applicationsByStatus).reduce((acc, [status, apps]) => {
    acc[status] = apps.length;
    return acc;
  }, {} as Record<string, number>);
  
  // Order of application stages for display
  const statusOrder = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-neutral-darkest">My Applications</h1>
        <p className="text-neutral-dark mt-1">Track the status of your job applications</p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : applications && applications.length > 0 ? (
        <>
          {/* Application Statistics */}
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-6">
            {statusOrder.map(status => (
              <Card key={status} className="flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statusCounts[status] || 0}</div>
                  <div className="mt-2">
                    <div className="h-1 w-full bg-neutral-lighter rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getStatusColor(status)}`} 
                        style={{ width: `${(statusCounts[status] || 0) / (applications.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Applications Table */}
          <Card>
            <CardHeader>
              <CardTitle>Application History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => {
                    const job = getJobDetails(application.jobId);
                    
                    return (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{job?.title || "Unknown Job"}</TableCell>
                        <TableCell>{job?.location.split(",")[0] || "Unknown Company"}</TableCell>
                        <TableCell>{formatDate(application.appliedAt)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(application.status)}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={calculateProgress(application.status)} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground">
                              {calculateProgress(application.status)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost">
                              <FileText className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Briefcase className="h-4 w-4 mr-2" />
                              View Job
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Calendar className="h-16 w-16 text-neutral-light mb-4" />
          <h3 className="text-xl font-medium text-neutral-dark mb-1">No applications yet</h3>
          <p className="text-neutral-medium mb-6">
            You haven't applied to any jobs yet. Browse open positions to start your application.
          </p>
          <Button asChild>
            <a href="/job-search">Browse Jobs</a>
          </Button>
        </div>
      )}
    </div>
  );
}