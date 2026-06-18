/**
 * Armazenamento das propostas (CRM).
 *
 * IMPLEMENTAÇÃO LOCAL: arquivo JSON em `.data/proposals.json` (não versionado).
 * Funciona em `npm run dev`. Para PRODUÇÃO, troque o corpo destas funções por
 * Supabase/Postgres mantendo a MESMA interface (o resto do app não muda).
 *
 * Uso apenas no servidor (server components, server actions, route handlers).
 */
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { BOOKING_STATUSES, ProposalStatus, StoredProposal } from '@/data/crm'

const DATA_DIR = path.join(process.cwd(), '.data')
const FILE = path.join(DATA_DIR, 'proposals.json')

function nowISO() {
  return new Date().toISOString()
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function makeSlug(name: string, partner?: string) {
  const base = slugify(`${name}${partner ? '-' + partner : ''}`) || 'proposta'
  const rand = crypto.randomBytes(2).toString('hex')
  return `${base}-${rand}`
}

// Semente: a proposta de demonstração já existente.
function seed(): StoredProposal[] {
  const ts = '2026-06-17T00:00:00.000Z'
  return [
    {
      id: 'demo-mariana-lucas',
      slug: 'mariana-e-lucas',
      status: 'enviada',
      demo: true,
      client: { name: 'Mariana', partnerName: 'Lucas' },
      event: {
        type: 'Casamento',
        date: '2026-10-18',
        venue: 'Espaço Jardim das Oliveiras',
        city: 'Campinas, São Paulo',
        guestCount: '≈ 120 convidados',
        notes: 'Cerimônia e recepção no mesmo espaço, ao entardecer.',
      },
      recommendedPackageId: 'alianca',
      personalMessage:
        'Mariana e Lucas, preparei esta proposta pensando no dia de vocês. Mais do que um vídeo, ela é sobre como vocês vão querer reviver o 18 de outubro daqui a alguns anos. Qualquer dúvida, estou por perto.',
      availabilityStatus: 'available',
      expiresAt: '2026-07-15',
      checkoutLinks: {
        sinal: '/proposta/obrigado?demo=1&cond=sinal',
        avista: '/proposta/obrigado?demo=1&cond=avista',
        cartao: '/proposta/obrigado?demo=1&cond=cartao',
      },
      consultantName: 'Thiago Rodrigues',
      whatsapp: '5521981636666',
      createdAt: ts,
      updatedAt: ts,
      sentAt: ts,
      viewCount: 0,
    },
  ]
}

async function readAll(): Promise<StoredProposal[]> {
  try {
    const raw = await fs.readFile(FILE, 'utf8')
    return JSON.parse(raw) as StoredProposal[]
  } catch {
    const data = seed()
    await writeAll(data)
    return data
  }
}

async function writeAll(list: StoredProposal[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), 'utf8')
}

// ── Consultas ──
export async function listProposals(): Promise<StoredProposal[]> {
  const all = await readAll()
  return all.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
}

export async function getById(id: string): Promise<StoredProposal | undefined> {
  return (await readAll()).find((p) => p.id === id)
}

export async function getBySlug(slug: string): Promise<StoredProposal | undefined> {
  return (await readAll()).find((p) => p.slug === slug)
}

/** Datas (AAAA-MM-DD) já comprometidas (reservada/fechada). */
export async function bookedDates(exceptId?: string): Promise<{ date: string; id: string; couple: string }[]> {
  const all = await readAll()
  return all
    .filter((p) => BOOKING_STATUSES.includes(p.status) && p.id !== exceptId)
    .map((p) => ({
      date: p.event.date,
      id: p.id,
      couple: p.client.partnerName ? `${p.client.name} e ${p.client.partnerName}` : p.client.name,
    }))
}

/** Há outra proposta reservada/fechada nesta data? */
export async function dateConflict(date: string, exceptId?: string) {
  return (await bookedDates(exceptId)).find((b) => b.date === date)
}

// ── Mutações ──
export type CreateInput = Omit<
  StoredProposal,
  'id' | 'slug' | 'status' | 'createdAt' | 'updatedAt' | 'viewCount' | 'sentAt' | 'firstViewedAt' | 'lastViewedAt'
> & { status?: ProposalStatus }

export async function createProposal(input: CreateInput): Promise<StoredProposal> {
  const all = await readAll()
  const ts = nowISO()
  const p: StoredProposal = {
    ...input,
    id: crypto.randomUUID(),
    slug: makeSlug(input.client.name, input.client.partnerName),
    status: input.status ?? 'rascunho',
    createdAt: ts,
    updatedAt: ts,
    viewCount: 0,
  }
  all.push(p)
  await writeAll(all)
  return p
}

export async function updateProposal(id: string, patch: Partial<StoredProposal>): Promise<StoredProposal | undefined> {
  const all = await readAll()
  const i = all.findIndex((p) => p.id === id)
  if (i < 0) return undefined
  all[i] = { ...all[i], ...patch, id: all[i].id, updatedAt: nowISO() }
  await writeAll(all)
  return all[i]
}

export async function setStatus(id: string, status: ProposalStatus): Promise<StoredProposal | undefined> {
  const patch: Partial<StoredProposal> = { status }
  if (status === 'enviada') {
    const cur = await getById(id)
    if (cur && !cur.sentAt) patch.sentAt = nowISO()
  }
  return updateProposal(id, patch)
}

/** Registra uma visualização da página pública (chamado pelo beacon). */
export async function recordView(slug: string): Promise<void> {
  const all = await readAll()
  const i = all.findIndex((p) => p.slug === slug)
  if (i < 0) return
  const ts = nowISO()
  const p = all[i]
  p.viewCount = (p.viewCount ?? 0) + 1
  p.lastViewedAt = ts
  if (!p.firstViewedAt) p.firstViewedAt = ts
  if (p.status === 'enviada') p.status = 'visualizada' // avança o funil
  p.updatedAt = ts
  await writeAll(all)
}
