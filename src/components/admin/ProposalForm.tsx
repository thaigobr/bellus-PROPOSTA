import { StoredProposal } from '@/data/crm'
import { DEFAULT_PACKAGES, DEFAULT_PAYMENT_OPTIONS } from '@/data/defaults'
import { formatBRL, formatDateShort } from '@/lib/format'
import { MessageAutofill } from './MessageAutofill'

type BookedDate = { date: string; couple: string }

export function ProposalForm({
  action,
  initial,
  submitLabel,
  booked,
}: {
  action: (formData: FormData) => void
  initial?: StoredProposal
  submitLabel: string
  booked: BookedDate[]
}) {
  const v = initial
  return (
    <form action={action} className="space-y-6">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <MessageAutofill />

      {/* Casal */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Casal</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="adm-label">
            Nome do cliente *
            <input name="name" required defaultValue={v?.client.name} className="adm-field" />
          </label>
          <label className="adm-label">
            Nome do par
            <input name="partnerName" defaultValue={v?.client.partnerName} className="adm-field" />
          </label>
          <label className="adm-label">
            E-mail
            <input name="email" type="email" defaultValue={v?.client.email} className="adm-field" />
          </label>
          <label className="adm-label">
            WhatsApp/telefone do cliente
            <input name="phone" defaultValue={v?.client.phone} className="adm-field" />
          </label>
        </div>
      </fieldset>

      {/* Evento */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Evento</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="adm-label">
            Tipo
            <input name="type" defaultValue={v?.event.type ?? 'Casamento'} className="adm-field" />
          </label>
          <label className="adm-label">
            Data *
            <input name="date" type="date" required defaultValue={v?.event.date} className="adm-field" />
          </label>
          <label className="adm-label">
            Local
            <input name="venue" defaultValue={v?.event.venue} className="adm-field" />
          </label>
          <label className="adm-label">
            Cidade
            <input name="city" defaultValue={v?.event.city} className="adm-field" />
          </label>
          <label className="adm-label">
            Convidados
            <input name="guestCount" defaultValue={v?.event.guestCount} className="adm-field" />
          </label>
          <label className="adm-label sm:col-span-2">
            Observações
            <textarea name="notes" rows={2} defaultValue={v?.event.notes} className="adm-field" />
          </label>
        </div>
        {booked.length > 0 && (
          <p className="mt-3 text-xs text-ink-soft">
            Datas já reservadas:{' '}
            {booked.map((b) => `${formatDateShort(b.date)} (${b.couple})`).join(' · ')}
          </p>
        )}
      </fieldset>

      {/* Recomendação */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Recomendação e mensagem</legend>
        <div className="grid gap-4">
          <label className="adm-label">
            Experiência recomendada
            <select name="recommendedPackageId" defaultValue={v?.recommendedPackageId ?? ''} className="adm-field">
              <option value="">Nenhuma</option>
              {DEFAULT_PACKAGES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="adm-label">
            Motivo da recomendação (opcional)
            <textarea name="recommendationReason" rows={2} defaultValue={v?.recommendationReason} className="adm-field" />
          </label>
          <label className="adm-label">
            Mensagem pessoal de abertura (preenchida sozinha; edite se quiser)
            <textarea name="personalMessage" rows={4} defaultValue={v?.personalMessage} className="adm-field" />
          </label>
        </div>
      </fieldset>

      {/* Disponibilidade */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Disponibilidade e validade</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="adm-label">
            Disponibilidade da data
            <select name="availabilityStatus" defaultValue={v?.availabilityStatus ?? ''} className="adm-field">
              <option value="">Automática (pela agenda)</option>
              <option value="available">Disponível</option>
              <option value="on_hold">Em pré-reserva</option>
              <option value="unavailable">Indisponível</option>
            </select>
          </label>
          <label className="adm-label">
            Validade da proposta
            <input name="expiresAt" type="date" defaultValue={v?.expiresAt} className="adm-field" />
          </label>
        </div>
      </fieldset>

      {/* Preços especiais */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Preços especiais (opcional)</legend>
        <p className="mb-3 text-xs text-ink-soft">Deixe em branco para usar o preço de tabela.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {DEFAULT_PACKAGES.map((p) => (
            <label key={p.id} className="adm-label">
              {p.name}
              <input
                name={`price_${p.id}`}
                inputMode="numeric"
                placeholder={typeof p.price === 'number' ? formatBRL(p.price) : 'sob consulta'}
                defaultValue={v?.priceOverrides?.[p.id] ?? ''}
                className="adm-field"
              />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Pagamento */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Links de pagamento</legend>
        <p className="mb-3 text-xs text-ink-soft">
          Cole a URL do provedor (Pix/cartão). Sem link, o botão leva ao WhatsApp.
        </p>
        <div className="grid gap-4">
          {DEFAULT_PAYMENT_OPTIONS.map((o) => (
            <label key={o.id} className="adm-label">
              {o.label}
              <input
                name={`link_${o.id}`}
                type="url"
                placeholder="https://..."
                defaultValue={v?.checkoutLinks?.[o.id] ?? ''}
                className="adm-field"
              />
            </label>
          ))}
        </div>
      </fieldset>

      {/* Contato */}
      <fieldset className="adm-card">
        <legend className="px-1 text-sm font-semibold text-gold">Contato que assina</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="adm-label">
            Consultor
            <input name="consultantName" defaultValue={v?.consultantName ?? 'Thiago Rodrigues'} className="adm-field" />
          </label>
          <label className="adm-label">
            WhatsApp (DDI+DDD)
            <input name="whatsapp" defaultValue={v?.whatsapp ?? '5521981636666'} className="adm-field" />
          </label>
        </div>
      </fieldset>

      <button type="submit" className="btn-primary w-full sm:w-auto">
        {submitLabel}
      </button>
    </form>
  )
}
