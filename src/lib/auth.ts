import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';

// Server-side Better Auth instance. Roles (ADMIN / MANAGER / EMPLOYEE) are
// stored on the User model and read via the `role` additional field below.
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'EMPLOYEE',
        input: false, // role can't be set by the client at signup; only via admin actions
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  // Add OAuth providers here if desired, e.g.:
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID!,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  //   },
  // },
});

export type Session = typeof auth.$Infer.Session;
