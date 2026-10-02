import type { Request } from 'express'
import type { SerializedRequest, SerializedResponse } from 'pino'
import { pinoHttp } from 'pino-http'
import { apiLogger } from '@lib/logger.js'
import { randomUUID } from 'node:crypto'

export const httpLogger = pinoHttp({
  logger: apiLogger,
  autoLogging: { ignore: (req) => req.method === 'OPTIONS' },
  genReqId: function (_req, res) {
    const id = randomUUID()
    res.setHeader('X-Request-Id', id)
    return id
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return 'error'
    if (res.statusCode >= 400) return 'warn'
    return 'info'
  },
  customProps: (req) => ({
    userId: (req as unknown as Request).dbUserId ?? null,
  }),
  serializers: {
    req(req: SerializedRequest) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
      }
    },
    res(res: SerializedResponse) {
      return {
        statusCode: res.statusCode,
      }
    },
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} completed with status ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`,
})
