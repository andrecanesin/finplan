import { isFirebaseConfigured } from '../firebase.js'
import { createLocalStore } from './localStore.js'
import { createFirestoreStore } from './firestoreStore.js'

export { isFirebaseConfigured }

export function createStore(uid) {
  if (isFirebaseConfigured) return createFirestoreStore(uid)
  return createLocalStore()
}
