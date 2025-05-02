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
import { db } from "./db";
import { eq, desc, sql, and, or } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";
import { pool } from "./db";

// Keep the IStorage interface as is - no changes needed

// Standard PostgreSQL implementation of DatabaseStorage
export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Don't allow updating password through this method
    const { password, ...updateData } = userData;
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async updateUserPassword(id: number, currentPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    
    // In a real app, proper password comparison would be done here
    if (user.password !== currentPassword) {
      return false;
    }
    
    await db
      .update(users)
      .set({ password: newPassword })
      .where(eq(users.id, id));
      
    return true;
  }
  
  async updateUserSettings(id: number, settings: Record<string, any>): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({ settings: JSON.stringify(settings) })
        .where(eq(users.id, id));
        
      return true;
    } catch (error) {
      console.error("Error updating user settings:", error);
      return false;
    }
  }
  
  async deleteUser(id: number): Promise<boolean> {
    try {
      // Delete related data first (applications, interviews, etc.)
      // Then delete the user
      const [deletedUser] = await db
        .delete(users)
        .where(eq(users.id, id))
        .returning();
        
      return !!deletedUser;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
      
    return user;
  }
  
  // Job methods
  async getJob(id: number): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }
  
  async getAllJobs(): Promise<Job[]> {
    return await db.select().from(jobs);
  }
  
  async getRecentJobs(limit: number): Promise<Job[]> {
    return await db
      .select()
      .from(jobs)
      .orderBy(desc(jobs.createdAt))
      .limit(limit);
  }
  
  async createJob(insertJob: InsertJob): Promise<Job> {
    const [job] = await db
      .insert(jobs)
      .values(insertJob)
      .returning();
      
    return job;
  }
  
  async updateJob(id: number, jobUpdate: Partial<InsertJob>): Promise<Job | undefined> {
    const [updatedJob] = await db
      .update(jobs)
      .set(jobUpdate)
      .where(eq(jobs.id, id))
      .returning();
      
    return updatedJob;
  }
  
  // Candidate methods
  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }
  
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates);
  }
  
  async getCandidatesByStage(stage: string): Promise<Candidate[]> {
    return await db.select().from(candidates).where(eq(candidates.stage, stage));
  }
  
  async getCandidateByUserId(userId: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.userId, userId));
    return candidate;
  }
  
  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
      
    return candidate;
  }
  
  async updateCandidate(id: number, candidateUpdate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updatedCandidate] = await db
      .update(candidates)
      .set(candidateUpdate)
      .where(eq(candidates.id, id))
      .returning();
      
    return updatedCandidate;
  }
  
  // Application methods
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }
  
  async getApplicationsByJob(jobId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.jobId, jobId));
  }
  
  async getApplicationsByUser(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }
  
  async getApplicationsByStage(stage: string): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.status, stage));
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
      
    return application;
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application | undefined> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
      
    return updatedApplication;
  }
  
  // Interview methods
  async getInterview(id: number): Promise<Interview | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }
  
  async getInterviewsByApplication(applicationId: number): Promise<Interview[]> {
    return await db.select().from(interviews).where(eq(interviews.applicationId, applicationId));
  }
  
  async getUpcomingInterviews(limit: number): Promise<Interview[]> {
    return await db
      .select()
      .from(interviews)
      .where(sql`interviews.scheduled_date > NOW()`)
      .orderBy(interviews.scheduledDate)
      .limit(limit);
  }
  
  async createInterview(insertInterview: InsertInterview): Promise<Interview> {
    const [interview] = await db
      .insert(interviews)
      .values(insertInterview)
      .returning();
      
    return interview;
  }
  
  async updateInterview(id: number, interviewUpdate: Partial<InsertInterview>): Promise<Interview | undefined> {
    const [updatedInterview] = await db
      .update(interviews)
      .set(interviewUpdate)
      .where(eq(interviews.id, id))
      .returning();
      
    return updatedInterview;
  }
  
  // Activity methods
  async getActivities(limit: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
      
    return activity;
  }
  
  // Dashboard stats
  async getDashboardStats(): Promise<{
    activeJobs: number;
    newCandidates: number;
    scheduledInterviews: number;
    hireRate: number;
  }> {
    // Get active jobs count
    const activeJobsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobs)
      .where(eq(jobs.status, "open"));
    
    // Get new candidates (last 30 days)
    const newCandidatesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(candidates)
      .where(sql`created_at > NOW() - INTERVAL '30 days'`);
    
    // Get scheduled interviews
    const scheduledInterviewsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(interviews)
      .where(sql`scheduled_date > NOW()`);
    
    // Calculate hire rate
    const totalApplicationsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications);
    
    const hiredApplicationsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "hired"));
    
    const totalApplications = totalApplicationsResult[0]?.count || 0;
    const hiredApplications = hiredApplicationsResult[0]?.count || 0;
    const hireRate = totalApplications > 0 ? (hiredApplications / totalApplications) * 100 : 0;
    
    return {
      activeJobs: activeJobsResult[0]?.count || 0,
      newCandidates: newCandidatesResult[0]?.count || 0,
      scheduledInterviews: scheduledInterviewsResult[0]?.count || 0,
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
    const appliedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "applied"));
    
    const screeningResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "screening"));
    
    const interviewResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "interview"));
    
    const offerResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "offer"));
    
    const hiredResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "hired"));
    
    return {
      applied: appliedResult[0]?.count || 0,
      screening: screeningResult[0]?.count || 0,
      interview: interviewResult[0]?.count || 0,
      offer: offerResult[0]?.count || 0,
      hired: hiredResult[0]?.count || 0
    };
  }
}

export const storage = new DatabaseStorage();