import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecruitmentPipeline } from "@/components/dashboard/RecruitmentPipeline";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { JobForm } from "@/components/jobs/JobForm";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
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
