import type { Role } from '@prisma/client';

// Central place for role-based access rules. Keep checks here rather than
// scattering `if (role === 'ADMIN')` across the codebase, so the rules stay
// auditable and consistent.

export const ROLE_RANK: Record<Role, number> = {
  EMPLOYEE: 0,
  MANAGER: 1,
  ADMIN: 2,
};

export function hasMinimumRole(role: Role, minimum: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export const can = {
  manageUsers: (role: Role) => role === 'ADMIN',
  createProject: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  archiveProject: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  manageSprints: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  deleteAnyComment: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  viewAnalytics: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  assignTasks: (role: Role) => hasMinimumRole(role, 'MANAGER'),
  // Employees can always: move their own tasks, comment, upload files, view boards they're a member of.
};
