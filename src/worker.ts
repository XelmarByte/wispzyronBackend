import type { Worker } from 'bullmq'
import { env } from '@lib/env.js'
import { workerLogger } from '@lib/logger.js'
import { storageWorker } from '@jobs/storage/storage.worker.js'

workerLogger.info(`Starting Worker process (${env.NODE_ENV})...`)

const workers: Worker[] = [storageWorker]

const gracefulShutdown = async (signal: string) => {
  workerLogger.info(`Received ${signal}. Closing workers gracefully...`)

  const timer = setTimeout(() => {
    workerLogger.error('Forced shutdown of workers after timeout.')
    process.exit(1)
  }, 10000)

  try {
    await Promise.all(workers.map((worker) => worker.close()))
    clearTimeout(timer)
    workerLogger.info('All workers closed clean. Process exiting.')
    process.exit(0)
  } catch (e) {
    workerLogger.error({ e }, 'Error during worker shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => void gracefulShutdown('SIGINT'))

process.on('unhandledRejection', (reason: Error) => {
  workerLogger.fatal(reason, 'Unhandled Promise Rejection in Worker')
  process.exit(1)
})

process.on('uncaughtException', (error: Error) => {
  workerLogger.fatal(error, 'Uncaught Exception in Worker')
  process.exit(1)
})
