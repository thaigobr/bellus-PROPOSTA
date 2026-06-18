import { requireUser } from '@/lib/auth'
import { ROLE_LABEL } from '@/data/users'
import { changeOwnPasswordAction } from '@/app/admin/user-actions'

export const dynamic = 'force-dynamic'

export default async function ContaPage({
  searchParams,
}: {
  searchParams: { ok?: string; erro?: string }
}) {
  const me = await requireUser()

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-ink">Minha conta</h1>
        <p className="text-ink-soft">
          {me.name} · @{me.username} · {ROLE_LABEL[me.role]}
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
        <h2 className="text-sm font-semibold text-gold">Trocar senha</h2>
        <form action={changeOwnPasswordAction} className="mt-3 space-y-4">
          <label className="adm-label">
            Senha atual
            <input name="current" type="password" required autoComplete="current-password" className="adm-field" />
          </label>
          <label className="adm-label">
            Nova senha
            <input name="newpw" type="password" required autoComplete="new-password" className="adm-field" />
          </label>
          <button type="submit" className="btn-primary">
            Salvar nova senha
          </button>
        </form>
      </section>
    </div>
  )
}
