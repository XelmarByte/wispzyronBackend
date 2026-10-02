import type { OrganizationContext } from '@apptypes/app.js'
import { db } from '@db/index.js'
import { resolvePlanConfig } from '@lib/plans.js'

export const getContext = async (dbUserId: string) => {
  const existingUser = await db.query.users.findFirst({
    columns: { createdAt: false, updatedAt: false, providerId: false },
    where: { id: dbUserId },
    with: {
      memberships: {
        with: {
          organization: { columns: { createdAt: false, updatedAt: false } },
          role: { columns: { name: true, permissions: true } },
        },
        columns: { displayName: true, avatarUrl: true, corporateEmail: true },
      },
    },
  })

  const { memberships, ...userData } = existingUser!

  if (memberships.length === 0) {
    return { ...userData, organizations: [] }
  }

  const cleanOrganizations: OrganizationContext[] = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    logoKey: m.organization.logoKey,
    displayName: m.displayName,
    avatarUrl: m.avatarUrl,
    corporateEmail: m.corporateEmail,
    role: {
      name: m.role.name,
      permissions: m.role.permissions,
    },
    plan: {
      tier: m.organization.plan,
      status: m.organization.subscriptionStatus,
      config: resolvePlanConfig(
        m.organization.plan,
        m.organization.customPlanLimits,
      ),
    },
  }))

  return {
    ...userData,
    organizations: cleanOrganizations,
  }
}
