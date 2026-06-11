import { PrismaClient } from '@prisma/client';

// 💎 RESTORING CONNECTION TO THE DATABASE WITH YOUR DATA
const DATA_DATABASE_URL = "postgresql://neondb_owner:npg_P9dAkpvqj2Go@ep-lingering-band-aq1mdygx-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATA_DATABASE_URL,
    },
  },
});
