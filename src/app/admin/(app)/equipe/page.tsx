import Link from 'next/link'
import { requireTeamManager } from '@/lib/auth'
import { listUsers } from '@/lib/users-store'
import { ROLE_DESC, ROLE_LABEL, assignableRoles, canManageUser } from '@/data/users'
import { createUserAction } from '@/app/admin/user-actions'

export const dynamic = 'force-dynamic'

function Banner({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${
        ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
      }`}
    >
      {children}
    </div>
  )
}

export default async function EquipePage({
  searchParams,
}: {
  searchParams: { ok?: string; erro?: string }
}) {
  const me = await requireTeamManager()
  const users = await listUsers()
  const roles = assignableRoles(me)

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl font-light text-ink">Equipe</h1>
      {searchParams.ok && <Banner ok>{searchParams.ok}</Banner>}
      {searchParams.erro && <Banner>{searchParams.erro}</Banner>}

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-4 rounded-lg border border-line bg-bg px-4 py-3"
          >
            <div className="min-w-0">
              <p className="font-medium text-ink">
                {u.name} <span className="text-sm text-ink-soft">@{u.username}</span>
              </p>
              <p className="text-sm text-ink-soft">
                {ROLE_LABEL[u.role]}
                {u.email ? ` · ${u.email}` : ''}
              </p>
            </div>
            {u.id === me.id ? (
              <span className="text-xs text-ink-soft">você</span>
            ) : canManageUser(me, u) ? (
              <Link href={`/admin/equipe/${u.id}`} className="text-sm font-medium text-gold hover:underline">
                Gerenciar
              </Link>
            ) : (
              <span className="text-xs text-ink-soft">sem acesso de gestão</span>
            )}
          </div>
        ))}
      </div>

      {roles.length > 0 && (
        <section className="adm-card">
          <h2 className="text-sm font-semibold text-gold">Adicionar usuário</h2>
          <form action={createUserAction} className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="adm-label">
              Nome
              <input name="name" required className="adm-field" />
            </label>
            <label className="adm-label">
              Usuário (login)
              <input name="username" required className="adm-field" />
            </label>
            <label className="adm-label">
              E-mail
              <input name="email" type="email" className="adm-field" />
            </label>
            <label className="adm-label">
              Papel
              <select name="role" defaultValue={roles[roles.length - 1]} className="adm-field">
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-label sm:col-span-2">
              Senha inicial
              <input name="password" type="text" required className="adm-field" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary">
                Criar usuário
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs leading-relaxed text-ink-soft">
            <strong>Administrador (sócio):</strong> {ROLE_DESC.admin} <strong>Funcionário:</strong>{' '}
            {ROLE_DESC.funcionario}
          </p>
        </section>
      )}
    </div>
  )
}
