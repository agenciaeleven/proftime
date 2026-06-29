import { getPool, hasDatabase } from './pool.js'
import { createTeacher } from '../services/auth.js'

function getArg(args: string[], name: string): string | undefined {
  const flag = `--${name}`
  const idx = args.indexOf(flag)
  return idx >= 0 ? args[idx + 1] : undefined
}

async function main(): Promise<void> {
  if (!hasDatabase()) {
    console.error('[db:create-user] DATABASE_URL não configurada')
    process.exit(1)
  }

  const args = process.argv.slice(2)
  const email = getArg(args, 'email') || process.env.CREATE_USER_EMAIL
  const password = getArg(args, 'password') || process.env.CREATE_USER_PASSWORD
  const fullName = getArg(args, 'name') || process.env.CREATE_USER_NAME

  if (!email || !password || !fullName) {
    console.error(
      'Uso: npm run db:create-user -- --email EMAIL --password SENHA --name "Nome Completo"',
    )
    console.error('Ou defina CREATE_USER_EMAIL, CREATE_USER_PASSWORD e CREATE_USER_NAME')
    process.exit(1)
  }

  const result = await createTeacher(email, password, fullName)
  if ('error' in result) {
    console.error(`[db:create-user] ${result.error}`)
    process.exit(1)
  }

  console.log(`[db:create-user] Professor criado: ${result.user.email} (id: ${result.user.id})`)
}

main()
  .catch((err) => {
    console.error('[db:create-user] Falha:', err)
    process.exit(1)
  })
  .finally(async () => {
    await getPool().end()
  })
