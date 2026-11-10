/**
 * Seeds a FAKE agent workspace for the demo video. Local demo database only.
 * Run with DATABASE_URL pointing at the demo DB (port 5433), never production.
 */
import { PrismaClient } from '@prisma/client'

const url = process.env.DATABASE_URL ?? ''
if (!url.includes('localhost:5433/levydesk_demo')) {
  throw new Error(`Refusing to seed: DATABASE_URL is not the local demo DB (${url.replace(/\/\/.*@/, '//***@')})`)
}

const db = new PrismaClient()

async function main() {
  const user = await db.user.upsert({
    where: { email: 'demo@levydesk.test' },
    update: { name: 'Demo Agent' },
    create: { email: 'demo@levydesk.test', name: 'Demo Agent' },
  })

  const existing = await db.workspaceMember.findFirst({ where: { userId: user.id } })
  if (existing) await db.workspace.delete({ where: { id: existing.workspaceId } })

  const ws = await db.workspace.create({
    data: {
      name: 'Northlight Short Lets (demo)',
      type: 'AGENT',
      plan: 'AGENT',
      members: { create: { userId: user.id, role: 'OWNER' } },
    },
  })

  const morag = await db.client.create({ data: { workspaceId: ws.id, name: 'Morag Fraser' } })
  const thistle = await db.client.create({ data: { workspaceId: ws.id, name: 'Thistle Demo Holdings Ltd' } })
  const priya = await db.client.create({ data: { workspaceId: ws.id, name: 'Priya Shah' } })

  const props = [
    { name: 'Leith Shore Flat', clientId: morag.id, postcode: 'EH6 6QW', council: 'edinburgh', licenceNumber: 'EH-DEMO-0001' },
    { name: 'Royal Mile Studio', clientId: morag.id, postcode: 'EH1 1QS', council: 'edinburgh', licenceNumber: 'EH-DEMO-0002' },
    { name: 'Stockbridge Townhouse', clientId: thistle.id, postcode: 'EH3 6SS', council: 'edinburgh', licenceNumber: 'EH-DEMO-0003' },
    { name: 'Merchant City Loft', clientId: priya.id, postcode: 'G1 1HD', council: 'glasgow', licenceNumber: 'GL-DEMO-0001' },
  ]
  for (const p of props) {
    await db.property.create({
      data: { ...p, workspaceId: ws.id, town: p.council === 'glasgow' ? 'Glasgow' : 'Edinburgh', country: 'SCOTLAND', accommodationType: 'SELF_CATERING' },
    })
  }
  console.log(`Seeded workspace ${ws.name}: 3 clients, ${props.length} properties`)
}

main().finally(() => db.$disconnect())
