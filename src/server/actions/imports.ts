'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireWorkspace } from './auth-helpers'
import { parseFile } from '@/lib/importers/parse'
import { processImportBatch } from '@/lib/importers/processor'
import { getPreset, TARGET_FIELDS, type ColumnMappingDef, type TargetField } from '@/lib/importers/presets'
import type { BookingSource } from '@prisma/client'

const VALID_SOURCES = ['AIRBNB', 'BOOKING_COM', 'VRBO', 'DIRECT', 'SOFTWARE', 'OTHER'] as const

export type UploadState = { error?: string }

export async function uploadFile(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const { workspace } = await requireWorkspace()
  if (!workspace) return { error: 'You need a workspace before importing bookings.' }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) return { error: 'Please select a file to upload.' }

  const source = formData.get('source') as string
  if (!VALID_SOURCES.includes(source as BookingSource)) return { error: 'Invalid booking source.' }

  const propertyId = formData.get('propertyId') as string
  if (!propertyId) return { error: 'Please select a property.' }

  // Verify property belongs to this workspace
  const property = await db.property.findFirst({
    where: { id: propertyId, workspaceId: workspace.id },
  })
  if (!property) return { error: 'Property not found.' }

  // Parse file
  let headers: string[]
  let rawCsv: string
  try {
    const buffer = await file.arrayBuffer()
    const result = parseFile(buffer, file.name)
    headers = result.headers
    rawCsv = result.rawCsv
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return { error: `Could not read file: ${msg}` }
  }

  if (headers.length === 0) return { error: 'File appears to be empty or has no column headers.' }

  const batch = await db.importBatch.create({
    data: {
      workspaceId: workspace.id,
      propertyId,
      source: source as BookingSource,
      filename: file.name,
      rawContent: rawCsv,
      headers,
      status: 'PENDING',
    },
  })

  redirect(`/imports/${batch.id}/map`)
}

export type ProcessState = { error?: string }

export async function processImport(
  _prev: ProcessState,
  formData: FormData,
): Promise<ProcessState> {
  const batchId = formData.get('batchId') as string
  if (!batchId) return { error: 'Missing batch ID.' }

  const batch = await db.importBatch.findUnique({ where: { id: batchId } })
  if (!batch) return { error: 'Import batch not found.' }

  const { workspace } = await requireWorkspace(batch.workspaceId)
  if (!workspace) return { error: 'Access denied.' }

  // Extract mapping from form fields: field_checkIn, field_checkOut, etc.
  const mapping: ColumnMappingDef = {}
  for (const field of TARGET_FIELDS) {
    const val = formData.get(`field_${field}`)
    if (typeof val === 'string' && val) {
      mapping[field] = val
    }
  }

  // Optionally save the mapping
  const saveName = (formData.get('saveMappingName') as string | null)?.trim()
  if (saveName) {
    await db.columnMapping.upsert({
      where: {
        workspaceId_source_name: {
          workspaceId: workspace.id,
          source: batch.source,
          name: saveName,
        },
      },
      create: {
        workspaceId: workspace.id,
        source: batch.source,
        name: saveName,
        mapping: mapping as object,
      },
      update: { mapping: mapping as object },
    })
  }

  // Store the mapping on the batch
  await db.importBatch.update({
    where: { id: batchId },
    data: { status: 'PROCESSING' },
  })

  await processImportBatch(batchId, mapping)
  revalidatePath('/bookings')
  redirect(`/imports/${batchId}/results`)
}

const SaveMappingSchema = z.object({
  workspaceId: z.string().cuid(),
  source: z.enum(VALID_SOURCES),
  name: z.string().min(1).max(80),
  mapping: z.record(z.string(), z.string()),
})

export async function saveColumnMapping(input: z.infer<typeof SaveMappingSchema>) {
  const data = SaveMappingSchema.parse(input)
  await requireWorkspace(data.workspaceId)

  await db.columnMapping.upsert({
    where: {
      workspaceId_source_name: {
        workspaceId: data.workspaceId,
        source: data.source as BookingSource,
        name: data.name,
      },
    },
    create: {
      workspaceId: data.workspaceId,
      source: data.source as BookingSource,
      name: data.name,
      mapping: data.mapping as object,
    },
    update: { mapping: data.mapping as object },
  })
}

export async function getSavedMappings(source: BookingSource) {
  const { workspace } = await requireWorkspace()
  if (!workspace) return []

  return db.columnMapping.findMany({
    where: { workspaceId: workspace.id, source },
    orderBy: { updatedAt: 'desc' },
  })
}
