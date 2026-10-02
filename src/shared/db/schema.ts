import type { Permission } from '@lib/permissions.js'
import type { Plan, PlanConfig, SubscriptionStatus } from '@lib/plans.js'
import {
  text,
  uuid,
  jsonb,
  boolean,
  varchar,
  snakeCase,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core'

export const users = snakeCase.table('users', {
  id: uuid().defaultRandom().primaryKey(),
  providerId: text().notNull().unique(),
  email: text().notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  imageUrl: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const organizations = snakeCase.table('organizations', {
  id: uuid().defaultRandom().primaryKey(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 50 }).notNull().unique(),
  logoKey: text(),
  plan: text().$type<Plan>().notNull(),
  subscriptionStatus: text().$type<SubscriptionStatus>().notNull(),
  customPlanLimits: jsonb().$type<Partial<PlanConfig>>(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const roles = snakeCase.table('roles', {
  id: uuid().defaultRandom().primaryKey(),
  organizationId: uuid()
    .notNull()
    .references(() => organizations.id, { onDelete: 'cascade' }),
  name: varchar({ length: 50 }).notNull(),
  description: varchar({ length: 255 }),
  permissions: text().array().$type<Permission>().notNull().default([]), // ej: ["projects:create", "billing:read"]
  isSystem: boolean().default(false).notNull(), // Avoid delete admin base role
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
})

export const organizationMembers = snakeCase.table(
  'organization_members',
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    roleId: uuid()
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }), // Avoid delete role in use
    displayName: varchar({ length: 255 }).notNull(),
    avatarUrl: text(),
    corporateEmail: varchar({ length: 255 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.organizationId] })],
)
