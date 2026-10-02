import { z } from 'zod'

export const planSchema = z.enum(['starter', 'pro', 'enterprise'])
export type Plan = z.infer<typeof planSchema>

export const subscriptionStatusSchema = z.enum([
  'pending_payment',
  'active',
  'past_due',
  'canceled',
  'unpaid',
])
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

type FeatureFlag =
  'electronic_invoicing' | 'inventory_management' | 'audit_logs'

export interface PlanConfig {
  name: string
  maxStaffMembers: number
  maxSubscribers: number
  maxRouters: number
  features: Record<FeatureFlag, boolean>
}

const PLAN_CONFIGS: Record<Plan, PlanConfig> = {
  starter: {
    name: 'Starter WISP',
    maxStaffMembers: 3,
    maxSubscribers: 200,
    maxRouters: 2,
    features: {
      electronic_invoicing: false,
      inventory_management: false,
      audit_logs: false,
    },
  },
  pro: {
    name: 'Professional',
    maxStaffMembers: 10,
    maxSubscribers: 1000,
    maxRouters: 10,
    features: {
      electronic_invoicing: true,
      inventory_management: true,
      audit_logs: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    maxStaffMembers: -1,
    maxSubscribers: -1,
    maxRouters: -1,
    features: {
      electronic_invoicing: true,
      inventory_management: true,
      audit_logs: true,
    },
  },
}

export const resolvePlanConfig = (
  plan: Plan,
  overrides: Partial<PlanConfig> | null,
): PlanConfig => {
  const baseConfig = PLAN_CONFIGS[plan]
  if (overrides === null) return baseConfig

  return {
    ...baseConfig,
    ...overrides,
    features: {
      ...baseConfig.features,
      ...overrides.features,
    },
  }
}
