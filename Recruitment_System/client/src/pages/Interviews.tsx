import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Interview, Application, Candidate, Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Interviews() {
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch upcoming interviews
  const { data: interviews, isLoading: isInterviewsLoading } = useQuery<Interview[]>({
    queryKey: ['/api/interviews', { upcoming: true }],
  });
  
  // Fetch applications for scheduling new interviews
  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/applications', { stage: 'screening' }],
  });
  
  // Fetch candidates data
  const { data: candidates } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });
  
  // Fetch jobs data
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
  });
  
  // Create or update interview mutation
  const interviewMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedInterview) {
        return apiRequest("PATCH", `/api/interviews/${selectedInterview.id}`, data);
      } else {
        return apiRequest("POST", "/api/interviews", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/interviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setIsInterviewModalOpen(false);
      setSelectedInterview(null);
      toast({
        title: selectedInterview ? "Interview updated" : "Interview scheduled",
        description: selectedInterview 
          ? "The interview has been successfully updated." 
          : "The interview has been successfully scheduled.",
      });
    },
  });
  
  // Form schema for interview scheduling
  const formSchema = z.object({
    applicationId: z.number(),
    recruiterId: z.number().default(1), // Default to first recruiter
    scheduledAt: z.date(),
    duration: z.number().min(15).max(240),
    location: z.string().min(3),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "cancelled"]).default("scheduled"),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      applicationId: 0,
      recruiterId: 1,
      scheduledAt: new Date(),
      duration: 60,
      location: "Zoom Meeting",
      notes: "",
      status: "scheduled",
    },
  });
  
  const handleScheduleInterview = () => {
    form.reset({
      applicationId: 0,
      recruiterId: 1,
      scheduledAt: new Date(),
      duration: 60,
      location: "Zoom Meeting",
      notes: "",
      status: "scheduled",
    });
    setSelectedInterview(null);
    setIsInterviewModalOpen(true);
  };
  
  const handleEditInterview = (interview: Interview) => {
    form.reset({
      applicationId: interview.applicationId,
      recruiterId: interview.recruiterId,
      scheduledAt: new Date(interview.scheduledAt),
      duration: interview.duration,
      location: interview.location || "Zoom Meeting",
      notes: interview.notes || "",
      status: interview.status as "scheduled" | "completed" | "cancelled",
    });
    setSelectedInterview(interview);
    setIsInterviewModalOpen(true);
  };
  
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    interviewMutation.mutate(data);
  };
  
  // Helper function to get candidate name from application
  const getCandidateName = (applicationId: number) => {
    if (!applications || !candidates) return "Loading...";
    
    const application = applications.find(app => app.id === applicationId);
    if (!application) return "Unknown Candidate";
    
    // First try to find candidate by userId from application
    const candidateByUserId = candidates.find(c => c.userId === application.userId);
    if (candidateByUserId) return candidateByUserId.fullName;
    
    // Fallback to searching for a candidate with matching user ID and email
    const user = application.userId;
    const candidate = candidates.find(c => c.userId === user);
    return candidate ? candidate.fullName : "Unknown Candidate";
  };
  
  // Helper function to get job title from application
  const getJobTitle = (applicationId: number) => {
    if (!applications || !jobs) return "Loading...";
    
    const application = applications.find(app => app.id === applicationId);
    if (!application) return "Unknown Position";
    
    const job = jobs.find(j => j.id === application.jobId);
    return job ? job.title : "Unknown Position";
  };
  
  // Filter interviews for calendar view by date
  const getInterviewsForDate = (date: Date) => {
    if (!interviews) return [];
    
    return interviews.filter(interview => {
      const interviewDate = new Date(interview.scheduledAt);
      return (
        interviewDate.getDate() === date.getDate() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getFullYear() === date.getFullYear()
      );
    });
  };
  
  const selectedDateInterviews = selectedDate ? getInterviewsForDate(selectedDate) : [];
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Interviews Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-darkest">Interviews</h2>
          <p className="mt-1 text-sm text-neutral-dark">Schedule and manage candidate interviews</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button onClick={handleScheduleInterview}>
            <i className="fas fa-calendar-plus -ml-1 mr-2"></i>
            Schedule Interview
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="upcoming" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming">Upcoming Interviews</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming">
          {/* Upcoming Interviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isInterviewsLoading ? (
              <>
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </>
            ) : interviews && interviews.length > 0 ? (
              interviews.map((interview) => (
                <Card 
                  key={interview.id} 
                  className="overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">{getCandidateName(interview.applicationId)}</h3>
                      <Badge variant={
                        interview.status === "scheduled" ? "default" : 
                        interview.status === "completed" ? "success" : 
                        "destructive"
                      }>
                        {interview.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-neutral-dark">{getJobTitle(interview.applicationId)}</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <i className="fas fa-calendar-day text-primary mr-2"></i>
                        <span>{format(new Date(interview.scheduledAt), 'PPP')}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-clock text-primary mr-2"></i>
                        <span>{format(new Date(interview.scheduledAt), 'p')} ({interview.duration} mins)</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <i className="fas fa-map-marker-alt text-primary mr-2"></i>
                        <span>{interview.location || 'No location specified'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditInterview(interview)}
                      >
                        <i className="fas fa-edit mr-1"></i> Edit
                      </Button>
                      <Button size="sm">
                        <i className="fas fa-check-circle mr-1"></i> Complete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-neutral-dark">
                No upcoming interviews scheduled. Click "Schedule Interview" to add one.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="calendar">
          {/* Calendar View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <h3 className="font-medium text-lg mb-4">
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
                
                {selectedDate ? (
                  selectedDateInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {selectedDateInterviews.map((interview) => (
                        <div 
                          key={interview.id}
                          className="p-3 border rounded-md hover:bg-neutral-lightest cursor-pointer"
                          onClick={() => handleEditInterview(interview)}
                        >
                          <div className="flex justify-between">
                            <div>
                              <span className="font-medium">{format(new Date(interview.scheduledAt), 'p')}</span>
                              <span className="text-neutral-dark"> ({interview.duration} mins)</span>
                            </div>
                            <Badge variant={
                              interview.status === "scheduled" ? "default" : 
                              interview.status === "completed" ? "success" : 
                              "destructive"
                            }>
                              {interview.status}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="font-medium">{getCandidateName(interview.applicationId)}</p>
                            <p className="text-sm text-neutral-dark">{getJobTitle(interview.applicationId)}</p>
                          </div>
                          <div className="mt-1 text-sm">
                            <i className="fas fa-map-marker-alt text-primary mr-1"></i>
                            <span>{interview.location || 'No location specified'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-neutral-dark">
                      No interviews scheduled for this date.
                    </div>
                  )
                ) : (
                  <div className="py-12 text-center text-neutral-dark">
                    Select a date to view scheduled interviews.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Interview Modal */}
      <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedInterview ? "Edit Interview" : "Schedule New Interview"}
            </DialogTitle>
            <DialogDescription>
              {selectedInterview 
                ? "Update the interview details below." 
                : "Fill in the details to schedule a new interview."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="applicationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Candidate</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                      disabled={!!selectedInterview}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a candidate" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {applications?.map((application) => {
                          const candidateName = getCandidateName(application.id);
                          const jobTitle = getJobTitle(application.id);
                          return (
                            <SelectItem key={application.id} value={application.id.toString()}>
                              {candidateName} - {jobTitle}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="scheduledAt"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          onChange={(e) => {
                            const date = new Date(e.target.value);
                            field.onChange(date);
                          }}
                          value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" min="15" max="240" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Zoom Meeting URL or Office Room" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any notes or preparation instructions for the interview" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedInterview && (
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interview Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" type="button" onClick={() => setIsInterviewModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={interviewMutation.isPending}>
                  {interviewMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      {selectedInterview ? "Updating..." : "Scheduling..."}
                    </>
                  ) : (
                    selectedInterview ? "Update Interview" : "Schedule Interview"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
