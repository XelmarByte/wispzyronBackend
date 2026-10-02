import app from './app.js'
import { env } from '@lib/env.js'
import { apiLogger } from '@lib/logger.js'

const server = app.listen(env.PORT, () => {
  apiLogger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`)
})

const gracefulShutdown = (signal: string) => {
  apiLogger.info(`Received ${signal}. Shutting down gracefully...`)

  server.close(() => {
    apiLogger.info('Closed all active HTTP connections. Process exiting.')
    process.exit(0)
  })

  // Force shutdown if connections do not close within 10 seconds
  setTimeout(() => {
    apiLogger.error('Forced shutdown after timeout.')
    process.exit(1)
  }, 10000).unref()
}

// Intercept termination signals (Docker, PM2, Kubernetes, DigitalOcean)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Intercept unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  apiLogger.fatal(reason, 'Unhandled Promise Rejection')
  // Force process exit so process managers (like Docker or PM2) can restart a clean instance
  process.exit(1)
})

// Intercept uncaught synchronous exceptions
process.on('uncaughtException', (error: Error) => {
  apiLogger.fatal(error, 'Uncaught Exception')
  process.exit(1)
})
