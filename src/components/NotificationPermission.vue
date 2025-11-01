<template>
  <v-card v-if="showNotificationPrompt" class="notification-prompt mb-4" elevation="2">
    <v-card-text>
      <v-row align="center" no-gutters>
        <v-col cols="auto" class="pr-3">
          <v-icon size="32" color="primary">mdi-bell-outline</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">{{ texts.title }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ texts.message }}
          </div>
        </v-col>
      </v-row>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" variant="text" @click="dismissPrompt">
        {{ texts.dismiss }}
      </v-btn>
      <v-btn color="primary" variant="flat" :loading="isLoading" @click="enableNotifications">
        {{ texts.enable }}
      </v-btn>
    </v-card-actions>
  </v-card>

  <!-- Success message -->
  <v-snackbar v-model="showSuccessMessage" :timeout="5000" color="success" location="top">
    <v-icon start>mdi-check-circle</v-icon>
    {{ texts.success }}
  </v-snackbar>

  <!-- Error message -->
  <v-snackbar v-model="showErrorMessage" :timeout="5000" color="error" location="top">
    <v-icon start>mdi-alert-circle</v-icon>
    {{ errorMessage }}
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  requestNotificationPermission,
  registerToken,
  isNotificationSupported,
  getNotificationPermission,
  onForegroundMessage
} from '@/services/notification-service'
import { store } from '@/store'

// Define notification texts for different languages
const notificationTexts: Record<string, any> = {
  sk: {
    title: 'Povoliť notifikácie',
    message: 'Dostávajte užitočné upozornenia a aktualizácie',
    enable: 'Povoliť',
    dismiss: 'Neskôr',
    success: 'Notifikácie boli úspešne povolené',
    error: 'Nepodarilo sa povoliť notifikácie'
  },
  en: {
    title: 'Enable Notifications',
    message: 'Receive useful alerts and updates',
    enable: 'Enable',
    dismiss: 'Later',
    success: 'Notifications enabled successfully',
    error: 'Failed to enable notifications'
  },
  cs: {
    title: 'Povolit upozornění',
    message: 'Dostávejte užitečná upozornění a aktualizace',
    enable: 'Povolit',
    dismiss: 'Později',
    success: 'Oznámení byla úspěšně povolena',
    error: 'Nepodařilo se povolit oznámení'
  },
  de: {
    title: 'Benachrichtigungen aktivieren',
    message: 'Erhalten Sie nützliche Benachrichtigungen und Updates',
    enable: 'Aktivieren',
    dismiss: 'Später',
    success: 'Benachrichtigungen erfolgreich aktiviert',
    error: 'Benachrichtigungen konnten nicht aktiviert werden'
  }
}

const texts = computed(() => {
  const lang = store.chosenLang || 'sk'
  return notificationTexts[lang] || notificationTexts.sk
})

const showNotificationPrompt = ref(false)
const isLoading = ref(false)
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const errorMessage = ref('')

// Check if we should show the notification prompt
onMounted(() => {
  // Check if notifications are supported
  if (!isNotificationSupported()) {
    return
  }

  // Check permission status
  const permission = getNotificationPermission()

  // Show prompt only if permission is 'default' (not asked yet) and user hasn't dismissed it
  const hasUserDismissed = localStorage.getItem('notification-prompt-dismissed') === 'true'

  if (permission === 'default' && !hasUserDismissed) {
    // Show prompt after a short delay
    setTimeout(() => {
      showNotificationPrompt.value = true
    }, 2000)
  } else if (permission === 'granted' && !store.notificationToken) {
    // Permission already granted but no token yet - get token silently
    setupNotifications()
  }

  // Setup foreground message handler if permission is granted
  if (permission === 'granted') {
    setupForegroundMessageHandler()
  }
})

async function enableNotifications() {
  isLoading.value = true
  showNotificationPrompt.value = false

  try {
    await setupNotifications()
  } catch (error) {
    console.error('Error enabling notifications:', error)
    errorMessage.value = texts.value.error
    showErrorMessage.value = true
  } finally {
    isLoading.value = false
  }
}

async function setupNotifications() {
  // Request permission and get token
  const token = await requestNotificationPermission()

  if (!token) {
    throw new Error('Failed to get notification token')
  }

  // Store token in store
  store.notificationToken = token

  // Register token with backend if we have buildingID
  if (store.buildingID) {
    try {
      const response = await registerToken(store.buildingID, token, store.guestID || undefined)

      // Store guestID if it was created
      if (response.guestID && !store.guestID) {
        store.guestID = response.guestID
        // Persist guestID to localStorage
        localStorage.setItem('guestID', response.guestID)
      }

      // Persist token and registration status
      localStorage.setItem('notificationToken', token)
      localStorage.setItem('notificationRegistered', 'true')
    } catch (error) {
      console.error('Error registering token with backend:', error)
      // Don't throw - we still got the token, just backend registration failed
    }
  }

  // Setup foreground message handler
  setupForegroundMessageHandler()
}

function setupForegroundMessageHandler() {
  onForegroundMessage((payload) => {
    console.log('Foreground notification received:', payload)
    console.log('Payload structure:', {
      hasNotification: !!payload.notification,
      notificationTitle: payload.notification?.title,
      notificationBody: payload.notification?.body,
      data: payload.data
    })

    // Extract title and body - try notification object first, then data object
    const title = payload.notification?.title || payload.data?.title || 'Checkpoint Notification'
    const body = payload.notification?.body || payload.data?.message || payload.data?.body || ''

    console.log('Extracted values:', { title, body })

    // Show browser notification
    if (Notification.permission === 'granted') {
      const options = {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: payload.data || {}
      }

      console.log('Showing notification with:', { title, options })
      new Notification(title, options)
    } else {
      console.warn('Notification permission not granted:', Notification.permission)
    }
  })
}

function dismissPrompt() {
  showNotificationPrompt.value = false
  // Remember user dismissed the prompt
  localStorage.setItem('notification-prompt-dismissed', 'true')
}
</script>

<style scoped>
.notification-prompt {
  border-left: 4px solid rgb(var(--v-theme-primary));
}
</style>
