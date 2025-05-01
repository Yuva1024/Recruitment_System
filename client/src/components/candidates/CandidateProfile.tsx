import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Candidate, Application, Job } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface CandidateProfileProps {
  candidate: Candidate;
}

export function CandidateProfile({ candidate }: CandidateProfileProps) {
  const [notes, setNotes] = useState(candidate.notes || "");
  const [selectedStage, setSelectedStage] = useState(candidate.stage);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get candidate's applications
  const { data: applications } = useQuery<Application[]>({
    queryKey: ['/api/applications', { candidateId: candidate.id }],
  });
  
  // Get jobs for applications
  const { data: jobs } = useQuery<Job[]>({
    queryKey: ['/api/jobs'],
    enabled: !!applications && applications.length > 0,
  });
  
  const getJobTitle = (jobId: number) => {
    if (!jobs) return "Loading...";
    const job = jobs.find(j => j.id === jobId);
    return job ? job.title : "Unknown Job";
  };
  
  // Update candidate stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async (newStage: string) => {
      return apiRequest("PATCH", `/api/candidates/${candidate.id}`, { 
        stage: newStage 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/pipeline/stats'] });
      toast({
        title: "Stage updated",
        description: `Candidate moved to ${selectedStage} stage`,
      });
    },
  });
  
  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async (newNotes: string) => {
      return apiRequest("PATCH", `/api/candidates/${candidate.id}`, { 
        notes: newNotes 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/candidates'] });
      toast({
        title: "Notes updated",
        description: "Candidate notes have been saved",
      });
    },
  });
  
  const handleStageChange = (value: string) => {
    setSelectedStage(value as any);
    updateStageMutation.mutate(value);
  };
  
  const handleSaveNotes = () => {
    updateNotesMutation.mutate(notes);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary-light text-white flex items-center justify-center text-2xl font-bold mb-4">
              {candidate.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <h2 className="text-xl font-bold">{candidate.fullName}</h2>
            <p className="text-neutral-dark">
              {candidate.skills?.[0] || 'Candidate'}
            </p>
            
            <div className="mt-4 w-full">
              <Label htmlFor="stage-select" className="mb-2 block">Current Stage</Label>
              <Select value={selectedStage} onValueChange={handleStageChange} disabled={updateStageMutation.isPending}>
                <SelectTrigger id="stage-select" className="w-full">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="screening">Screening</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-6 space-y-3 w-full">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-dark">Email:</span>
                <span className="text-sm font-medium">{candidate.email}</span>
              </div>
              
              {candidate.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-dark">Phone:</span>
                  <span className="text-sm font-medium">{candidate.phone}</span>
                </div>
              )}
              
              {candidate.education && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-dark">Education:</span>
                  <span className="text-sm font-medium">{candidate.education}</span>
                </div>
              )}
              
              {candidate.experience && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-dark">Experience:</span>
                  <span className="text-sm font-medium">{candidate.experience}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-dark">Added:</span>
                <span className="text-sm font-medium">
                  {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
            
            {candidate.resumeUrl && (
              <Button className="mt-4 w-full" variant="outline">
                <i className="fas fa-download mr-2"></i>
                Download Resume
              </Button>
            )}
          </div>
        </div>
        
        <div className="md:w-2/3">
          <Tabs defaultValue="applications">
            <TabsList className="w-full">
              <TabsTrigger value="applications" className="flex-1">Applications</TabsTrigger>
              <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="applications" className="mt-4">
              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{getJobTitle(application.jobId)}</h3>
                            <p className="text-sm text-neutral-dark">
                              Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <Badge variant={
                            application.status === "hired" ? "success" :
                            application.status === "rejected" ? "destructive" :
                            application.status === "offer" ? "warning" :
                            "default"
                          }>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </div>
                        
                        {application.coverLetter && (
                          <div className="mt-2">
                            <h4 className="text-sm font-medium">Cover Letter:</h4>
                            <p className="text-sm mt-1 text-neutral-dark">
                              {application.coverLetter.length > 150 
                                ? `${application.coverLetter.substring(0, 150)}...` 
                                : application.coverLetter}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-neutral-dark">
                  No applications found for this candidate.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="skills" className="mt-4">
              {candidate.skills && candidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="py-2 px-3">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-neutral-dark">
                  No skills listed for this candidate.
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="notes" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Add notes about this candidate"
                  className="min-h-[200px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSaveNotes} 
                    disabled={updateNotesMutation.isPending}
                  >
                    {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
