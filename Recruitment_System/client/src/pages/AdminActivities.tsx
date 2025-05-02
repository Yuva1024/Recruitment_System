import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Activity, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Activity as ActivityIcon, Clock } from "lucide-react";

export default function AdminActivities() {
  const [activityFilter, setActivityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all activities
  const { data: activities, isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/admin/activities"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/activities");
      return await res.json();
    },
  });

  // Fetch users to display names
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return await res.json();
    },
  });

  // Helper function to get user details
  const getUserDetails = (userId: number) => {
    const user = users?.find(user => user.id === userId);
    return {
      name: user?.fullName || "Unknown User",
      role: user?.role || "unknown"
    };
  };

  // Format activity details for display
  const formatActivityDetails = (activity: Activity) => {
    const user = getUserDetails(activity.userId);
    let details = "";

    switch (activity.type) {
      case "job_created":
        details = `${user.name} created a new job posting: ${activity.details.jobTitle}`;
        break;
      case "job_updated":
        details = `${user.name} updated a job posting: ${activity.details.jobTitle}`;
        break;
      case "job_application":
        details = `${user.name} applied for position: ${activity.details.jobTitle}`;
        break;
      case "candidate_stage_changed":
        details = `${user.name} moved ${activity.details.candidateName} to ${activity.details.newStage} stage`;
        break;
      case "interview_scheduled":
        details = `${user.name} scheduled an interview with ${activity.details.candidateName}`;
        break;
      case "user_registered":
        details = `${user.name} registered as a ${activity.details.role}`;
        break;
      default:
        details = `${user.name} performed action: ${activity.type}`;
    }
    
    return details;
  };

  // Get activity icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "job_created":
      case "job_updated":
        return <ActivityIcon className="h-5 w-5 text-primary" />;
      case "job_application":
        return <ActivityIcon className="h-5 w-5 text-blue-500" />;
      case "candidate_stage_changed":
        return <ActivityIcon className="h-5 w-5 text-orange-500" />;
      case "interview_scheduled":
        return <ActivityIcon className="h-5 w-5 text-green-500" />;
      case "user_registered":
        return <ActivityIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <ActivityIcon className="h-5 w-5 text-neutral-dark" />;
    }
  };

  // Filter activities
  const filteredActivities = activities?.filter(activity => {
    // Filter by type
    if (activityFilter !== "all" && activity.type !== activityFilter) {
      return false;
    }

    // Filter by search query (in activity details)
    if (searchQuery) {
      const activityText = formatActivityDetails(activity).toLowerCase();
      if (!activityText.includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Activity Log</h1>
          <p className="text-neutral-dark mt-1">
            Track all user activities in the system
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Select
            value={activityFilter}
            onValueChange={setActivityFilter}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Filter activities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activities</SelectItem>
              <SelectItem value="job_created">Job Created</SelectItem>
              <SelectItem value="job_updated">Job Updated</SelectItem>
              <SelectItem value="job_application">Job Application</SelectItem>
              <SelectItem value="candidate_stage_changed">Candidate Updated</SelectItem>
              <SelectItem value="interview_scheduled">Interview Scheduled</SelectItem>
              <SelectItem value="user_registered">User Registered</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Activity Timeline</CardTitle>
          <CardDescription>
            Recent actions performed by users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activitiesLoading ? (
            <div className="py-10 text-center text-neutral-dark">
              Loading activities...
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex gap-4 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {formatActivityDetails(activity)}
                    </p>
                    <div className="flex items-center mt-1 text-xs text-neutral-dark">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-neutral-dark">
              No activities found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}