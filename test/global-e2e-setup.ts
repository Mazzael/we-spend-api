import 'tsconfig-paths/register'

import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { envSchema } from '@/infra/env/env'

config({ path: '.env', override: true })
config({ path: '.env.test', override: true })

const env = envSchema.parse(process.env)

export default async function () {
  const schemaId = randomUUID()
  const databaseURL = new URL(env.DATABASE_URL)
  databaseURL.searchParams.set('schema', schemaId)

  const fullURL = databaseURL.toString()
  process.env.DATABASE_URL = fullURL

  const fs = await import('node:fs/promises')
  await fs.writeFile('.test-schema', schemaId, 'utf-8')

  execSync('pnpm prisma migrate deploy', {
    env: {
      ...process.env,
      DATABASE_URL: fullURL,
    },
    stdio: 'inherit',
  })
}
