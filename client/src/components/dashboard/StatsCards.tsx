import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Active Jobs */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <i className="fas fa-briefcase text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-dark truncate">Active Jobs</dt>
                  <dd>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-medium text-neutral-darkest">{stats?.activeJobs ?? 0}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/jobs">
              <a className="font-medium text-primary hover:text-primary-dark">
                View all<span className="sr-only"> active jobs</span>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      {/* New Candidates */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary rounded-md p-3">
                <i className="fas fa-user-plus text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-dark truncate">New Candidates</dt>
                  <dd>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-medium text-neutral-darkest">{stats?.newCandidates ?? 0}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/candidates">
              <a className="font-medium text-primary hover:text-primary-dark">
                View all<span className="sr-only"> new candidates</span>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      {/* Interviews */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-info rounded-md p-3">
                <i className="fas fa-calendar-check text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-dark truncate">Scheduled Interviews</dt>
                  <dd>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-medium text-neutral-darkest">{stats?.scheduledInterviews ?? 0}</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/interviews">
              <a className="font-medium text-primary hover:text-primary-dark">
                Schedule<span className="sr-only"> interviews</span>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
      
      {/* Hire Rate */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success rounded-md p-3">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-dark truncate">Hire Rate</dt>
                  <dd>
                    {isLoading ? (
                      <Skeleton className="h-6 w-16 mt-1" />
                    ) : (
                      <div className="text-lg font-medium text-neutral-darkest">{stats?.hireRate ?? 0}%</div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-neutral-lightest px-4 py-4 sm:px-6">
          <div className="text-sm">
            <Link href="/analytics">
              <a className="font-medium text-primary hover:text-primary-dark">
                View analytics<span className="sr-only"> for hire rate</span>
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
