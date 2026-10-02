import { env } from '@lib/env.js'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/shared/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: { url: env.DATABASE_URL },
})
