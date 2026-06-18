/** Usuários da equipe e papéis de acesso. */

export type Role = 'owner' | 'admin' | 'funcionario'

export interface User {
  id: string
  name: string
  /** Identificador de login (handle). */
  username: string
  email?: string
  role: Role
  /** scrypt: "salt:hash" em hex. Nunca exposto ao cliente. */
  passwordHash: string
  createdAt: string
}

/** Usuário sem o hash, seguro para enviar à UI. */
export type SafeUser = Omit<User, 'passwordHash'>

export const ROLE_LABEL: Record<Role, string> = {
  owner: 'Proprietário',
  admin: 'Administrador (sócio)',
  funcionario: 'Funcionário',
}

export const ROLE_DESC: Record<Role, string> = {
  owner: 'Acesso total, incluindo a gestão da equipe.',
  admin: 'Acesso de sócio: propostas, agenda e gestão de funcionários.',
  funcionario: 'Cria e acompanha propostas e agenda.',
}

export function roleRank(r: Role): number {
  return r === 'owner' ? 3 : r === 'admin' ? 2 : 1
}

/** Pode acessar a área de equipe (gerenciar usuários)? */
export function canManageTeam(u: { role: Role }): boolean {
  return u.role === 'owner' || u.role === 'admin'
}

/** O `actor` pode editar/excluir o `target`? (hierarquia por papel) */
export function canManageUser(actor: { id: string; role: Role }, target: { id: string; role: Role }): boolean {
  if (actor.id === target.id) return false
  return roleRank(actor.role) > roleRank(target.role)
}

/** Papéis que o `actor` pode atribuir ao criar/alterar usuários. */
export function assignableRoles(actor: { role: Role }): Role[] {
  if (actor.role === 'owner') return ['admin', 'funcionario']
  if (actor.role === 'admin') return ['funcionario']
  return []
}
