import { collection, doc, addDoc, deleteDoc, getDocs, getDoc, setDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase.js'

// Estrutura: users/{uid}/transactions/{id}, users/{uid}/meta/pagamentos, users/{uid}/meta/cofres.
// App é monousuário: o uid vem da conta Firebase Auth única criada no setup.
export function createFirestoreStore(uid) {
  const txCol = collection(db, 'users', uid, 'transactions')
  const pagamentosRef = doc(db, 'users', uid, 'meta', 'pagamentos')
  const cofresRef = doc(db, 'users', uid, 'meta', 'cofres')

  return {
    async init() {},

    async getTransactions() {
      const snap = await getDocs(query(txCol, orderBy('createdAt', 'desc')))
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
    async addTransaction(tx) {
      const payload = { ...tx, createdAt: tx.createdAt || new Date().toISOString() }
      const ref = await addDoc(txCol, payload)
      return { id: ref.id, ...payload }
    },
    async deleteTransaction(id) {
      await deleteDoc(doc(txCol, id))
    },

    async getPagamentos() {
      const snap = await getDoc(pagamentosRef)
      return snap.exists() ? snap.data() : {}
    },
    async setPagamento(instanceId, pago) {
      const current = await this.getPagamentos()
      const next = { ...current }
      if (pago) next[instanceId] = true
      else delete next[instanceId]
      await setDoc(pagamentosRef, next)
    },

    async getCofres() {
      const snap = await getDoc(cofresRef)
      return snap.exists() ? snap.data() : null
    },
    async setCofre(key, patch) {
      const current = (await this.getCofres()) || {}
      const next = { ...current, [key]: { ...(current[key] || {}), ...patch } }
      await setDoc(cofresRef, next)
    },
  }
}
