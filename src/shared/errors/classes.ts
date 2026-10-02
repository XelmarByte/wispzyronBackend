import type { ApiErrorCode } from './codes.js'

export abstract class ApiError extends Error {
  public readonly statusCode: number
  public readonly code: ApiErrorCode

  constructor(message: string, statusCode: number, code: ApiErrorCode) {
    super(message)
    this.statusCode = statusCode
    this.code = code

    // Fix prototype chain for custom Error inheritance in TypeScript (ensures `instanceof` works)
    Object.setPrototypeOf(this, new.target.prototype)

    // Omit error class constructors from stack trace to show the real throw location
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends ApiError {
  constructor(code: ApiErrorCode, message: string) {
    super(message, 400, code)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(code: ApiErrorCode, message: string) {
    super(message, 401, code)
  }
}

export class ForbiddenError extends ApiError {
  constructor(code: ApiErrorCode, message: string) {
    super(message, 403, code)
  }
}

export class NotFoundError extends ApiError {
  constructor(code: ApiErrorCode, message: string) {
    super(message, 404, code)
  }
}

export class ConflictError extends ApiError {
  constructor(code: ApiErrorCode, message: string) {
    super(message, 409, code)
  }
}
