# Recruitment System

A comprehensive recruitment management platform built with React, Node.js, Express, and PostgreSQL that streamlines the entire hiring process for both recruiters and candidates.

![Recruitment System](generated-icon.png)

## Features

- **Multi-User Role System**: Separate interfaces for recruiters, candidates, and administrators
- **Job Management**: Create, edit, and manage job postings
- **Candidate Portal**: Profile creation, skills management, and application tracking
- **Application Processing**: End-to-end application lifecycle management
- **Interview Scheduling**: Coordinate and track interviews
- **Analytics Dashboard**: Recruitment metrics and pipeline visualization
- **Activity Tracking**: Comprehensive audit trail of system activities

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: Passport.js, express-session
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

- Node.js (v16.0.0 or higher)
- npm (v7.0.0 or higher)
- PostgreSQL (v13.0 or higher) OR Supabase account

## Installation and Setup

### Option 1: Standard Local Setup with PostgreSQL

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yuva1024/Recruitment_System.git
   cd Recruitment_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Install PostgreSQL on your machine if not already installed
   - Create a new database:
     ```bash
     createdb recruitment_system
     ```

4. **Create a .env file in the project root**
   ```
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/recruitment_system
   SESSION_SECRET=your_secure_random_string
   ```
   Replace `yourpassword` with your actual PostgreSQL password.

5. **Install missing packages for Windows compatibility**
   ```bash
   npm install pg @types/pg dotenv connect-pg-simple @types/connect-pg-simple
   ```

6. **For Windows compatibility, modify server/db.ts**
   
   If you're on Windows and encounter connection issues, change your db.ts file to this:
   ```typescript
   import 'dotenv/config';
   import { drizzle } from 'drizzle-orm/node-postgres';
   import * as schema from "@shared/schema";
   import pg from 'pg';

   if (!process.env.DATABASE_URL) {
     throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
   }

   // Use standard PostgreSQL client for local development
   const { Pool } = pg;
   export const pool = new Pool({ 
     connectionString: process.env.DATABASE_URL 
   });

   export const db = drizzle(pool, { schema });
   ```

7. **Push database schema**
   ```bash
   npm run db:push
   ```

8. **Start the development server**
   ```bash
   npm run dev
   ```

### Option 2: Supabase Setup (Recommended for Windows Users)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yuva1024/Recruitment_System.git
   cd Recruitment_System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a Supabase account and project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create a new project
   - Get your PostgreSQL connection string from the dashboard (Settings → Database)

4. **Create a .env file in the project root**
   ```
   DATABASE_URL=your_supabase_connection_string
   SESSION_SECRET=your_secure_random_string
   ```
   Replace `your_supabase_connection_string` with the connection string from Supabase.

5. **Install postgres.js (better Windows compatibility)**
   ```bash
   npm install postgres
   ```

6. **Modify server/db.ts for Supabase**
   ```typescript
   import 'dotenv/config';
   import { drizzle } from 'drizzle-orm/postgres-js';
   import postgres from 'postgres';
   import * as schema from "@shared/schema";

   if (!process.env.DATABASE_URL) {
     throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
   }

   // Configure postgres.js with the right SSL settings for Supabase
   const connectionString = process.env.DATABASE_URL;
   const client = postgres(connectionString, { 
     ssl: 'require',
     max: 10, // Connection pool size
   });

   export const db = drizzle(client, { schema });

   // Export a pool interface that mimics pg for session store compatibility
   export const pool = {
     query: async (text, params = []) => {
       try {
         const result = await client.unsafe(text, params);
         return { rows: result };
       } catch (error) {
         console.error('Database query error:', error);
         throw error;
       }
     }
   };
   ```

7. **Update drizzle.config.ts for SSL**
   ```typescript
   import type { Config } from "drizzle-kit";
   import 'dotenv/config';

   if (!process.env.DATABASE_URL) {
     throw new Error("DATABASE_URL is not set");
   }

   export default {
     schema: "./shared/schema.ts",
     out: "./drizzle",
     driver: 'pg',
     dbCredentials: {
       connectionString: process.env.DATABASE_URL,
       ssl: true,
     },
   } satisfies Config;
   ```

8. **Push database schema**
   ```bash
   npm run db:push
   ```

9. **Start the development server**
   ```bash
   npm run dev
   ```

## Application Structure

The application follows a structured organization:

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express server
│   ├── auth.ts             # Authentication configuration
│   ├── db.ts               # Database connection
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data access layer
│   └── vite.ts             # Vite integration
├── shared/                 # Shared code between client and server
│   └── schema.ts           # Database schema and types
├── documentation/          # Project documentation
├── .env                    # Environment variables (create this)
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

## User Accounts

The system has three user roles with different access levels:

### Admin Access
- **Username**: admin
- **Password**: admin123
- Access to user management and system activity logs

### Recruiter Access
- **Username**: recruiter
- **Password**: recruiter123
- Access to job posting, candidate management, and interview scheduling

### Candidate Access
- Create your own account through the registration page
- Access to job search, application submission, and profile management

## Common Issues & Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL service is running
- Verify your DATABASE_URL is correct in .env
- For Windows users, try the Supabase option for easier setup

### PostgreSQL SSL Error on Windows
If you encounter SSL errors with PostgreSQL on Windows, try:
1. Edit your pg_hba.conf file to allow local connections without SSL
2. Use the Supabase option which handles SSL properly

### Missing Dependencies
If you encounter errors about missing modules:
```bash
npm install
```

### Port Already in Use
If port 5000 is already in use:
1. Change the port in server/index.ts
2. Or kill the process using that port:
   ```bash
   npx kill-port 5000
   ```

## Development Workflow

1. **Frontend Development**
   - React components are in `client/src/components`
   - Pages are in `client/src/pages`
   - Global state is managed with React Query and context

2. **Backend Development**
   - API endpoints are defined in `server/routes.ts`
   - Authentication logic is in `server/auth.ts`
   - Database operations are in `server/storage.ts`

3. **Database Schema Changes**
   - Update the schema in `shared/schema.ts`
   - Run `npm run db:push` to update the database

4. **Adding New Features**
   - Update schema if needed
   - Add backend endpoints
   - Create frontend components
   - Connect with React Query

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)