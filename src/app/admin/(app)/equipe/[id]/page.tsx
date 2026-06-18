import { notFound, redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'
import { getUser } from '@/lib/users-store'
import { ROLE_LABEL, assignableRoles, canManageUser } from '@/data/users'
import { deleteUserAction, resetPasswordAction, setRoleAction } from '@/app/admin/user-actions'

export const dynamic = 'force-dynamic'

export default async function ManageUserPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { ok?: string; erro?: string }
}) {
  const me = await requireUser()
  const target = await getUser(params.id)
  if (!target) notFound()
  if (!canManageUser(me, target)) redirect('/admin/equipe?erro=Sem+permissão')
  const roles = assignableRoles(me)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-ink">{target.name}</h1>
        <p className="text-ink-soft">
          @{target.username} · {ROLE_LABEL[target.role]}
          {target.email ? ` · ${target.email}` : ''}
        </p>
      </div>

      {searchParams.ok && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {searchParams.ok}
        </div>
      )}
      {searchParams.erro && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {searchParams.erro}
        </div>
      )}

      <section className="adm-card">
        <h2 className="text-sm font-semibold text-gold">Papel de acesso</h2>
        <form action={setRoleAction} className="mt-3 flex flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={target.id} />
          <select name="role" defaultValue={target.role} className="adm-field max-w-xs">
            {roles.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-ghost px-4 py-2 text-sm">
            Salvar papel
          </button>
        </form>
      </section>

      <section className="adm-card">
        <h2 className="text-sm font-semibold text-gold">Redefinir senha</h2>
        <form action={resetPasswordAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="id" value={target.id} />
          <label className="adm-label">
            Nova senha
            <input name="password" type="text" required className="adm-field" />
          </label>
          <button type="submit" className="btn-ghost px-4 py-2 text-sm">
            Redefinir
          </button>
        </form>
      </section>

      <section className="adm-card">
        <h2 className="text-sm font-semibold text-rose-600">Remover usuário</h2>
        <p className="mt-1 text-sm text-ink-soft">Esta ação é permanente.</p>
        <form action={deleteUserAction} className="mt-3">
          <input type="hidden" name="id" value={target.id} />
          <button
            type="submit"
            className="rounded-full border border-rose-300 px-4 py-2 text-sm text-rose-700 hover:bg-rose-50"
          >
            Remover {target.name}
          </button>
        </form>
      </section>
    </div>
  )
}
