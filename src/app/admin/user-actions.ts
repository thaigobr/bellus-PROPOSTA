'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/auth'
import { createUser, deleteUser, getUser, setUserPassword, setUserRole } from '@/lib/users-store'
import { verifyPassword } from '@/lib/hash'
import { Role, assignableRoles, canManageTeam, canManageUser } from '@/data/users'

function s(fd: FormData, k: string): string {
  const v = fd.get(k)
  return typeof v === 'string' ? v.trim() : ''
}

export async function createUserAction(fd: FormData) {
  const me = await requireUser()
  if (!canManageTeam(me)) redirect('/admin')
  const role = s(fd, 'role') as Role
  if (!assignableRoles(me).includes(role)) redirect('/admin/equipe?erro=Sem+permissão+para+esse+papel')
  try {
    await createUser({
      name: s(fd, 'name'),
      username: s(fd, 'username'),
      email: s(fd, 'email') || undefined,
      role,
      password: s(fd, 'password'),
    })
  } catch (e) {
    redirect(`/admin/equipe?erro=${encodeURIComponent((e as Error).message)}`)
  }
  revalidatePath('/admin/equipe')
  redirect('/admin/equipe?ok=Usuário+criado')
}

export async function deleteUserAction(fd: FormData) {
  const me = await requireUser()
  const target = await getUser(s(fd, 'id'))
  if (!target || !canManageUser(me, target)) redirect('/admin/equipe?erro=Sem+permissão')
  await deleteUser(target.id)
  revalidatePath('/admin/equipe')
  redirect('/admin/equipe?ok=Usuário+removido')
}

export async function setRoleAction(fd: FormData) {
  const me = await requireUser()
  const target = await getUser(s(fd, 'id'))
  const role = s(fd, 'role') as Role
  if (!target || !canManageUser(me, target) || !assignableRoles(me).includes(role)) {
    redirect('/admin/equipe?erro=Sem+permissão')
  }
  await setUserRole(target.id, role)
  revalidatePath(`/admin/equipe/${target.id}`)
  revalidatePath('/admin/equipe')
  redirect(`/admin/equipe/${target.id}?ok=Papel+atualizado`)
}

export async function resetPasswordAction(fd: FormData) {
  const me = await requireUser()
  const target = await getUser(s(fd, 'id'))
  if (!target || !canManageUser(me, target)) redirect('/admin/equipe?erro=Sem+permissão')
  try {
    await setUserPassword(target.id, s(fd, 'password'))
  } catch (e) {
    redirect(`/admin/equipe/${target.id}?erro=${encodeURIComponent((e as Error).message)}`)
  }
  redirect(`/admin/equipe/${target.id}?ok=Senha+redefinida`)
}

export async function changeOwnPasswordAction(fd: FormData) {
  const me = await requireUser()
  if (!verifyPassword(s(fd, 'current'), me.passwordHash)) {
    redirect('/admin/conta?erro=Senha+atual+incorreta')
  }
  try {
    await setUserPassword(me.id, s(fd, 'newpw'))
  } catch (e) {
    redirect(`/admin/conta?erro=${encodeURIComponent((e as Error).message)}`)
  }
  redirect('/admin/conta?ok=Senha+alterada')
}
