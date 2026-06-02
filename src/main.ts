import './assets/main.css'
import './assets/actionListView.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import * as Sentry from '@sentry/vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { VNumberInput } from 'vuetify/labs/VNumberInput'

const vuetify = createVuetify({
  components: { VNumberInput },
})

const app = createApp(App)
app.use(vuetify).use(router)

Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN,
  enableLogs: true
})

app.mount('#app')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered successfully:', registration)
    })
    .catch((error) => {
      console.error('Service Worker registration failed:', error)
    })
}
