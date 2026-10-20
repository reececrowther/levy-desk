import { PgBoss } from 'pg-boss'

declare global {
  // eslint-disable-next-line no-var
  var __boss: PgBoss | undefined
}

const boss = global.__boss ?? new PgBoss({
  connectionString: process.env.DATABASE_URL as string,
  // Keep the schema separate from the app tables
  schema: 'pgboss',
})

if (process.env.NODE_ENV !== 'production') global.__boss = boss

let started = false

export async function getBoss(): Promise<PgBoss> {
  if (!started) {
    await boss.start()
    started = true
  }
  return boss
}

export { boss }
