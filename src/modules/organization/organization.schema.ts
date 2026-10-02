import { z } from 'zod'
import { planSchema } from '@lib/plans.js'

export const createLogoPresignedUrlSchema = z.object({
  contentType: z.literal('image/webp'),
  size: z
    .int()
    .positive()
    .max(2 * 1024 * 1024),
})
export type CreateLogoPresignedUrlInput = z.infer<
  typeof createLogoPresignedUrlSchema
>

export const createOrganizationSchema = z.object({
  name: z.string().max(100),
  slug: z.string().max(50),
  fileId: z.string().optional(),
  plan: planSchema,
})
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
