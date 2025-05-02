import { useQuery } from "@tanstack/react-query";
import { Candidate, PipelineStats } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { CandidateProfile } from "../candidates/CandidateProfile";

const stages = [
  { key: "applied", label: "Applied" },
  { key: "screening", label: "Screening" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "hired", label: "Hired" }
];

export function RecruitmentPipeline() {
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  
  const { data: stats, isLoading: statsLoading } = useQuery<PipelineStats>({
    queryKey: ['/api/pipeline/stats'],
  });
  
  const candidatesQueries = stages.map(stage => {
    return useQuery<Candidate[]>({
      queryKey: ['/api/candidates', { stage: stage.key }],
    });
  });

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  return (
    <>
      <Card className="mb-6 overflow-hidden">
        <CardHeader className="px-4 py-5 border-b border-neutral-light sm:px-6">
          <CardTitle>Recruitment Pipeline</CardTitle>
          <CardDescription>Track candidates through your hiring process</CardDescription>
        </CardHeader>
        
        <CardContent className="px-4 py-5 sm:p-6 overflow-x-auto hide-scrollbar">
          <div className="flex flex-col md:flex-row justify-between min-w-max space-y-4 md:space-y-0 md:space-x-4">
            {stages.map((stage, stageIndex) => (
              <div 
                key={stage.key}
                className={`pipeline-stage relative bg-neutral-lightest rounded-lg p-4 flex-1 min-w-[250px] ${stageIndex === stages.length - 1 ? '' : 'after:content-[""] after:absolute after:top-1/2 after:right-[-16px] after:w-[32px] after:h-[2px] after:bg-neutral-light md:after:block after:hidden'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-neutral-darkest">{stage.label}</h4>
                  {statsLoading ? (
                    <Skeleton className="h-6 w-10" />
                  ) : (
                    <Badge variant="default" className="bg-primary-light">
                      {stats?.[stage.key as keyof PipelineStats] ?? 0}
                    </Badge>
                  )}
                </div>
                
                {candidatesQueries[stageIndex].isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : candidatesQueries[stageIndex].data?.length === 0 ? (
                  <div className="text-center py-8 text-neutral-dark text-sm">
                    No candidates in this stage
                  </div>
                ) : (
                  <>
                    {candidatesQueries[stageIndex].data?.slice(0, 2).map((candidate) => (
                      <div 
                        key={candidate.id}
                        className="candidate-card bg-white p-3 rounded shadow-sm mb-3 transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-md"
                        onClick={() => handleCardClick(candidate)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-primary-light text-white flex items-center justify-center">
                              {candidate.fullName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="ml-3">
                              <h5 className="text-sm font-medium text-neutral-darkest">{candidate.fullName}</h5>
                              <p className="text-xs text-neutral-dark">{candidate.skills?.[0] || 'Candidate'}</p>
                            </div>
                          </div>
                          <span className="text-xs text-neutral-dark">
                            {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="mt-2">
                          {candidate.education && (
                            <div className="flex items-center text-xs text-neutral-dark">
                              <i className="fas fa-university mr-1"></i>
                              <span>{candidate.education}</span>
                            </div>
                          )}
                          {candidate.experience && (
                            <div className="flex items-center mt-1 text-xs text-neutral-dark">
                              <i className="fas fa-briefcase mr-1"></i>
                              <span>{candidate.experience}</span>
                            </div>
                          )}
                        </div>
                        
                        {stage.key === "interview" && (
                          <div className="mt-2 px-2 py-1 bg-info bg-opacity-10 text-info text-xs rounded-md inline-flex items-center">
                            <i className="fas fa-calendar-alt mr-1"></i>
                            <span>Upcoming Interview</span>
                          </div>
                        )}
                        
                        {stage.key === "offer" && (
                          <div className="mt-2 px-2 py-1 bg-warning bg-opacity-10 text-warning text-xs rounded-md inline-flex items-center">
                            <i className="fas fa-clock mr-1"></i>
                            <span>Awaiting response</span>
                          </div>
                        )}
                        
                        {stage.key === "hired" && (
                          <div className="mt-2 px-2 py-1 bg-success bg-opacity-10 text-success text-xs rounded-md inline-flex items-center">
                            <i className="fas fa-check-circle mr-1"></i>
                            <span>Start date scheduled</span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(candidatesQueries[stageIndex].data?.length ?? 0) > 2 && (
                      <Button 
                        variant="link" 
                        className="w-full text-center text-sm text-primary hover:text-primary-dark pt-2"
                      >
                        Show more
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate Profile</DialogTitle>
            <DialogDescription>
              View candidate information and manage their application status
            </DialogDescription>
          </DialogHeader>
          
          {selectedCandidate && <CandidateProfile candidate={selectedCandidate} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
