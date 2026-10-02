import { Router } from 'express'
import {
  createOrganizationHandler,
  createLogoPresignedUrlHandler,
} from './organization.controller.js'

export const organizationRouter = Router()

organizationRouter.post('/logo/presigned-url', createLogoPresignedUrlHandler)
organizationRouter.post('/', createOrganizationHandler)
