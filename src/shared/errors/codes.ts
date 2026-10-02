export const SystemErrorCodes = [
  'malformed_json',
  'route_not_found',
  'internal_error',
] as const

export const MiddlewareErrorCodes = ['unauthenticated'] as const

type SystemErrorCode = (typeof SystemErrorCodes)[number]
type MiddlewareErrorCode = (typeof MiddlewareErrorCodes)[number]

// Union type representing every valid error code string in the entire application
export type ApiErrorCode = SystemErrorCode | MiddlewareErrorCode

export const InternalLogCodes = ['clerk_sync_failed'] as const
type InternalLogCode = (typeof InternalLogCodes)[number]

export type LogCode = ApiErrorCode | InternalLogCode
