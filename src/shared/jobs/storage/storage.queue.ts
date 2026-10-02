import type {
  StorageJobData,
  PromoteTempFilePayload,
} from './storage.service.js'
import { Queue } from 'bullmq'
import { queueRedisConnection } from '@lib/bullmq.js'

export const STORAGE_QUEUE_NAME = 'storage-queue'

const storageQueue = new Queue<StorageJobData>(STORAGE_QUEUE_NAME, {
  connection: queueRedisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 * 7 },
  },
})

export const enqueuePromoteTempFile = async (
  payload: PromoteTempFilePayload,
  requestId?: string,
) => {
  return await storageQueue.add('promote_temp_file', {
    type: 'promote_temp_file',
    payload,
    requestId,
  })
}
