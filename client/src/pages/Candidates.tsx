import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Candidate } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { CandidateProfile } from "@/components/candidates/CandidateProfile";

export default function Candidates() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const { toast } = useToast();
  
  const { data: candidates, isLoading } = useQuery<Candidate[]>({
    queryKey: ['/api/candidates'],
  });
  
  const handleOpenProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsProfileModalOpen(true);
  };
  
  const filteredCandidates = candidates?.filter(candidate => {
    const matchesSearch = candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (candidate.skills && candidate.skills.some(skill => 
                            skill.toLowerCase().includes(searchTerm.toLowerCase())
                          ));
                         
    const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
    
    return matchesSearch && matchesStage;
  });
  
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      {/* Candidates Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-darkest">Candidates</h2>
          <p className="mt-1 text-sm text-neutral-dark">Manage and track your candidates</p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Button>
            <i className="fas fa-plus -ml-1 mr-2"></i>
            Add Candidate
          </Button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="text-neutral-medium fas fa-search"></i>
            </div>
            <Input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button 
            variant={stageFilter === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={stageFilter === "applied" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("applied")}
          >
            Applied
          </Button>
          <Button 
            variant={stageFilter === "screening" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("screening")}
          >
            Screening
          </Button>
          <Button 
            variant={stageFilter === "interview" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("interview")}
          >
            Interview
          </Button>
          <Button 
            variant={stageFilter === "offer" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("offer")}
          >
            Offer
          </Button>
          <Button 
            variant={stageFilter === "hired" ? "default" : "outline"} 
            size="sm"
            onClick={() => setStageFilter("hired")}
          >
            Hired
          </Button>
        </div>
      </div>
      
      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </>
        ) : filteredCandidates && filteredCandidates.length > 0 ? (
          filteredCandidates.map((candidate) => (
            <Card 
              key={candidate.id} 
              className="overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => handleOpenProfile(candidate)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-light text-white flex items-center justify-center text-lg font-bold">
                    {candidate.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium">{candidate.fullName}</h3>
                    <p className="text-sm text-neutral-dark">{candidate.skills?.[0] || 'Candidate'}</p>
                  </div>
                </div>
                
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-sm text-neutral-dark">
                    <i className="fas fa-envelope mr-2"></i>
                    <span>{candidate.email}</span>
                  </div>
                  
                  {candidate.phone && (
                    <div className="flex items-center text-sm text-neutral-dark">
                      <i className="fas fa-phone mr-2"></i>
                      <span>{candidate.phone}</span>
                    </div>
                  )}
                  
                  {candidate.education && (
                    <div className="flex items-center text-sm text-neutral-dark">
                      <i className="fas fa-university mr-2"></i>
                      <span>{candidate.education}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant={
                    candidate.stage === "hired" ? "success" :
                    candidate.stage === "rejected" ? "destructive" :
                    candidate.stage === "offer" ? "warning" :
                    "default"
                  }>
                    {candidate.stage.charAt(0).toUpperCase() + candidate.stage.slice(1)}
                  </Badge>
                  <span className="text-xs text-neutral-dark">
                    Added {formatDistanceToNow(new Date(candidate.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-neutral-dark">
            {searchTerm || stageFilter !== "all" 
              ? "No candidates match your search criteria." 
              : "No candidates found. Add your first candidate."}
          </div>
        )}
      </div>
      
      {/* Profile Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedCandidate && <CandidateProfile candidate={selectedCandidate} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
