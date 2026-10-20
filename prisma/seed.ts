/**
 * Seeds initial config values. Scheme rules are applied at calculation time from
 * src/levy/rules/index.ts (the TypeScript rule data is the source of truth).
 * This seed inserts a demo workspace + property for local development.
 */
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('Seeding development data…')

  // Upsert a demo user and workspace for local dev
  const user = await db.user.upsert({
    where: { email: 'demo@levydesk.local' },
    update: {},
    create: {
      email: 'demo@levydesk.local',
      name: 'Demo User',
    },
  })

  const workspace = await db.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace',
      name: 'Demo Lettings',
      type: 'OWNER',
      plan: 'FREE',
      vatRegistered: false,
    },
  })

  await db.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  })

  const property = await db.property.upsert({
    where: { id: 'demo-property-edin' },
    update: {},
    create: {
      id: 'demo-property-edin',
      workspaceId: workspace.id,
      name: 'Old Town Flat',
      postcode: 'EH11AG',
      council: 'edinburgh',
      country: 'SCOTLAND',
      accommodationType: 'SELF_CATERING',
      unitsOrRooms: 1,
      breakfastIncluded: false,
    },
  })

  console.log(`Demo property: ${property.name} (${property.id})`)
  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
