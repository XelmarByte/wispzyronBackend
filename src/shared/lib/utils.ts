import type { ZodType } from 'zod'

export const cleanText = (text: string | null | undefined) => {
  if (!text) return ''
  return text
    .replace(/[^0-9a-zA-ZáéíóúÁÉÍÓÚäëïöüÄËÏÖÜñÑ\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export const safeParseWithSchema = <T extends ZodType>(
  schema: T,
  data: unknown,
) => {
  const result = schema.safeParse(data)
  if (result.error) throw new Error()
  return result.data
}
