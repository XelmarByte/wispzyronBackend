export {}

declare global {
  interface CustomJwtSessionClaims {
    dbUserId?: string
  }
  namespace Express {
    interface Request {
      providerId?: string
      dbUserId?: string
    }
  }
}
