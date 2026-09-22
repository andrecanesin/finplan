import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthGate from './components/AuthGate.jsx'
import BottomNav from './components/BottomNav.jsx'
import MonthPicker from './components/MonthPicker.jsx'
import Lancar from './screens/Lancar.jsx'
import Painel from './screens/Painel.jsx'
import ContasFixas from './screens/ContasFixas.jsx'
import { createStore } from './lib/store/index.js'
import { mesAtual, START_MES } from './lib/calculations.js'
import { COFRES_SEED } from './config/referenceData.js'

// O plano só começa a valer em out/2026 (primeira fonte de renda fixa).
// Antes disso, abrir no mês corrente só mostraria uma cascata toda negativa.
function mesInicial() {
  const atual = mesAtual()
  return atual >= START_MES ? atual : START_MES
}

function AppContent({ uid, onLogout }) {
  const store = useMemo(() => createStore(uid), [uid])

  const [mes, setMes] = useState(mesInicial)
  const [screen, setScreen] = useState('lancar')
  const [transactions, setTransactions] = useState([])
  const [pagamentos, setPagamentos] = useState({})
  const [cofres, setCofres] = useState(COFRES_SEED)
  const [carregado, setCarregado] = useState(false)

  const reload = useCallback(async () => {
    const [tx, pag, cof] = await Promise.all([store.getTransactions(), store.getPagamentos(), store.getCofres()])
    setTransactions(tx)
    setPagamentos(pag)
    setCofres({
      colchao: { ...COFRES_SEED.colchao, ...(cof?.colchao || {}) },
      caixaQuitacao: { ...COFRES_SEED.caixaQuitacao, ...(cof?.caixaQuitacao || {}) },
    })
    setCarregado(true)
  }, [store])

  useEffect(() => {
    reload()
  }, [reload])

  async function handleSaveTransaction(tx) {
    await store.addTransaction(tx)
    await reload()
  }

  async function handleTogglePago(instanceId, pago) {
    setPagamentos((prev) => {
      const next = { ...prev }
      if (pago) next[instanceId] = true
      else delete next[instanceId]
      return next
    })
    await store.setPagamento(instanceId, pago)
  }

  async function handleSaveCofre(key, patch) {
    setCofres((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }))
    await store.setCofre(key, patch)
  }

  if (!carregado) {
    return <div className="center">Carregando seus dados…</div>
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Finplan</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <MonthPicker mes={mes} onChange={setMes} />
          {onLogout && (
            <button type="button" className="btn-secondary" style={{ padding: '4px 10px' }} onClick={onLogout}>
              Sair
            </button>
          )}
        </div>
      </header>

      {screen === 'lancar' && <Lancar mes={mes} transactions={transactions} onSave={handleSaveTransaction} />}
      {screen === 'painel' && (
        <Painel mes={mes} transactions={transactions} cofres={cofres} onSaveCofre={handleSaveCofre} />
      )}
      {screen === 'fixas' && (
        <ContasFixas mes={mes} pagamentos={pagamentos} onTogglePago={handleTogglePago} />
      )}

      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  )
}

export default function App() {
  return <AuthGate>{({ uid, onLogout }) => <AppContent uid={uid} onLogout={onLogout} />}</AuthGate>
}
