import { initializeApp, getApps } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Sem essas três chaves o app não consegue autenticar/ler o Firestore — nesse
// caso caímos no localStore (ver src/lib/store/index.js), útil pra rodar/testar
// localmente antes de criar o projeto Firebase.
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

export const app = isFirebaseConfigured ? (getApps().length ? getApps()[0] : initializeApp(config)) : null
export const auth = isFirebaseConfigured ? getAuth(app) : null
export const db = isFirebaseConfigured ? getFirestore(app) : null

export function watchAuth(callback) {
  if (!auth) return () => {}
  return onAuthStateChanged(auth, callback)
}

export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

// Usado só no primeiro setup, pra criar a única conta do app (monousuário).
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export function logOut() {
  return signOut(auth)
}
