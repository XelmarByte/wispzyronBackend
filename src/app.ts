import cors from 'cors'
import router from './routes.js'
import express from 'express'
import { httpLogger } from '@middlewares/http-logger.js'
import { errorHandler } from '@middlewares/error-handler.js'
import { NotFoundError } from '@errors/classes.js'
import { clerkMiddleware } from '@clerk/express'

const app = express()
app.disable('x-powered-by')

// Global infrastructure middlewares
app.use(httpLogger)
app.use(cors())
app.use(express.json())
app.use(clerkMiddleware())

// Health check route
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

// API routes mounting
app.use('/api', router)

// Handle non-existent routes (404)
app.use((_req, _res, next) => {
  next(
    new NotFoundError('route_not_found', 'The requested route does not exist'),
  )
})

// Global error handler (must always be the last middleware)
app.use(errorHandler)

export default app
