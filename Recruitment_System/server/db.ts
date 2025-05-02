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