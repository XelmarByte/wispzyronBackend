import type { ApiErrorCode } from '@errors/codes.js'
import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express'
import { logApiWarn } from '@lib/logger.js'
import { ApiError, BadRequestError } from '@errors/classes.js'

interface ErrorResponse {
  code: ApiErrorCode
  message: string
}

export const errorHandler: ErrorRequestHandler = (
  rawErr: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If headers were already sent to the client, delegate to Express to safely close the connection
  if (res.headersSent) {
    return next(rawErr)
  }

  let err = rawErr

  // Handle malformed JSON body sent by the client
  if (
    err instanceof SyntaxError &&
    'status' in err &&
    err.status === 400 &&
    'body' in err
  ) {
    err = new BadRequestError(
      'malformed_json',
      'Invalid JSON payload structure',
    )
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500
  const code: ApiErrorCode =
    err instanceof ApiError ? err.code : 'internal_error'
  const message =
    err instanceof ApiError ? err.message : 'Internal server error'

  if (err instanceof ApiError) {
    logApiWarn(req, code, message)
  } else {
    req.log.error(err, 'Unhandled system exception')
  }

  const response: ErrorResponse = { code, message }

  return res.status(statusCode).json(response)
}
