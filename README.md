# Talent Recruiter - Recruitment Management Platform

A comprehensive recruitment management platform designed to streamline the hiring process through advanced candidate tracking, job posting, and intelligent analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Overview

Talent Recruiter is a full-featured recruitment management platform similar to Zoho Recruit. The system enables the entire recruitment lifecycle with distinct interfaces for recruiters and candidates. Recruiters can manage job postings, candidates, interviews, and analytics, while candidates can browse and apply for jobs through their own portal.

## Features

### For Recruiters
- Create and manage job listings
- Track candidate applications
- Schedule and manage interviews
- View candidate profiles and resumes
- Track recruitment pipeline metrics
- View hiring analytics and dashboards

### For Candidates
- Browse available job listings
- Submit job applications
- Track application status
- Manage personal profile and resume
- Schedule interviews

### For Administrators
- User management (recruiters and candidates)
- Activity monitoring
- System configuration

## System Architecture

The application is built using a modern, scalable architecture:

- **Frontend**: React with TypeScript, using a component-based architecture
- **Backend**: Node.js/Express.js RESTful API
- **Database**: PostgreSQL for persistent data storage
- **ORM**: Drizzle ORM for database interactions
- **Authentication**: Passport.js with session-based authentication
- **State Management**: React Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui components

## Tech Stack

### Frontend
- React 18+
- TypeScript
- React Query (TanStack Query)
- wouter (routing)
- shadcn/ui components
- Tailwind CSS
- Lucide React (icons)
- React Hook Form (form handling)
- Zod (validation)

### Backend
- Node.js
- Express.js
- Passport.js (authentication)
- Multer (file uploads)
- PostgreSQL
- Drizzle ORM
- Zod (validation)

## Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Setup Steps

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/talent-recruiter.git
   cd talent-recruiter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   SESSION_SECRET=your_secret_key_here
   DATABASE_URL=postgres://username:password@localhost:5432/talent_recruiter
   ```

4. Initialize the database
   ```bash
   npm run db:push
   ```

5. Start the development server
   ```bash
   npm run dev
   ```

6. Access the application at `http://localhost:5000`

## Database Setup

The application uses PostgreSQL for data storage. The database schema includes the following tables:

- `users` - User accounts (admins, recruiters, candidates)
- `jobs` - Job listings
- `candidates` - Candidate profiles
- `applications` - Job applications
- `interviews` - Interview scheduling
- `activities` - System activity tracking
- `session` - User sessions

### Setting up a Local PostgreSQL Database

1. Install PostgreSQL if not already installed
2. Create a new database
   ```sql
   CREATE DATABASE talent_recruiter;
   ```
3. Configure the connection string in your `.env` file
4. Run the database migration
   ```bash
   npm run db:push
   ```

### Default Admin Credentials

The system is seeded with default admin and recruiter accounts:

- **Admin**
  - Username: `admin`
  - Password: `admin123`

- **Recruiter**
  - Username: `recruiter`
  - Password: `recruiter123`

## API Documentation

The backend provides a comprehensive RESTful API for interacting with the system.

### Authentication Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/register` | POST | Register a new user | No |
| `/api/login` | POST | Authenticate a user | No |
| `/api/logout` | POST | Log out the current user | Yes |
| `/api/user` | GET | Get the current user | Yes |

### Jobs Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/jobs` | GET | List all jobs | No |
| `/api/jobs/:id` | GET | Get a specific job | No |
| `/api/jobs` | POST | Create a new job | Yes (Recruiter) |
| `/api/jobs/:id` | PATCH | Update a job | Yes (Recruiter) |
| `/api/jobs/recent` | GET | Get recent jobs | No |

### Candidates Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/candidates` | GET | List all candidates | Yes (Recruiter) |
| `/api/candidates/:id` | GET | Get a specific candidate | Yes (Recruiter) |
| `/api/candidates` | POST | Create a candidate | Yes |
| `/api/candidates/:id` | PATCH | Update a candidate | Yes |
| `/api/candidates/user/:userId` | GET | Get candidate by user ID | Yes |

### Applications Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/applications` | GET | List applications (filter by jobId, userId, or stage) | Yes |
| `/api/applications` | POST | Submit an application | Yes (Candidate) |
| `/api/applications/:id/status` | PATCH | Update application status | Yes (Recruiter) |

### Interviews Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/interviews` | GET | List interviews (filter by applicationId or upcoming) | Yes |
| `/api/interviews` | POST | Schedule an interview | Yes (Recruiter) |
| `/api/interviews/:id` | PATCH | Update an interview | Yes (Recruiter) |

### Admin Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/admin/users` | GET | List all users | Yes (Admin) |
| `/api/admin/users/:id` | DELETE | Delete a user | Yes (Admin) |
| `/api/admin/activities` | GET | List system activities | Yes (Admin) |

### Analytics Endpoints

| Endpoint | Method | Description | Authentication Required |
|----------|--------|-------------|-------------------------|
| `/api/dashboard/stats` | GET | Get dashboard statistics | Yes (Recruiter, Admin) |
| `/api/pipeline/stats` | GET | Get recruitment pipeline statistics | Yes (Recruiter, Admin) |

## User Roles

The system supports three user roles:

### Administrator
- Full system access
- User management capabilities
- Activity monitoring
- System configuration

### Recruiter
- Create and manage job listings
- Review applications
- Manage candidate pipeline
- Schedule interviews
- View analytics

### Candidate
- Browse job listings
- Submit applications
- Track application status
- Manage profile
- Schedule interviews

## Development Guidelines

### Project Structure

```
talent-recruiter/
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── pages/         # Application pages
│   │   ├── types/         # TypeScript type definitions
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
├── server/                # Backend Express application
│   ├── auth.ts            # Authentication logic
│   ├── db.ts              # Database connection
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Data storage service
│   └── vite.ts            # Vite configuration for server
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema and types
└── uploads/               # Uploaded files (resumes, etc.)
```

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules for code linting
- Use Prettier for code formatting
- Follow React best practices and hooks

### State Management

- Use React Query for server state
- Use React Context for global application state
- Use React's built-in useState and useReducer for component state

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

#### Authentication Problems
- Ensure SESSION_SECRET is properly set in your environment variables
- Verify PostgreSQL is running and the connection string is correct
- Check that session table exists in the database

#### Database Connection Issues
- Verify PostgreSQL server is running
- Check DATABASE_URL environment variable
- Ensure database user has proper permissions

#### Frontend API Connection
- Check for CORS issues
- Verify API endpoints are correct
- Check network tab in browser dev tools for errors

### Reporting Issues

Please report issues through the GitHub issue tracker with:
- Description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Environment details (OS, browser, Node version, etc.)