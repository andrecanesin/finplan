import { useMemo, useState } from 'react'
import { calcCascata, calcSaldoAcumulado, calcTodosEnvelopes, formatCurrency } from '../lib/calculations.js'
import ProgressBar from '../components/ProgressBar.jsx'

function CascataRow({ label, value, op, total }) {
  return (
    <div className={`cascata-row ${total ? 'total' : ''}`}>
      <span className="label">
        {op ? `${op} ` : ''}
        {label}
      </span>
      <span className={`value ${value < 0 ? 'negative' : total ? 'positive' : ''}`}>{formatCurrency(value)}</span>
    </div>
  )
}

function EnvelopeRow({ envelope }) {
  const { conta } = envelope
  if (envelope.semTeto) {
    return (
      <div className="envelope-item">
        <div className="envelope-header">
          <span className="nome">{conta.nome}</span>
          <span className="valores">{formatCurrency(envelope.realizadoProprio)}</span>
        </div>
        <p className="envelope-sub">{conta.nota}</p>
      </div>
    )
  }
  return (
    <div className="envelope-item">
      <div className="envelope-header">
        <span className="nome">{conta.nome}</span>
        <span className="valores">
          {formatCurrency(envelope.realizadoPool)} / {formatCurrency(conta.orcadoMensal)}
        </span>
      </div>
      <ProgressBar percentual={envelope.percentual} />
      <p className="envelope-sub">
        {conta.cadencia === 'semanal'
          ? `Liberado até agora: ${formatCurrency(envelope.disponivel)} · restam ${formatCurrency(envelope.resta)} esta semana`
          : `Restam ${formatCurrency(envelope.resta)} este mês`}
      </p>
    </div>
  )
}

function CofreCard({ id, cofre, onSave }) {
  const [editando, setEditando] = useState(false)
  const [valorAtual, setValorAtual] = useState(String(cofre.valorAtual ?? 0))
  const [meta, setMeta] = useState(cofre.meta != null ? String(cofre.meta) : '')

  const pct = cofre.meta ? Math.min(1, cofre.valorAtual / cofre.meta) : null

  if (editando) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: 10 }}>{cofre.nome}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="muted">
            Valor atual
            <input
              className="valor-input"
              style={{ fontSize: 20, textAlign: 'left', width: '100%' }}
              inputMode="decimal"
              value={valorAtual}
              onChange={(e) => setValorAtual(e.target.value.replace(/[^0-9,.]/g, ''))}
            />
          </label>
          <label className="muted">
            Meta (opcional)
            <input
              className="valor-input"
              style={{ fontSize: 20, textAlign: 'left', width: '100%' }}
              inputMode="decimal"
              value={meta}
              onChange={(e) => setMeta(e.target.value.replace(/[^0-9,.]/g, ''))}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onSave(id, {
                  valorAtual: parseFloat(valorAtual.replace(',', '.')) || 0,
                  meta: meta ? parseFloat(meta.replace(',', '.')) || 0 : null,
                })
                setEditando(false)
              }}
            >
              Salvar
            </button>
            <button type="button" className="btn-secondary" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card cofre-card" onClick={() => setEditando(true)} role="button" tabIndex={0}>
      <div className="info">
        <h3>{cofre.nome}</h3>
        <div className="valor">{formatCurrency(cofre.valorAtual)}</div>
        {cofre.meta ? (
          <div className="meta">
            Meta {formatCurrency(cofre.meta)} · {Math.round(pct * 100)}% cumprida
          </div>
        ) : (
          <div className="meta">Sem meta definida</div>
        )}
      </div>
    </div>
  )
}

export default function Painel({ mes, transactions, cofres, onSaveCofre }) {
  const cascata = useMemo(() => calcCascata(mes, transactions), [mes, transactions])
  const envelopes = useMemo(() => calcTodosEnvelopes(mes, transactions), [mes, transactions])
  const saldoInfo = useMemo(() => calcSaldoAcumulado(mes, transactions), [mes, transactions])

  return (
    <div className="screen">
      <div className="card">
        <CascataRow label="Faturamento" value={cascata.faturamento} />
        <CascataRow label="Custos PJ" value={-cascata.custosPJ} op="−" />
        <CascataRow label="Retirada pessoal" value={cascata.retirada} op="=" total />
        <CascataRow label="Fixas PF" value={-cascata.fixasPF} op="−" />
        <CascataRow label="Sobra do mês" value={cascata.sobra} op="=" total />
        <CascataRow label="Contas contábeis (gasto)" value={-cascata.gastoContasContabeis} op="−" />
        <CascataRow label="Saldo do mês" value={cascata.saldoMes} op="=" total />
      </div>

      <div className="card">
        <div className="cascata-row total">
          <span className="label">Saldo acumulado (rollover)</span>
          <span className={`value ${saldoInfo.saldoAcumulado < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(saldoInfo.saldoAcumulado)}
          </span>
        </div>
        <p className="envelope-sub">
          Vindo do mês anterior: {formatCurrency(saldoInfo.saldoAnterior)} + saldo deste mês:{' '}
          {formatCurrency(saldoInfo.saldoMesAtual)}
        </p>
      </div>

      <div className="section-title">Contas contábeis</div>
      <div className="card">
        {envelopes.map((e) => (
          <EnvelopeRow key={e.conta.id} envelope={e} />
        ))}
      </div>

      <div className="section-title">Cofres</div>
      <CofreCard id="colchao" cofre={cofres.colchao} onSave={onSaveCofre} />
      <CofreCard id="caixaQuitacao" cofre={cofres.caixaQuitacao} onSave={onSaveCofre} />
    </div>
  )
}
