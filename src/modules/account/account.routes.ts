import { Router } from 'express'
import { getContextHandler } from './account.controller.js'

export const accountRouter = Router()

accountRouter.get('/context', getContextHandler)
