import { env } from '@lib/env.js'
import { r2Client } from '@lib/r2.js'
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

export interface PromoteTempFilePayload {
  tempKey: string
  finalKey: string
}
export const promoteTempFile = async (payload: PromoteTempFilePayload) => {
  const { tempKey, finalKey } = payload

  await r2Client.send(
    new CopyObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      CopySource: `${env.R2_BUCKET_NAME}/${tempKey}`,
      Key: finalKey,
    }),
  )
}

interface DeleteFilePayload {
  key: string
}
export const deleteFile = async (payload: DeleteFilePayload) => {
  const { key } = payload

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  )
}

export type StorageJobData = { requestId?: string } & (
  | {
      type: 'promote_temp_file'
      payload: PromoteTempFilePayload
    }
  | {
      type: 'delete_file'
      payload: DeleteFilePayload
    }
)
