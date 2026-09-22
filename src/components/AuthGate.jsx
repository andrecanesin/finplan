import { useEffect, useState } from 'react'
import { isFirebaseConfigured, watchAuth, signIn, signUp, logOut } from '../lib/firebase.js'

// App monousuário: uma única conta Firebase Auth (email/senha) protege os dados
// no Firestore. Sem Firebase configurado, pula direto pra um uid fixo local
// (localStore não precisa de auth).
export default function AuthGate({ children }) {
  const [status, setStatus] = useState(isFirebaseConfigured ? 'loading' : 'signed-in')
  const [user, setUser] = useState(null)
  const [modo, setModo] = useState('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!isFirebaseConfigured) return undefined
    const unsub = watchAuth((u) => {
      setUser(u)
      setStatus(u ? 'signed-in' : 'signed-out')
    })
    return unsub
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      if (modo === 'entrar') {
        await signIn(email, senha)
      } else {
        await signUp(email, senha)
      }
    } catch (err) {
      setErro(traduzErro(err.code))
    } finally {
      setEnviando(false)
    }
  }

  if (status === 'loading') {
    return <div className="center">Carregando…</div>
  }

  if (status === 'signed-out') {
    return (
      <div className="auth-screen">
        <h1 style={{ fontSize: 24 }}>Finplan</h1>
        <p className="muted" style={{ textAlign: 'center' }}>
          {modo === 'entrar' ? 'Entre com sua conta.' : 'Crie a única conta deste app (uso pessoal).'}
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            minLength={6}
            required
          />
          {erro && <p className="auth-error">{erro}</p>}
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? 'Aguarde…' : modo === 'entrar' ? 'Entrar' : 'Criar conta'}
          </button>
        </form>
        <button
          type="button"
          className="btn-secondary"
          style={{ maxWidth: 320 }}
          onClick={() => setModo(modo === 'entrar' ? 'criar' : 'entrar')}
        >
          {modo === 'entrar' ? 'Primeira vez? Criar conta' : 'Já tenho conta'}
        </button>
      </div>
    )
  }

  return children({ uid: isFirebaseConfigured ? user.uid : 'local', onLogout: isFirebaseConfigured ? logOut : null })
}

function traduzErro(code) {
  const mapa = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-not-found': 'Conta não encontrada.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/invalid-credential': 'E-mail ou senha incorretos.',
    'auth/email-already-in-use': 'Já existe uma conta com esse e-mail.',
    'auth/weak-password': 'Senha muito curta (mínimo 6 caracteres).',
  }
  return mapa[code] || 'Não foi possível autenticar. Tente novamente.'
}
