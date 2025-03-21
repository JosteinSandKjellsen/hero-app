import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Configure Prisma Client with production-optimized settings
const prismaClientSingleton = (): PrismaClient => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['error', 'warn'] // Log only errors and warnings in development
      : ['error'], // Log only errors in production
  });
};

// Set up global singleton for development
const prisma = global.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export { prisma };
