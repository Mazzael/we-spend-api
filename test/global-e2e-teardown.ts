import { PrismaClient } from '@prisma/client'
import { readFile } from 'node:fs/promises'
import { config } from 'dotenv'
import { envSchema } from '@/infra/env/env'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

export default async function () {
  const schemaId = await readFile('.test-schema', 'utf-8')
  const url = new URL(env.DATABASE_URL)
  url.searchParams.set('schema', schemaId)

  const prisma = new PrismaClient({
    datasources: {
      db: { url: url.toString() },
    },
  })

  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
  await prisma.$disconnect()
}
