import { useQuery } from "@tanstack/react-query";
import { PipelineStats, DashboardStats, Activity, Job, Application } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<string>("all");
  
  // Fetch pipeline stats
  const { data: pipelineStats, isLoading: isPipelineLoading } = useQuery<PipelineStats>({
    queryKey: ['/api/pipeline/stats'],
  });
  
  // Fetch dashboard stats
  const { data: dashboardStats, isLoading: isDashboardLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  // Fetch jobs for job analytics
  const { data: jobs, isLoading: isJobsLoading } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });
  
  // Fetch activities for timeline
  const { data: activities, isLoading: isActivitiesLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', { limit: 50 }],
  });
  
  // Helper function to prepare pipeline data for charts
  const getPipelineData = () => {
    if (!pipelineStats) return [];
    
    return [
      { name: "Applied", value: pipelineStats.applied, fill: "#4299e1" },
      { name: "Screening", value: pipelineStats.screening, fill: "#38b2ac" },
      { name: "Interview", value: pipelineStats.interview, fill: "#805ad5" },
      { name: "Offer", value: pipelineStats.offer, fill: "#ed8936" },
      { name: "Hired", value: pipelineStats.hired, fill: "#48bb78" },
    ];
  };
  
  // Sample recruitment funnel conversion rates
  const getFunnelData = () => {
    if (!pipelineStats) return [];
    
    const totalApplied = pipelineStats.applied + pipelineStats.screening + 
                        pipelineStats.interview + pipelineStats.offer + 
                        pipelineStats.hired;
    
    const screeningRate = totalApplied > 0 
      ? Math.round(((pipelineStats.screening + pipelineStats.interview + 
                    pipelineStats.offer + pipelineStats.hired) / totalApplied) * 100) 
      : 0;
      
    const interviewRate = (pipelineStats.screening + pipelineStats.interview + 
                          pipelineStats.offer + pipelineStats.hired) > 0 
      ? Math.round(((pipelineStats.interview + pipelineStats.offer + 
                    pipelineStats.hired) / (pipelineStats.screening + 
                    pipelineStats.interview + pipelineStats.offer + 
                    pipelineStats.hired)) * 100) 
      : 0;
      
    const offerRate = (pipelineStats.interview + pipelineStats.offer + 
                      pipelineStats.hired) > 0 
      ? Math.round(((pipelineStats.offer + pipelineStats.hired) / 
                    (pipelineStats.interview + pipelineStats.offer + 
                    pipelineStats.hired)) * 100) 
      : 0;
      
    const hireRate = (pipelineStats.offer + pipelineStats.hired) > 0 
      ? Math.round((pipelineStats.hired / (pipelineStats.offer + 
                  pipelineStats.hired)) * 100) 
      : 0;
    
    return [
      { name: "Screening", rate: screeningRate, fill: "#4299e1" },
      { name: "Interview", rate: interviewRate, fill: "#805ad5" },
      { name: "Offer", rate: offerRate, fill: "#ed8936" },
      { name: "Hire", rate: hireRate, fill: "#48bb78" },
    ];
  };
  
  // Mock job performance data based on the jobs we have
  const getJobPerformanceData = () => {
    if (!jobs) return [];
    
    return jobs.slice(0, 5).map(job => ({
      name: job.title.length > 20 ? job.title.substring(0, 20) + "..." : job.title,
      applications: Math.floor(Math.random() * 30) + 5, // This would be real data in a production app
      interviews: Math.floor(Math.random() * 15) + 2,
      offers: Math.floor(Math.random() * 5) + 1,
    }));
  };
  
  // Historical hiring data (for time series chart)
  const getHistoricalHiringData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    // Generate last 6 months in correct order
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      last6Months.push(months[monthIndex]);
    }
    
    // Create data for line chart
    return last6Months.map(month => ({
      name: month,
      applications: Math.floor(Math.random() * 50) + 10,
      interviews: Math.floor(Math.random() * 30) + 5,
      hires: Math.floor(Math.random() * 10) + 1,
    }));
  };
  
  // Chart color scheme
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Analytics Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-darkest">Recruitment Analytics</h2>
          <p className="mt-1 text-sm text-neutral-dark">Track key metrics and performance indicators</p>
        </div>
        
        <div className="mt-4 flex space-x-3 md:mt-0">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <i className="fas fa-download -ml-1 mr-2"></i>
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Active Jobs */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                <i className="fas fa-briefcase text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-neutral-dark truncate">Active Jobs</p>
                {isDashboardLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-medium text-neutral-darkest">{dashboardStats?.activeJobs ?? 0}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Hire Rate */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-success rounded-md p-3">
                <i className="fas fa-chart-line text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-neutral-dark truncate">Hire Rate</p>
                {isDashboardLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-medium text-neutral-darkest">{dashboardStats?.hireRate ?? 0}%</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Time to Hire */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-info rounded-md p-3">
                <i className="fas fa-hourglass-half text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-neutral-dark truncate">Avg. Time to Hire</p>
                {isDashboardLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-medium text-neutral-darkest">18 days</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Cost per Hire */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-warning rounded-md p-3">
                <i className="fas fa-dollar-sign text-white"></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <p className="text-sm font-medium text-neutral-dark truncate">Cost per Hire</p>
                {isDashboardLoading ? (
                  <Skeleton className="h-6 w-16 mt-1" />
                ) : (
                  <p className="text-lg font-medium text-neutral-darkest">$4,200</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analysis</TabsTrigger>
          <TabsTrigger value="jobs">Job Performance</TabsTrigger>
          <TabsTrigger value="trends">Hiring Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Candidate Pipeline Distribution */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Candidate Pipeline Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isPipelineLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getPipelineData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getPipelineData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Recruitment Funnel */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Recruitment Funnel Conversion</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isPipelineLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={getFunnelData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value}%`} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                      <Bar dataKey="rate" name="Conversion Rate">
                        {getFunnelData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Historical Hiring Data */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>Hiring Activity (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={getHistoricalHiringData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#4299e1" name="Applications" />
                    <Line type="monotone" dataKey="interviews" stroke="#805ad5" name="Interviews" />
                    <Line type="monotone" dataKey="hires" stroke="#48bb78" name="Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pipeline">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Pipeline Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isPipelineLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left font-medium">Stage</th>
                          <th className="py-3 px-4 text-left font-medium">Count</th>
                          <th className="py-3 px-4 text-left font-medium">% of Total</th>
                          <th className="py-3 px-4 text-left font-medium">Avg. Time in Stage</th>
                          <th className="py-3 px-4 text-left font-medium">Conversion Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getPipelineData().map((stage, index) => {
                          const total = getPipelineData().reduce((sum, item) => sum + item.value, 0);
                          const percentage = total > 0 ? ((stage.value / total) * 100).toFixed(1) : "0";
                          
                          return (
                            <tr key={stage.name} className="border-b">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: stage.fill }}></div>
                                  {stage.name}
                                </div>
                              </td>
                              <td className="py-3 px-4">{stage.value}</td>
                              <td className="py-3 px-4">{percentage}%</td>
                              <td className="py-3 px-4">{Math.floor(Math.random() * 10) + 1} days</td>
                              <td className="py-3 px-4">
                                {index === 0 ? "100%" : `${Math.floor(Math.random() * 40) + 40}%`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stage Duration Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "Applied", days: 2 },
                        { name: "Screening", days: 5 },
                        { name: "Interview", days: 8 },
                        { name: "Offer", days: 4 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${value} days`} />
                      <Tooltip formatter={(value) => [`${value} days`, 'Average Duration']} />
                      <Bar dataKey="days" name="Average Duration" fill="#4299e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Drop-off Analysis</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "Applied → Screening", rate: 35 },
                        { name: "Screening → Interview", rate: 22 },
                        { name: "Interview → Offer", rate: 15 },
                        { name: "Offer → Hired", rate: 8 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Drop-off Rate']} />
                      <Bar dataKey="rate" name="Drop-off Rate" fill="#f56565" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="jobs">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isJobsLoading ? (
                  <Skeleton className="h-[400px] w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={getJobPerformanceData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="applications" name="Applications" fill="#4299e1" />
                      <Bar dataKey="interviews" name="Interviews" fill="#805ad5" />
                      <Bar dataKey="offers" name="Offers" fill="#ed8936" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Time to Fill by Job</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={jobs?.slice(0, 5).map(job => ({
                        name: job.title.length > 15 ? job.title.substring(0, 15) + "..." : job.title,
                        days: Math.floor(Math.random() * 30) + 15,
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <XAxis type="number" tickFormatter={(value) => `${value} days`} />
                      <YAxis type="category" dataKey="name" width={150} />
                      <Tooltip formatter={(value) => [`${value} days`, 'Time to Fill']} />
                      <Bar dataKey="days" name="Time to Fill" fill="#4299e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Sources</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Job Boards", value: 45 },
                          { name: "Company Website", value: 25 },
                          { name: "Referrals", value: 15 },
                          { name: "Social Media", value: 10 },
                          { name: "Other", value: 5 },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Hiring Trends (Last 12 Months)</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={Array.from({ length: 12 }, (_, i) => {
                      const date = new Date();
                      date.setMonth(date.getMonth() - (11 - i));
                      return {
                        month: date.toLocaleString('default', { month: 'short' }),
                        applications: Math.floor(Math.random() * 60) + 20,
                        interviews: Math.floor(Math.random() * 30) + 10,
                        hires: Math.floor(Math.random() * 10) + 1,
                      };
                    })}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#4299e1" name="Applications" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="interviews" stroke="#805ad5" name="Interviews" />
                    <Line type="monotone" dataKey="hires" stroke="#48bb78" name="Hires" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills in Demand</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={[
                        { name: "JavaScript", count: 42 },
                        { name: "React", count: 38 },
                        { name: "Node.js", count: 32 },
                        { name: "TypeScript", count: 27 },
                        { name: "AWS", count: 25 },
                        { name: "Python", count: 22 },
                        { name: "Product Management", count: 18 },
                        { name: "UI/UX Design", count: 15 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip />
                      <Bar dataKey="count" name="Candidate Count" fill="#4299e1" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Hiring Efficiency Metrics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Time to Fill</span>
                        <span className="text-sm font-medium">24 days</span>
                      </div>
                      <div className="w-full bg-neutral-lightest rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-xs text-neutral-dark mt-1">Industry average: 36 days</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Cost per Hire</span>
                        <span className="text-sm font-medium">$4,200</span>
                      </div>
                      <div className="w-full bg-neutral-lightest rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '72%' }}></div>
                      </div>
                      <p className="text-xs text-neutral-dark mt-1">Industry average: $4,700</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Offer Acceptance Rate</span>
                        <span className="text-sm font-medium">83%</span>
                      </div>
                      <div className="w-full bg-neutral-lightest rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '83%' }}></div>
                      </div>
                      <p className="text-xs text-neutral-dark mt-1">Industry average: 76%</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Interview to Hire Ratio</span>
                        <span className="text-sm font-medium">4:1</span>
                      </div>
                      <div className="w-full bg-neutral-lightest rounded-full h-2.5">
                        <div className="bg-primary h-2.5 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <p className="text-xs text-neutral-dark mt-1">Industry average: 6:1</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
