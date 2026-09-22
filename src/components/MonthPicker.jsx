import { mesLabel, proximoMes, START_MES } from '../lib/calculations.js'

function mesAnterior(mes) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 2, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export default function MonthPicker({ mes, onChange }) {
  return (
    <div className="month-picker">
      <button type="button" onClick={() => onChange(mesAnterior(mes))} disabled={mes <= START_MES} aria-label="Mês anterior">
        ‹
      </button>
      <span>{mesLabel(mes)}</span>
      <button type="button" onClick={() => onChange(proximoMes(mes))} aria-label="Próximo mês">
        ›
      </button>
    </div>
  )
}
