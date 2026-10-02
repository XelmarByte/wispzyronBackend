import { env } from '@lib/env.js'
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { relations } from './relations.js'

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle({ client: pool, relations })
