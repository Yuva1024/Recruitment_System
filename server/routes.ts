import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertJobSchema, insertCandidateSchema, insertApplicationSchema, insertInterviewSchema, User } from "@shared/schema";
import multer from "multer";
import fs from "fs";
import path from "path";
import { setupAuth } from "./auth";
// Helper middleware for checking if the user is a recruiter or admin
function recruitersOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as User;
  if (user.role !== "recruiter" && user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Recruiter role required." });
  }
  
  next();
}

// Helper middleware to check if the user is a candidate or admin
function candidatesOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as User;
  if (user.role !== "candidate" && user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Candidate role required." });
  }
  
  next();
}

// Helper middleware to check if the user is an admin
function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  const user = req.user as User;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Administrator role required." });
  }
  
  next();
}

// Helper middleware to check if a user is logged in
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadsDir = path.join(import.meta.dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)){
          fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  
  // Health check
  app.get("/api/health", (req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  // Jobs endpoints
  app.get("/api/jobs", async (req: Request, res: Response) => {
    try {
      const jobs = await storage.getAllJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/recent", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const jobs = await storage.getRecentJobs(limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", recruitersOnly, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      
      // Validate request body
      const validatedData = insertJobSchema.parse({
        ...req.body,
        userId: user.id // Ensure the job is created by the current user
      });
      
      // Create job
      const job = await storage.createJob(validatedData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.patch("/api/jobs/:id", recruitersOnly, async (req: Request, res: Response) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Validate request body
      const validatedData = insertJobSchema.partial().parse(req.body);
      
      // Update job
      const updatedJob = await storage.updateJob(jobId, validatedData);
      res.json(updatedJob);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update job" });
    }
  });

  // Candidates endpoints
  app.get("/api/candidates", async (req: Request, res: Response) => {
    try {
      let candidates;
      
      if (req.query.stage) {
        candidates = await storage.getCandidatesByStage(req.query.stage as string);
      } else {
        candidates = await storage.getAllCandidates();
      }
      
      res.json(candidates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.get("/api/candidates/:id", async (req: Request, res: Response) => {
    try {
      const candidateId = parseInt(req.params.id);
      const candidate = await storage.getCandidate(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  app.post("/api/candidates", upload.single('resume'), async (req: Request, res: Response) => {
    try {
      let resumeUrl = null;
      let extractedText = "";
      
      // Handle resume file if uploaded
      if (req.file) {
        resumeUrl = `/uploads/${req.file.filename}`;
        
        // In a real app, we would extract text from the PDF and parse for skills
        // For now, we'll use a simpler approach without PDF parsing
        
        // Example skills detection from filename if skills not provided
        if (!req.body.skills) {
          const filename = req.file.originalname.toLowerCase();
          const commonSkills = ["JavaScript", "React", "TypeScript", "Node.js", "Python", "Java", 
            "Angular", "Vue", "AWS", "Docker", "Kubernetes", "SQL", "NoSQL", "MongoDB", 
            "Leadership", "Communication", "Project Management", "Agile", "Scrum"];
          
          const foundSkills = commonSkills.filter(skill => 
            filename.toLowerCase().includes(skill.toLowerCase())
          );
          
          if (foundSkills.length > 0) {
            req.body.skills = foundSkills;
          }
        }
      }
      
      // Add resume URL to the request body
      if (resumeUrl) {
        req.body.resumeUrl = resumeUrl;
      }
      
      // Parse skills array if it comes as a string
      if (typeof req.body.skills === 'string') {
        try {
          req.body.skills = JSON.parse(req.body.skills);
        } catch (e) {
          req.body.skills = req.body.skills.split(',').map((s: string) => s.trim());
        }
      }
      
      // Validate request body
      const validatedData = insertCandidateSchema.parse(req.body);
      
      // Create candidate
      const candidate = await storage.createCandidate(validatedData);
      res.status(201).json(candidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  app.patch("/api/candidates/:id", upload.single('resume'), async (req: Request, res: Response) => {
    try {
      const candidateId = parseInt(req.params.id);
      const candidate = await storage.getCandidate(candidateId);
      
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      // Handle resume file if uploaded
      if (req.file) {
        req.body.resumeUrl = `/uploads/${req.file.filename}`;
      }
      
      // Parse skills array if it comes as a string
      if (typeof req.body.skills === 'string') {
        try {
          req.body.skills = JSON.parse(req.body.skills);
        } catch (e) {
          req.body.skills = req.body.skills.split(',').map((s: string) => s.trim());
        }
      }
      
      // Validate request body
      const validatedData = insertCandidateSchema.partial().parse(req.body);
      
      // Update candidate
      const updatedCandidate = await storage.updateCandidate(candidateId, validatedData);
      res.json(updatedCandidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid candidate data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update candidate" });
    }
  });

  // Applications endpoints
  app.get("/api/applications", async (req: Request, res: Response) => {
    try {
      let applications = [];
      
      if (req.query.jobId) {
        applications = await storage.getApplicationsByJob(parseInt(req.query.jobId as string));
      } else if (req.query.userId) {
        applications = await storage.getApplicationsByUser(parseInt(req.query.userId as string));
      } else if (req.query.stage) {
        applications = await storage.getApplicationsByStage(req.query.stage as string);
      } else {
        return res.status(400).json({ message: "Please provide a query parameter (jobId, userId, or stage)" });
      }
      
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertApplicationSchema.parse(req.body);
      
      // Create application
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid application data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.patch("/api/applications/:id/status", async (req: Request, res: Response) => {
    try {
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      // Update application status
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      
      if (!updatedApplication) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(updatedApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application status" });
    }
  });

  // Interviews endpoints
  app.get("/api/interviews", async (req: Request, res: Response) => {
    try {
      let interviews = [];
      
      if (req.query.applicationId) {
        interviews = await storage.getInterviewsByApplication(parseInt(req.query.applicationId as string));
      } else if (req.query.upcoming) {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
        interviews = await storage.getUpcomingInterviews(limit);
      } else {
        return res.status(400).json({ message: "Please provide a query parameter (applicationId or upcoming)" });
      }
      
      res.json(interviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interviews" });
    }
  });

  app.post("/api/interviews", async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = insertInterviewSchema.parse(req.body);
      
      // Create interview
      const interview = await storage.createInterview(validatedData);
      res.status(201).json(interview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create interview" });
    }
  });

  app.patch("/api/interviews/:id", async (req: Request, res: Response) => {
    try {
      const interviewId = parseInt(req.params.id);
      
      // Validate request body
      const validatedData = insertInterviewSchema.partial().parse(req.body);
      
      // Update interview
      const updatedInterview = await storage.updateInterview(interviewId, validatedData);
      
      if (!updatedInterview) {
        return res.status(404).json({ message: "Interview not found" });
      }
      
      res.json(updatedInterview);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid interview data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update interview" });
    }
  });

  // Activities endpoint
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Pipeline stats endpoint
  app.get("/api/pipeline/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getPipelineStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pipeline stats" });
    }
  });

  // Admin endpoints
  app.get("/api/admin/users", adminOnly, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.delete("/api/admin/users/:id", adminOnly, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const success = await storage.deleteUser(userId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.get("/api/admin/activities", adminOnly, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Candidate by user ID endpoint (for settings page)
  app.get("/api/candidates/user/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = req.user as User;
      
      // Only allow users to fetch their own data or admins to fetch any data
      if (user.id !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const candidate = await storage.getCandidateByUserId(userId);
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found" });
      }
      
      res.json(candidate);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch candidate" });
    }
  });

  // User profile update endpoint
  app.patch("/api/users/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Only allow users to update their own data or admins to update any data
      if (user.id !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const { password, ...profileData } = req.body;
      const updatedUser = await storage.updateUser(userId, profileData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Change password endpoint
  app.patch("/api/users/:id/account", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Only allow users to update their own data or admins to update any data
      if (user.id !== userId && user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (req.body.newPassword) {
        // Password change logic
        const success = await storage.updateUserPassword(
          userId, 
          req.body.currentPassword, 
          req.body.newPassword
        );
        
        if (!success) {
          return res.status(400).json({ message: "Invalid current password" });
        }
      }
      
      // Update other account settings
      const accountSettings = {
        notifications: req.body.notifications
      };
      
      await storage.updateUserSettings(userId, accountSettings);
      
      res.json({ message: "Account settings updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update account settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
