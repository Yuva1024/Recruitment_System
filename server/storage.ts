import {
  users, 
  jobs, 
  candidates, 
  applications, 
  interviews, 
  activities,
  type User, 
  type InsertUser,
  type Job,
  type InsertJob,
  type Candidate,
  type InsertCandidate,
  type Application,
  type InsertApplication,
  type Interview,
  type InsertInterview,
  type Activity,
  type InsertActivity
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Job methods
  getJob(id: number): Promise<Job | undefined>;
  getAllJobs(): Promise<Job[]>;
  getRecentJobs(limit: number): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined>;
  
  // Candidate methods
  getCandidate(id: number): Promise<Candidate | undefined>;
  getAllCandidates(): Promise<Candidate[]>;
  getCandidatesByStage(stage: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  
  // Application methods
  getApplication(id: number): Promise<Application | undefined>;
  getApplicationsByJob(jobId: number): Promise<Application[]>;
  getApplicationsByCandidate(candidateId: number): Promise<Application[]>;
  getApplicationsByStage(stage: string): Promise<Application[]>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application | undefined>;
  
  // Interview methods
  getInterview(id: number): Promise<Interview | undefined>;
  getInterviewsByApplication(applicationId: number): Promise<Interview[]>;
  getUpcomingInterviews(limit: number): Promise<Interview[]>;
  createInterview(interview: InsertInterview): Promise<Interview>;
  updateInterview(id: number, interview: Partial<InsertInterview>): Promise<Interview | undefined>;
  
  // Activity methods
  getActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    activeJobs: number;
    newCandidates: number;
    scheduledInterviews: number;
    hireRate: number;
  }>;
  
  // Pipeline stats
  getPipelineStats(): Promise<{
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private jobs: Map<number, Job>;
  private candidates: Map<number, Candidate>;
  private applications: Map<number, Application>;
  private interviews: Map<number, Interview>;
  private activities: Map<number, Activity>;
  
  private currentUserId: number;
  private currentJobId: number;
  private currentCandidateId: number;
  private currentApplicationId: number;
  private currentInterviewId: number;
  private currentActivityId: number;

  constructor() {
    this.users = new Map();
    this.jobs = new Map();
    this.candidates = new Map();
    this.applications = new Map();
    this.interviews = new Map();
    this.activities = new Map();
    
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentCandidateId = 1;
    this.currentApplicationId = 1;
    this.currentInterviewId = 1;
    this.currentActivityId = 1;
    
    // Initialize with some default data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "candidate",
      position: insertUser.position || null,
      profileImage: insertUser.profileImage || null,
      resume: insertUser.resume || null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    
    // Create activity for user registration
    await this.createActivity({
      userId: id,
      type: "user_registered",
      details: { 
        userId: id, 
        username: user.username,
        role: user.role 
      }
    });
    
    return user;
  }

  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getAllJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values());
  }
  
  async getRecentJobs(limit: number): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createJob(insertJob: InsertJob): Promise<Job> {
    const id = this.currentJobId++;
    const job: Job = { 
      ...insertJob, 
      id, 
      status: insertJob.status || "open",
      salary: insertJob.salary || null,
      requirements: insertJob.requirements || null,
      createdAt: new Date()
    };
    this.jobs.set(id, job);
    
    // Create activity for job creation
    await this.createActivity({
      userId: job.userId,
      type: "job_created",
      details: { jobId: id, jobTitle: job.title }
    });
    
    return job;
  }

  async updateJob(id: number, job: Partial<InsertJob>): Promise<Job | undefined> {
    const existingJob = this.jobs.get(id);
    if (!existingJob) return undefined;
    
    const updatedJob = { ...existingJob, ...job };
    this.jobs.set(id, updatedJob);
    return updatedJob;
  }

  // Candidate methods
  async getCandidate(id: number): Promise<Candidate | undefined> {
    return this.candidates.get(id);
  }

  async getAllCandidates(): Promise<Candidate[]> {
    return Array.from(this.candidates.values());
  }
  
  async getCandidatesByStage(stage: string): Promise<Candidate[]> {
    return Array.from(this.candidates.values())
      .filter(candidate => candidate.stage === stage);
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = this.currentCandidateId++;
    const candidate: Candidate = { 
      ...insertCandidate, 
      id,
      stage: insertCandidate.stage || "applied",
      phone: insertCandidate.phone || null,
      resumeUrl: insertCandidate.resumeUrl || null,
      education: insertCandidate.education || null,
      experience: insertCandidate.experience || null,
      skills: insertCandidate.skills || null,
      notes: insertCandidate.notes || null,
      createdAt: new Date() 
    };
    this.candidates.set(id, candidate);
    
    // Create activity for candidate creation
    await this.createActivity({
      userId: 1, // Default to first user
      type: "candidate_created",
      details: { candidateId: id, candidateName: candidate.fullName }
    });
    
    return candidate;
  }

  async updateCandidate(id: number, candidateUpdate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const existingCandidate = this.candidates.get(id);
    if (!existingCandidate) return undefined;
    
    const oldStage = existingCandidate.stage;
    const updatedCandidate = { ...existingCandidate, ...candidateUpdate };
    this.candidates.set(id, updatedCandidate);
    
    // Create activity for stage change if stage was updated
    if (candidateUpdate.stage && oldStage !== candidateUpdate.stage) {
      await this.createActivity({
        userId: 1, // Default to first user
        type: "candidate_stage_changed",
        details: { 
          candidateId: id, 
          candidateName: updatedCandidate.fullName,
          oldStage,
          newStage: candidateUpdate.stage
        }
      });
    }
    
    return updatedCandidate;
  }

  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.jobId === jobId);
  }

  async getApplicationsByCandidate(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.userId === userId);
  }
  
  async getApplicationsByStage(stage: string): Promise<Application[]> {
    return Array.from(this.applications.values())
      .filter(app => app.status === stage);
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentApplicationId++;
    const application: Application = { 
      ...insertApplication, 
      id, 
      status: insertApplication.status || "applied",
      resume: insertApplication.resume || null,
      coverLetter: insertApplication.coverLetter || null,
      appliedAt: new Date(), 
      updatedAt: new Date() 
    };
    this.applications.set(id, application);
    
    // Create activity
    const job = await this.getJob(application.jobId);
    const user = await this.getUser(application.userId);
    await this.createActivity({
      userId: application.userId,
      type: "application_created",
      details: { 
        applicationId: id, 
        userId: application.userId,
        userName: user?.fullName || "Unknown User",
        jobId: application.jobId,
        jobTitle: job?.title || "Unknown Job"
      }
    });
    
    return application;
  }

  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) return undefined;
    
    const oldStatus = existingApplication.status;
    const updatedApplication = { 
      ...existingApplication, 
      status, 
      updatedAt: new Date() 
    };
    this.applications.set(id, updatedApplication);
    
    // Create activity for status change
    const job = await this.getJob(updatedApplication.jobId);
    const user = await this.getUser(updatedApplication.userId);
    await this.createActivity({
      userId: 1, // Default to first user (recruiter)
      type: "application_status_changed",
      details: { 
        applicationId: id, 
        userId: updatedApplication.userId,
        userName: user?.fullName || "Unknown User",
        jobId: updatedApplication.jobId,
        jobTitle: job?.title || "Unknown Job",
        oldStatus,
        newStatus: status
      }
    });
    
    return updatedApplication;
  }

  // Interview methods
  async getInterview(id: number): Promise<Interview | undefined> {
    return this.interviews.get(id);
  }

  async getInterviewsByApplication(applicationId: number): Promise<Interview[]> {
    return Array.from(this.interviews.values())
      .filter(interview => interview.applicationId === applicationId);
  }
  
  async getUpcomingInterviews(limit: number): Promise<Interview[]> {
    const now = new Date();
    return Array.from(this.interviews.values())
      .filter(interview => new Date(interview.scheduledAt) > now && interview.status === "scheduled")
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
      .slice(0, limit);
  }

  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const id = this.currentInterviewId++;
    const interview: Interview = { 
      ...insertInterview, 
      id,
      status: insertInterview.status || "scheduled",
      location: insertInterview.location || null,
      notes: insertInterview.notes || null
    };
    this.interviews.set(id, interview);
    
    // Create activity
    const application = await this.getApplication(interview.applicationId);
    const user = application ? await this.getUser(application.userId) : undefined;
    const job = application ? await this.getJob(application.jobId) : undefined;
    
    await this.createActivity({
      userId: interview.recruiterId,
      type: "interview_scheduled",
      details: { 
        interviewId: id, 
        applicationId: interview.applicationId,
        userId: user?.id,
        userName: user?.fullName || "Unknown User",
        jobId: job?.id,
        jobTitle: job?.title || "Unknown Job",
        scheduledAt: interview.scheduledAt
      }
    });
    
    return interview;
  }

  async updateInterview(id: number, interviewUpdate: Partial<InsertInterview>): Promise<Interview | undefined> {
    const existingInterview = this.interviews.get(id);
    if (!existingInterview) return undefined;
    
    const updatedInterview = { ...existingInterview, ...interviewUpdate };
    this.interviews.set(id, updatedInterview);
    
    // Create activity if status changed
    if (interviewUpdate.status && interviewUpdate.status !== existingInterview.status) {
      const application = await this.getApplication(updatedInterview.applicationId);
      const user = application ? await this.getUser(application.userId) : undefined;
      
      await this.createActivity({
        userId: updatedInterview.recruiterId,
        type: "interview_status_changed",
        details: { 
          interviewId: id, 
          userId: user?.id,
          userName: user?.fullName || "Unknown User",
          oldStatus: existingInterview.status,
          newStatus: interviewUpdate.status
        }
      });
    }
    
    return updatedInterview;
  }

  // Activity methods
  async getActivities(limit: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date() 
    };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    activeJobs: number;
    newCandidates: number;
    scheduledInterviews: number;
    hireRate: number;
  }> {
    const activeJobs = Array.from(this.jobs.values())
      .filter(job => job.status === "open").length;
    
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newCandidates = Array.from(this.candidates.values())
      .filter(candidate => 
        new Date(candidate.createdAt) >= oneWeekAgo && 
        new Date(candidate.createdAt) <= now
      ).length;
    
    const scheduledInterviews = Array.from(this.interviews.values())
      .filter(interview => interview.status === "scheduled").length;
    
    const totalApplications = this.applications.size;
    const hiredApplications = Array.from(this.applications.values())
      .filter(app => app.status === "hired").length;
    
    const hireRate = totalApplications > 0 
      ? Math.round((hiredApplications / totalApplications) * 100 * 10) / 10 
      : 0;
    
    return {
      activeJobs,
      newCandidates,
      scheduledInterviews,
      hireRate
    };
  }
  
  // Pipeline stats
  async getPipelineStats(): Promise<{
    applied: number;
    screening: number;
    interview: number;
    offer: number;
    hired: number;
  }> {
    const applied = Array.from(this.applications.values())
      .filter(app => app.status === "applied").length;
      
    const screening = Array.from(this.applications.values())
      .filter(app => app.status === "screening").length;
      
    const interview = Array.from(this.applications.values())
      .filter(app => app.status === "interview").length;
      
    const offer = Array.from(this.applications.values())
      .filter(app => app.status === "offer").length;
      
    const hired = Array.from(this.applications.values())
      .filter(app => app.status === "hired").length;
    
    return {
      applied,
      screening,
      interview,
      offer,
      hired
    };
  }
  
  private seedData() {
    // Create default admin user
    const admin: InsertUser = {
      username: "admin",
      password: "password",
      fullName: "Sarah Johnson",
      email: "sarah@example.com",
      role: "recruiter",
      position: "Senior Recruiter",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    };
    this.createUser(admin);
    
    // Create some initial jobs
    const job1: InsertJob = {
      title: "Senior Frontend Developer",
      description: "We're looking for an experienced frontend developer to join our team.",
      location: "San Francisco, CA (Remote)",
      salary: "$120,000 - $150,000",
      requirements: "5+ years of experience with React, TypeScript, and modern frontend tools.",
      status: "open",
      userId: 1
    };
    
    const job2: InsertJob = {
      title: "Product Manager",
      description: "Lead product development and strategy for our core platform.",
      location: "New York, NY",
      salary: "$130,000 - $160,000",
      requirements: "3+ years of product management experience in SaaS products.",
      status: "open",
      userId: 1
    };
    
    const job3: InsertJob = {
      title: "UX/UI Designer",
      description: "Design beautiful and intuitive user interfaces for our products.",
      location: "Austin, TX (Hybrid)",
      salary: "$90,000 - $120,000",
      requirements: "Portfolio showcasing UI/UX projects and 2+ years of experience.",
      status: "open",
      userId: 1
    };
    
    // Create jobs
    this.createJob(job1);
    this.createJob(job2);
    this.createJob(job3);
    
    // Create sample candidates
    const candidate1: InsertCandidate = {
      fullName: "Michael Rodriguez",
      email: "michael@example.com",
      phone: "555-123-4567",
      education: "Computer Science, MIT",
      experience: "5 years experience",
      skills: ["JavaScript", "React", "TypeScript"],
      stage: "applied",
      notes: "Strong technical background"
    };
    
    const candidate2: InsertCandidate = {
      fullName: "Emily Chen",
      email: "emily@example.com",
      phone: "555-987-6543",
      education: "MBA, Stanford",
      experience: "7 years experience",
      skills: ["Product Strategy", "User Research", "Agile"],
      stage: "applied",
      notes: "Great communication skills"
    };
    
    const candidate3: InsertCandidate = {
      fullName: "Thomas Wilson",
      email: "thomas@example.com",
      phone: "555-456-7890",
      education: "Computer Engineering, Berkeley",
      experience: "4 years experience",
      skills: ["Node.js", "AWS", "MongoDB"],
      stage: "screening",
      notes: "Strong backend experience"
    };
    
    const candidate4: InsertCandidate = {
      fullName: "Jessica Parker",
      email: "jessica@example.com",
      phone: "555-789-0123",
      education: "Design, RISD",
      experience: "6 years experience",
      skills: ["Figma", "Adobe XD", "UI Design"],
      stage: "interview",
      notes: "Impressive portfolio"
    };
    
    const candidate5: InsertCandidate = {
      fullName: "David Nguyen",
      email: "david@example.com",
      phone: "555-234-5678",
      education: "PhD Statistics, Harvard",
      experience: "3 years experience",
      skills: ["Python", "Machine Learning", "Data Visualization"],
      stage: "offer",
      notes: "Strong analytical skills"
    };
    
    const candidate6: InsertCandidate = {
      fullName: "Alicia Moore",
      email: "alicia@example.com",
      phone: "555-345-6789",
      education: "Marketing, Northwestern",
      experience: "8 years experience",
      skills: ["SEO", "Content Strategy", "Analytics"],
      stage: "hired",
      notes: "Great leadership potential"
    };
    
    // Create candidates
    this.createCandidate(candidate1);
    this.createCandidate(candidate2);
    this.createCandidate(candidate3);
    this.createCandidate(candidate4);
    this.createCandidate(candidate5);
    this.createCandidate(candidate6);
    
    // Create candidate users
    const candidateUser1: InsertUser = {
      username: "michael",
      password: "password",
      fullName: "Michael Rodriguez",
      email: "michael@example.com",
      role: "candidate"
    };
    
    const candidateUser2: InsertUser = {
      username: "emily",
      password: "password",
      fullName: "Emily Chen",
      email: "emily@example.com",
      role: "candidate"
    };
    
    const candidateUser3: InsertUser = {
      username: "thomas",
      password: "password",
      fullName: "Thomas Wilson",
      email: "thomas@example.com",
      role: "candidate"
    };
    
    const candidateUser4: InsertUser = {
      username: "jessica",
      password: "password",
      fullName: "Jessica Parker",
      email: "jessica@example.com",
      role: "candidate"
    };
    
    const candidateUser5: InsertUser = {
      username: "david",
      password: "password",
      fullName: "David Nguyen",
      email: "david@example.com",
      role: "candidate"
    };
    
    const candidateUser6: InsertUser = {
      username: "alicia",
      password: "password",
      fullName: "Alicia Moore",
      email: "alicia@example.com",
      role: "candidate"
    };
    
    const user2 = this.createUser(candidateUser1);
    const user3 = this.createUser(candidateUser2);
    const user4 = this.createUser(candidateUser3);
    const user5 = this.createUser(candidateUser4);
    const user6 = this.createUser(candidateUser5);
    const user7 = this.createUser(candidateUser6);
    
    // Create applications
    const application1: InsertApplication = {
      userId: 2,
      jobId: 1,
      status: "applied",
      coverLetter: "I'm excited to apply for this position..."
    };
    
    const application2: InsertApplication = {
      userId: 3,
      jobId: 2,
      status: "applied",
      coverLetter: "With my background in product management..."
    };
    
    const application3: InsertApplication = {
      userId: 4,
      jobId: 1,
      status: "screening",
      coverLetter: "I believe my backend skills would complement..."
    };
    
    const application4: InsertApplication = {
      userId: 5,
      jobId: 3,
      status: "interview",
      coverLetter: "My design background makes me a perfect fit..."
    };
    
    const application5: InsertApplication = {
      userId: 6,
      jobId: 1,
      status: "offer",
      coverLetter: "I'm interested in applying my data science skills..."
    };
    
    const application6: InsertApplication = {
      userId: 7,
      jobId: 2,
      status: "hired",
      coverLetter: "I'm looking forward to bringing my marketing expertise..."
    };
    
    // Create applications
    this.createApplication(application1);
    this.createApplication(application2);
    this.createApplication(application3);
    this.createApplication(application4);
    this.createApplication(application5);
    this.createApplication(application6);
    
    // Create interview
    const interview1: InsertInterview = {
      applicationId: 4,
      recruiterId: 1,
      scheduledAt: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      duration: 60,
      location: "Zoom Meeting",
      notes: "Focus on design process and portfolio review",
      status: "scheduled"
    };
    
    this.createInterview(interview1);
  }
}

export const storage = new MemStorage();
