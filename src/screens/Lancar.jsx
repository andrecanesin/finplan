import { useMemo, useState } from 'react'
import { CONTAS_CONTABEIS } from '../config/referenceData.js'
import { calcEnvelope, formatCurrency } from '../lib/calculations.js'

export default function Lancar({ mes, transactions, onSave }) {
  const [contaId, setContaId] = useState(CONTAS_CONTABEIS[0].id)
  const [valor, setValor] = useState('')
  const [tipo, setTipo] = useState('PF')
  const [impulso, setImpulso] = useState(false)
  const [saving, setSaving] = useState(false)

  const conta = CONTAS_CONTABEIS.find((c) => c.id === contaId)

  const envelope = useMemo(() => calcEnvelope(contaId, mes, transactions), [contaId, mes, transactions])
  const envelopeRef = useMemo(
    () => (conta?.compartilhaEnvelopeCom ? calcEnvelope(conta.compartilhaEnvelopeCom, mes, transactions) : null),
    [conta, mes, transactions],
  )

  const valorNumero = parseFloat(valor.replace(',', '.')) || 0
  const podeSalvar = valorNumero > 0 && contaId && !saving

  async function handleSalvar() {
    if (!podeSalvar) return
    setSaving(true)
    try {
      await onSave({ valor: valorNumero, contaContabilId: contaId, tipo, impulso, mes })
      setValor('')
      setImpulso(false)
    } finally {
      setSaving(false)
    }
  }

  let hint = ''
  let hintClass = ''
  if (envelope?.semTeto) {
    if (envelopeRef) {
      hint = `Sem teto fixo — restam ${formatCurrency(envelopeRef.resta)} esta semana no envelope de Mercado`
      if (envelopeRef.resta < 0) hintClass = 'danger'
      else if (envelopeRef.resta < envelopeRef.disponivel * 0.2) hintClass = 'warn'
    }
  } else if (envelope) {
    const periodo = conta.cadencia === 'semanal' ? 'esta semana' : 'este mês'
    hint = `Restam ${formatCurrency(envelope.resta)} ${periodo} em ${conta.nome.split(' + ')[0]}`
    if (envelope.resta < 0) hintClass = 'danger'
    else if (envelope.disponivel && envelope.resta < envelope.disponivel * 0.2) hintClass = 'warn'
  }

  return (
    <div className="screen">
      <div className="valor-display" style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 28, color: 'var(--text-dim)' }}>R$</span>
        <input
          className="valor-input"
          style={{ width: `${Math.max(5, valor.length + 1)}ch`, maxWidth: '70%' }}
          inputMode="decimal"
          placeholder="0,00"
          value={valor}
          onChange={(e) => setValor(e.target.value.replace(/[^0-9,.]/g, ''))}
          autoFocus
        />
      </div>

      <div className="chips">
        {CONTAS_CONTABEIS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip ${contaId === c.id ? 'selected' : ''}`}
            onClick={() => setContaId(c.id)}
          >
            {c.nome.split(' + ')[0]}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="toggle-row">
          <span>Tipo</span>
          <div className="toggle">
            <button type="button" className={tipo === 'PJ' ? 'active' : ''} onClick={() => setTipo('PJ')}>
              PJ
            </button>
            <button type="button" className={tipo === 'PF' ? 'active' : ''} onClick={() => setTipo('PF')}>
              PF
            </button>
          </div>
        </div>
        <div className="toggle-row">
          <span>Foi por impulso?</span>
          <button
            type="button"
            className={`switch ${impulso ? 'on' : ''}`}
            role="switch"
            aria-checked={impulso}
            onClick={() => setImpulso((v) => !v)}
          >
            <span className="knob" />
          </button>
        </div>
      </div>

      {hint && <p className={`context-hint ${hintClass}`}>{hint}</p>}

      <button type="button" className="btn-primary" disabled={!podeSalvar} onClick={handleSalvar}>
        {saving ? 'Salvando…' : 'Salvar lançamento'}
      </button>
    </div>
  )
}
