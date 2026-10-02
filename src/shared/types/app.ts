import type { Permission } from '@lib/permissions.js'
import type { Plan, PlanConfig, SubscriptionStatus } from '@lib/plans.js'

export interface OrganizationContext {
  id: string
  name: string
  slug: string
  logoKey: string | null
  displayName: string
  avatarUrl: string | null
  corporateEmail: string
  role: {
    name: string
    permissions: Permission[]
  }
  plan: {
    tier: Plan
    status: SubscriptionStatus
    config: PlanConfig
  }
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileId: string
}
