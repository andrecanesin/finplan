import { useMemo, useState } from 'react'
import { getFixedInstances, getStatusContaFixa, formatCurrency } from '../lib/calculations.js'
import StatusBadge from '../components/StatusBadge.jsx'

const FILTROS = [
  { id: 'todas', label: 'Todas' },
  { id: 'PF', label: 'PF' },
  { id: 'PJ', label: 'PJ' },
]

export default function ContasFixas({ mes, pagamentos, onTogglePago }) {
  const [filtro, setFiltro] = useState('todas')

  const instances = useMemo(() => getFixedInstances(mes), [mes])

  const filtradas = instances
    .filter((i) => filtro === 'todas' || i.tipo === filtro)
    .sort((a, b) => a.diaVencimento - b.diaVencimento)

  const pendente = filtradas
    .filter((i) => getStatusContaFixa(i, pagamentos) !== 'pago')
    .reduce((s, i) => s + i.valor, 0)

  return (
    <div className="screen">
      <div className="filter-row">
        {FILTROS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filtro === f.id ? 'active' : ''}
            onClick={() => setFiltro(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="muted">Pendente no mês</span>
        <strong>{formatCurrency(pendente)}</strong>
      </div>

      <div className="card">
        {filtradas.map((instance) => {
          const status = getStatusContaFixa(instance, pagamentos)
          const pago = status === 'pago'
          return (
            <div className="conta-fixa-item" key={instance.id}>
              <button
                type="button"
                className={`checkbox ${pago ? 'checked' : ''}`}
                aria-label={pago ? 'Marcar como não pago' : 'Marcar como pago'}
                onClick={() => onTogglePago(instance.id, !pago)}
              >
                {pago ? '✓' : ''}
              </button>
              <div className="info" style={{ flex: 1 }}>
                <div className="nome">{instance.nomeExibicao}</div>
                <div className="venc">
                  Vence dia {instance.diaVencimento} · {instance.tipo}
                  {instance.nota ? ` · ${instance.nota}` : ''}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <span className="valor">{formatCurrency(instance.valor)}</span>
                <StatusBadge status={status} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
