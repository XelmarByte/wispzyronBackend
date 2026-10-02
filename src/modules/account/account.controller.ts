import type { NextFunction, Request, Response } from 'express'
import { getContext } from './account.service.js'

export const getContextHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const dbUserId = req.dbUserId!
    const userContext = await getContext(dbUserId)
    return res.status(200).json(userContext)
  } catch (e) {
    next(e)
  }
}
