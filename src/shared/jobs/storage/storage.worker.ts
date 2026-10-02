import type { StorageJobData } from './storage.service.js'
import { STORAGE_QUEUE_NAME } from './storage.queue.js'
import { workerRedisConnection } from '@lib/bullmq.js'
import { Worker, UnrecoverableError } from 'bullmq'
import { deleteFile, promoteTempFile } from './storage.service.js'
import {
  logWorkerJobFailed,
  logWorkerInfraError,
  logWorkerJobCompleted,
} from '@lib/logger.js'

export const storageWorker = new Worker<StorageJobData>(
  STORAGE_QUEUE_NAME,
  async (job) => {
    switch (job.data.type) {
      case 'promote_temp_file': {
        await promoteTempFile(job.data.payload)
        break
      }

      case 'delete_file': {
        await deleteFile(job.data.payload)
        break
      }

      default: {
        throw new UnrecoverableError(
          `Unhandled job type: ${(job.data as { type: string }).type}`,
        )
      }
    }
  },
  { connection: workerRedisConnection, concurrency: 5 },
)

storageWorker.on('completed', (job) => {
  logWorkerJobCompleted({
    queue: STORAGE_QUEUE_NAME,
    jobId: job.id,
    jobType: job.data.type,
    durationMs: job.finishedOn ? job.finishedOn - job.processedOn! : undefined,
    requestId: job.data.requestId,
  })
})

storageWorker.on('failed', (job, err) => {
  if (!job) return

  logWorkerJobFailed({
    queue: STORAGE_QUEUE_NAME,
    jobId: job.id,
    jobType: job.data.type,
    attemptsMade: job.attemptsMade,
    maxAttempts: job.opts.attempts ?? 1,
    requestId: job.data.requestId,
    err,
  })
})

storageWorker.on('error', (err) => {
  logWorkerInfraError({
    queue: STORAGE_QUEUE_NAME,
    err,
  })
})
