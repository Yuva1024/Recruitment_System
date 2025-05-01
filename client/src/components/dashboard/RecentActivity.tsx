import { useQuery } from "@tanstack/react-query";
import { Activity } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  const formatActivityText = (activity: Activity) => {
    const { type, details } = activity;
    
    switch (type) {
      case 'job_created':
        return (
          <>
            <span className="font-medium">Sarah Johnson</span>
            <span> created a new job posting for </span>
            <span className="font-medium">{details.jobTitle}</span>
          </>
        );
      
      case 'candidate_created':
        return (
          <>
            <span className="font-medium">Sarah Johnson</span>
            <span> added a new candidate </span>
            <span className="font-medium">{details.candidateName}</span>
          </>
        );
      
      case 'candidate_stage_changed':
        return (
          <>
            <span className="font-medium">Sarah Johnson</span>
            <span> moved </span>
            <span className="font-medium">{details.candidateName}</span>
            <span> from {details.oldStage} to {details.newStage} stage</span>
          </>
        );
      
      case 'interview_scheduled':
        return (
          <>
            <span className="font-medium">Sarah Johnson</span>
            <span> scheduled an interview with </span>
            <span className="font-medium">{details.candidateName}</span>
            <span> for </span>
            <span className="font-medium">{details.jobTitle}</span>
            <span> role</span>
          </>
        );
      
      case 'application_status_changed':
        if (details.newStatus === 'offer') {
          return (
            <>
              <span className="font-medium">Sarah Johnson</span>
              <span> sent an offer to </span>
              <span className="font-medium">{details.candidateName}</span>
              <span> for </span>
              <span className="font-medium">{details.jobTitle}</span>
              <span> role</span>
            </>
          );
        }
        return (
          <>
            <span className="font-medium">Sarah Johnson</span>
            <span> updated </span>
            <span className="font-medium">{details.candidateName}</span>
            <span>'s application status to {details.newStatus}</span>
          </>
        );
      
      default:
        return <span>Unknown activity</span>;
    }
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-4 py-5 border-b border-neutral-light sm:px-6">
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates from your team</CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="divide-y divide-neutral-light max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <>
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="p-4">
                <Skeleton className="h-16 w-full" />
              </div>
            </>
          ) : activities && activities.length > 0 ? (
            activities.map((activity) => (
              <div key={activity.id} className="p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img 
                      className="h-10 w-10 rounded-full" 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="User avatar" 
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-neutral-darkest">
                      {formatActivityText(activity)}
                    </div>
                    <div className="mt-1 text-xs text-neutral-dark">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-dark">
              No recent activities found.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6 text-center">
        <Link href="/activities">
          <a className="text-sm font-medium text-primary hover:text-primary-dark">
            View all activity
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
}
