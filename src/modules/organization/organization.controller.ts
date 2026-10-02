import type { Request, Response, NextFunction } from 'express'
import { safeParseWithSchema } from '@lib/utils.js'
import {
  createOrganization,
  createLogoPresignedUrl,
} from './organization.service.js'
import {
  createOrganizationSchema,
  createLogoPresignedUrlSchema,
} from './organization.schema.js'

export const createLogoPresignedUrlHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const input = safeParseWithSchema(createLogoPresignedUrlSchema, req.body)
    const data = await createLogoPresignedUrl(input)
    return res.status(200).json(data)
  } catch (e) {
    next(e)
  }
}

export const createOrganizationHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dbUserId = req.dbUserId!
    const input = safeParseWithSchema(createOrganizationSchema, req.body)
    const data = await createOrganization({
      input,
      dbUserId,
      requestId: req.id as string,
    })
    return res.status(201).json(data)
  } catch (e) {
    next(e)
  }
}
