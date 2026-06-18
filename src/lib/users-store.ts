/** Store de usuários (.data/users.json). Local; Supabase-ready. Server-only. */
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { Role, User, roleRank } from '@/data/users'
import { hashPassword } from './hash'

const DATA_DIR = path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'users.json')

function seed(): User[] {
  return [
    {
      id: 'owner-1',
      name: process.env.ADMIN_NAME || 'Thiago Rodrigues',
      username: (process.env.ADMIN_USER || 'thiago').toLowerCase(),
      email: 'contato@belluseventos.com.br',
      role: 'owner',
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || 'bellus'),
      createdAt: new Date().toISOString(),
    },
  ]
}

async function readAll(): Promise<User[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf8')) as User[]
  } catch {
    const d = seed()
    await writeAll(d)
    return d
  }
}

async function writeAll(list: User[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
}

export async function listUsers(): Promise<User[]> {
  return (await readAll()).sort((a, b) => roleRank(b.role) - roleRank(a.role) || (a.name < b.name ? -1 : 1))
}

export async function getUser(id: string): Promise<User | undefined> {
  return (await readAll()).find((u) => u.id === id)
}

export async function getByLogin(login: string): Promise<User | undefined> {
  const l = (login || '').trim().toLowerCase()
  if (!l) return undefined
  return (await readAll()).find((u) => u.username.toLowerCase() === l || (u.email || '').toLowerCase() === l)
}

export async function createUser(input: {
  name: string
  username: string
  email?: string
  role: Role
  password: string
}): Promise<User> {
  const all = await readAll()
  const username = input.username.trim().toLowerCase()
  if (!username) throw new Error('Informe um usuário.')
  if (!input.password || input.password.length < 4) throw new Error('Senha muito curta.')
  if (all.some((u) => u.username.toLowerCase() === username)) throw new Error('Esse usuário já existe.')
  const user: User = {
    id: crypto.randomUUID(),
    name: input.name.trim() || username,
    username,
    email: input.email?.trim() || undefined,
    role: input.role,
    passwordHash: hashPassword(input.password),
    createdAt: new Date().toISOString(),
  }
  all.push(user)
  await writeAll(all)
  return user
}

export async function deleteUser(id: string): Promise<void> {
  const all = await readAll()
  await writeAll(all.filter((u) => u.id !== id))
}

export async function setUserRole(id: string, role: Role): Promise<void> {
  const all = await readAll()
  const u = all.find((x) => x.id === id)
  if (u) {
    u.role = role
    await writeAll(all)
  }
}

export async function setUserPassword(id: string, password: string): Promise<void> {
  if (!password || password.length < 4) throw new Error('Senha muito curta.')
  const all = await readAll()
  const u = all.find((x) => x.id === id)
  if (u) {
    u.passwordHash = hashPassword(password)
    await writeAll(all)
  }
}
