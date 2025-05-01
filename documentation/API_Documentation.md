# RECRUITMENT SYSTEM - API DOCUMENTATION

**Version 1.0**

**Date: May 1, 2025**

---

## TABLE OF CONTENTS

1. [INTRODUCTION](#1-introduction)
2. [AUTHENTICATION](#2-authentication)
3. [ERROR HANDLING](#3-error-handling)
4. [USER ENDPOINTS](#4-user-endpoints)
5. [JOB ENDPOINTS](#5-job-endpoints)
6. [CANDIDATE ENDPOINTS](#6-candidate-endpoints)
7. [APPLICATION ENDPOINTS](#7-application-endpoints)
8. [INTERVIEW ENDPOINTS](#8-interview-endpoints)
9. [ANALYTICS ENDPOINTS](#9-analytics-endpoints)
10. [ADMIN ENDPOINTS](#10-admin-endpoints)

---

## 1. INTRODUCTION

This document provides detailed information about the RESTful API endpoints available in the Recruitment System. The API is built using Express.js and follows RESTful conventions.

### Base URL

All API endpoints are relative to the base URL:

```
https://yourdomain.com/api
```

### Request Format

Unless otherwise specified, request bodies should be sent as JSON with the appropriate `Content-Type` header:

```
Content-Type: application/json
```

### Response Format

All responses are returned in JSON format. A typical successful response has the following structure:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Example",
      ...
    }
  ]
}
```

Error responses have the following structure:

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "username",
      "message": "Username is required"
    }
  ]
}
```

## 2. AUTHENTICATION

The API uses session-based authentication with Passport.js.

### Authentication Endpoints

#### Register a New User

**Endpoint:** `POST /register`

**Description:** Creates a new user account.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "candidate"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "candidate",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

#### Log In

**Endpoint:** `POST /login`

**Description:** Authenticates a user and creates a session.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "candidate",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

#### Log Out

**Endpoint:** `POST /logout`

**Description:** Ends the current user session.

**Response:**

```
HTTP/1.1 200 OK
```

#### Get Current User

**Endpoint:** `GET /user`

**Description:** Retrieves the currently authenticated user.

**Response:**

```json
{
  "id": 1,
  "username": "johndoe",
  "fullName": "John Doe",
  "email": "john@example.com",
  "role": "candidate",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

## 3. ERROR HANDLING

The API uses standard HTTP status codes to indicate the success or failure of requests:

- **200 OK**: The request was successful.
- **201 Created**: A new resource was created successfully.
- **400 Bad Request**: The request was malformed or contained invalid data.
- **401 Unauthorized**: Authentication is required or failed.
- **403 Forbidden**: The authenticated user does not have permission to access the resource.
- **404 Not Found**: The requested resource was not found.
- **500 Internal Server Error**: An unexpected error occurred on the server.

## 4. USER ENDPOINTS

### Update User Profile

**Endpoint:** `PATCH /users/:id`

**Description:** Updates a user's profile information.

**Authentication:** Required

**Authorization:** User can only update their own profile unless they are an admin.

**Request Body:**

```json
{
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "position": "Software Engineer"
}
```

**Response:**

```json
{
  "id": 1,
  "username": "johndoe",
  "fullName": "John Smith",
  "email": "john.smith@example.com",
  "role": "candidate",
  "position": "Software Engineer",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

### Update User Password

**Endpoint:** `PATCH /users/:id/account`

**Description:** Updates a user's password.

**Authentication:** Required

**Authorization:** User can only update their own password unless they are an admin.

**Request Body:**

```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

**Response:**

```
HTTP/1.1 200 OK
```

## 5. JOB ENDPOINTS

### Get All Jobs

**Endpoint:** `GET /jobs`

**Description:** Retrieves all job listings.

**Authentication:** Not required

**Response:**

```json
[
  {
    "id": 1,
    "title": "Senior Frontend Developer",
    "description": "...",
    "location": "Remote",
    "salary": "$120,000 - $150,000",
    "requirements": "...",
    "status": "open",
    "userId": 2,
    "createdAt": "2025-05-01T12:00:00Z"
  },
  ...
]
```

### Get a Job

**Endpoint:** `GET /jobs/:id`

**Description:** Retrieves a specific job listing.

**Authentication:** Not required

**Response:**

```json
{
  "id": 1,
  "title": "Senior Frontend Developer",
  "description": "...",
  "location": "Remote",
  "salary": "$120,000 - $150,000",
  "requirements": "...",
  "status": "open",
  "userId": 2,
  "createdAt": "2025-05-01T12:00:00Z"
}
```

### Get Recent Jobs

**Endpoint:** `GET /jobs/recent`

**Description:** Retrieves recently posted jobs.

**Authentication:** Not required

**Query Parameters:**

- `limit`: Maximum number of jobs to return (default: 5)

**Response:**

```json
[
  {
    "id": 3,
    "title": "Product Manager",
    "description": "...",
    "location": "San Francisco, CA",
    "salary": "$140,000 - $180,000",
    "requirements": "...",
    "status": "open",
    "userId": 2,
    "createdAt": "2025-05-01T12:00:00Z"
  },
  ...
]
```

### Create a Job

**Endpoint:** `POST /jobs`

**Description:** Creates a new job listing.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Request Body:**

```json
{
  "title": "DevOps Engineer",
  "description": "We are looking for a skilled DevOps engineer...",
  "location": "Remote",
  "salary": "$110,000 - $140,000",
  "requirements": "Kubernetes, Docker, CI/CD, 3+ years experience",
  "status": "open"
}
```

**Response:**

```json
{
  "id": 4,
  "title": "DevOps Engineer",
  "description": "We are looking for a skilled DevOps engineer...",
  "location": "Remote",
  "salary": "$110,000 - $140,000",
  "requirements": "Kubernetes, Docker, CI/CD, 3+ years experience",
  "status": "open",
  "userId": 2,
  "createdAt": "2025-05-01T13:00:00Z"
}
```

### Update a Job

**Endpoint:** `PATCH /jobs/:id`

**Description:** Updates an existing job listing.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required, and user must be the job creator or an admin

**Request Body:**

```json
{
  "title": "Senior DevOps Engineer",
  "salary": "$130,000 - $160,000",
  "status": "open"
}
```

**Response:**

```json
{
  "id": 4,
  "title": "Senior DevOps Engineer",
  "description": "We are looking for a skilled DevOps engineer...",
  "location": "Remote",
  "salary": "$130,000 - $160,000",
  "requirements": "Kubernetes, Docker, CI/CD, 3+ years experience",
  "status": "open",
  "userId": 2,
  "createdAt": "2025-05-01T13:00:00Z"
}
```

## 6. CANDIDATE ENDPOINTS

### Get All Candidates

**Endpoint:** `GET /candidates`

**Description:** Retrieves all candidate profiles.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Query Parameters:**

- `stage`: Filter candidates by stage (optional)

**Response:**

```json
[
  {
    "id": 1,
    "fullName": "John Doe",
    "email": "john@example.com",
    "userId": 3,
    "phone": "555-123-4567",
    "resumeUrl": "/uploads/resume-123.pdf",
    "education": "Bachelor's in Computer Science",
    "experience": "5 years as a software developer",
    "skills": ["JavaScript", "React", "Node.js"],
    "stage": "screening",
    "notes": "Strong frontend skills",
    "createdAt": "2025-05-01T12:00:00Z"
  },
  ...
]
```

### Get a Candidate

**Endpoint:** `GET /candidates/:id`

**Description:** Retrieves a specific candidate profile.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Response:**

```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "userId": 3,
  "phone": "555-123-4567",
  "resumeUrl": "/uploads/resume-123.pdf",
  "education": "Bachelor's in Computer Science",
  "experience": "5 years as a software developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "stage": "screening",
  "notes": "Strong frontend skills",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

### Get Candidate by User ID

**Endpoint:** `GET /candidates/user/:userId`

**Description:** Retrieves a candidate profile by user ID.

**Authentication:** Required

**Authorization:** User can only view their own candidate profile unless they are a recruiter or admin

**Response:**

```json
{
  "id": 1,
  "fullName": "John Doe",
  "email": "john@example.com",
  "userId": 3,
  "phone": "555-123-4567",
  "resumeUrl": "/uploads/resume-123.pdf",
  "education": "Bachelor's in Computer Science",
  "experience": "5 years as a software developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "stage": "screening",
  "notes": "Strong frontend skills",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

### Create a Candidate

**Endpoint:** `POST /candidates`

**Description:** Creates a new candidate profile.

**Authentication:** Required

**Request Body:**

```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "userId": 4,
  "phone": "555-987-6543",
  "education": "Master's in Computer Science",
  "experience": "3 years as a data scientist",
  "skills": ["Python", "Machine Learning", "Data Analysis"],
  "stage": "applied"
}
```

**Additional Notes:**

- This endpoint accepts multipart/form-data for resume file uploads
- File field name: `resume`
- Maximum file size: 5MB
- Accepted file types: PDF

**Response:**

```json
{
  "id": 2,
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "userId": 4,
  "phone": "555-987-6543",
  "resumeUrl": "/uploads/resume-456.pdf",
  "education": "Master's in Computer Science",
  "experience": "3 years as a data scientist",
  "skills": ["Python", "Machine Learning", "Data Analysis"],
  "stage": "applied",
  "notes": null,
  "createdAt": "2025-05-01T14:00:00Z"
}
```

### Update a Candidate

**Endpoint:** `PATCH /candidates/:id`

**Description:** Updates an existing candidate profile.

**Authentication:** Required

**Authorization:** User can only update their own candidate profile unless they are a recruiter or admin

**Request Body:**

```json
{
  "phone": "555-111-2222",
  "education": "PhD in Computer Science",
  "skills": ["Python", "Machine Learning", "Data Analysis", "Deep Learning"]
}
```

**Additional Notes:**

- This endpoint accepts multipart/form-data for resume file uploads
- File field name: `resume`
- Maximum file size: 5MB
- Accepted file types: PDF

**Response:**

```json
{
  "id": 2,
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "userId": 4,
  "phone": "555-111-2222",
  "resumeUrl": "/uploads/resume-456.pdf",
  "education": "PhD in Computer Science",
  "experience": "3 years as a data scientist",
  "skills": ["Python", "Machine Learning", "Data Analysis", "Deep Learning"],
  "stage": "applied",
  "notes": null,
  "createdAt": "2025-05-01T14:00:00Z"
}
```

## 7. APPLICATION ENDPOINTS

### Get Applications

**Endpoint:** `GET /applications`

**Description:** Retrieves job applications.

**Authentication:** Required

**Query Parameters (one required):**

- `jobId`: Filter applications by job ID
- `userId`: Filter applications by user ID
- `stage`: Filter applications by stage

**Response:**

```json
[
  {
    "id": 1,
    "userId": 3,
    "jobId": 1,
    "status": "screening",
    "coverLetter": "I am excited to apply for this position...",
    "resume": "/uploads/app-resume-123.pdf",
    "appliedAt": "2025-05-01T12:30:00Z",
    "updatedAt": "2025-05-01T14:30:00Z"
  },
  ...
]
```

### Create an Application

**Endpoint:** `POST /applications`

**Description:** Creates a new job application.

**Authentication:** Required

**Request Body:**

```json
{
  "jobId": 2,
  "userId": 3,
  "coverLetter": "I believe my skills match perfectly with this role...",
  "resume": "/uploads/app-resume-456.pdf"
}
```

**Response:**

```json
{
  "id": 2,
  "userId": 3,
  "jobId": 2,
  "status": "applied",
  "coverLetter": "I believe my skills match perfectly with this role...",
  "resume": "/uploads/app-resume-456.pdf",
  "appliedAt": "2025-05-01T15:00:00Z",
  "updatedAt": "2025-05-01T15:00:00Z"
}
```

### Update Application Status

**Endpoint:** `PATCH /applications/:id/status`

**Description:** Updates the status of a job application.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Request Body:**

```json
{
  "status": "interview"
}
```

**Response:**

```json
{
  "id": 2,
  "userId": 3,
  "jobId": 2,
  "status": "interview",
  "coverLetter": "I believe my skills match perfectly with this role...",
  "resume": "/uploads/app-resume-456.pdf",
  "appliedAt": "2025-05-01T15:00:00Z",
  "updatedAt": "2025-05-01T15:30:00Z"
}
```

## 8. INTERVIEW ENDPOINTS

### Get Interviews

**Endpoint:** `GET /interviews`

**Description:** Retrieves interviews.

**Authentication:** Required

**Query Parameters (one required):**

- `applicationId`: Filter interviews by application ID
- `upcoming`: Set to `true` to get upcoming interviews

**Additional Query Parameters for upcoming interviews:**

- `limit`: Maximum number of interviews to return (default: 10)

**Response:**

```json
[
  {
    "id": 1,
    "applicationId": 1,
    "recruiterId": 2,
    "scheduledAt": "2025-05-05T10:00:00Z",
    "duration": 60,
    "location": "Video call: https://meet.example.com/123",
    "notes": null,
    "status": "scheduled"
  },
  ...
]
```

### Create an Interview

**Endpoint:** `POST /interviews`

**Description:** Schedules a new interview.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Request Body:**

```json
{
  "applicationId": 2,
  "recruiterId": 2,
  "scheduledAt": "2025-05-06T14:00:00Z",
  "duration": 45,
  "location": "Conference Room A",
  "notes": "Technical interview focused on frontend skills"
}
```

**Response:**

```json
{
  "id": 2,
  "applicationId": 2,
  "recruiterId": 2,
  "scheduledAt": "2025-05-06T14:00:00Z",
  "duration": 45,
  "location": "Conference Room A",
  "notes": "Technical interview focused on frontend skills",
  "status": "scheduled"
}
```

### Update an Interview

**Endpoint:** `PATCH /interviews/:id`

**Description:** Updates an existing interview.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Request Body:**

```json
{
  "scheduledAt": "2025-05-07T10:00:00Z",
  "location": "Video call: https://meet.example.com/456",
  "status": "rescheduled"
}
```

**Response:**

```json
{
  "id": 2,
  "applicationId": 2,
  "recruiterId": 2,
  "scheduledAt": "2025-05-07T10:00:00Z",
  "duration": 45,
  "location": "Video call: https://meet.example.com/456",
  "notes": "Technical interview focused on frontend skills",
  "status": "rescheduled"
}
```

## 9. ANALYTICS ENDPOINTS

### Get Dashboard Statistics

**Endpoint:** `GET /dashboard/stats`

**Description:** Retrieves dashboard statistics.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Response:**

```json
{
  "activeJobs": 4,
  "newCandidates": 10,
  "scheduledInterviews": 5,
  "hireRate": 15
}
```

### Get Pipeline Statistics

**Endpoint:** `GET /pipeline/stats`

**Description:** Retrieves recruitment pipeline statistics.

**Authentication:** Required

**Authorization:** Recruiter or Admin role required

**Response:**

```json
{
  "applied": 20,
  "screening": 12,
  "interview": 8,
  "offer": 3,
  "hired": 2
}
```

## 10. ADMIN ENDPOINTS

### Get All Users

**Endpoint:** `GET /admin/users`

**Description:** Retrieves all users in the system.

**Authentication:** Required

**Authorization:** Admin role required

**Response:**

```json
[
  {
    "id": 1,
    "username": "admin",
    "fullName": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "position": "System Administrator",
    "createdAt": "2025-05-01T00:00:00Z"
  },
  ...
]
```

### Delete a User

**Endpoint:** `DELETE /admin/users/:id`

**Description:** Deletes a user from the system.

**Authentication:** Required

**Authorization:** Admin role required

**Response:**

```
HTTP/1.1 204 No Content
```

### Get Admin Activities

**Endpoint:** `GET /admin/activities`

**Description:** Retrieves system activities for monitoring.

**Authentication:** Required

**Authorization:** Admin role required

**Query Parameters:**

- `limit`: Maximum number of activities to return (default: 50)

**Response:**

```json
[
  {
    "id": 1,
    "userId": 2,
    "type": "job_created",
    "details": {
      "jobId": 4,
      "jobTitle": "DevOps Engineer"
    },
    "createdAt": "2025-05-01T13:00:00Z"
  },
  ...
]
```

---

**Prepared by: API Team**

**Contact: api-support@talentrecruiter.com**