# RECRUITMENT SYSTEM - DATABASE SCHEMA

**Version 1.0**

**Date: May 1, 2025**

---

## TABLE OF CONTENTS

1. [INTRODUCTION](#1-introduction)
2. [DATABASE TABLES](#2-database-tables)
   - [2.1 Users Table](#21-users-table)
   - [2.2 Jobs Table](#22-jobs-table)
   - [2.3 Candidates Table](#23-candidates-table)
   - [2.4 Applications Table](#24-applications-table)
   - [2.5 Interviews Table](#25-interviews-table)
   - [2.6 Activities Table](#26-activities-table)
   - [2.7 Sessions Table](#27-sessions-table)
3. [RELATIONSHIPS](#3-relationships)
4. [INDEXES](#4-indexes)
5. [DATA VALIDATION](#5-data-validation)
6. [SAMPLE QUERIES](#6-sample-queries)

---

## 1. INTRODUCTION

This document provides detailed information about the database schema used in the Recruitment System. The system uses PostgreSQL as its database management system, and Drizzle ORM for database interactions.

## 2. DATABASE TABLES

### 2.1 USERS TABLE

The `users` table stores information about all system users, including administrators, recruiters, and candidates.

**Table Name:** `users`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the user |
| username | TEXT | NOT NULL, UNIQUE | User's login username |
| password | TEXT | NOT NULL | Hashed password for authentication |
| fullName | TEXT | NOT NULL | User's full name |
| email | TEXT | NOT NULL, UNIQUE | User's email address |
| role | TEXT | NOT NULL | User role: "admin", "recruiter", or "candidate" |
| position | TEXT | | User's job position |
| profileImage | TEXT | | URL to user's profile image |
| resume | TEXT | | URL to user's resume (for candidates) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the user account was created |

### 2.2 JOBS TABLE

The `jobs` table stores information about job postings created by recruiters.

**Table Name:** `jobs`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the job |
| title | TEXT | NOT NULL | Job title |
| description | TEXT | NOT NULL | Detailed job description |
| location | TEXT | NOT NULL | Job location |
| salary | TEXT | | Salary range or information |
| requirements | TEXT | | Job requirements |
| status | TEXT | NOT NULL, DEFAULT 'open' | Job status: "open", "closed", "draft" |
| userId | INTEGER | NOT NULL | ID of the recruiter who created the job |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the job was created |

### 2.3 CANDIDATES TABLE

The `candidates` table stores detailed information about candidates in the system.

**Table Name:** `candidates`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the candidate |
| fullName | TEXT | NOT NULL | Candidate's full name |
| email | TEXT | NOT NULL, UNIQUE | Candidate's email address |
| userId | INTEGER | | ID of the associated user account (if registered) |
| phone | TEXT | | Candidate's phone number |
| resumeUrl | TEXT | | URL to candidate's resume file |
| education | TEXT | | Candidate's education information |
| experience | TEXT | | Candidate's professional experience |
| skills | TEXT[] | | Array of candidate's skills |
| stage | TEXT | NOT NULL, DEFAULT 'applied' | Candidate's stage in the recruitment process |
| notes | TEXT | | Recruiter notes about the candidate |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the candidate was created |

### 2.4 APPLICATIONS TABLE

The `applications` table tracks job applications submitted by candidates.

**Table Name:** `applications`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the application |
| userId | INTEGER | NOT NULL | ID of the user who applied |
| jobId | INTEGER | NOT NULL | ID of the job being applied for |
| status | TEXT | NOT NULL, DEFAULT 'applied' | Application status: "applied", "screening", "interview", "offer", "hired", "rejected" |
| coverLetter | TEXT | | Cover letter submitted with the application |
| resume | TEXT | | URL to the resume submitted for this specific application |
| appliedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the application was submitted |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the application was last updated |

### 2.5 INTERVIEWS TABLE

The `interviews` table manages interview scheduling for job applications.

**Table Name:** `interviews`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the interview |
| applicationId | INTEGER | NOT NULL | ID of the associated job application |
| recruiterId | INTEGER | NOT NULL | ID of the recruiter conducting the interview |
| scheduledAt | TIMESTAMP | NOT NULL | Scheduled date and time for the interview |
| duration | INTEGER | NOT NULL | Interview duration in minutes |
| location | TEXT | | Interview location or video call link |
| notes | TEXT | | Interview notes or feedback |
| status | TEXT | NOT NULL, DEFAULT 'scheduled' | Interview status: "scheduled", "completed", "cancelled", "rescheduled" |

### 2.6 ACTIVITIES TABLE

The `activities` table logs important activities in the system for auditing and reporting.

**Table Name:** `activities`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier for the activity |
| userId | INTEGER | NOT NULL | ID of the user who performed the activity |
| type | TEXT | NOT NULL | Type of activity: "job_created", "application_submitted", "status_changed", etc. |
| details | JSONB | NOT NULL | JSON object containing activity details |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when the activity occurred |

### 2.7 SESSIONS TABLE

The `sessions` table manages user sessions for authentication.

**Table Name:** `session`

| Column Name | Data Type | Constraints | Description |
|-------------|-----------|-------------|-------------|
| sid | VARCHAR | PRIMARY KEY | Session ID |
| sess | JSON | NOT NULL | Session data |
| expire | TIMESTAMP | NOT NULL | Expiration time for the session |

## 3. RELATIONSHIPS

The database schema includes the following relationships:

1. **Users and Candidates**:
   - One-to-one relationship: A user with role "candidate" can have one candidate profile.
   - Foreign key: `candidates.userId` references `users.id`

2. **Users and Jobs**:
   - One-to-many relationship: A recruiter user can create multiple jobs.
   - Foreign key: `jobs.userId` references `users.id`

3. **Applications**:
   - Many-to-one relationship with Users: A user can submit multiple applications.
   - Many-to-one relationship with Jobs: A job can receive multiple applications.
   - Foreign keys: 
     - `applications.userId` references `users.id`
     - `applications.jobId` references `jobs.id`

4. **Interviews**:
   - Many-to-one relationship with Applications: An application can have multiple interviews.
   - Many-to-one relationship with Users: A recruiter can conduct multiple interviews.
   - Foreign keys:
     - `interviews.applicationId` references `applications.id`
     - `interviews.recruiterId` references `users.id`

5. **Activities**:
   - Many-to-one relationship with Users: A user can generate multiple activity logs.
   - Foreign key: `activities.userId` references `users.id`

## 4. INDEXES

The following indexes are created to optimize query performance:

1. **Users Table**:
   - Primary key on `id`
   - Unique index on `username`
   - Unique index on `email`
   - Index on `role`

2. **Jobs Table**:
   - Primary key on `id`
   - Index on `userId`
   - Index on `status`
   - Index on `createdAt`

3. **Candidates Table**:
   - Primary key on `id`
   - Unique index on `email`
   - Index on `userId`
   - Index on `stage`

4. **Applications Table**:
   - Primary key on `id`
   - Index on `userId`
   - Index on `jobId`
   - Index on `status`
   - Index on `appliedAt`

5. **Interviews Table**:
   - Primary key on `id`
   - Index on `applicationId`
   - Index on `recruiterId`
   - Index on `scheduledAt`
   - Index on `status`

6. **Activities Table**:
   - Primary key on `id`
   - Index on `userId`
   - Index on `type`
   - Index on `createdAt`

7. **Sessions Table**:
   - Primary key on `sid`
   - Index on `expire`

## 5. DATA VALIDATION

Data validation is implemented at multiple levels:

1. **Database Level**:
   - NOT NULL constraints
   - UNIQUE constraints
   - Default values

2. **Application Level**:
   - Zod schema validation
   - Drizzle ORM type safety
   - Input sanitization

3. **API Level**:
   - Request body validation
   - Parameter validation
   - Authentication and authorization checks

## 6. SAMPLE QUERIES

### Get All Open Jobs
```sql
SELECT * FROM jobs WHERE status = 'open' ORDER BY createdAt DESC;
```

### Get Candidate Applications with Job Details
```sql
SELECT a.*, j.title, j.location
FROM applications a
JOIN jobs j ON a.jobId = j.id
WHERE a.userId = $1
ORDER BY a.appliedAt DESC;
```

### Get Upcoming Interviews for a Recruiter
```sql
SELECT i.*, a.userId, j.title
FROM interviews i
JOIN applications a ON i.applicationId = a.id
JOIN jobs j ON a.jobId = j.id
WHERE i.recruiterId = $1 AND i.status = 'scheduled' AND i.scheduledAt > NOW()
ORDER BY i.scheduledAt;
```

### Get Hiring Pipeline Statistics
```sql
SELECT status, COUNT(*) as count
FROM applications
GROUP BY status;
```

### Get Recent Activities
```sql
SELECT a.*, u.fullName
FROM activities a
JOIN users u ON a.userId = u.id
ORDER BY a.createdAt DESC
LIMIT 10;
```

---

**Prepared by: Database Team**

**Contact: db-support@talentrecruiter.com**