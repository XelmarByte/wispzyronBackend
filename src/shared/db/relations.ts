import * as schema from './schema.js'
import { defineRelations } from 'drizzle-orm'

export const relations = defineRelations(schema, (r) => ({
  users: {
    memberships: r.many.organizationMembers({
      from: r.users.id,
      to: r.organizationMembers.userId,
    }),
  },
  organizationMembers: {
    organization: r.one.organizations({
      from: r.organizationMembers.organizationId,
      to: r.organizations.id,
      optional: false,
    }),
    role: r.one.roles({
      from: r.organizationMembers.roleId,
      to: r.roles.id,
      optional: false,
    }),
  },
}))
