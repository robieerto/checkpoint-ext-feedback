import { initializeApp } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'

// Driven by build-time env vars so staging builds connect to
// ofrules-checkpoint-staging instead of always hitting production
// regardless of which Hosting project actually serves the build.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// VAPID key for web push (from cloud functions test client)
export const VAPID_KEY = 'BCQVBCtHPkNutu90rAWQBFk0E5Rej8PbgOJgnz7Cu9ZjhI5kkvg6wL9vDlQNIeKTBzPV2HRVW4AJjJEu7QpDxgk'

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null

export const getMessagingInstance = (): Messaging | null => {
  // Only initialize messaging in browser environment and if service worker is supported
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (!messaging) {
      messaging = getMessaging(firebaseApp)
    }
    return messaging
  }
  return null
}
