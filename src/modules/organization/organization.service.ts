import type { OrganizationContext } from '@apptypes/app.js'
import type {
  CreateOrganizationInput,
  CreateLogoPresignedUrlInput,
} from './organization.schema.js'
import { db } from '@db/index.js'
import { env } from '@lib/env.js'
import { r2Client } from '@lib/r2.js'
import { randomUUID } from 'node:crypto'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { resolvePlanConfig } from '@lib/plans.js'
import { enqueuePromoteTempFile } from '@jobs/storage/storage.queue.js'
import { roles, organizations, organizationMembers } from '@db/schema.js'

export const createLogoPresignedUrl = async (
  input: CreateLogoPresignedUrlInput,
) => {
  const fileId = randomUUID()

  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: `temp/${fileId}.webp`,
    ContentType: input.contentType,
    ContentLength: input.size,
  })

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 60 })
  return { uploadUrl, fileId }
}

export const createOrganization = async ({
  input,
  dbUserId,
  requestId,
}: {
  input: CreateOrganizationInput
  dbUserId: string
  requestId: string
}) => {
  const user = await db.query.users.findFirst({
    columns: { email: true, name: true, imageUrl: true },
    where: { id: dbUserId },
  })

  const displayName = user!.name
  const corporateEmail = user!.email
  const avatarUrl = user!.imageUrl
  const roleName = 'Propietario'
  const roleDescription = 'Acceso total y control absoluto de la empresa'
  const orgId = randomUUID()
  const finalKey = input.fileId ? `public/orgs/${orgId}/logo.webp` : null

  const data = await db.transaction(async (tx) => {
    await tx.insert(organizations).values({
      id: orgId,
      name: input.name,
      slug: input.slug,
      logoKey: finalKey,
      plan: input.plan,
      subscriptionStatus: 'pending_payment',
    })

    const [baseRole] = await tx
      .insert(roles)
      .values({
        organizationId: orgId,
        name: roleName,
        description: roleDescription,
        permissions: ['*'],
        isSystem: true,
      })
      .returning({ id: roles.id })

    await tx.insert(organizationMembers).values({
      userId: dbUserId,
      organizationId: orgId,
      roleId: baseRole.id,
      displayName,
      corporateEmail,
      avatarUrl,
    })

    const newOrganization: OrganizationContext = {
      id: orgId,
      name: input.name,
      slug: input.slug,
      logoKey: finalKey,
      displayName,
      avatarUrl,
      corporateEmail,
      role: {
        name: roleName,
        permissions: ['*'],
      },
      plan: {
        tier: input.plan,
        status: 'active',
        config: resolvePlanConfig(input.plan, null),
      },
    }

    return newOrganization
  })

  // PROCESO DE PAGO complex function
  try {
    await new Promise((r) => setTimeout(r, 500))
    // Se deberia aplicar el pago y posteriormente cambiar el estado de la org a 'active'
    // tambien agregar el dato correspondiente a la tabla de organization_subscriptions (transaccion)
    // si cambiarlo a active falla (transaccion falla), tendria que hacer un try catch interno que solo envuelva a este proceso de la DB
    // o directamente enviarlo a una queue con 5 reintentos.
    await db.update(organizations).set({ subscriptionStatus: 'active' })
  } catch (e) {
    // Si ocurre un error en el pago se borra la organizacion que se acaba de crear que tiene su status de 'pending_payment'
    // await db.delete()
    // la imagen subida no tiene sentido ya que la carpeta a donde se subio es temporal y se borrara de todas maneras
    // en este punto aun no se mueve la imagen de la carpeta temporal a la carpeta final
    console.error(e)
  }

  // SOLO SE HACE EL "MOVE" DEL ARCHIVO A LA RUTA FINAL SI EL PAGO SE REALIZO CORRECTAMENTE
  // SI EL PAGO NO SE PUDO REALIZAR, EL ARCHIVO ESTARA EN LA RUTA TEMPORAL Y SE ELIMINARA DE TODAS FORMAS
  if (finalKey) {
    await enqueuePromoteTempFile(
      { tempKey: `temp/${input.fileId}.webp`, finalKey },
      requestId,
    )
  }

  return data
}
