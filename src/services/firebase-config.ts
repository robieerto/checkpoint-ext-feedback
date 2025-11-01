import { initializeApp } from 'firebase/app'
import { getMessaging, type Messaging } from 'firebase/messaging'

// Firebase configuration for checkpoint-a9 project
const firebaseConfig = {
  apiKey: 'AIzaSyB7JZkNlZdjo8XWIUE5aWs5XsNkgDuY7BI',
  authDomain: 'checkpoint-a9.firebaseapp.com',
  projectId: 'checkpoint-a9',
  storageBucket: 'checkpoint-a9.appspot.com',
  messagingSenderId: '860517143126',
  appId: '1:860517143126:web:0671e8e40a29ef469be1f7',
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
