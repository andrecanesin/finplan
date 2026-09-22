// Fallback usado quando o Firebase não está configurado (ver isFirebaseConfigured).
// Guarda tudo em localStorage — só persiste no navegador/dispositivo atual,
// não sincroniza entre dispositivos. Bom pra rodar e testar o app sem depender
// de criar um projeto Firebase primeiro.

const KEYS = {
  transactions: 'finplan.transactions',
  pagamentos: 'finplan.pagamentos',
  cofres: 'finplan.cofres',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage indisponível (modo privado, quota) — segue só em memória.
  }
}

export function createLocalStore() {
  return {
    async init() {},

    async getTransactions() {
      return read(KEYS.transactions, [])
    },
    async addTransaction(tx) {
      const list = read(KEYS.transactions, [])
      const withId = {
        ...tx,
        id: tx.id || crypto.randomUUID(),
        createdAt: tx.createdAt || new Date().toISOString(),
      }
      list.push(withId)
      write(KEYS.transactions, list)
      return withId
    },
    async deleteTransaction(id) {
      write(KEYS.transactions, read(KEYS.transactions, []).filter((t) => t.id !== id))
    },

    async getPagamentos() {
      return read(KEYS.pagamentos, {})
    },
    async setPagamento(instanceId, pago) {
      const map = read(KEYS.pagamentos, {})
      if (pago) map[instanceId] = true
      else delete map[instanceId]
      write(KEYS.pagamentos, map)
    },

    async getCofres() {
      return read(KEYS.cofres, null)
    },
    async setCofre(key, patch) {
      const cofres = read(KEYS.cofres, {}) || {}
      cofres[key] = { ...(cofres[key] || {}), ...patch }
      write(KEYS.cofres, cofres)
    },
  }
}
