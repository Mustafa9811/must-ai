import { drizzle } from 'drizzle-orm/d1';
import { env } from '@/env';
import * as schema from './schema';

// Initialize Drizzle with the D1 database
export const db = drizzle(env.DB, { schema });

// Export types for use in the application
export type Database = typeof db;
