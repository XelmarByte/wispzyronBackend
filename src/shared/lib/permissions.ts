import { z } from 'zod'

export const permissionSchema = z.enum([
  '*',
  // Projects module
  'projects:read',
  'projects:create',
  'projects:delete',
  // Billing module
  'billing:read',
  'billing:manage',
  // Members and roles module
  'members:read',
  'members:invite',
  'roles:manage',
])

export type Permission = z.infer<typeof permissionSchema>
