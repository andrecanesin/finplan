import { FONTES_RENDA, CONTAS_FIXAS, CONTAS_CONTABEIS, SEMANAS_POR_MES } from '../config/referenceData.js'

export const START_MES = '2026-10'

// ---------- helpers de mês/data ----------

export function formatCurrency(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
}

export function mesAtual() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function proximoMes(mes) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(y, m, 1)) // m já é o índice do próximo mês (0-based do mês atual + 1)
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function mesLabel(mes) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, 1))
  const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function listMesesAte(mes, start = START_MES) {
  const out = []
  let cur = start
  let guard = 0
  while (cur <= mes && guard < 600) {
    out.push(cur)
    cur = proximoMes(cur)
    guard += 1
  }
  return out
}

function isActiveInMonth(item, mes) {
  if (item.inicio && mes < item.inicio) return false
  if (item.fim && mes > item.fim) return false
  return true
}

function diasNoMes(mes) {
  const [y, m] = mes.split('-').map(Number)
  return new Date(Date.UTC(y, m, 0)).getUTCDate()
}

function sextasFeirasDoMes(mes) {
  const [y, m] = mes.split('-').map(Number)
  const total = diasNoMes(mes)
  const dias = []
  for (let dia = 1; dia <= total; dia += 1) {
    if (new Date(Date.UTC(y, m - 1, dia)).getUTCDay() === 5) dias.push(dia)
  }
  return dias
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// ---------- contas fixas: instâncias do mês + status ----------

// Expande CONTAS_FIXAS em instâncias concretas do mês (a faxineira vira uma
// instância por sexta-feira real do calendário, per seção 8 do briefing).
export function getFixedInstances(mes) {
  const instances = []
  for (const item of CONTAS_FIXAS) {
    if (!isActiveInMonth(item, mes)) continue
    if (item.cadencia === 'semanal-sexta') {
      const fridays = sextasFeirasDoMes(mes)
      fridays.forEach((dia, idx) => {
        instances.push({
          ...item,
          id: `${item.id}__${mes}-${String(dia).padStart(2, '0')}`,
          baseId: item.id,
          diaVencimento: dia,
          ocorrencia: idx + 1,
          nomeExibicao: `${item.nome} (${idx + 1}ª sexta)`,
        })
      })
    } else {
      instances.push({ ...item, id: `${item.id}__${mes}`, baseId: item.id, nomeExibicao: item.nome })
    }
  }
  return instances
}

export function getStatusContaFixa(instance, pagamentos, hoje = new Date()) {
  if (pagamentos?.[instance.id]) return 'pago'
  const [y, m] = instance.id.includes('__') ? instance.id.split('__')[1].split('-').map(Number) : []
  const hojeSemHora = stripTime(hoje)
  const vencimento = new Date(y, m - 1, instance.diaVencimento)
  const diffDias = Math.round((vencimento - hojeSemHora) / 86400000)
  if (diffDias < 0) return 'atrasado'
  if (diffDias <= 3) return 'vence-em-breve'
  return 'em-dia'
}

export const STATUS_LABEL = {
  pago: 'Pago',
  atrasado: 'Atrasado',
  'vence-em-breve': 'Vence em breve',
  'em-dia': 'Em dia',
}

// ---------- cascata mensal ----------

export function calcCascata(mes, transactions) {
  const fontesAtivas = FONTES_RENDA.filter((f) => isActiveInMonth(f, mes))
  const faturamento = fontesAtivas.reduce((s, f) => s + f.valor, 0)

  const instances = getFixedInstances(mes)
  const custosPJInstances = instances.filter((i) => i.tipo === 'PJ')
  const fixasPFInstances = instances.filter((i) => i.tipo === 'PF')
  const custosPJ = custosPJInstances.reduce((s, i) => s + i.valor, 0)
  const fixasPF = fixasPFInstances.reduce((s, i) => s + i.valor, 0)

  const retirada = faturamento - custosPJ
  const sobra = retirada - fixasPF

  const transacoesMes = transactions.filter((t) => t.mes === mes)
  const gastoContasContabeis = transacoesMes.reduce((s, t) => s + t.valor, 0)

  const saldoMes = sobra - gastoContasContabeis

  return {
    mes,
    fontesAtivas,
    faturamento,
    custosPJInstances,
    custosPJ,
    fixasPFInstances,
    fixasPF,
    retirada,
    sobra,
    gastoContasContabeis,
    saldoMes,
  }
}

export function calcSaldoAcumulado(mes, transactions, saldoInicial = 0) {
  const meses = listMesesAte(mes)
  let saldoAnterior = saldoInicial
  let saldoMesAtual = 0
  for (const m of meses) {
    const { saldoMes } = calcCascata(m, transactions)
    if (m === mes) {
      saldoMesAtual = saldoMes
    } else {
      saldoAnterior += saldoMes
    }
  }
  return { saldoAnterior, saldoMesAtual, saldoAcumulado: saldoAnterior + saldoMesAtual }
}

// ---------- envelopes (contas contábeis) ----------

function getWeekIndexDisponivel(mes, hoje = new Date()) {
  const atual = mesAtual()
  if (mes < atual) return Math.ceil(diasNoMes(mes) / 7)
  if (mes > atual) return 0
  return Math.ceil(hoje.getDate() / 7)
}

export function calcEnvelope(contaId, mes, transactions, hoje = new Date()) {
  const conta = CONTAS_CONTABEIS.find((c) => c.id === contaId)
  if (!conta) return null

  const sharers = CONTAS_CONTABEIS.filter((c) => c.compartilhaEnvelopeCom === contaId)
  const idsNoPool = [contaId, ...sharers.map((s) => s.id)]
  const transacoesMes = transactions.filter((t) => t.mes === mes)
  const realizadoPool = transacoesMes
    .filter((t) => idsNoPool.includes(t.contaContabilId))
    .reduce((s, t) => s + t.valor, 0)
  const realizadoProprio = transacoesMes
    .filter((t) => t.contaContabilId === contaId)
    .reduce((s, t) => s + t.valor, 0)

  if (conta.semTeto) {
    return { conta, realizadoProprio, realizadoPool, semTeto: true }
  }

  let disponivel
  if (conta.cadencia === 'semanal') {
    const semanal = conta.orcadoMensal / SEMANAS_POR_MES
    const weekIndex = getWeekIndexDisponivel(mes, hoje)
    disponivel = Math.min(conta.orcadoMensal, weekIndex * semanal)
  } else {
    disponivel = conta.orcadoMensal
  }

  const resta = disponivel - realizadoPool
  const percentual = conta.orcadoMensal ? Math.min(1, realizadoPool / conta.orcadoMensal) : 0

  return {
    conta,
    realizadoProprio,
    realizadoPool,
    disponivel,
    resta,
    percentual,
    orcadoMensal: conta.orcadoMensal,
    semTeto: false,
  }
}

export function calcTodosEnvelopes(mes, transactions, hoje = new Date()) {
  return CONTAS_CONTABEIS.map((c) => calcEnvelope(c.id, mes, transactions, hoje))
}
