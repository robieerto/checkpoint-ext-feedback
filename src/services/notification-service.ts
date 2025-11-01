import { getToken, onMessage, deleteToken, type MessagePayload } from 'firebase/messaging'
import { getMessagingInstance, VAPID_KEY } from './firebase-config'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export interface NotificationToken {
  token: string
  guestID?: string
}

export interface AddTokenResponse {
  message: string
  guestID: string
  wasAdded?: boolean
}

export interface RemoveTokenResponse {
  message: string
}

/**
 * Request notification permission and get FCM token
 * @returns FCM token or null if permission denied or error
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return null
    }

    // Request permission
    const permission = await Notification.requestPermission()

    if (permission !== 'granted') {
      console.warn('Notification permission denied')
      return null
    }

    const messaging = getMessagingInstance()
    if (!messaging) {
      console.error('Firebase Messaging not available')
      return null
    }

    // Get FCM token - Firebase will automatically use the registered service worker
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    })

    if (token) {
      console.log('FCM token obtained:', token)
      return token
    } else {
      console.warn('No FCM token available')
      return null
    }
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

/**
 * Register FCM token with the backend API
 * @param buildingID - Building identifier
 * @param token - FCM token
 * @param guestID - Optional guest identifier (will be auto-generated if not provided)
 * @returns Response from API with guestID
 */
export async function registerToken(
  buildingID: string,
  token: string,
  guestID?: string
): Promise<AddTokenResponse> {
  try {
    const params = new URLSearchParams({ buildingID })
    if (guestID) {
      params.append('guestID', guestID)
    }

    const response = await axios.post<AddTokenResponse>(
      `${API_URL}/addFCMToken?${params.toString()}`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Token registered successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error registering token:', error)
    throw error
  }
}

/**
 * Unregister FCM token from the backend API
 * @param buildingID - Building identifier
 * @param guestID - Guest identifier
 * @param token - FCM token
 * @returns Response from API
 */
export async function unregisterToken(
  buildingID: string,
  guestID: string,
  token: string
): Promise<RemoveTokenResponse> {
  try {
    const params = new URLSearchParams({ buildingID, guestID })

    const response = await axios.post<RemoveTokenResponse>(
      `${API_URL}/removeFCMToken?${params.toString()}`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Token unregistered successfully:', response.data)
    return response.data
  } catch (error) {
    console.error('Error unregistering token:', error)
    throw error
  }
}

/**
 * Delete FCM token from Firebase
 */
export async function deleteFCMToken(): Promise<void> {
  try {
    const messaging = getMessagingInstance()
    if (!messaging) {
      console.error('Firebase Messaging not available')
      return
    }

    await deleteToken(messaging)
    console.log('FCM token deleted')
  } catch (error) {
    console.error('Error deleting FCM token:', error)
    throw error
  }
}

/**
 * Setup listener for foreground messages
 * @param callback - Function to call when message is received
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void): void {
  const messaging = getMessagingInstance()
  if (!messaging) {
    console.error('Firebase Messaging not available')
    return
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload)
    callback(payload)
  })
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator
}
