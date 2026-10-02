import type { Request } from 'express'
import type { LogCode } from '@errors/codes.js'
import pino from 'pino'
import { env } from './env.js'

const isDevelopment = env.NODE_ENV === 'development'
const isTest = env.NODE_ENV === 'test'

const logger = pino({
  level: isTest ? 'silent' : isDevelopment ? 'debug' : 'info',
  redact: {
    paths: [
      'password',
      '*.password',
      'creditCard',
      '*.creditCard',
      'authorization',
      'headers.authorization',
      'cookie',
      'headers.cookie',
    ],
    censor: '[REDACTED]',
  },
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
  }),
})

export const apiLogger = logger.child({ service: 'api' })
export const workerLogger = logger.child({ service: 'worker' })

export const logApiWarn = (req: Request, code: LogCode, message: string) => {
  req.log.warn({ code }, message)
}

export const logWorkerJobCompleted = (params: {
  queue: string
  jobId: string | undefined
  jobType: string
  durationMs: number | undefined
  requestId?: string
}) => {
  const { queue, jobId, jobType, durationMs, requestId } = params

  workerLogger.info(
    { queue, jobId, jobType, durationMs, requestId },
    `Job ${jobId ?? 'unknown'} (${jobType}) completed successfully`,
  )
}

export const logWorkerJobFailed = (params: {
  queue: string
  jobId: string | undefined
  jobType: string
  attemptsMade: number
  maxAttempts: number
  requestId?: string
  err: Error
}) => {
  const { queue, jobId, jobType, attemptsMade, maxAttempts, requestId, err } =
    params

  if (attemptsMade >= maxAttempts) {
    workerLogger.warn(
      { queue, jobId, jobType, attemptsMade, maxAttempts, requestId, err },
      `Job ${jobId ?? 'unknown'} (${jobType}) failed after ${attemptsMade} attempts: ${err.message}`,
    )
  }
}

export const logWorkerInfraError = (params: { queue: string; err: Error }) => {
  const { queue, err } = params
  workerLogger.error(
    { queue, err },
    `Redis connection error in queue: ${queue}`,
  )
}
