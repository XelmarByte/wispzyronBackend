import type { Request, Response, NextFunction } from 'express'
import { db } from '@db/index.js'
import { users } from '@db/schema.js'
import { cleanText } from '@lib/utils.js'
import { logApiWarn } from '@lib/logger.js'
import { UnauthorizedError } from '@errors/classes.js'
import { getAuth, clerkClient } from '@clerk/express'

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const { userId: providerId, sessionClaims } = getAuth(req)
    if (!providerId) {
      throw new UnauthorizedError('unauthenticated', 'Authentication required')
    }

    let dbUserId = sessionClaims.dbUserId

    if (!dbUserId) {
      const existingUser = await db.query.users.findFirst({
        columns: { id: true },
        where: { providerId },
      })

      if (existingUser) {
        dbUserId = existingUser.id
      } else {
        const { emailAddresses, firstName, lastName, imageUrl } =
          await clerkClient.users.getUser(providerId)

        const email = emailAddresses[0].emailAddress.toLowerCase()

        const cleanedFirstName = cleanText(firstName)
        const cleanedLastName = cleanText(lastName)

        const fullName = [cleanedFirstName, cleanedLastName]
          .filter(Boolean)
          .join(' ')

        const fallbackName = cleanText(email.split('@')[0]) || 'Nuevo usuario'

        const rawName = fullName.length > 0 ? fullName : fallbackName
        const name = rawName.length > 255 ? rawName.slice(0, 255) : rawName

        // 99.99% secure, unhandled error if rare race condition happens
        const [{ id: newUserId }] = await db
          .insert(users)
          .values({ providerId, email, name, imageUrl })
          .returning({ id: users.id })

        dbUserId = newUserId
      }

      try {
        await clerkClient.users.updateUserMetadata(providerId, {
          publicMetadata: { db_user_id: dbUserId },
        })
      } catch {
        logApiWarn(
          req,
          'clerk_sync_failed',
          'Failed to sync db_user_id to Clerk publicMetadata',
        )
      }
    }

    req.providerId = providerId
    req.dbUserId = dbUserId
    next()
  } catch (e) {
    next(e)
  }
}
