export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  position?: string;
  profileImage?: string;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary?: string;
  requirements?: string;
  status: "open" | "closed" | "paused";
  userId: number;
  createdAt: string | Date;
}

export interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  education?: string;
  experience?: string;
  skills?: string[];
  stage: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  notes?: string;
  createdAt: string | Date;
}

export interface Application {
  id: number;
  candidateId: number;
  jobId: number;
  status: "applied" | "screening" | "interview" | "offer" | "hired" | "rejected";
  coverLetter?: string;
  appliedAt: string | Date;
  updatedAt: string | Date;
}

export interface Interview {
  id: number;
  applicationId: number;
  recruiterId: number;
  scheduledAt: string | Date;
  duration: number;
  location?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface Activity {
  id: number;
  userId: number;
  type: string;
  details: Record<string, any>;
  createdAt: string | Date;
}

export interface DashboardStats {
  activeJobs: number;
  newCandidates: number;
  scheduledInterviews: number;
  hireRate: number;
}

export interface PipelineStats {
  applied: number;
  screening: number;
  interview: number;
  offer: number;
  hired: number;
}

export interface CandidateWithJob extends Candidate {
  job?: Job;
}

export interface JobWithApplicationsCount extends Job {
  applicationsCount: number;
}
