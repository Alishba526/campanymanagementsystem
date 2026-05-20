import { PrismaClient } from '@prisma/client';

const NEON_DB_URL = "postgresql://neondb_owner:npg_P9dAkpvqj2Go@ep-lingering-band-aq1mdygx-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

console.log('--- PRISMA INITIALIZING WITH URL ---');
console.log(NEON_DB_URL.substring(0, 40) + '...');

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DB_URL,
    },
  },
});
