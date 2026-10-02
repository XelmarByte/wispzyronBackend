import type { ConnectionOptions } from 'bullmq'
import { env } from './env.js'

const baseConnection: ConnectionOptions = {
  url: env.REDIS_URL,
  enableReadyCheck: false,
}

// Queue options (API): Fails fast on connection loss to prevent blocked HTTP requests
export const queueRedisConnection: ConnectionOptions = {
  ...baseConnection,
  maxRetriesPerRequest: 20,
}

// Worker options (Background): Retries indefinitely as required by BullMQ
export const workerRedisConnection: ConnectionOptions = {
  ...baseConnection,
  maxRetriesPerRequest: null,
}
